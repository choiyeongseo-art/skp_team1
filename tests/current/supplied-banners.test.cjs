const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
function app(savedState={}){let savedJson='';const elements=new Map(),events={};const element=()=>({innerHTML:'',style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},focus(){},querySelector(){return null},querySelectorAll(){return []},replaceWith(){},setAttribute(){},scrollTop:0});const document={querySelector(s){if(['#modal .sheet','#search','#sort','#signupForm','#hero','.product-category-chips','.header-language[open]'].includes(s))return null;if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll(){return []},addEventListener(n,f){(events[n]??=[]).push(f)}};const c={Date:class extends Date{constructor(...args){super(...(args.length?args:['2026-11-06T03:00:00Z']));}},window:{BUSAN_MAPBOX_CONFIG:{token:'pk.test',style:'mapbox://styles/mapbox/dark-v11'},mapInstances:[]},document,localStorage:{getItem:()=>JSON.stringify({saved:[1,2,3,4,5,6,7],...savedState}),setItem(key,value){savedJson=value}},setInterval(fn,delay){(c.window.testTimers??=[]).push({fn,delay});},clearTimeout(){},setTimeout(){}};c.mapboxgl={AttributionControl:class {constructor(options){this.options=options;}},Map:class {constructor(options){this.options=options;this.listeners={};c.window.mapInstances.push(this);}on(name,fn){this.listeners[name]=fn;}addControl(control){this.attribution=control;}remove(){this.removed=true;}isStyleLoaded(){return true;}resize(){}getLayer(){return false;}getCenter(){return {toArray:()=>this.options.center};}getZoom(){return this.options.zoom;}flyTo(options){this.lastFly=options;}fitBounds(bounds,options){this.lastBounds=bounds;this.lastFit=options;}zoomIn(){}zoomOut(){}}};vm.createContext(c);for(const file of ['data/content.js','thumbnail-assets.js','store-map.js','language.js','app.js','data/event-catalog.js','data/event-details.js','data/store-locations.js','integration/supplied-banners.js','integration/home-categories.js','integration/mapbox-view.js','integration/event-window.js','integration/home-event-map.js','integration/header-language.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../../busan-drop',file),'utf8'),c);return {run:s=>vm.runInContext(s,c),elements,events,storage:()=>JSON.parse(savedJson||'{}')}}

test('twenty active brands render while archived product ownership stays stable',()=>{
 const a=app();assert.deepEqual(Array.from(a.run('brands.map(b=>b.name)')),['탑텐','올리브영','유니클로','자라','몬치치','티파니앤코','와키윌리','참치학교','원피스 무기와라 스토어','와이잭','젤라또 피케','리락쿠마·스미코구라시','메이플스토리','시그니엘 부산','웨스틴 조선 부산','그랜드 조선 부산','해리포터 마호도코로','히나쿠우','달달더마켓','광안리 M 드론×레이저쇼','G-STAR']);
 assert.equal(a.run('brands[deals.find(d=>d.id===8).brand].name'),'탑텐');
 assert.equal(a.run('brands[1].name'),'올리브영');
 assert.equal(a.run('brands.filter(b=>b.active).length'),20);
 a.run("state.screen='brands'");assert.doesNotMatch(a.run('brandRows()+chips()'),/탑텐|TOPTEN/);
 assert.equal(a.run('orderedBrands().some(b=>b.name==="탑텐")'),false);
 for(let index=0;index<6;index++){a.run(`state.brand=${index};nav('brand')`);assert.ok(a.elements.get('#viewport').innerHTML.includes('브랜드관'));}
 a.run("state.query='몬치치'");assert.match(a.run('brandRows()'),/몬치치/);assert.doesNotMatch(a.run('brandRows()'),/티파니앤코/);
 a.run("nav('stores')");assert.doesNotMatch(a.run('storeMap()'),/data-map-brand="[45]"/);
});
test('home banners show the ten nearest confirmed deadlines regardless of shopping preference',()=>{
 const a=app();
 for(const types of [['뷰티'],['패션'],['로컬/팝업']]){
  a.run(`state.shoppingTypes=${JSON.stringify(types)};state.banner=0;home()`);
  assert.deepEqual(Array.from(a.run('banners')),[1,14,15,13,17,6,10,18,4,9]);
 }
 const html=a.run('campaignBanner()');assert.equal([...html.matchAll(/data-supplied-slide=/g)].length,10);
 assert.doesNotMatch(html,/topten.jpg|텐텐데이/);
 assert.match(html,/oliveyoung.jpg[\s\S]*부산 여행 파우치, 여기서 채울까\?/);
 assert.equal([...html.matchAll(/data-banner=/g)].length,10);
 for(const file of ['oliveyoung','topten','uniqlo','zara','monchhichi','tiffany'])assert.ok(fs.existsSync(path.join(__dirname,'../../busan-drop/assets/banners/home-20261105',file+'.jpg')));
});
test('repeated banner switching changes the active brand without rerendering the whole viewport',()=>{
 const a=app();a.run("nav('home')");const original=a.elements.get('#viewport').innerHTML;
 for(let index=0;index<30;index++)a.run('switchCampaign((state.banner+1)%banners.length)');
 assert.equal(a.elements.get('#viewport').innerHTML,original);
 a.run('switchCampaign(4)');assert.equal(a.run('banners[state.banner]'),17);
 a.run('switchCampaign(-1)');assert.equal(a.run('state.banner'),4);
});

test('home combines regional tabs, icon categories and the map under one trip-event heading',()=>{
 const a=app();a.run("nav('home')");const html=a.elements.get('#viewport').innerHTML;
 assert.match(html,/내 여행지 이벤트 모아보기/);
 assert.doesNotMatch(html,/카테고리별 할인 정보|핫플 이벤트 모아보기/);
 assert.deepEqual([...html.matchAll(/data-home-event-region="([^"]+)"/g)].map(match=>match[1]),['BUSAN','서면','남포동','광안리','해운대']);
 assert.ok(html.indexOf('campaign-pagination')<html.indexOf('home-event-map'));
 assert.ok(html.indexOf('data-home-event-region')<html.indexOf('data-home-category'));
 assert.ok(html.indexOf('data-home-category')<html.indexOf('id="homeMapbox"'));
 assert.equal([...html.matchAll(/data-home-category=/g)].length,8);
 assert.doesNotMatch(html,/<nav class="map-brand-tabs"|<nav class="map-region-tabs"/);
 assert.doesNotMatch(html,/블프 할인 상품|id="results"|product-category-chips|deal-card/);
 for(const [language,label] of [['ko','부산'],['en','Busan'],['ja','釜山'],['zh','釜山']]){
  a.run(`state.language='${language}'`);assert.match(a.run('home()'),new RegExp(`data-home-event-region="BUSAN"[^>]*>${label}</button>`));
 }
 assert.match(html,/homeMapbox/);assert.doesNotMatch(html,/시연점|map-world/);assert.equal(a.run('state.screen'),'home');
 const count=a.run('window.mapInstances.length');
 a.run('render()');assert.equal(a.run('window.mapInstances.length'),count);
 const click={target:{closest:selector=>selector==='[data-home-event-region]'?{dataset:{homeEventRegion:'광안리'}}:null}};
 for(const handler of a.events.click)handler(click);
 assert.equal(a.run('state.mapRegion'),'광안리');
 assert.equal(a.run('window.mapInstances.length'),count);
 assert.deepEqual(JSON.parse(a.run('JSON.stringify(window.mapInstances.at(-1).lastBounds)')),[[129.097087,35.132391],[129.13472,35.18475]]);
 a.run("nav('stores')");assert.match(a.run('storeMap()'),/map-brand-tabs/);
});

test('banner autoplay advances at three seconds and manual selection restarts the countdown',()=>{
 const a=app();a.run("Date.now=()=>0;nav('home')");
 a.run("Date.now=()=>2999;window.testTimers.find(t=>t.delay===500).fn()");assert.equal(a.run('state.banner'),0);
 a.run("Date.now=()=>3000;window.testTimers.find(t=>t.delay===500).fn()");assert.equal(a.run('state.banner'),1);
 a.run("Date.now=()=>4000;switchCampaign(3)");
 a.run("Date.now=()=>6999;window.testTimers.find(t=>t.delay===500).fn()");assert.equal(a.run('state.banner'),3);
 a.run("Date.now=()=>7000;window.testTimers.find(t=>t.delay===500).fn()");assert.equal(a.run('state.banner'),4);
});

test('banner details show dates and venue; home category filters without leaving home',()=>{
 const a=app();a.run("nav('home')");const html=a.run('campaignBanner()');
 assert.match(html,/<h2>눈 마주치면 데려오게 될걸\?<\/h2><div class="supplied-banner-meta"><span class="supplied-banner-period">2026.11.05 – 2026.11.15<\/span><span class="supplied-banner-place">신세계백화점 센텀시티/);
 assert.doesNotMatch(html,/행사 일정 안내 전|uniqlo.jpg|zara.jpg|tiffany.jpg/);assert.match(html,/부산 올리브영 전 매장/);
 a.run("state.mapRegion='서면'");
 for(const fn of a.events.click)fn({target:{closest:selector=>selector==='[data-home-category]'?{dataset:{homeCategory:'팝업'}}:null}});
 assert.equal(a.run('state.homeCategory'),'팝업');assert.equal(a.run('state.screen'),'home');
 assert.equal(a.run('state.mapRegion'),'서면');
});

test('expired banners leave on the next KST day, including hotel booking deadlines; fewer than ten and empty states are safe',()=>{
 const a=app();
 a.run("window.BUSAN_EVENT_WINDOW.koreaToday=()=> '2026-11-08';campaignBanner()");
 assert.ok(!Array.from(a.run('banners')).includes(1));
 assert.equal(a.run('banners.length'),10);
 a.run("window.BUSAN_EVENT_WINDOW.koreaToday=()=> '2026-11-09';campaignBanner()");
 const active=Array.from(a.run('banners'));assert.ok(!active.includes(14));assert.ok(!active.includes(15));assert.equal(a.run("window.BUSAN_EVENT_WINDOW.isExpired(window.BUSAN_EVENT_CATALOG.find(e=>e.brand==='시그니엘 부산'))"),false);
 assert.equal(a.run("window.BUSAN_EVENT_CATALOG.find(e=>e.brand==='시그니엘 부산').offers.some(o=>o.bookingEnd==='2026-11-29')"),true);assert.doesNotMatch(a.run('campaignBanner()'),/SIGNIEL BRAND FESTA/);
 a.run("window.BUSAN_EVENT_WINDOW.koreaToday=()=> '2027-07-01'");
 assert.equal(a.run('campaignBanner()'),'');assert.equal(a.run('banners.length'),0);
 assert.doesNotThrow(()=>a.run('switchCampaign(NaN)'));
});
test('KST date rollover updates the displayed carousel during autoplay without a reload',()=>{
 const a=app();a.run("nav('home');window.BUSAN_EVENT_WINDOW.koreaToday=()=> '2026-11-09';switchCampaign(1)");
 assert.doesNotMatch(a.elements.get('#viewport').innerHTML,/oliveyoung.jpg|westin-josun.svg|grand-josun.svg/);
 const order=JSON.parse(a.run('JSON.stringify(banners.map(index=>{const event=window.BUSAN_EVENT_CATALOG.find(c=>c.brand===brands[index].name);return event.offers?.length?event.offers.filter(o=>o.bookingEnd>=window.BUSAN_EVENT_WINDOW.koreaToday()).map(o=>o.bookingEnd).sort()[0]:event.end;}))'));
 assert.deepEqual(order,[...order].sort());
});
