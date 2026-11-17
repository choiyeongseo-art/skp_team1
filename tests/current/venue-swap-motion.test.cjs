const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const root=__dirname+'/../../busan-drop/integration/',source=fs.readFileSync(root+'shopping-pass.js','utf8');
function motion(reduced=false){const calls=[],nodes=[['first',200],['second',100],['unchanged',300]].map(([id,top])=>({dataset:{mapStop:id},getBoundingClientRect:()=>({top}),animate:(frames,options)=>calls.push({id,frames,options})})),c={window:{matchMedia:()=>({matches:reduced})},document:{querySelectorAll:()=>nodes}};vm.createContext(c);vm.runInContext(source.slice(source.indexOf(' function animateVenueSwap('),source.indexOf(" document.addEventListener('click',e=>{\n  const button=e.target.closest('[data-venue-stop-move]')")),c);c.animateVenueSwap(new Map([['first',100],['second',200],['unchanged',300]]),'first');return calls;}
test('both swapped cards animate from their prior positions with moved-card emphasis',()=>{const calls=motion();assert.equal(calls.length,2);assert.equal(calls[0].frames[0].transform,'translateY(-100px)');assert.equal(calls[1].frames[0].transform,'translateY(100px)');assert.equal(calls[0].options.duration,480);assert.equal(calls[0].frames[0].backgroundColor,'#FFD628');});
test('reduced-motion preference skips movement animations',()=>assert.equal(motion(true).length,0));
test('saved itinerary event markers use the same artwork as the category filters',()=>{
 const c={window:{BUSAN_STORE_BRAND_CATEGORIES:{Signiel:['숙박'],Fashion:['패션'],Popup:['팝업','푸드'],Market:['로컬','디저트']}},home:()=>'',document:{addEventListener(){}}};
 vm.createContext(c);
 for(const file of ['home-categories.js','place-card.js'])vm.runInContext(fs.readFileSync(root+file,'utf8'),c);
 const {BUSAN_CATEGORY_ICON:artwork,BUSAN_PLACE_CARD:place,BUSAN_EVENT_MAP_CATEGORY:category}=c.window;
 for(const [brand,name,asset] of [['Signiel','숙박','stay'],['Fashion','패션','fashion'],['Popup','팝업','popup'],['Market','로컬','busan']]){
  assert.equal(place.mapIcon('event',{brand}),artwork(name));
  assert.ok(place.mapIcon('event',{brand}).includes('flat-black-yellow-'+asset+'.svg'));
 }
 assert.equal(category({brand:'Popup'},'푸드'),'푸드');
 assert.equal(category({brand:'Market'},'디저트'),'디저트');
 assert.match(place.mapIcon('food'),/nearby-food\.webp/);
 assert.notEqual(place.mapIcon('food'),artwork('푸드'));
 assert.match(place.mapIcon('sights'),/nearby-sights\.webp/);
});
