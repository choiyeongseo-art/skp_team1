const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../../busan-drop/integration/event-social.js','utf8');
const tick=()=>new Promise(r=>setImmediate(r));
function setup({signed=true,initialSaved=false,base=1,guestSaved=false}={}){
 let owner=signed?'account':null,entries=initialSaved?[{eventId:'event'}]:[],fail=false;
 const handlers={},winHandlers={},count={textContent:''},button={dataset:{eventSocialSave:'event',eventStore:'store'},classList:{toggle(){}},setAttribute(){}};
 const c={Intl,URL,URLSearchParams,Event:class{constructor(type){this.type=type;}},state:{screen:'home'},esc:String,head:()=>'',specs:{},render(){},toast(){},setTimeout(){},setInterval(){},location:{search:'',origin:'https://example.com'},fetch:async()=>({ok:true,json:async()=>({counts:{event:base},saved:guestSaved?[{eventId:'event'}]:[]})}),document:{querySelector:()=>null,querySelectorAll:selector=>selector==='[data-event-count]'?[{dataset:{eventCount:'event'},querySelector:()=>count}]:[button],addEventListener:(n,fn)=>handlers[n]=fn},window:{BUSAN_EVENT_CATALOG:[{id:'event',brand:'Brand'}],BUSAN_EVENT_WINDOW:{isExpired:()=>false},BUSAN_AUTH:{getUser:()=>owner?{id:owner}:null},BUSAN_ACCOUNT_STORE:{getOwner:()=>owner,getEvents:()=>entries,isLoading:()=>false,async toggleEvent(id,store,saving){if(fail)throw Error('failure');entries=saving?[{eventId:id}]:[];c.window.BUSAN_EVENT_SOCIAL.refreshAccount();}},addEventListener:(n,fn)=>winHandlers[n]=fn,dispatchEvent(){}}};
 vm.runInNewContext(source,c);
 return {c,count,async toggle(){handlers.click({target:{closest:selector=>selector==='[data-event-social-save]'?button:null}});await tick();},async refresh(){await winHandlers.focus();},async switchAccount(id,saved){owner=id;entries=saved?[{eventId:'event'}]:[];c.window.BUSAN_EVENT_SOCIAL.refreshAccount();await tick();},fail(){fail=true;}};
}
test('signed-in heart adds one to the existing banner count and unsaving removes it',async()=>{
 const h=setup();await tick();assert.equal(h.count.textContent,'1');await h.toggle();assert.equal(h.count.textContent,'2');await h.toggle();assert.equal(h.count.textContent,'1');
});
test('restored account saves, repeated hydration and aggregate refresh do not increment twice',async()=>{
 const h=setup({initialSaved:true});await tick();assert.equal(h.count.textContent,'2');for(let i=0;i<3;i++){h.c.window.BUSAN_EVENT_SOCIAL.refreshAccount();await h.refresh();}assert.equal(h.count.textContent,'2');assert.match(h.c.window.BUSAN_EVENT_SOCIAL.counter('Brand'),/<span>2<\/span>/);await h.toggle();assert.equal(h.count.textContent,'1');
});
test('switching accounts reflects each account contribution; guest totals already include their save',async()=>{
 const h=setup({initialSaved:true,guestSaved:true});await tick();assert.equal(h.count.textContent,'2');await h.switchAccount('other',false);assert.equal(h.count.textContent,'1');await h.switchAccount(null,false);assert.equal(h.count.textContent,'1');assert.equal(h.c.window.BUSAN_EVENT_SOCIAL.getState().saved.length,1);
});
test('failed account toggle keeps the count and zero totals never become negative',async()=>{
 const h=setup({base:0});await tick();h.fail();await h.toggle();assert.equal(h.count.textContent,'0');const restored=setup({base:0,initialSaved:true});await tick();assert.equal(restored.count.textContent,'1');await restored.toggle();assert.equal(restored.count.textContent,'0');
});
