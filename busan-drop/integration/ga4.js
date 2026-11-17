(() => {
  const id = document.currentScript?.dataset.measurementId;
  const entry = new URL(location.href);
  if (!/^G-[A-Z0-9]{4,20}$/.test(id || '') ||
      entry.hostname !== 'busandrop.vercel.app' || entry.searchParams.get('analytics_test') === '1') return;

  const key = 'busan-ga4-consent-v1';
  let allowed;
  try { allowed = localStorage.getItem(key); } catch {}
  const campaign = {};
  for (const name of ['source', 'medium', 'campaign', 'content']) {
    const value = entry.searchParams.get('utm_' + name);
    if (/^[a-zA-Z0-9_.-]{1,80}$/.test(value || '')) {
      campaign['campaign_' + (name === 'campaign' ? 'name' : name)] = value;
    }
  }
  const safePath = pathname => /^\/busandrop\/(home|stores|drop-plan|saved|my|login)\/?$/.test(pathname)
    ? pathname.replace(/\/$/, '') : '/busandrop/login';
  let initialized = false;
  let previousPath;
  function pageView() {
    if (allowed !== 'yes') return;
    const pathname = safePath(location.pathname);
    if (pathname === previousPath) return;
    previousPath = pathname;
    window.gtag('event', 'page_view', {
      ...campaign,
      page_location: location.origin + pathname,
      page_title: 'BUSAN DROP',
      send_to: id
    });
  }
  const events = new Set([
    'event_detail_viewed', 'event_like_added', 'plan_creation_started',
    'plan_stage_viewed', 'plan_step_completed', 'plan_saved', 'plan_cloud_synced'
  ]);
  const stages = ['dates', 'events', 'sights', 'food', 'review'];
  function track(name, data = {}) {
    if (allowed !== 'yes' || !initialized || !events.has(name)) return;
    if (name === 'plan_stage_viewed' && stages.includes(data.stage)) {
      name = 'plan_view_' + data.stage;
    }
    if (name === 'plan_step_completed' && data.skipped === true) name = 'plan_step_skipped';
    const event = { send_to: id, ...campaign };
    for (const key of ['step', 'venue_index']) {
      if (Number.isSafeInteger(data[key]) && data[key] >= 0) event[key] = data[key];
    }
    if (typeof data.editing_existing === 'boolean') event.editing_existing = Number(data.editing_existing);
    if (data.save_scope === 'account' || data.save_scope === 'browser') {
      event.save_scope = data.save_scope;
    }
    window.gtag('event', name, event);
  }
  window.BUSAN_GA4 = { track, allowed: () => allowed === 'yes' && initialized };
  function start() {
    window['ga-disable-' + id] = false;
    if (!initialized) {
      initialized = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      // Set before loading the tag: destination defaults can emit events before
      // stream config is processed. Keep the initial attribution on those hits.
      window.gtag('set', {
        ...campaign,
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
      window.gtag('js', new Date());
      let referrer = '';
      try { referrer = new URL(document.referrer).origin; } catch {}
      window.gtag('config', id, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: location.origin + safePath(entry.pathname),
        page_referrer: referrer,
        page_title: 'BUSAN DROP',
        ...campaign
      });
      const tag = document.createElement('script');
      tag.async = true;
      tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
      document.head.append(tag);
    }
    pageView();
    window.dispatchEvent(new Event('busan-ga4-enabled'));
  }
  const labels = {
    ko: ['Google Analytics (선택)', '유입 채널과 접속 지역을 파악하기 위해 Google Analytics가 쿠키, 기기 정보, 방문 페이지와 캠페인 정보를 처리합니다.', '허용', '허용 안 함', 'Google의 데이터 처리 안내'],
    en: ['Google Analytics (optional)', 'Google Analytics uses cookies, device information, page views and campaign tags to measure traffic sources and approximate location.', 'Allow', 'Do not allow', 'How Google uses data'],
    ja: ['Google Analytics（任意）', '流入元とおおよその地域を把握するため、Google AnalyticsがCookie、端末情報、閲覧ページ、キャンペーン情報を処理します。', '許可', '許可しない', 'Googleのデータの取り扱い'],
    zh: ['Google Analytics（可选）', 'Google Analytics 处理 Cookie、设备信息、访问页面和广告系列信息，以了解流量来源与大致地区。', '允许', '不允许', 'Google 如何处理数据'],
    'zh-TW': ['Google Analytics（選用）', 'Google Analytics 處理 Cookie、裝置資訊、瀏覽頁面和活動資訊，以瞭解流量來源與大致地區。', '允許', '不允許', 'Google 如何處理資料']
  };
  // The shared settings panel owns the UI and commits both choices before reloading.
  window.BUSAN_GA4.consent = {
    get: () => allowed === 'yes' ? true : allowed === 'no' ? false : null,
    copy: language => labels[language] || labels.en,
    set(value) {
      if (allowed === (value ? 'yes' : 'no')) return false;
      allowed = value ? 'yes' : 'no';
      try { localStorage.setItem(key, allowed); } catch {}
      if (value) start();
      else {
        window['ga-disable-' + id] = true;
        previousPath = undefined;
      }
      return !value && initialized;
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    const previousRender = render;
    render = (...args) => { previousRender(...args); pageView(); };
    if (allowed === 'yes') start();
  });
})();
