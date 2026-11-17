'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const { parseEnv } = require('node:util');
const { filters } = require('./local-admin-metrics.cjs');

const PROPERTY = '564404386';
const STEPS = [
  ['행사 선택', 'plan_view_events'], ['관광지', 'plan_view_sights'],
  ['맛집', 'plan_view_food'], ['플랜 확인', 'plan_view_review'], ['플랜 저장', 'plan_saved']
];
function config(files, env = process.env) {
  const values = {};
  for (const file of files) {
    try { Object.assign(values, parseEnv(fs.readFileSync(file, 'utf8'))); } catch {}
  }
  const vars = { ...values, ...env };
  return {
    property: PROPERTY,
    accessToken: vars.BUSANDROP_GA4_ACCESS_TOKEN,
    credentialFile: vars.BUSANDROP_GA4_CREDENTIALS_FILE,
    refreshToken: vars.BUSANDROP_GA4_REFRESH_TOKEN,
    clientId: vars.BUSANDROP_GA4_CLIENT_ID,
    clientSecret: vars.BUSANDROP_GA4_CLIENT_SECRET
  };
}
function reportFilters(query) {
  const f = filters(query);
  const result = { from: f.from, to: f.to, environment: f.environment };
  for (const name of ['source', 'content', 'country']) {
    const value = query[name] || '';
    if (typeof value !== 'string' || value.length > 100 || /[\x00-\x1f]/.test(value)) {
      throw Object.assign(Error('invalid_filters'), { status: 400 });
    }
    result[name] = value;
  }
  return result;
}
function dimensionFilter(f) {
  const expressions = [
    ['source', 'sessionSource'], ['content', 'sessionManualAdContent'], ['country', 'country']
  ].filter(([key]) => f[key]).map(([key, fieldName]) => ({
    filter: { fieldName, stringFilter: { matchType: 'EXACT', value: f[key], caseSensitive: true } }
  }));
  return expressions.length ? { andGroup: { expressions } } : undefined;
}
function decode(report) {
  return (report.rows || []).map(row => Object.fromEntries([
    ...(report.dimensionHeaders || []).map((h, i) => [h.name, row.dimensionValues[i]?.value || '']),
    ...(report.metricHeaders || []).map((h, i) => [h.name, Number(row.metricValues[i]?.value || 0)])
  ]));
}
function createHandler({ envFiles = [], fetcher = fetch, now = Date.now } = {}) {
  let tokenCache, cachedConfig;
  const cache = new Map(), pending = new Map();
  async function token(c) {
    if (c.accessToken) return c.accessToken;
    const signature = JSON.stringify(c);
    if (signature === cachedConfig && tokenCache?.until > now()) return tokenCache.value;
    const form = new URLSearchParams();
    if (c.credentialFile) {
      let credential;
      try {
        credential = JSON.parse(fs.readFileSync(c.credentialFile, 'utf8'));
        if (credential.type !== 'service_account' || !credential.private_key || !credential.client_email) throw Error();
      } catch { throw Error('invalid_credentials'); }
      const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
      const seconds = Math.floor(now() / 1000);
      const payload = encode({ alg: 'RS256', typ: 'JWT' }) + '.' + encode({
        iss: credential.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly',
        aud: 'https://oauth2.googleapis.com/token', iat: seconds, exp: seconds + 3600
      });
      const assertion = payload + '.' + crypto.sign('RSA-SHA256', Buffer.from(payload), credential.private_key).toString('base64url');
      form.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
      form.set('assertion', assertion);
    } else if (c.refreshToken && c.clientId && c.clientSecret) {
      for (const [key, value] of Object.entries({
        grant_type: 'refresh_token', refresh_token: c.refreshToken, client_id: c.clientId, client_secret: c.clientSecret
      })) form.set(key, value);
    } else { throw Error('not_configured'); }
    const response = await fetcher('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(), signal: AbortSignal.timeout(15000), redirect: 'error'
    });
    if (!response.ok) throw Error('authentication_failed');
    const data = await response.json();
    if (!data.access_token) throw Error('authentication_failed');
    tokenCache = { value: data.access_token, until: now() + Math.max(0, (Number(data.expires_in) || 3600) - 120) * 1000 };
    cachedConfig = signature;
    return tokenCache.value;
  }
  async function post(c, accessToken, method, body, alpha = false) {
    const response = await fetcher(
      'https://analyticsdata.googleapis.com/' + (alpha ? 'v1alpha' : 'v1beta') + '/properties/' + c.property + ':' + method, {
        method: 'POST', headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(20000), redirect: 'error'
      });
    if (!response.ok) {
      const error = Error(response.status === 403 ? 'access_denied' : response.status === 401 ? 'authentication_failed' : response.status === 429 ? 'quota_exceeded' : 'report_unavailable');
      error.upstreamStatus = response.status;
      throw error;
    }
    return response.json();
  }
  async function core(c, accessToken, f, dimensions, metrics) {
    const result = [], metadata = [];
    let rowCount = 0;
    do {
      const data = await post(c, accessToken, 'runReport', {
        dateRanges: [{ startDate: f.from, endDate: f.to }],
        dimensions: dimensions.map(name => ({ name })), metrics: metrics.map(name => ({ name })),
        dimensionFilter: dimensionFilter(f), limit: '10000', offset: String(result.length)
      });
      const page = decode(data);
      result.push(...page);
      metadata.push(data.metadata || {});
      rowCount = Number(data.rowCount || 0);
      if (!page.length && result.length < rowCount) throw Error('report_unavailable');
    } while (result.length < rowCount && result.length < 100000);
    return { rows: result, truncated: result.length < rowCount, metadata };
  }
  async function load(c, f) {
    const accessToken = await token(c);
    const cohort = ['sessionSource', 'sessionMedium', 'sessionCampaignName', 'sessionManualAdContent', 'country'];
    const results = await Promise.allSettled([
      core(c, accessToken, f, cohort, ['sessions', 'totalUsers', 'engagedSessions']),
      core(c, accessToken, f, [...cohort, 'eventName'], ['eventCount']),
      post(c, accessToken, 'runFunnelReport', {
        dateRanges: [{ startDate: f.from, endDate: f.to }],
        dimensionFilter: dimensionFilter(f),
        funnelBreakdown: { breakdownDimension: { name: 'country' }, limit: '100' },
        funnel: { isOpenFunnel: false, steps: STEPS.map(([name, eventName]) => ({
          name, isDirectlyFollowedBy: false, filterExpression: { funnelEventFilter: { eventName } }
        })) }, limit: '10000'
      }, true)
    ]);
    const [acquisition, actions, funnel] = results;
    if (acquisition.status === 'rejected' && actions.status === 'rejected') throw acquisition.reason;
    const report = item => item.status === 'fulfilled'
      ? { status: 'ok', ...item.value }
      : { status: 'error', error: item.reason.message };
    return {
      status: 'ok', property: c.property, filters: f, fetchedAt: new Date(now()).toISOString(),
      acquisition: report(acquisition), actions: report(actions),
      funnel: funnel.status === 'fulfilled' ? {
        status: 'ok', rows: decode(funnel.value.funnelTable || {}),
        metadata: funnel.value.funnelTable?.metadata || {}
      } : { status: 'error', error: funnel.reason.message }
    };
  }
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const f = reportFilters(req.query), c = config(envFiles);
      if (f.environment !== 'production') return res.json({ status: 'production_only', property: c.property, filters: f });
      if (!c.accessToken && !c.credentialFile && !(c.refreshToken && c.clientId && c.clientSecret)) {
        return res.json({ status: 'not_configured', property: c.property, filters: f });
      }
      const key = JSON.stringify([c, f]), hit = cache.get(key);
      if (hit && now() - hit.at < 60000 && req.query.refresh !== '1') return res.json(hit.value);
      if (!pending.has(key)) pending.set(key, load(c, f).then(value => {
        cache.set(key, { at: now(), value });
        if (cache.size > 20) cache.delete(cache.keys().next().value);
        return value;
      }).finally(() => pending.delete(key)));
      return res.json(await pending.get(key));
    } catch (error) {
      return res.status(error.status || 502).json({
        status: 'error', error: error.status === 400 ? 'invalid_filters' : ['invalid_credentials','authentication_failed','access_denied','quota_exceeded','report_unavailable'].includes(error.message) ? error.message : 'report_unavailable',
        property: PROPERTY, upstreamStatus: error.upstreamStatus
      });
    }
  };
}
module.exports = { createHandler, reportFilters, dimensionFilter, decode };
