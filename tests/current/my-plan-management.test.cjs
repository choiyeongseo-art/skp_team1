const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){const initial={plans:[{id:'a',title:'Plan A',start:'2026-11-08',end:'2026-11-12',stops:[{id:'event'}]},{id:'b',title:'Plan B',start:'2026-11-08',end:'2026-11-12',stops:[{id:'event'}]}],places:[]},storage=new Map([['busan-my-library',JSON.stringify(initial)]]),listeners=[],discarded=[],modal={innerHTML:''};
 const c={state:{screen:'profile',language:'ko'},languageOptions:[{code:'ko',native:'Korean'}],profile:()=>'',saved:()=>'',specs:{},head:()=>'',esc:String,render(){},nav(){},toast(){},localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},document:{querySelectorAll:()=>[],addEventListener:(name,fn,capture)=>listeners.push({name,fn,capture}),querySelector(selector){if(selector==='#modal')return modal;if(selector==='[data-library-delete-cancel]')return {focus(){}};if(selector==='.library-delete-overlay'&&modal.innerHTML)return {remove(){modal.innerHTML=''}};return null;}},window:{BUSAN_MY_LIBRARY_MODEL:require('../../busan-drop/integration/my-library-model'),BUSAN_EVENT_WINDOW:{planVisible:entry=>entry},BUSAN_SHOPPING_PASS:{discardSaved:id=>discarded.push(id)},addEventListener(){}}};vm.runInNewContext(fs.readFileSync(__dirname+'/../../busan-drop/integration/my-library.js','utf8'),c);
 function click(attribute,value=''){const el={dataset:{[attribute.replace('data-','').replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase())]:value},classList:{contains:()=>false},isConnected:false};for(const item of listeners.filter(item=>item.name==='click'))item.fn({target:{closest:selector=>selector.split(',').some(part=>part.trim()==='['+attribute+']')?el:null,classList:{contains:()=>false}}});}
 function rename(value){let invalid=false;const input={value,setCustomValidity(message){invalid=!!message},reportValidity(){}},form={matches:s=>s==='[data-library-rename-form]',querySelector:()=>input};for(const item of listeners.filter(item=>item.name==='submit'))item.fn({target:form,preventDefault(){}});return invalid;}
 return {c,modal,click,rename,discarded,get:()=>JSON.parse(storage.get('busan-my-library'))};}
test('plan cards precede bottom settings, removed account copy stays absent, and actions remain separate',()=>{const h=setup(),html=h.c.profile();assert.ok(html.indexOf('id="myLibrary"')<html.indexOf('account-settings'));assert.doesNotMatch(html,/계정 및 설정|로그인됨|게스트|여행의 취향|플랜과 방문 기록|account-identity|account-invite/);assert.match(html,/data-language-next="profile"/);assert.match(html,/data-library-about/);assert.doesNotMatch(html,/MY PAGE/);assert.match(html,/<h2>마이페이지<\/h2>/);assert.match(html,/<h3 id="mySettingsTitle">설정<\/h3>/);assert.doesNotMatch(html,/class="account-menu"/);assert.match(html,/data-library-edit="a"/);assert.match(html,/data-library-delete="a"/);assert.doesNotMatch(html,/<button[^>]*my-plan-card/);});
test('opening and cancelling deletion leave all saved plans intact',()=>{const h=setup();h.click('data-library-delete','a');assert.match(h.modal.innerHTML,/data-library-delete-confirm="a"/);assert.equal(h.get().plans.length,2);h.click('data-library-delete-cancel');assert.equal(h.modal.innerHTML,'');assert.equal(h.get().plans.length,2);assert.equal(h.discarded.length,0);});

test('My settings always exposes the appropriate account action for guests and signed-in users',()=>{
 const h=setup();
 h.c.state.joined=false;
 assert.match(h.c.profile(),/data-library-login[^>]*>[\s\S]*?<strong>로그인<\/strong>/);
 assert.doesNotMatch(h.c.profile(),/data-bd-signout/);
 const before=h.get(),navigation=[];h.c.nav=screen=>navigation.push(screen);
 h.click('data-library-login');
 assert.deepEqual(navigation,['signup']);assert.equal(h.c.state.authMode,'login');assert.equal(h.c.state.joined,false);assert.deepEqual(h.get(),before);
 h.c.state.joined=true;
 assert.match(h.c.profile(),/data-bd-signout[^>]*>[\s\S]*?<strong>로그아웃<\/strong>/);
 assert.doesNotMatch(h.c.profile(),/data-library-login/);
 h.c.state.joined=false;
 assert.match(h.c.profile(),/data-library-login/);
});
test('only the pending plan can be deleted; confirmation clears its matching draft reference',()=>{const h=setup();h.click('data-library-delete-confirm','a');assert.equal(h.get().plans.length,2);h.click('data-library-delete','a');h.click('data-library-delete-confirm','b');assert.equal(h.get().plans.length,2);h.click('data-library-delete-confirm','a');assert.deepEqual(h.get().plans.map(plan=>plan.id),['b']);assert.deepEqual(h.discarded,['a']);});

test('plan summaries separate events, sights and food including empty categories',()=>{
 const source=fs.readFileSync(__dirname+'/../../busan-drop/integration/my-library.js','utf8'),context={};vm.createContext(context);vm.runInContext(source.match(/ function planSummary\(entry\)\{[^\n]+/)[0],context);
 const entry={routeSnapshot:[{},{},{}],places:[{kind:'sights'},{kind:'sights'},{kind:'food'},{kind:'food'},{kind:'food'},{kind:'food'}]};
 assert.equal(context.planSummary(entry),'행사 3곳 · 관광지 2곳 · 맛집 4곳');assert.equal(context.planSummary({stops:[{}]}),'행사 1곳 · 관광지 0곳 · 맛집 0곳');
 assert.equal(entry.places.length,6);
});


test('plan deletion is available only from My list, never from the journey detail or other screens',()=>{
 const h=setup();h.click('data-library-plan','a');h.click('data-library-delete','a');assert.equal(h.modal.innerHTML,'');assert.equal(h.get().plans.length,2);
 h.click('data-library-back');h.c.state.screen='saved';h.click('data-library-delete','a');assert.equal(h.modal.innerHTML,'');
 h.c.state.screen='profile';h.click('data-library-delete','a');assert.match(h.modal.innerHTML,/data-library-delete-confirm="a"/);
 h.click('data-library-plan','a');h.click('data-library-delete-confirm','a');assert.equal(h.get().plans.length,2);
});


test('live journey reorder persists groups and stops, keeps stamps and updates the next destination',()=>{
 const h=setup(),m=h.c.window.BUSAN_MY_LIBRARY_MODEL;
 const route=['a','b'].map(id=>({campaign:{id,start:'2026-11-08',end:'2026-11-12'},event:{title:id},item:{id,address:id}}));
 const entry={id:'live',title:'Live plan',flow:'venue-groups',start:'2026-11-08',end:'2026-11-12',routeSnapshot:route,stops:[{id:'a'},{id:'b'}],places:[{id:'sight',eventId:'b',kind:'sights',name:'Sight'}],selection:{},progress:{done:[m.visitKey({id:'event:a',date:''})]}};
 entry.itinerary=m.groupedRows(entry);h.c.window.BUSAN_MY_LIBRARY.savePlan(entry);h.click('data-library-plan','live');
 const clickMove=dataset=>{
  const current=h.c.window.BUSAN_MY_LIBRARY.get().plans.find(p=>p.id==='live');h.c.window.BUSAN_MY_LIBRARY.savePlan(m.reorderSavedPlan(current,dataset));
 };
 clickMove({eventId:'b',direction:'up'});
 let saved=h.get().plans.find(p=>p.id==='live');assert.deepEqual(saved.routeSnapshot.map(r=>r.campaign.id),['b','a']);assert.deepEqual(saved.progress,entry.progress);assert.equal(m.venueJourney(saved,m.groupedRows(saved),'2026-11-08').next.id,'event:b');
 clickMove({eventId:'b',stopId:'place:b:sight',direction:'up'});
 saved=h.get().plans.find(p=>p.id==='live');assert.deepEqual(saved.selection.venueOrders.b,['place:b:sight','event:b']);assert.equal(m.venueJourney(saved,m.groupedRows(saved),'2026-11-08').next.id,'place:b:sight');assert.deepEqual(saved.progress,entry.progress);assert.deepEqual(entry.routeSnapshot.map(r=>r.campaign.id),['a','b']);
});


test('renaming from plan view trims and persists only the name, rejects blanks and supports cancel',()=>{
 const h=setup(),before=h.get();h.click('data-library-plan','a');h.click('data-library-rename');assert.equal(h.rename('   '),true);assert.deepEqual(h.get(),before);
 assert.equal(h.rename('  부산 쇼핑 여행  '),false);assert.equal(h.get().plans[0].title,'부산 쇼핑 여행');assert.deepEqual(h.get().plans[0].stops,before.plans[0].stops);assert.deepEqual(h.get().plans[1],before.plans[1]);
 h.click('data-library-rename');h.click('data-library-rename-cancel');h.rename('취소한 이름');assert.equal(h.get().plans[0].title,'부산 쇼핑 여행');
});


test('removing a journey place preserves the same place in another group and prunes its stamp and editor selection',()=>{
 const m=require('../../busan-drop/integration/my-library-model'),route=['a','b'].map(id=>({campaign:{id},event:{title:id},item:{id,address:id}}));
 const entry={flow:'venue-groups',routeSnapshot:route,stops:[{id:'a'},{id:'b'}],places:[{id:'shared',eventId:'a',kind:'sights'},{id:'shared',eventId:'b',kind:'sights'}],selection:{venueChoices:{a:{sights:['shared'],sightPlaces:[{id:'shared'}]},b:{sights:['shared'],sightPlaces:[{id:'shared'}]}},venueOrders:{a:['place:a:shared','event:a']}},progress:{done:[m.visitKey({date:'',id:'place:a:shared'}),m.visitKey({date:'',id:'event:b'})]}};
 const next=m.removeSavedStop(entry,'place:a:shared');assert.deepEqual(next.places.map(p=>p.eventId),['b']);assert.deepEqual(next.selection.venueChoices.a.sights,[]);assert.deepEqual(next.selection.venueChoices.b.sights,['shared']);assert.deepEqual(next.progress.done,[m.visitKey({date:'',id:'event:b'})]);assert.equal(entry.places.length,2);
 const removed=m.removeSavedStop(entry,'event:a');assert.deepEqual(removed.routeSnapshot.map(r=>r.campaign.id),['b']);assert.deepEqual(removed.places.map(p=>p.eventId),['b']);assert.equal(removed.selection.venueChoices.a,undefined);assert.deepEqual(removed.stops,[{id:'b'}]);
});

test('reordering centers the clicked event heading or place card and animates both groups',()=>{
 const source=fs.readFileSync(__dirname+'/../../busan-drop/integration/my-library.js','utf8');
 const viewport={scrollTop:300,clientHeight:600,getBoundingClientRect:()=>({top:0,height:600})},animations=[];let focused='';
 const node=(id,top)=>({dataset:{venueGroup:id,mapStop:id},getBoundingClientRect:()=>({top:top-viewport.scrollTop,height:200}),animate:(frames,options)=>animations.push({id,frames,options}),querySelector:selector=>selector==='.venue-group-heading'?{getBoundingClientRect:()=>({top:top-viewport.scrollTop,height:100}),focus:()=>{focused=id}}:{focus:()=>{focused=id}}});
 const old=[node('a',100),node('b',900)];let nodes=old;
 const context={document:{querySelector:()=>viewport,querySelectorAll:()=>nodes},window:{matchMedia:()=>({matches:false})},Map};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf(' function captureOrderMotion('),source.indexOf(' window.BUSAN_MY_LIBRARY.captureOrderMotion=')),context);
 const snapshot=context.captureOrderMotion('[data-venue-group]','venueGroup',{closest:()=>old[0]});
 nodes=[node('b',100),node('a',900)];context.finishOrderMotion(snapshot);
 assert.equal(viewport.scrollTop,650);assert.equal(focused,'a');assert.equal(animations.length,2);assert.ok(animations.every(animation=>animation.options.duration===560));
 const stopSnapshot=context.captureOrderMotion('[data-map-stop]','mapStop',{closest:()=>nodes[1]});nodes=[node('a',100),node('b',900)];context.finishOrderMotion(stopSnapshot);assert.equal(viewport.scrollTop,0);assert.equal(focused,'a');
});

test('operating hours separate day and seasonal schedules without splitting time or month ranges',()=>{
 const source=fs.readFileSync(__dirname+'/../../busan-drop/integration/my-library.js','utf8'),context={esc:value=>String(value).replaceAll('<','&lt;')};vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf(' function splitHoursLines('),source.indexOf(' function groupedHtml(')),context);
 assert.deepEqual(Array.from(context.splitHoursLines('백화점 기준 월–목 10:30–20:00 / 금–일·공휴일 10:30–20:30')),['백화점 기준 월–목 10:30–20:00','금–일·공휴일 10:30–20:30']);
 assert.deepEqual(Array.from(context.splitHoursLines('- 1월~2월 · 12월 : 09:00 ~ 20:00 - 3월~6월 · 9월~11월 : 09:00 ~ 21:00\n- 7월~8월 : 09:00 ~ 22:00\n\n※ 탑승권 발권 : 폐장시간 30분 전')),['1월~2월 · 12월 : 09:00 ~ 20:00','3월~6월 · 9월~11월 : 09:00 ~ 21:00','7월~8월 : 09:00 ~ 22:00','※ 탑승권 발권 : 폐장시간 30분 전']);
 const html=context.stopHoursHtml({kind:'food',hours:'11:00 - 15:00<br>17:00 - 21:00'});assert.equal((html.match(/class="venue-stop-hours-line"/g)||[]).length,2);assert.doesNotMatch(html,/<br>/);assert.match(context.stopHoursHtml({kind:'food'}),/확인 필요/);
});

test('card rename edits only the selected title without opening plan details',()=>{
 const h=setup(),before=h.get();h.click('data-library-card-rename','b');
 assert.match(h.c.profile(),/my-plan-name-form/);assert.doesNotMatch(h.c.profile(),/my-plan-detail/);
 h.rename('  Weekend Busan  ');assert.equal(h.get().plans[1].title,'Weekend Busan');
 assert.deepEqual(h.get().plans[0],before.plans[0]);assert.deepEqual(h.get().plans[1].stops,before.plans[1].stops);
 h.click('data-library-card-rename','a');h.click('data-library-card-rename-cancel');h.rename('Cancelled');assert.equal(h.get().plans[0].title,'Plan A');
});
