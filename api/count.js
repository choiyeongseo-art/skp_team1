'use strict';
const fs = require('node:fs');

function loadEnv(keyFile) {
  const env = {};
  try {
    for (const line of fs.readFileSync(keyFile, 'utf8').split('\n')) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z_0-9]+)\s*=\s*(.*?)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  } catch {}
  return env;
}

const ALLOWED_PAGES = new Set([
  '/busandrop/login',
  '/busandrop/home',
  '/busandrop/stores',
  '/busandrop/drop-plan',
  '/busandrop/saved',
  '/busandrop/my',
]);

const ALLOWED_ACTIONS = new Set(['view', 'save']);

// 한국 KST 날짜 반환
function kstDate() {
  return new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
}

function sanitize(v) {
  if (v == null) return '';
  return String(v).slice(0, 100).replace(/[^\w\-.]/g, '');
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const body = req.body || {};
  const page = body.page;
  const eventId = body.event_id ? sanitize(body.event_id) : null;
  const action = body.action ? String(body.action) : null;

  if (!ALLOWED_PAGES.has(page) && !eventId) {
    return res.status(400).json({ error: 'invalid_page' });
  }

  const fileEnv = loadEnv(require('node:path').join(__dirname, '../.env.local'));
  const url = (process.env.BUSANDROP_AUTH_SUPABASE_URL || fileEnv.BUSANDROP_AUTH_SUPABASE_URL || '').replace(/\/$/, '');
  const anonKey = process.env.BUSANDROP_COUNTS_SUPABASE_ANON_KEY || fileEnv.BUSANDROP_COUNTS_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    return res.status(503).json({ error: 'not_configured' });
  }

  const headers = {
    'apikey': anonKey,
    'Authorization': 'Bearer ' + anonKey,
    'Content-Type': 'application/json',
  };

  const date = kstDate();

  try {
    if (eventId && ALLOWED_ACTIONS.has(action)) {
      await fetch(`${url}/rest/v1/rpc/busan_increment_event_interaction`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ p_event_id: eventId, p_action: action, p_date: date }),
        signal: AbortSignal.timeout(8000),
      });
    }

    if (ALLOWED_PAGES.has(page)) {
      const country = sanitize(req.headers['x-vercel-ip-country'] || '');
      const utmSource = page === '/busandrop/login' ? sanitize(body.utm_source) : '';
      const utmMedium = page === '/busandrop/login' ? sanitize(body.utm_medium) : '';
      const utmCampaign = page === '/busandrop/login' ? sanitize(body.utm_campaign) : '';
      const utmContent = page === '/busandrop/login' ? sanitize(body.utm_content) : '';

      await fetch(`${url}/rest/v1/rpc/busan_increment_page_view`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_page: page,
          p_utm_source: utmSource,
          p_utm_medium: utmMedium,
          p_utm_campaign: utmCampaign,
          p_utm_content: utmContent,
          p_country: country,
          p_date: date,
        }),
        signal: AbortSignal.timeout(8000),
      });
    }

    return res.status(204).end();
  } catch {
    return res.status(502).json({ error: 'upstream_error' });
  }
};
