const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../../busan-drop');
function setup({noMap=false,language='ko'}={}){
 const events={},elements=new Map(),maps=[],pins=[];
 const el=()=>({dataset:{},hidden:true,innerHTML:'',classList:{},listeners:{},addEventListener(name,fn){this.listeners[name]=fn;},setAttribute(){},replaceWith(){},querySelector(selector){if(!this.children)this.children={};return this.children[selector]??=el();}});
 const document={querySelectorAll(){return [];},createElement:el,querySelector(s){if(s==='.store-brand-filters')return null;if(!elements.has(s))elements.set(s,el());return elements.get(s);},addEventListener(name,fn){(events[name]??=[]).push(fn);}};
 class MapMock{constructor(options){this.options=options;maps.push(this);}addControl(){}on(){}remove(){this.removed=true;}isStyleLoaded(){return true;}getLayer(){return false;}resize(){}jumpTo(o){this.camera=o;}flyTo(o){this.camera=o;}fitBounds(bounds){this.bounds=bounds.points;}zoomIn(){}zoomOut(){}}
 class Marker{constructor(o){this.element=o.element;pins.push(this);}setLngLat(ll){this.ll=ll;return this;}addTo(){return this;}remove(){this.removed=true;}}
 const mapboxgl={Map:MapMock,Marker,AttributionControl:class{},LngLatBounds:class{constructor(){this.points=[];}extend(p){this.points.push(p);return this;}}};
 const c={document,window:{mapboxgl,BUSAN_MAPBOX_CONFIG:{token:'test',style:'mapbox://styles/mapbox/dark-v11'}},mapboxgl,state:{screen:'stores',storeView:'map',brand:1,language,mapLocal:false,storeRegion:null},brands:['탑텐','올리브영','유니클로','자라','몬치치','티파니앤코'].map(name=>({name})),head:()=>'<header class="app-head"></header>',storeMap(){},bindStoreMap(){},render(){c.bindStoreMap();},icon:()=>'<svg/>',esc:String};
 vm.createContext(c);
 for(const f of ['data/store-locations.js','data/event-catalog.js','data/event-details.js','integration/store-events-model.js','integration/mapbox-view.js','integration/store-mapbox.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
 if(noMap)c.window.mapboxgl=null;
 const opened=[];c.window.BUSAN_OPEN_EVENT_DETAIL=item=>opened.push(item);
 const click=(selector,dataset)=>events.click[0]({target:{closest:s=>s===selector?{dataset,setAttribute(){}}:null}});
 return {c,maps,pins,elements,click,opened};
}

function openUniqlo(h){h.c.state.brand=2;h.c.state.storeView='list';h.click('[data-store-event-open]',{storeEventOpen:'uniqlo-4'});}
test('branch rows show venue names with direct details actions, without district selection or extra preview',()=>{
 const h=setup();h.c.state.brand=2;h.c.state.storeView='list';const html=h.c.storeMap();
 const choices=html.match(/<div class="branch-number-choices"[\s\S]*?<\/article>/)[0];
 for(const item of h.c.window.BUSAN_STORE_LOCATIONS.filter(x=>x.brand==='유니클로')){assert.ok(choices.includes(`data-store-detail="${item.id}"`));assert.ok(choices.includes(item.name));}
 assert.doesNotMatch(choices,/data-branch-pin|branch-selected-location|aria-pressed/);
});
test('all nine branch buttons open the matching venue directly',()=>{
 const h=setup();openUniqlo(h);
 for(const item of h.c.window.BUSAN_STORE_LOCATIONS.filter(x=>x.brand==='유니클로')){h.click('[data-store-detail]',{storeDetail:item.id});assert.equal(h.opened.at(-1).id,item.id);assert.equal(h.c.state.realStoreId,item.id);}
});
test('map includes all nine coordinates and every numbered pin opens its own event',()=>{
 const h=setup();openUniqlo(h);const rows=h.c.window.BUSAN_STORE_LOCATIONS.filter(x=>x.brand==='유니클로');
 assert.equal(h.pins.length,9);assert.equal(h.maps[0].bounds.length,9);
 rows.forEach((item,i)=>{assert.deepEqual(Array.from(h.pins[i].ll),[item.lng,item.lat]);assert.equal(h.pins[i].element.textContent,String(i+1));h.pins[i].element.listeners.click({stopPropagation(){}});assert.equal(h.opened.at(-1).id,item.id);});
 h.click('[data-branch-overview]',{});assert.equal(h.maps[0].bounds.length,9);
});
test('map failure preserves direct branch access and clear fallback copy',()=>{
 const h=setup({noMap:true});openUniqlo(h);const panel=h.elements.get('[data-store-event-branches="uniqlo-4"]');
 assert.match(panel.querySelector('.branch-map-status').textContent,/아래 지점명/);
 h.click('[data-store-detail]',{storeDetail:'uniqlo-8'});assert.equal(h.opened.at(-1).id,'uniqlo-8');
});
test('guidance and actions support all five UI languages',()=>{
 for(const language of ['ko','en','ja','zh','zh-TW']){const h=setup({language});h.c.state.brand=2;h.c.state.storeView='list';const html=h.c.storeMap();assert.match(html,/branch-choice-action/);if(language!=='ko')assert.doesNotMatch(html,/지도나 지점명을/);}
});
test('stale branch action cannot open a venue excluded by the active filters',()=>{
 const h=setup();h.c.state.brand=2;h.click('[data-store-detail]',{storeDetail:'zara-9302'});assert.equal(h.opened.length,0);
});
