const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../../busan-drop/integration/shopping-pass.js'),'utf8');
function scroll({scrollTop=200,panelTop=600,viewportTop=100,reduced=false,missing=false}={}){
 const calls=[],viewport={scrollTop,getBoundingClientRect:()=>({top:viewportTop}),scrollTo:options=>calls.push(options)};
 const context={document:{querySelector:()=>missing?null:viewport},window:{matchMedia:()=>({matches:reduced})}};
 vm.createContext(context);vm.runInContext(source.match(/ function revealTourPreview\(panel\)\{[\s\S]*?\n \}/)[0],context);
 context.revealTourPreview({getBoundingClientRect:()=>({top:panelTop})});return calls;
}
test('pin preview scrolls the phone viewport to the card with a 12px top gap',()=>{const [result]=scroll();assert.equal(result.top,688);assert.equal(result.behavior,'smooth');});
test('reduced motion uses immediate scrolling and never scrolls before the content start',()=>{const [result]=scroll({scrollTop:0,panelTop:95,reduced:true});assert.equal(result.top,0);assert.equal(result.behavior,'auto');});
test('missing viewport is safe',()=>assert.equal(scroll({missing:true}).length,0));
test('map popup replaces the below-map reveal without scrolling the page',()=>{
 const calls=[],place={id:'tour',name:'관광지',lat:35,lng:129,distance:100},panel={hidden:false};
 const c={tourPopup:null,tourFocused:'tour',map:{easeTo:options=>calls.push(options)},nearbyKind:()=> 'sights',mapPlaces:()=>[place],venueChoice:()=>({sights:[]}),tourDistance:()=> '100m',esc:String,window:{BUSAN_TOURISM_I18N:{display:p=>p}},document:{querySelector:()=>panel,querySelectorAll:()=>[]},mapboxgl:{Popup:class{setLngLat(){return this}setHTML(){return this}addTo(){return this}on(){return this}}}};
 vm.createContext(c);vm.runInContext(source.slice(source.indexOf(' function showTourPreview('),source.indexOf(' function initTourMap(')),c);c.showTourPreview();assert.equal(panel.hidden,true);assert.deepEqual(Array.from(calls[0].center),[129,35]);assert.equal(calls[0].offset[1],70);
});
