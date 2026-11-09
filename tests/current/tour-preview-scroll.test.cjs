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
test('only explicit pin selection requests reveal; normal preview rendering preserves scroll',()=>{
 assert.match(source,/tourFocused=place.id;showTourPreview\(\{reveal:true\}\)/);
 assert.match(source,/function showTourPreview\(\{reveal=false\}=\{\}\)/);
 assert.match(source,/if\(place&&reveal\)revealTourPreview\(panel\)/);
 assert.match(source,/tourFocused=null;showTourPreview\(\)/);
});
