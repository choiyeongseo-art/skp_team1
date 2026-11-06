const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function setup(){const events={},elements=new Map();const c={window:{},state:{language:'ko'},brands:[{name:'몬치치',cat:'팝업'},{name:'올리브영',cat:'뷰티'}],esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),document:{activeElement:null,querySelector(s){if(s==='.event-detail-overlay'||s==='.event-detail-dialog')return null;if(!elements.has(s))elements.set(s,{innerHTML:'',classList:{add(){},remove(){}},focus(){}});return elements.get(s);},addEventListener(name,fn){(events[name]??=[]).push(fn);}}};vm.createContext(c);for(const f of ['data/event-details.js','integration/event-detail-popup.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../../busan-drop',f),'utf8'),c);return {c,elements};}
test('Monchhichi popup starts with banner and contains actionable researched information',()=>{
 const {c}=setup();const html=c.window.BUSAN_EVENT_DETAIL_HTML({brand:'몬치치',name:'몬치치 팝업',address:'센텀남대로 35',lat:35.16,lng:129.12});
 assert.ok(html.indexOf('event-detail-banner')<html.indexOf('id="eventDetailTitle"'));
 for(const text of ['B2 하이퍼스테이지','11.09 휴점','100,000원 이상','러기지태그','12:00 / 15:00','22,000원','1인 1예약','공식 예약','확인 전'])assert.ok(html.includes(text),text);
 assert.match(html,/role="dialog" aria-modal="true"/);assert.doesNotMatch(html,/>무료</);
});
test('Olive Young preserves channel and store participation limits',()=>{
 const {c}=setup();const html=c.window.BUSAN_EVENT_DETAIL_HTML({brand:'올리브영',name:'올리브영 남포타운점',address:'부산 중구',lat:35.1,lng:129});
 for(const text of ['29,900원','6,900원','39,900원','타입별 1인 1개','온라인 라스트픽','선택한 부산 매장의 공통 할인율이 아닙니다','참여 자격','판매 지점'])assert.ok(html.includes(text),text);
});
test('unknown brand events do not receive fabricated dates or offers and escaped addresses are safe',()=>{
 const {c,elements}=setup(),item={brand:'티파니앤코',name:'티파니 센텀',address:'<img onerror="bad">',lat:35,lng:129};
 c.window.BUSAN_OPEN_EVENT_DETAIL(item);const html=elements.get('#modal').innerHTML;
 assert.match(html,/행사 상세 정보를 준비/);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img onerror|2026\.11\.01/);
});

test('Google directions stays in the fixed footer without a duplicate by the address',()=>{
 const {c}=setup();const html=c.window.BUSAN_EVENT_DETAIL_HTML({brand:'몬치치',name:'팝업',address:'센텀남대로 35',lat:35.1688179,lng:129.1295233});
 assert.match(html,/data-event-copy-address/);assert.doesNotMatch(html,/event-address-directions/);
 assert.match(html,/<footer class="event-detail-actions"><a class="event-directions" href="https:\/\/www.google.com\/maps\/dir\/\?api=1&destination=35\.1688179,129\.1295233"/);
});

test('research provenance stays internal while visitor conditions remain visible',()=>{
 const {c}=setup();const html=c.window.BUSAN_EVENT_DETAIL_HTML({brand:'몬치치',name:'팝업',address:'센텀남대로 35',lat:35,lng:129});
 assert.doesNotMatch(html,/2차 자료|원문 대조|리서치|재게시 자료|event-evidence|원본 가격표/);
 assert.match(html,/11.09 휴점/);assert.match(html,/선착순·소진 시 종료/);assert.match(html,/현장 방문만으로 입장이 보장되지/);
 assert.equal(c.window.BUSAN_EVENT_DETAILS['몬치치'].sections[0].status,'2차 자료 기준');
});

test('branch profiles and local offers are not applied to other Olive Young branches',()=>{
 const {c}=setup();vm.runInContext(fs.readFileSync(path.join(__dirname,'../../busan-drop/data/store-locations.js'),'utf8'),c);
 const connect=c.window.BUSAN_STORE_LOCATIONS.find(s=>s.id==='oliveyoung-8'),nampo=c.window.BUSAN_STORE_LOCATIONS.find(s=>s.id==='oliveyoung-0'),millac=c.window.BUSAN_STORE_LOCATIONS.find(s=>s.id==='oliveyoung-30');
 const connectHtml=c.window.BUSAN_EVENT_DETAIL_HTML(connect),nampoHtml=c.window.BUSAN_EVENT_DETAIL_HTML(nampo),millacHtml=c.window.BUSAN_EVENT_DETAIL_HTML(millac);
 assert.match(connectHtml,/이 매장 공지의 쿠폰 조건/);assert.match(connectHtml,/00시·18시/);assert.match(connectHtml,/051-667-1238/);
 assert.doesNotMatch(nampoHtml,/00시·18시/);assert.match(nampoHtml,/더마 특화존/);assert.match(nampoHtml,/지점별 특가 품목/);assert.match(millacHtml,/올영호/);
});

test('Uniqlo preserves unconfirmed winter dates and shows independently verified store hours and tax-free exception',()=>{
 const {c}=setup();vm.runInContext(fs.readFileSync(path.join(__dirname,'../../busan-drop/data/store-locations.js'),'utf8'),c);
 const rows=c.window.BUSAN_STORE_LOCATIONS.filter(s=>s.brand==='유니클로');assert.equal(rows.length,9);
 const seomyeon=rows.find(s=>s.id==='uniqlo-6'),saha=rows.find(s=>s.id==='uniqlo-4');
 const html=c.window.BUSAN_EVENT_DETAIL_HTML(seomyeon),sahaHtml=c.window.BUSAN_EVENT_DETAIL_HTML(saha);
 for(const text of ['공식 일정 안내 전','10:30–21:00','이 매장은 면세 이용 불가','051-810-3330','서면역 7번'])assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/undefined|2026\.11\.20|2026\.11\.27|더플백|티슈|50%|70%/);
 assert.match(sahaHtml,/현금 결제 불가/);assert.doesNotMatch(sahaHtml,/이 매장은 면세 이용 불가/);
 assert.equal(c.window.BUSAN_EVENT_DETAILS['유니클로'].start,null);assert.equal(c.window.BUSAN_EVENT_DETAILS['유니클로'].verified,false);
});

test('Zara pins show campaign guidance, branch hours and sections without fabricated sale dates or percentages',()=>{
 const {c}=setup();vm.runInContext(fs.readFileSync(path.join(__dirname,'../../busan-drop/data/store-locations.js'),'utf8'),c);
 const rows=c.window.BUSAN_STORE_LOCATIONS.filter(s=>s.brand==='자라');assert.equal(rows.length,3);
 const seomyeon=rows.find(s=>s.id==='zara-9302'),centum=rows.find(s=>s.id==='zara-14970');
 const a=c.window.BUSAN_EVENT_DETAIL_HTML(seomyeon),b=c.window.BUSAN_EVENT_DETAIL_HTML(centum);
 for(const html of [a,b]){for(const text of ['자라 블랙프라이데이 안내','공식 일정 안내 전','31일','최초 구매 매장','할인 코드를 제공하지','080-305-1200','공식 매장 안내'])assert.ok(html.includes(text),text);assert.doesNotMatch(html,/undefined|2026\.11\.27|2026\.12\.01|최대 40%|20시|21시|2차 자료|원문 대조/);}
 assert.match(a,/11:00–22:30/);assert.match(a,/여성 · 남성 컬렉션 취급/);assert.doesNotMatch(a,/여성 · 남성 · 아동 컬렉션 취급/);
 assert.match(b,/10:30–20:30/);assert.match(b,/여성 · 남성 · 아동 컬렉션 취급/);
 assert.equal(c.window.BUSAN_EVENT_DETAILS['자라'].start,null);assert.equal(c.window.BUSAN_EVENT_DETAILS['자라'].maxDiscount,null);
 assert.equal(seomyeon.lat,35.155406);assert.equal(centum.lng,129.131306);
});

test('venue maps follow selected branch coordinates and release resources on replacement and navigation',()=>{
 const {c}=setup(),maps=[],pins=[],observers=[];
 c.window.BUSAN_MAPBOX_CONFIG={token:'test-public-token',style:'test-style'};
 c.window.mapboxgl={Map:class{constructor(options){this.options=options;this.removed=false;maps.push(this);}addControl(){}on(){}remove(){this.removed=true;}},Marker:class{setLngLat(coords){pins.push(coords);return this;}addTo(){return this;}},AttributionControl:class{},NavigationControl:class{}};
 c.MutationObserver=class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}};
 const first={brand:'유니클로',name:'서면',address:'부산',lat:35.156642,lng:129.056003};
 c.window.BUSAN_OPEN_EVENT_DETAIL(first);
 assert.deepEqual(Array.from(maps[0].options.center),[129.056003,35.156642]);
 assert.deepEqual(Array.from(pins[0]),[129.056003,35.156642]);
 c.window.BUSAN_OPEN_EVENT_DETAIL({...first,name:'사하',lat:35.090635,lng:128.963936});
 assert.equal(maps[0].removed,true);assert.equal(observers[0].disconnected,true);
 assert.deepEqual(Array.from(maps[1].options.center),[128.963936,35.090635]);
 observers[1].callback();assert.equal(maps[1].removed,true);
 c.window.BUSAN_OPEN_EVENT_DETAIL({...first,lat:null});assert.equal(maps.length,2);
 assert.doesNotMatch(c.window.BUSAN_EVENT_DETAIL_HTML({...first,lat:null}),/id="eventVenueMap"/);
});

test('new Busan popups keep official prices, distinct B1 venues and uncertain fan/show conditions separate',()=>{
 const {c}=setup();vm.runInContext(fs.readFileSync(path.join(__dirname,'../../busan-drop/data/store-locations.js'),'utf8'),c);
 const w=c.window.BUSAN_STORE_LOCATIONS.find(s=>s.brand==='와키윌리'),t=c.window.BUSAN_STORE_LOCATIONS.find(s=>s.brand==='참치학교');
 const wh=c.window.BUSAN_EVENT_DETAIL_HTML(w),th=c.window.BUSAN_EVENT_DETAIL_HTML(t);
 for(const text of ['B1 키네틱 스테이지','87,200원','263,200원','안내 상품 4종','11.09 휴점','방문·팬사인회 일정은 확인되지'])assert.ok(wh.includes(text),text);
 for(const text of ['폴바셋 앞','32,000원','84,000원','11월 7일(토) 오후 4시','11월 14일 추가 일정','051-678-2173'])assert.ok(th.includes(text),text);
 assert.doesNotMatch(th,/11.09 휴점|31%|전 품목|무료 시식/);
 for(const item of [w,t]){assert.ok(Number.isFinite(item.lat)&&Number.isFinite(item.lng));assert.match(item.coordinateNote,/건물 기준/);}
});

test('Mugiwara entry limits, YJACK exclusions and Gelato Pique gifts retain their individual scope',()=>{
 const {c}=setup();vm.runInContext(fs.readFileSync(path.join(__dirname,'../../busan-drop/data/store-locations.js'),'utf8'),c);
 const render=brand=>c.window.BUSAN_EVENT_DETAIL_HTML(c.window.BUSAN_STORE_LOCATIONS.find(s=>s.brand===brand));
 const m=render('원피스 무기와라 스토어'),y=render('와이잭'),g=render('젤라또 피케');
 for(const value of ['팬덤스페이스','1인 1일 1회','11월 2일–26일','예약자 본인','중복 증정은 불가','45,000원'])assert.ok(m.includes(value),value);
 for(const value of ['크록스 앞','19,900–39,000원','150,000원','300,000원','균일가·일부 상품은 제외'])assert.ok(y.includes(value),value);
 assert.doesNotMatch(y,/11.09 휴점|최대 90%/);
 for(const value of ['99,500원','155,400원','모바일상품권','피너츠 키링','홀리데이 핸드타월','룸슬리퍼','전원 적용 혜택이 아니'])assert.ok(g.includes(value),value);
 assert.doesNotMatch(g,/최대 50%|전 품목 50%/);
});

test('San-X preserves January end and conditional gifts; Maple requires paid admission with separate costs',()=>{
 const {c}=setup();vm.runInContext(fs.readFileSync(path.join(__dirname,'../../busan-drop/data/store-locations.js'),'utf8'),c);
 const sanx=c.window.BUSAN_STORE_LOCATIONS.find(s=>s.id==='sanx-popup-2026'),maple=c.window.BUSAN_STORE_LOCATIONS.find(s=>s.id==='maplestory-popup-2026');
 const sh=c.window.BUSAN_EVENT_DETAIL_HTML(sanx),mh=c.window.BUSAN_EVENT_DETAIL_HTML(maple);
 for(const text of ['2027.01.31','코구마르쉐 상품 포함 50,000원','150,000원','중복 증정이 가능','포토회는 종료된'])assert.ok(sh.includes(text),text);
 for(const text of ['유료 파크 입장권','별도 확인','화요일 휴연','파크 전체 휴장을 뜻하지','49,000원','방문일'])assert.ok(mh.includes(text),text);
 assert.doesNotMatch(mh,/11.09 휴점|무료 팝업|전원 실물 경품 증정됩니다/);
 assert.equal(maple.lat,35.19602);assert.equal(maple.lng,129.2132);assert.match(maple.coordinateSource,/visitbusan/);
});

test('Harry Potter and Hinakuu preserve separate gift rules, venue ambiguity and current entry conditions',()=>{
 const {c}=setup(),build=brand=>c.window.BUSAN_EVENT_DETAIL_HTML({brand,name:brand,address:'부산광역시 부산진구 가야대로 772',lat:35.1568527,lng:129.0566158});
 const harry=build('해리포터 마호도코로'),hina=build('히나쿠우');
 assert.match(harry,/harrypotter-user-20261106.png/);assert.match(harry,/2027.01.07/);assert.match(harry,/중복 증정되지/);assert.match(harry,/08:00/);assert.doesNotMatch(harry,/15만원/);
 assert.match(hina,/hinakuu-user-20261106.png/);assert.match(hina,/2026.11.10/);assert.match(hina,/포토카드 5종 중복 없이/);assert.match(hina,/키네틱 스테이지/);assert.match(hina,/팬덤스페이스/);assert.match(hina,/품목·옵션별 최대 2개/);assert.match(hina,/11.09 휴점/);
});
