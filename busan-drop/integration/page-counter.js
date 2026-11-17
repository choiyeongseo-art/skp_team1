(function () {
  'use strict';

  if (location.hostname !== 'busandrop.vercel.app') return;

  const SCREEN_PATH = {
    signup: '/busandrop/login',
    language: '/busandrop/login',
    intro: '/busandrop/login',
    home: '/busandrop/home',
    stores: '/busandrop/stores',
    brands: '/busandrop/stores',
    brand: '/busandrop/stores',
    busan: '/busandrop/stores',
    place: '/busandrop/stores',
    pass: '/busandrop/drop-plan',
    saved: '/busandrop/saved',
    profile: '/busandrop/my',
  };

  const params = new URLSearchParams(location.search);
  const utmSource = params.get('utm_source') || '';
  const utmMedium = params.get('utm_medium') || '';
  const utmCampaign = params.get('utm_campaign') || '';
  const utmContent = params.get('utm_content') || '';

  let lastScreen = null;

  function send(body) {
    try {
      navigator.sendBeacon(
        '/api/busandrop/count',
        new Blob([JSON.stringify(body)], { type: 'application/json' })
      );
    } catch (_) {}
  }

  function countScreen(screen) {
    if (!screen || screen === lastScreen) return;
    lastScreen = screen;
    const page = SCREEN_PATH[screen];
    if (!page) return;

    const body = { page };
    if (page === '/busandrop/login' && utmSource) {
      body.utm_source = utmSource;
      if (utmMedium) body.utm_medium = utmMedium;
      if (utmCampaign) body.utm_campaign = utmCampaign;
      if (utmContent) body.utm_content = utmContent;
    }
    send(body);
  }

  // render 래핑 — analytics.js와 동일 패턴
  if (typeof render === 'function') {
    const prevRender = render;
    render = function () {
      prevRender.apply(this, arguments);
      if (typeof state !== 'undefined') countScreen(state.screen);
    };
    if (typeof state !== 'undefined') countScreen(state.screen);
  }

  // 행사 상세 오픈 훅
  const prevOpen = window.BUSAN_OPEN_EVENT_DETAIL;
  if (typeof prevOpen === 'function') {
    window.BUSAN_OPEN_EVENT_DETAIL = function (item) {
      const result = prevOpen.apply(this, arguments);
      const catalog = window.BUSAN_EVENT_CATALOG || [];
      const entry = catalog.find(function (e) { return e.brand === item?.brand; });
      if (entry && entry.id) {
        send({ page: '/busandrop/stores', event_id: entry.id, action: 'view' });
      }
      return result;
    };
  }

  // 저장 버튼 클릭 훅
  document.addEventListener('click', function (e) {
    const el = e.target && e.target.closest && e.target.closest('[data-event-social-save]');
    if (!el) return;
    const isSaving = el.getAttribute('aria-pressed') !== 'true';
    if (!isSaving) return;
    const eventId = el.dataset.eventSocialSave;
    if (!eventId) return;
    send({ page: '/busandrop/stores', event_id: eventId, action: 'save' });
  }, true);
}());
