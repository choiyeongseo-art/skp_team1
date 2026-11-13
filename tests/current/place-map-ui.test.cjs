const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.join(__dirname,'../../busan-drop/integration'),shopping=fs.readFileSync(path.join(base,'shopping-pass.js'),'utf8'),library=fs.readFileSync(path.join(base,'my-library.js'),'utf8');
const part=(source,start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
test('food and sights expose independent list/map tabs',()=>{
 const c={nearbyKind:()=> 'food',nearbyView:()=> 'map',nearbyMapIcon:()=>'<svg>food</svg>'};vm.createContext(c);vm.runInContext(part(shopping,' function tourMapMarkup()',' function revealTourPreview('),c);
 assert.match(c.tourMapMarkup(),/행사장 주변 맛집 지도/);assert.match(c.tourMapMarkup(),/data-tour-view="map" aria-pressed="true"/);assert.match(c.tourMapMarkup(),/food<\/svg>/);
 c.nearbyKind=()=> 'sights';c.nearbyView=()=> 'list';assert.doesNotMatch(c.tourMapMarkup(),/id="passTourMap"/);assert.match(c.tourMapMarkup(),/data-tour-view="list" aria-pressed="true"/);
});
test('food map uses the cuisine-filtered dataset without the ten-row list limit',()=>{
 const rows=Array.from({length:21},(_,i)=>({id:String(i),type:i%2?'cafe':'other'}));const c={currentStep:()=>4,nearbyList:()=>rows,foodGroup:'cafe',venueChoice:()=>({food:[]}),window:{BUSAN_MY_LIBRARY_MODEL:{filterFood:(places,q,group)=>places.filter(p=>p.type===group)}}};vm.createContext(c);
 vm.runInContext(part(shopping,' const nearbyKind=',' const nearbyMapIcon=').replaceAll(' const ',' var '),c);assert.equal(c.mapPlaces().length,10);c.foodGroup='other';assert.equal(c.mapPlaces().length,11);c.currentStep=()=>3;assert.equal(c.mapPlaces().length,21);
});
test('food map add/remove changes only the active venue food selection',()=>{
 const group={sights:['sight'],food:[],foodPlaces:[]},selection={},place={id:'food-1'},c={venueChoice:()=>group,tourControl:{dataset:{tourAdd:place.id}},nearbyKind:()=> 'food',mapPlaces:()=>[place],nearbyList:()=>[place],syncVenuePlaces(){},selection:()=>selection,persistPass(){},showTourPreview(){},document:{querySelector:()=>null}};vm.createContext(c);
 const block=shopping.match(/else \{const s=venueChoice\(\),id=tourControl.dataset.tourAdd,kind=nearbyKind\(\);[\s\S]*?\n   return;/)[0].replace(/^else /,'').replace(/\n   return;$/,'');
 // Wrap for the stale-place early return in the real event handler.
 vm.runInContext('function add(){'+block+'}',c);c.add();assert.deepEqual(Array.from(group.food),['food-1']);assert.equal(group.foodPlaces[0].id,place.id);assert.deepEqual(group.sights,['sight']);c.add();assert.equal(group.food.length,0);
});
function mapSetup(points){
 const pins=[],maps=[],controls=['','a','b'].map(id=>({dataset:{mapVenue:id},setAttribute(){},addEventListener(n,fn){this.click=fn;}})),panel={hidden:true,innerHTML:'',querySelectorAll:()=>[],getBoundingClientRect:()=>({top:450})},host={},scroll=[];
 const c={itineraryMarkers:[],itineraryMap:null,mapRows:points,state:{language:'en'},esc:String,window:{BUSAN_MAPBOX_CONFIG:{token:'fake',style:'fake'},BUSAN_PLACE_CARD:{mapIcon:kind=>'<svg>'+kind+'</svg>'},BUSAN_TOURISM_I18N:{display:x=>x},matchMedia:()=>({matches:true})},document:{querySelector:s=>s==='#libraryRouteMap'?host:s==='.venue-map-preview'?panel:s==='#viewport'?{scrollTop:0,getBoundingClientRect:()=>({top:0}),scrollTo:o=>scroll.push(o)}:null,querySelectorAll:s=>s==='[data-map-venue]'?controls:[],createElement:()=>({setAttribute(n,v){this[n]=v;},addEventListener(n,fn){this[n]=fn;}})}};
 class Map{constructor(){maps.push(this);this.events={};}remove(){this.removed=true;}resize(){}addControl(){}on(n,fn){this.events[n]=fn;}project(ll){return {x:ll[0]*100,y:ll[1]*100};}fitBounds(b){this.bounds=b.points;}addSource(n,v){this.source=v;}addLayer(v){this.layer=v;(this.layers??=[]).push(v);}getLayer(n){return n==='full-itinerary'&&!!this.layer;}setPaintProperty(...v){this.paint=v;}setLayoutProperty(){}}
 c.mapboxgl={Map,AttributionControl:class{},LngLatBounds:class{constructor(){this.points=[];}extend(p){this.points.push(p);}},Marker:class{constructor(options){this.options=options;this.element=options.element;pins.push(this);}setLngLat(p){this.position=p;return this;}addTo(){return this;}remove(){this.removed=true;}}};vm.createContext(c);vm.runInContext(part(library,' const placeKind=',' document.addEventListener(\'toggle\''),c);c.bindItineraryMap();return {c,pins,maps,controls,panel,scroll,active:()=>pins.filter(p=>!p.removed)};
}
const points=[{id:'event:a',eventId:'a',kind:'event',name:'Venue A',lat:35,lng:129},{id:'food:a',eventId:'a',kind:'food',name:'Food A',lat:36,lng:130},{id:'sight:b',eventId:'b',kind:'sights',name:'Sight B',lat:37,lng:131}];
test('review map uses category icons and venue labels instead of sequence numbers',()=>{const h=mapSetup(points);assert.equal(h.active().length,3);assert.match(h.active()[0].element.innerHTML,/Venue A/);assert.match(h.active()[1].element.innerHTML,/>food</);h.active()[1].element.click();assert.match(h.panel.innerHTML,/Food A/);assert.match(h.panel.innerHTML,/data-map-list="food:a"/);assert.equal(h.panel.hidden,false);});
test('venue focus dims other pins, fits selected venues and highlights only their lines',()=>{const h=mapSetup(points);h.maps[0].events.load();h.controls[1].click();assert.equal(h.active().filter(p=>p.element.className.includes('is-dimmed')).length,1);assert.equal(h.maps[0].bounds.length,2);assert.equal(h.maps[0].paint[2][1][2],'a');h.controls[0].click();assert.equal(h.active().filter(p=>p.element.className.includes('is-dimmed')).length,0);assert.equal(h.maps[0].bounds.length,3);});
test('overview always renders each nearby or co-located place at its exact coordinate',()=>{
 for(const close of [points.map((p,i)=>({...p,lat:35+i/10000,lng:129+i/10000})),points.map(p=>({...p,lat:35,lng:129}))]){
  const h=mapSetup(close);assert.equal(h.active().length,close.length);
  h.active().forEach((marker,i)=>{assert.deepEqual(Array.from(marker.position),[close[i].lng,close[i].lat]);assert.deepEqual(Array.from(marker.options.offset),[0,0]);assert.doesNotMatch(marker.element.className,/is-cluster/);marker.element.click();assert.ok(h.panel.innerHTML.includes(close[i].name));});
  assert.equal(h.maps[0].events.moveend,undefined);
 }
});
test('group lines connect only each venue to its own nearby places',()=>{const h=mapSetup(points);h.maps[0].events.load();const f=h.maps[0].source.data.features;assert.equal(f.length,1);assert.equal(f[0].properties.eventId,'a');assert.deepEqual(Array.from(f[0].geometry.coordinates[0]),[129,35]);assert.deepEqual(Array.from(f[0].geometry.coordinates[1]),[130,36]);});
test('food map mounts every valid filtered coordinate with fork-and-knife pins and preview actions',()=>{
 const pins=[],places=Array.from({length:14},(_,i)=>({id:'food-'+i,lat:i===13?null:35+i/100,lng:129+i/100,name:'Food '+i,distance:i*100})),previews=[];
 const c={map:null,markers:[],tourCamera:null,tourCameraKey:'',tourKey:()=> 'venue-a',foodGroup:'all',nearbyKind:()=> 'food',mapPlaces:()=>places,nearbyMapIcon:()=>'<svg>fork-and-knife</svg>',tourDistance:p=>p.distance+'m',showTourPreview:o=>previews.push(o),tourFocused:null,dispose(){},model:{coordinateGroups:()=>[]},document:{querySelector:()=>({}),querySelectorAll:()=>[],createElement:()=>({dataset:{},setAttribute(){},addEventListener(n,fn){this[n]=fn;}})},window:{BUSAN_TOURISM_I18N:{display:p=>p},BUSAN_MAPBOX_CONFIG:{token:'fake',style:'fake'}}};
 c.mapboxgl={Map:class{addControl(){}fitBounds(){}},AttributionControl:class{},LngLatBounds:class{extend(){}},Marker:class{constructor({element}){pins.push(element);}setLngLat(){return this;}addTo(){return this;}}};vm.createContext(c);vm.runInContext(part(shopping,' function initTourMap(route)',' function foodHoursDetails('),c);c.initTourMap([{item:{lat:35,lng:129}}]);assert.equal(pins.length,13);assert.ok(pins.every(p=>p.className.includes('pass-food-pin')&&p.innerHTML.includes('fork-and-knife')));pins[2].click();assert.equal(c.tourFocused,'food-2');assert.equal(previews.at(-1).reveal,true);
});
test('240px card maps isolate each venue and dispose old map instances on rerender',()=>{
 const h=mapSetup(points),labels=[{},{}],hosts=['a','b'].map((id,i)=>({dataset:{venueMiniMap:id},parentElement:{querySelector:()=>labels[i]}})),original=h.c.document.querySelectorAll;
 h.c.document.querySelectorAll=selector=>selector==='[data-venue-mini-map]'?hosts:original(selector);h.c.mapboxgl.NavigationControl=class{};
 h.c.bindVenueMiniMaps();assert.equal(h.maps.length,3);h.maps[1].events.load();h.maps[2].events.load();assert.equal(h.maps[1].bounds.length,2);assert.equal(h.maps[2].bounds.length,1);
 assert.ok(h.maps[1].bounds.every(p=>p[0]<131));assert.equal(h.maps[1].source.data.features.length,1);assert.ok(h.maps[1].layers.some(layer=>layer.id==='venue-direction-arrows'&&layer.layout['symbol-placement']==='line'));
 h.active().find(p=>p.element['aria-label']==='맛집 · Food A'&&p.position[0]===130).element.click();
 // Both overview and mini-map pins target the same stable row; the mini label also resolves it.
 const miniPins=h.pins.slice(3);miniPins.find(p=>p.element['aria-label']==='맛집 · Food A').element.click();assert.match(labels[0].innerHTML,/Food A/);
 h.c.bindVenueMiniMaps();assert.equal(h.maps[1].removed,true);assert.equal(h.maps[2].removed,true);
 const css=fs.readFileSync(path.join(base,'my-library.css'),'utf8');assert.match(css,/\.venue-mini-map\{height:240px/);
});
test('review shows labeled travel dates before the visit schedule and embeds maps in cards',()=>{
 const review=part(shopping,' function review()',' function foodTools()');assert.ok(review.indexOf('내 여행기간')<review.indexOf('state.visitStart'));assert.ok(review.indexOf('state.visitStart')<review.indexOf('방문 스케줄'));assert.ok(review.indexOf('방문 스케줄')<review.indexOf('plan-kind-summary'));
 const grouped=part(library,' function groupedHtml(',' window.BUSAN_MY_LIBRARY=');assert.ok(grouped.includes('data-venue-mini-map="${esc(group.id)}"'));assert.ok(grouped.indexOf('class="venue-visit-list"')<grouped.indexOf('data-venue-mini-map'));assert.ok(grouped.indexOf('venue-group-heading')<grouped.indexOf('class="venue-visit-list"'));assert.ok(grouped.indexOf('data-venue-mini-map')<grouped.indexOf('data-venue-edit'));
});
test('review renders event and place thumbnails with compact copy and boundary-aware arrows',()=>{
 const route=[{campaign:{id:'a',title:'Event A',image:'event.jpg'},event:{title:'Event A'},item:{address:'Venue address'}}],places=[{id:'s',eventId:'a',kind:'sights',name:'Sight',image:'sight.jpg',address:'Sight address'},{id:'f',eventId:'a',kind:'food',name:'Food',image:'food.jpg',address:'Food address'}];
 const c={model:require('../../busan-drop/integration/my-library-model'),mapRows:[],esc:String,window:{BUSAN_TOURISM_I18N:{display:p=>p}},pinIcon:()=>'<svg/>',placeKind:()=>'',};vm.createContext(c);vm.runInContext(part(library,' function splitHoursLines(',' window.BUSAN_MY_LIBRARY='),c);
 const html=c.groupedHtml({flow:'venue-groups',routeSnapshot:route,places},{edit:true});
 assert.match(html,/assets\/banners\/home-20261105\/event.jpg/);assert.match(html,/src="sight.jpg"/);assert.match(html,/src="food.jpg"/);assert.match(html,/>Event A<\/strong>/);
 assert.match(html,/data-venue-stop-move="up"[^>]+data-stop-id="event:a"[^>]+disabled/);assert.match(html,/data-venue-stop-move="down"[^>]+data-stop-id="place:a:f"[^>]+disabled/);
 assert.doesNotMatch(html,/class="venue-place-kind"/);assert.match(html,/venue-mini-toolbar[\s\S]*?venue-mini-selection[\s\S]*?data-venue-edit/);assert.doesNotMatch(html,/class="venue-group-edit"/);assert.match(html,/data-venue-remove="a"/);assert.match(html,/>주변 장소 추가·다시 선택 ↗<\/button>/);assert.ok(html.indexOf('class="venue-visit-list"')<html.indexOf('data-venue-mini-map'));assert.ok(html.indexOf('data-venue-mini-map')<html.indexOf('data-venue-edit'));assert.doesNotMatch(html,/핀을 눌러 장소를 확인하세요/);
});

test('review marker CSS preserves the Mapbox absolute origin for every pin type',()=>{
 const css=fs.readFileSync(path.join(base,'my-library.css'),'utf8').replace(/\/\*[\s\S]*?\*\//g,''),rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
 const rootRules=rules.filter(([,selector])=>selector.split(',').some(s=>/\.venue-map-pin(?:\.[\w-]+)*$/.test(s.trim())));
 assert.ok(rootRules.length>0);for(const [selector,body]of rootRules)assert.doesNotMatch(body,/position\s*:\s*(relative|static|fixed|sticky)/,selector);
 const origin=rules.find(([,selector])=>selector.trim()==='#phone .venue-map-pin.mapboxgl-marker');assert.ok(origin);assert.match(origin[2],/position:absolute/);assert.match(origin[2],/top:0/);assert.match(origin[2],/left:0/);assert.match(origin[2],/margin:0/);
});
test('co-located mini-map places share the exact coordinate with zero artificial offset',()=>{
 const same=points.map((p,i)=>i<2?{...p,lat:35,lng:129}:p),snapshot=JSON.stringify(same),h=mapSetup(same),label={},host={dataset:{venueMiniMap:'a'},parentElement:{querySelector:()=>label}},before=h.pins.length;
 h.c.document.querySelectorAll=selector=>selector==='[data-venue-mini-map]'?[host]:[];h.c.mapboxgl.NavigationControl=class{};h.c.bindVenueMiniMaps();
 const mini=h.pins.slice(before);assert.equal(mini.length,1);assert.deepEqual(Array.from(mini[0].position),[129,35]);assert.deepEqual(Array.from(mini[0].options.offset),[0,0]);assert.match(mini[0].element.innerHTML,/1·2/);
 mini[0].element.click();assert.match(label.innerHTML,/Venue A/);assert.match(label.innerHTML,/Food A/);assert.equal(JSON.stringify(same),snapshot);
});
