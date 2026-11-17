const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

const source = fs.readFileSync('busan-drop/integration/ga4.js', 'utf8');

test('GA4 sends approved product milestones after consent and excludes product identifiers', () => {
  const listeners = {};
  const scripts = [];
  const window = { addEventListener() {}, dispatchEvent() {} };
  const document = {
    currentScript: { dataset: { measurementId: 'G-TEST1234' } },
    documentElement: { lang: 'ko' },
    head: { append: tag => scripts.push(tag) },
    querySelector: () => null,
    createElement: () => ({ dataset: {}, style: {}, setAttribute() {} }),
    addEventListener: (name, fn) => { listeners[name] = fn; }
  };
  vm.runInNewContext(source, {
    window, document, URL, Event, render() {},
    location: new URL('https://busandrop.vercel.app/busandrop/login?utm_source=instagram&utm_content=ig02_bio'),
    localStorage: { getItem: () => null, setItem() {} }
  });
  listeners.DOMContentLoaded();
  window.BUSAN_GA4.track('plan_saved');
  assert.equal(scripts.length, 0);
  window.BUSAN_GA4.consent.set(true);
  assert.equal(scripts.length, 1);
  const config = window.dataLayer.find(command => command[0] === 'config')[2];
  assert.equal(config.campaign_source, 'instagram');
  assert.equal(config.campaign_content, 'ig02_bio');
  window.BUSAN_GA4.track('login_failed');
  window.BUSAN_GA4.track('plan_stage_viewed', { stage: 'sights', venue_index: 1, draft_id: 'private' });
  window.BUSAN_GA4.track('plan_step_completed', { step: 3, skipped: true });
  window.BUSAN_GA4.track('plan_saved', { plan_id: 'private' });
  const sent = Array.from(window.dataLayer).filter(command => command[0] === 'event');
  assert.deepEqual(sent.map(event => event[1]), [
    'page_view', 'plan_view_sights', 'plan_step_skipped', 'plan_saved'
  ]);
  assert.equal(sent[1][2].venue_index, 1);
  assert.equal(JSON.stringify(window.dataLayer).includes('private'), false);
});

test('initial campaign survives route cleanup and reaches both page and product events', () => {
  for (const [platform, content] of [['instagram', 'ig02_bio'], ['youtube', 'yt02_bio']]) {
    const listeners = {}, scripts = [];
    const window = { addEventListener() {}, dispatchEvent() {} };
    const document = {
      currentScript: { dataset: { measurementId: 'G-TEST1234' } },
      documentElement: { lang: 'ko' },
      head: { append: tag => scripts.push(tag) },
      querySelector: () => null,
      createElement: () => ({ dataset: {}, style: {}, setAttribute() {} }),
      addEventListener: (name, fn) => { listeners[name] = fn; }
    };
    const location = new URL(`https://busandrop.vercel.app/busandrop/login?utm_source=${platform}&utm_medium=social&utm_campaign=launch&utm_content=${content}&email=private@example.com`);
    vm.runInNewContext(source, { window, document, location, URL, Event, render() {}, localStorage: {getItem: () => 'yes', setItem() {}} });
    location.href = 'https://busandrop.vercel.app/busandrop/home';
    listeners.DOMContentLoaded();
    window.BUSAN_GA4.track('plan_saved', { plan_id: 'private-id' });
    const commands = Array.from(window.dataLayer);
    assert.equal(commands[0][0], 'set');
    assert.equal(commands[0][1].send_page_view, false);
    assert.equal(commands[0][1].campaign_source, platform);
    for (const command of commands.filter(command => command[0] === 'event')) {
      assert.equal(command[2].campaign_source, platform);
      assert.equal(command[2].campaign_medium, 'social');
      assert.equal(command[2].campaign_name, 'launch');
      assert.equal(command[2].campaign_content, content);
    }
    assert.equal(scripts.length, 1);
    assert.equal(JSON.stringify(commands).includes('private'), false);
  }
});
