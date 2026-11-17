const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler, reportFilters } = require('../../lib/local-admin-ga4.cjs');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ga4-admin-'));
const envFile = path.join(dir, 'test.env');
fs.writeFileSync(envFile, 'BUSANDROP_GA4_ACCESS_TOKEN=fixture-token\n');
async function call(handler, query = {}) {
  const result = { headers: {}, code: 200 };
  const res = { setHeader(k,v) { result.headers[k] = v; }, status(n) { result.code = n; return this; }, json(data) { result.data = data; return this; } };
  await handler({ query }, res);
  return result;
}
test('missing credentials returns a connection state without fabricated metrics', async () => {
  const handler = createHandler({ envFiles: [], fetcher: () => { throw Error('must not fetch'); } });
  const result = await call(handler);
  assert.equal(result.data.status, 'not_configured');
  assert.equal(result.data.acquisition, undefined);
  assert.equal(result.headers['Cache-Control'], 'no-store');
});
test('test environment never queries production GA4', async () => {
  const handler = createHandler({ envFiles: [envFile], fetcher: () => { throw Error('must not fetch'); } });
  assert.equal((await call(handler, {environment: 'test'})).data.status, 'production_only');
});
test('channel and country are scoped across all three reports and repeated requests use cache', async () => {
  const requests = [];
  const fetcher = async (url, opts) => {
    const body = JSON.parse(opts.body);
    requests.push(body);
    assert.equal(opts.headers.Authorization, 'Bearer fixture-token');
    assert.equal(body.dimensionFilter.andGroup.expressions[0].filter.stringFilter.value, 'instagram');
    assert.equal(body.dimensionFilter.andGroup.expressions[1].filter.stringFilter.value, 'Japan');
    return { ok: true, json: async () => url.includes('runFunnelReport') ? {
      funnelTable: { dimensionHeaders: [{name:'funnelStepName'},{name:'country'}], metricHeaders:[{name:'activeUsers'},{name:'funnelStepAbandonments'}], rows:[{dimensionValues:[{value:'1. events'},{value:'Japan'}],metricValues:[{value:'8'},{value:'2'}]}] }
    } : { dimensionHeaders:[], metricHeaders:[], rows:[], rowCount:0 } };
  };
  const handler = createHandler({ envFiles: [envFile], fetcher });
  const query = {source:'instagram', country:'Japan'};
  const first = await call(handler, query);
  assert.equal(first.data.funnel.rows[0].activeUsers, 8);
  assert.equal(first.data.funnel.rows[0].funnelStepAbandonments, 2);
  assert.equal(JSON.stringify(first.data).includes('fixture-token'), false);
  await call(handler, query);
  assert.equal(requests.length, 3);
});
test('funnel API failure preserves other successful reports', async () => {
  const handler = createHandler({ envFiles:[envFile], fetcher: async url => url.includes('runFunnelReport') ?
    {ok:false,status:403} : {ok:true,json:async()=>({rows:[]})} });
  const result = await call(handler);
  assert.equal(result.data.status, 'ok');
  assert.equal(result.data.funnel.error, 'access_denied');
  assert.equal(result.data.acquisition.status, 'ok');
});
test('invalid dates and array filters fail before external requests', () => {
  assert.throws(() => reportFilters({from:'2026-02-30'}));
  assert.throws(() => reportFilters({country:['Japan']}));
});
test.after(() => fs.rmSync(dir, {recursive:true,force:true}));
