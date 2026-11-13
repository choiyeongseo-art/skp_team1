const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../../busan-drop');
function setup(){
 const events={},elements=new Map(),maps=[],pins=[];
 const el=()=>({dataset:{},hidden:false,innerHTML:'',classList:{},addEventListener(){},setAttribute(){},replaceWith(){}});
 const document={createElement:el,querySelector(s){if(s==='.store-brand-filters')return null;if(!elements.has(s))elements.set(s,el());return elements.get(s);},addEventListener(name,fn){(events[name]??=[]).push(fn);}};
 class MapMock{constructor(options){this.options=options;maps.push(this);}addControl(){}on(){}remove(){this.removed=true;}isStyleLoaded(){return true;}getLayer(){return false;}resize(){}jumpTo(o){this.camera=o;}flyTo(o){this.camera=o;}fitBounds(bounds){this.bounds=bounds.points;}zoomIn(){}zoomOut(){}}
 class Marker{constructor(o){this.element=o.element;pins.push(this);}setLngLat(ll){this.ll=ll;return this;}addTo(){return this;}remove(){this.removed=true;}}
 const mapboxgl={Map:MapMock,Marker,AttributionControl:class{},LngLatBounds:class{constructor(){this.points=[];}extend(p){this.points.push(p);return this;}}};
 const c={document,window:{mapboxgl,BUSAN_MAPBOX_CONFIG:{token:'test',style:'mapbox://styles/mapbox/dark-v11'}},mapboxgl,state:{screen:'stores',storeView:'map',brand:1,language:'ko',mapLocal:false,storeRegion:null},brands:['탑텐','올리브영','유니클로','자라','몬치치','티파니앤코'].map(name=>({name})),head:()=>'<header class="app-head"></header>',storeMap(){},bindStoreMap(){},render(){c.bindStoreMap();},icon:()=>'<svg/>',esc:String};
 vm.createContext(c);
 for(const f of ['data/store-locations.js','integration/mapbox-view.js','integration/store-mapbox.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
 const click=(selector,dataset)=>events.click[0]({target:{closest:s=>s===selector?{dataset}:null}});
 return {c,maps,pins,elements,click};
}
test('brand and region selection render only matching real coordinates and reuse the map',()=>{
 const {c,maps,pins,click}=setup();c.render();assert.equal(maps.length,1);assert.equal(pins.filter(p=>!p.removed).length,3);
 assert.match(c.storeMap(),/3개 지점/);
 click('[data-store-brand]',{storeBrand:'3'});assert.equal(maps.length,1);assert.equal(pins.filter(p=>!p.removed).length,3);
 click('[data-store-region]',{storeRegion:'서면'});assert.equal(pins.filter(p=>!p.removed).length,1);assert.equal(c.window.BUSAN_STORE_LOCATIONS.find(row=>row.id===pins.find(p=>!p.removed).element.dataset.storePin).brand,'자라');
 const active=pins.find(p=>!p.removed);assert.ok(active.ll[0]>129&&active.ll[1]>35);
 c.state.screen='home';c.render();assert.ok(maps[0].removed);
});
test('all banner brands have locations and missing brands do not use fictional demo pins',()=>{
 const {c,pins}=setup();
 for(const [brand,count] of [[1,3],[2,9],[3,3],[4,1],[5,1],[0,0]]){
  c.state.brand=brand;c.render();assert.equal(pins.filter(p=>!p.removed).length,count);
 }
 assert.match(c.storeMap(),/등록된 위치가 없어요/);assert.doesNotMatch(c.storeMap(),/시연점|map-world/);
});
test('both maps use the same style and navigation puts stores before brands',()=>{
 const {c,maps}=setup();c.render();assert.equal(maps[0].options.style,'mapbox://styles/mapbox/streets-v12');
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 assert.ok(app.includes("[['home','홈','home'],['stores','매장찾기','store'],['pass','드롭 플랜','ticket']"));
});
test('category narrows brand choices and intersects with region and selected brand',()=>{
 const {c,pins,click}=setup();c.render();
 click('[data-store-category]',{storeCategory:'패션'});
 let html=c.storeMap();assert.ok(html.indexOf('data-store-category')<html.indexOf('data-store-region'));assert.doesNotMatch(html,/data-store-brand=/);
 assert.doesNotMatch(html,/data-store-brand=/);assert.doesNotMatch(html,/data-store-brand="1"/);
 assert.equal(pins.filter(p=>!p.removed).length,13);
 c.state.storeRefineOpen=true;click('[data-store-region]',{storeRegion:'서면'});assert.equal(c.state.storeRefineOpen,false);click('[data-store-brand]',{storeBrand:'3'});
 assert.equal(pins.filter(p=>!p.removed).length,1);assert.equal(c.window.BUSAN_STORE_LOCATIONS.find(row=>row.id===pins.find(p=>!p.removed).element.dataset.storePin).brand,'자라');
 click('[data-store-category]',{storeCategory:'뷰티'});assert.equal(c.state.mapLocal,true);assert.doesNotMatch(c.storeMap(),/data-store-brand=/);assert.doesNotMatch(c.storeMap(),/data-store-brand="3"/);
 assert.equal(pins.filter(p=>!p.removed).length,0);
 click('[data-store-region]',{storeRegion:'남포동'});assert.equal(pins.filter(p=>!p.removed).length,1);
 click('[data-store-category]',{storeCategory:'로컬'});assert.equal(pins.filter(p=>!p.removed).length,0);assert.match(c.storeMap(),/등록된 위치가 없어요/);
 c.state.language='en';assert.match(c.storeMap(),/>All Busan<\/button>/);
});

test('archived TOPTEN is absent from every category and stale selection resets safely',()=>{
 const {c}=setup();c.brands[0].active=false;
 for(const category of ['전체','패션','뷰티']){c.state.storeCategory=category;assert.doesNotMatch(c.storeMap(),/data-store-brand="0"|탑텐/);}
 c.state.brand=0;c.state.storeCategory='전체';c.storeMap();assert.equal(c.state.brand,1);assert.equal(c.state.mapLocal,true);
});

test('store finder keeps the home camera for every brand and uses shared regional zooms',()=>{
 const {c,maps,click}=setup();c.render();
 for(const brand of ['1','2','3','4','5']){click('[data-store-brand]',{storeBrand:brand});assert.equal(maps[0].camera.zoom,10);assert.deepEqual(maps[0].camera.center,c.window.BUSAN_MAPBOX_VIEWS.BUSAN.center);}
 click('[data-store-region]',{storeRegion:'서면'});assert.equal(maps[0].camera.zoom,13.5);assert.deepEqual(maps[0].camera.center,c.window.BUSAN_MAPBOX_VIEWS.서면.center);
});

test('Monchhichi is listed under pop-ups and excluded from local events',()=>{
 const {c,click,pins}=setup();click('[data-store-category]',{storeCategory:'로컬'});assert.doesNotMatch(c.storeMap(),/data-store-brand="4"/);
 click('[data-store-category]',{storeCategory:'팝업'});assert.doesNotMatch(c.storeMap(),/data-store-brand=/);assert.equal(pins.filter(p=>!p.removed).length,1);
});

test('only the three selected Olive Young branches remain, with distinct profiles',()=>{
 const {c}=setup();const rows=c.window.BUSAN_STORE_LOCATIONS.filter(s=>s.brand==='올리브영');
 assert.deepEqual(Array.from(rows,s=>s.id),['oliveyoung-8','oliveyoung-0','oliveyoung-30']);
 for(const store of rows){assert.ok(store.profile.headline);assert.equal(store.profile.features.length,3);}
 assert.equal(rows.find(s=>s.id==='oliveyoung-8').lat,35.141309);
 assert.equal(rows.find(s=>s.id==='oliveyoung-8').profile.eventParticipation,'confirmed-notice');
 assert.equal(rows.find(s=>s.id==='oliveyoung-0').profile.eventParticipation,'unconfirmed');
});

test('nine requested Uniqlo branches have distinct official pins and correct region intersections',()=>{
 const {c,pins,click}=setup();const rows=c.window.BUSAN_STORE_LOCATIONS.filter(s=>s.brand==='유니클로');
 assert.equal(rows.length,9);assert.equal(new Set(rows.map(s=>s.id)).size,9);
 for(const row of rows){assert.equal(row.verification,'official-store-locator');assert.ok(row.source.startsWith('https://map.uniqlo.com/kr/ko/detail/'));assert.ok(row.eventOverrides.hours);assert.equal(row.eventParticipation,'unconfirmed');}
 assert.equal(rows.find(s=>s.id==='uniqlo-0').lat,35.1528);assert.equal(rows.find(s=>s.id==='uniqlo-1').lng,129.036618);assert.equal(rows.find(s=>s.id==='uniqlo-3').lat,35.192088);
 click('[data-store-category]',{storeCategory:'패션'});click('[data-store-brand]',{storeBrand:'2'});assert.equal(pins.filter(p=>!p.removed).length,9);
 click('[data-store-region]',{storeRegion:'서면'});assert.equal(pins.filter(p=>!p.removed).length,2);
 click('[data-store-region]',{storeRegion:'남포동'});assert.equal(pins.filter(p=>!p.removed).length,1);
});

test('food and dessert categories filter their registered event brands independently',()=>{
 const {c,click}=setup();c.render();
 click('[data-store-category]',{storeCategory:'푸드'});
 assert.equal(c.state.storeCategory,'푸드');assert.equal(c.window.BUSAN_STORE_BRAND_CATEGORIES['참치학교'].includes('푸드'),true);
 click('[data-store-category]',{storeCategory:'디저트'});
 assert.equal(c.state.storeCategory,'디저트');assert.equal(c.window.BUSAN_STORE_BRAND_CATEGORIES['달달더마켓'].includes('디저트'),true);
 const html=c.storeMap();assert.match(html,/<details class="store-refine"/);assert.ok(html.indexOf('data-store-category')<html.indexOf('store-refine'));
});

test('expanded finder districts distinguish Centum, Haeundae and Gijang without changing source locations',()=>{
 const {c,click,pins}=setup();const source=c.window.BUSAN_STORE_LOCATIONS;
 const before=JSON.stringify(source);c.render();
 for(const [text,region] of [['부산 해운대구 센텀남대로 35','벡스코/센텀시티'],['부산 해운대구 달맞이길 30','해운대/마린시티'],['부산 기장군 기장해안로 147','송정/기장/정관'],['부산 동구 범일로 125','서면/연산/범일'],['부산 동구 초량동 부산역','부산역'],['부산 사하구 하신중앙로 129','사상/강서/김해공항/하단']]){
  assert.equal(c.window.BUSAN_STORE_REGION_FOR({address:text,name:''}),region);
 }
 click('[data-store-category]',{storeCategory:'전체'});
 click('[data-store-region]',{storeRegion:'벡스코/센텀시티'});
 assert.ok(pins.filter(p=>!p.removed).length>0);
 for(const pin of pins.filter(p=>!p.removed)){const item=source.find(row=>row.id===pin.element.dataset.storePin);assert.equal(c.window.BUSAN_STORE_REGION_FOR(item),'벡스코/센텀시티');}
 const html=c.storeMap();assert.equal((html.match(/data-store-region=/g)||[]).length,11);assert.match(html,/부산 전체/);
 assert.equal(JSON.stringify(source),before);
});
