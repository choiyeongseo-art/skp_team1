const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function setup(){const events={},elements=new Map();const c={window:{},state:{language:'ko'},brands:[{name:'몬치치',cat:'팝업'},{name:'올리브영',cat:'뷰티'}],esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),document:{activeElement:null,querySelector(s){if(s==='.event-detail-overlay'||s==='.event-detail-dialog')return null;if(!elements.has(s))elements.set(s,{innerHTML:'',classList:{add(){},remove(){}},focus(){}});return elements.get(s);},addEventListener(name,fn){(events[name]??=[]).push(fn);}}};vm.createContext(c);for(const f of ['data/event-details.js','data/event-display-flow.js','integration/event-detail-popup.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../../busan-drop',f),'utf8'),c);return {c,elements,events};}
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
 assert.match(html,/<footer class="event-detail-actions">[\s\S]*?<a class="event-directions" href="https:\/\/www.google.com\/maps\/dir\/\?api=1&destination=35\.1688179,129\.1295233"/);
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
 for(const text of ['공식 일정 안내 전','10:30–21:00','이 매장은 면세 이용 불가','051-810-3330'])assert.ok(html.includes(text),text);
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
 c.document.createElement=()=>({setAttribute(){}});
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
 assert.match(harry,/harrypotter-user-20261112.png/);assert.match(harry,/2027.01.07/);assert.match(harry,/중복 증정되지/);assert.match(harry,/08:00/);assert.doesNotMatch(harry,/15만원/);
 assert.match(hina,/hinakuu-user-20261106.png/);assert.match(hina,/2026.11.10/);assert.match(hina,/포토카드 5종 중복 없이/);assert.match(hina,/키네틱 스테이지/);assert.match(hina,/팬덤스페이스/);assert.match(hina,/품목·옵션별 최대 2개/);assert.match(hina,/11.09 휴점/);
});

test('saved-list button navigates immediately without reading or changing save state or showing a toast',async()=>{for(const saved of [false,true]){const {c,events}=setup(),routes=[];let reads=0,writes=0,toasts=0;c.nav=screen=>routes.push(screen);c.toast=()=>toasts++;c.window.BUSAN_EVENT_SOCIAL={getState:()=>{reads++;return {loaded:true,saved:saved?[{eventId:'current'}]:[]};},toggleEvent:()=>writes++};await events.click[0]({target:{closest:s=>s==='[data-event-saved-list]'?{}:null}});assert.deepEqual(routes,['saved']);assert.equal(reads,0);assert.equal(writes,0);assert.equal(toasts,0);}});

test('all registered venue content follows the shared contract without dropping researched sections',()=>{
 const {c}=setup();vm.runInContext(fs.readFileSync(path.join(__dirname,'../../busan-drop/data/store-locations.js'),'utf8'),c);
 const order=require('../../internal/event-workflow/contract.json').sections.map(s=>s.key);
 for(const venue of c.window.BUSAN_STORE_LOCATIONS){
  const html=c.window.BUSAN_EVENT_DETAIL_HTML(venue),keys=[...html.matchAll(/data-flow-section="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(keys,[...keys].sort((a,b)=>order.indexOf(a)-order.indexOf(b)),venue.id);
  const event={...c.window.BUSAN_EVENT_DETAILS[venue.brand],...venue.eventOverrides};
  for(const section of event.sections||[])assert.ok(html.includes(c.esc(section.title)),venue.id+': '+section.title);
  assert.ok(html.indexOf('data-flow-section="location"')<html.indexOf('data-flow-section="admission"'),venue.id);
 }
});
test('closure warnings follow the chosen date, while previous closures remain in the full schedule',()=>{
 const {c}=setup(),item={brand:'몬치치',name:'팝업',address:'부산',lat:35,lng:129};
 const current=c.window.BUSAN_EVENT_DETAIL_HTML(item,{visitDate:'2026-11-14'}),closed=c.window.BUSAN_EVENT_DETAIL_HTML(item,{visitDate:'2026-11-09'});
 assert.doesNotMatch(current,/class="event-closure"/);assert.match(current,/11.09 휴점/);assert.match(closed,/class="event-closure"/);
 assert.ok(current.indexOf('data-flow-section="products"')<current.indexOf('data-flow-section="benefits"'));
 assert.match(current,/<details class="event-flow-more">[\s\S]*?48,000원/);
 assert.doesNotMatch(current,/<footer[^>]*>[\s\S]*?event-saved-list/);
});

test('popup removes verification dates and repeated summaries without losing source data',()=>{
 const {c}=setup(),e=c.window.BUSAN_EVENT_DETAILS['몬치치'];
 const html=c.window.BUSAN_EVENT_DETAIL_HTML({brand:'몬치치',name:'팝업',address:'부산',lat:35,lng:129});
 assert.doesNotMatch(html,/확인일|datetime="2026-11-05"/);
 assert.equal(html.split(c.esc(e.entry)).length-1,0);
 assert.equal(html.split(c.esc(e.hours)).length-1,0);
 assert.match(html,/event-hours-kv/);
 assert.equal((html.match(/class="event-table-wrap event-international-table"/g)||[]).length,1);
 assert.equal(e.checked,'2026-11-05');
 assert.doesNotMatch(html,/event-flow-source|기타 안내·문의·출처/);assert.match(html,/02-6288-9714/);
 assert.ok(html.indexOf('data-flow-section="alerts"')<html.indexOf('data-flow-section="location"'));
 assert.ok(html.indexOf('data-flow-section="location"')<html.indexOf('data-flow-section="admission"'));
 assert.match(html,/공식 예약/);
});

test('visit summary separates multiple entries and includes closures; hours use weekday/time pairs',()=>{
 const {c}=setup(),html=c.window.BUSAN_EVENT_DETAIL_HTML({brand:'몬치치',name:'팝업',address:'부산',lat:35,lng:129});
 const summary=html.split('class="event-flow-summary"')[1].split('</dl>')[0];
 assert.match(summary,/<dt>입장 방식<\/dt><dd><span class="event-summary-value">사전예약 우선 입장<\/span><span class="event-summary-value">잔여 인원/);
 assert.match(summary,/<dt>휴점일<\/dt>/);assert.match(summary,/11.09 휴점/);
 assert.match(html,/<h3>운영 시간<\/h3>/);assert.doesNotMatch(html,/전체 휴점일 보기|<h3>날짜·입장·예약/);
 assert.match(html,/<dt><span>월–목<\/span><\/dt><dd><span>10:30–20:00<\/span>/);
 assert.match(html,/<dt><span>금–일<\/span><\/dt><dd><span>10:30–20:30<\/span>/);
});
test('multiple periods, fees and timed performances are separated without assigning unknown hours',()=>{
 const {c}=setup(),item={brand:'몬치치',name:'팝업',address:'부산',lat:35,lng:129};
 const e=c.window.BUSAN_EVENT_DETAILS['몬치치'];e.periods=[{start:'2026-11-05',end:'2026-11-08'},{start:'2026-11-13',end:'2026-11-15'}];e.fee='성인 18,000원 / 청소년 8,000원';e.venue=['제1행사장','제2행사장'];
 const html=c.window.BUSAN_EVENT_DETAIL_HTML(item),summary=html.split('class="event-flow-summary"')[1].split('</dl>')[0];
 assert.match(summary,/2026.11.05 — 2026.11.08<\/span><span/);assert.match(summary,/성인 18,000원<\/span><span/);assert.match(summary,/제1행사장<\/span><span/);
 const drone=c.window.BUSAN_EVENT_DETAIL_HTML({...item,brand:'광안리 M 드론×레이저쇼'});
 assert.match(drone,/<dt><span>11.21<\/span><\/dt><dd><span>19:00/);assert.match(drone,/<dt><span>11.21<\/span><\/dt><dd><span>21:00/);
 const unknown=c.window.BUSAN_EVENT_DETAIL_HTML({...item,brand:'티파니앤코'});assert.match(unknown,/<dd><span>확인 전<\/span>/);
});

test('important admission notes use brand callouts and place has one copy action beside its heading',()=>{
 const {c}=setup(),html=c.window.BUSAN_EVENT_DETAIL_HTML({brand:'몬치치',name:'팝업',address:'센텀남대로 35',lat:35,lng:129});
 assert.match(html,/<small class="event-guidance-callout">현장 방문만으로 입장이 보장되지/);
 assert.match(html,/<div class="event-flow-section-heading"><h3>장소<\/h3><button class="event-address-copy"/);
 assert.equal((html.match(/data-event-copy-address=/g)||[]).length,1);
 assert.doesNotMatch(html,/B2 행사장까지의 실내 이동|장소·교통/);
 const order=[...html.matchAll(/data-flow-section="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(order[order.indexOf('location')-1],'alerts');assert.equal(order[order.indexOf('location')+1],'admission');
});

test('place uses venue/address/transit pairs and section footnotes share the brand callout style',()=>{
 const {c}=setup(),html=c.window.BUSAN_EVENT_DETAIL_HTML({brand:'몬치치',name:'팝업',address:'부산 해운대구 센텀남대로 35 · 센텀시티 B2',lat:35,lng:129});
 assert.match(html,/<dl class="event-place-kv"><div><dt>행사장<\/dt>/);
 assert.match(html,/<dt>주소<\/dt><dd>부산 해운대구 센텀남대로 35<\/dd>/);
 assert.match(html,/<dt>찾아가기<\/dt><dd>부산 2호선/);
 assert.match(html,/data-event-copy-address="부산 해운대구 센텀남대로 35 · 센텀시티 B2"/);
 assert.match(html,/<small class="event-guidance-callout">백화점 영업시간 기준/);
 assert.match(html,/<small class="event-guidance-callout">참고 가격이며/);
 assert.match(html,/<small class="event-guidance-callout">선착순·소진 시 종료/);
});

test('international information lists five separate rows without inferring payment support from legacy prose',()=>{
 const {c}=setup(),item={brand:'몬치치',name:'팝업',address:'부산',lat:35,lng:129};
 const html=c.window.BUSAN_EVENT_DETAIL_HTML(item),table=html.split('event-international-table')[1].split('</table>')[0];
 assert.deepEqual([...table.matchAll(/scope="row">([^<]+)/g)].map(m=>m[1]),['외국인 이용·예약','해외 카드','간편 결제','텍스 리펀','여권 필요 여부']);
 assert.equal((table.match(/event-unknown/g)||[]).length,5);
 const e=c.window.BUSAN_EVENT_DETAILS['몬치치'];e.payment='현금 결제 불가 · 해외 카드·QR 결제는 매장 확인';
 const legacy=c.window.BUSAN_EVENT_DETAIL_HTML(item);assert.match(legacy,/현금 결제 불가/);assert.equal((legacy.split('event-international-table')[1].split('</table>')[0].match(/event-unknown/g)||[]).length,5);
 e.foreignCard='VISA 가능';e.mobilePayment='확인 전';assert.match(c.window.BUSAN_EVENT_DETAIL_HTML(item),/scope="row">해외 카드<\/th><td>VISA 가능/);
});

test('callouts and additional guidance separate sentences without breaking dates, decimals or URLs',()=>{
 const {c}=setup(),format=c.window.BUSAN_EVENT_SENTENCE_LINES;
 assert.equal(format('입장은 보장되지 않습니다. 공식 예약을 확인하세요.'),'입장은 보장되지 않습니다.\n공식 예약을 확인하세요.');
 assert.equal(format('2026.11.14 기준입니다. 가격은 3.5원입니다.'),'2026.11.14 기준입니다.\n가격은 3.5원입니다.');
 assert.equal(format('https://example.com에서 확인하세요.다음 문장입니다.'),'https://example.com에서 확인하세요.\n다음 문장입니다.');
 assert.equal(format('Dr. Kim checked. Next sentence.'),'Dr. Kim checked.\nNext sentence.');
 assert.equal(format('確認してください。次の案内です。'),'確認してください。\n次の案内です。');
 const html=c.window.BUSAN_EVENT_DETAIL_HTML({brand:'몬치치',name:'팝업',address:'부산',lat:35,lng:129});
 assert.match(html,/입장이 보장되지 않습니다\.\n하단의 공식 예약/);
 assert.match(html,/1인 2개 구매 제한 안내가 있습니다\.\n적용 상품/);
});

test('nearby place details share the event dialog shell and retain category-specific researched fields',()=>{
 const {c,elements}=setup();
 const sight={kind:'sights',name:'부산 관광지',address:'부산 주소',image:'https://example.com/photo.jpg',lat:35,lng:129,distance:1250,visitInfo:{admission:'성인 5,000원',usetime:'09:00–18:00',restdate:'월요일',parking:'주차 가능',infocenter:'051-123-4567'},detailDescription:'관광지 상세 소개'};
 const html=c.window.BUSAN_PLACE_DETAIL_HTML(sight);
 for(const text of ['event-detail-dialog event-flow-v3','방문 요약','방문 전 꼭 확인','주소 복사','운영 시간','관광지 소개','5,000원','1.3km','월요일','051-123-4567','길찾기'])assert.ok(html.includes(text),text);
 assert.ok(html.indexOf('data-flow-section="location"')<html.indexOf('data-flow-section="admission"'));
 c.window.BUSAN_OPEN_PLACE_DETAIL(sight);assert.equal(elements.get('#modal').innerHTML,html);
 const food=c.window.BUSAN_PLACE_DETAIL_HTML({kind:'food',name:'맛집',address:'부산',menu:'국밥',hours:'11:00–21:00',businessStatus:{label:'영업 중'},rating:4.3});
 for(const text of ['맛집','국밥','11:00–21:00','4.3 / 5','영업 중','메뉴별 가격은 매장의 최신 안내'])assert.ok(food.includes(text),text);
 assert.doesNotMatch(food,/관광지 소개|관광지<\/span>/);
});
test('nearby details preserve unknown values and reject executable image or website URLs',()=>{
 const {c}=setup();const html=c.window.BUSAN_PLACE_DETAIL_HTML({kind:'food',name:'<img onerror="bad">',image:'javascript:alert(1)',website:'javascript:alert(1)'});
 assert.match(html,/확인 전/);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/src="javascript:|href="javascript:|<img onerror|>무료</);
});
