const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function setup(){const listeners=[],storage=new Map(),library={plans:[],places:[]},viewport={scrollTop:0},actions={innerHTML:''},modal={innerHTML:''};const route=['a','b'].map((id,i)=>({campaign:{id,brand:id,title:id,end:'2026-11-'+(12+i)},item:{id:'v'+i,name:id,address:id},event:{title:id},status:{kind:'open'}}));
 const initial={tripSelection:{selected:['a','b'],step:1,branches:{},order:[]}};storage.set('busan-shopping-pass',JSON.stringify(initial));const c={fetch:async url=>({ok:true,json:async()=>({places:[{id:'shared',kind:url.includes('attractions')?'sights':'food',name:'Shared place',nearStoreId:url.split('stores=')[1]}]})}),state:{screen:'pass',visitStart:'2026-11-08',visitEnd:'2026-11-12'},screens:{},specs:{},head:()=>'',icon:()=>'',esc:String,render(){},persist(){},nav(screen){c.state.screen=screen},toast(){},hasVisit:()=>true,validVisitDate:()=>true,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},document:{addEventListener:(name,fn)=>listeners.push({name,fn}),querySelector:s=>s==='#viewport'?viewport:s==='#detailActions'?actions:s==='#modal'?modal:null,querySelectorAll:()=>[]},window:{addEventListener(){},BUSAN_PASS_MODEL:{trip:()=>({route,candidates:[]})},BUSAN_EVENT_WINDOW:{koreaToday:()=> '2026-11-08'},BUSAN_MY_LIBRARY_MODEL:require('../../busan-drop/integration/my-library-model'),BUSAN_MY_LIBRARY:{get:()=>library,groupedHtml:()=>'',savePlan:entry=>library.plans.push(entry),showSaved:()=>c.state.screen='profile'},BUSAN_PLACE_CARD:{render:()=>''},crypto:{randomUUID:()=> 'saved-id'}}};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../../busan-drop/integration/shopping-pass.js','utf8'),c);c.window.BUSAN_SHOPPING_PASS.view();
 function click(attributes){const el={dataset:{},hasAttribute:name=>name in attributes};for(const [key,value]of Object.entries(attributes))el.dataset[key.replace(/^data-/,'').replace(/-([a-z])/g,(_,v)=>v.toUpperCase())]=value;for(const l of listeners.filter(l=>l.name==='click'))l.fn({target:{closest:selector=>Object.keys(attributes).some(key=>selector.includes('['+key+']'))?el:null}});}
 function choose(kind,checked=true){const el={dataset:{passNearby:'shared',kind},checked,matches:selector=>selector==='[data-pass-nearby]'};for(const l of listeners.filter(l=>l.name==='change'))l.fn({target:el});}
 return {storage,click,choose,change:el=>{for(const l of listeners.filter(l=>l.name==='change'))l.fn({target:el});},stored:()=>JSON.parse(storage.get('busan-shopping-pass')),library,c};}
test('flow visits sights and food for each venue, then review and save without calendar assignments',()=>{const h=setup();h.click({'data-pass-next':''});assert.equal(h.stored().tripSelection.step,3);assert.equal(h.stored().tripSelection.venueIndex,0);h.click({'data-pass-next':''});assert.equal(h.stored().tripSelection.step,4);h.click({'data-pass-next':''});assert.equal(h.stored().tripSelection.step,3);assert.equal(h.stored().tripSelection.venueIndex,1);h.click({'data-pass-skip':'sights'});assert.equal(h.stored().tripSelection.step,4);h.click({'data-pass-skip':'food'});assert.equal(h.stored().tripSelection.review,true);h.click({'data-review-save':''});assert.equal(h.library.plans.length,1);assert.equal(h.library.plans[0].flow,'venue-groups');assert.ok(h.library.plans[0].itinerary.every(row=>row.date===''));assert.equal(h.c.state.screen,'profile');assert.deepEqual(h.stored().tripSelection.selected,[]);});
test('back navigation crosses venue boundaries without restarting the whole plan',()=>{const h=setup();for(let i=0;i<3;i++)h.click({'data-pass-next':''});h.click({'data-venue-back':''});assert.equal(h.stored().tripSelection.venueIndex,0);assert.equal(h.stored().tripSelection.step,4);h.click({'data-venue-back':''});assert.equal(h.stored().tripSelection.step,3);h.click({'data-venue-back':''});assert.equal(h.stored().tripSelection.step,1);});

test('skipping one venue leaves every other venue selection intact, including shared IDs',async()=>{const h=setup(),flush=()=>new Promise(resolve=>setImmediate(resolve));h.click({'data-pass-next':''});await flush();h.choose('sights');h.click({'data-pass-next':''});await flush();h.choose('food');h.click({'data-pass-next':''});await flush();h.choose('sights');h.click({'data-pass-skip':'sights'});await flush();h.choose('food');h.click({'data-pass-next':''});h.click({'data-review-save':''});const entry=h.library.plans[0];assert.equal(entry.places.length,3);assert.deepEqual(Array.from(entry.places,p=>p.eventId),['a','a','b']);assert.equal(entry.selection.venueChoices.b.sights.length,0);assert.equal(entry.selection.venueChoices.a.sights.length,1);assert.equal(entry.itinerary.length,5);});
test('editing one venue from review returns directly to review and retains other groups',()=>{const h=setup();for(let i=0;i<5;i++)h.click({'data-pass-next':''});assert.equal(h.stored().tripSelection.review,true);h.click({'data-venue-edit':'0'});assert.equal(h.stored().tripSelection.step,3);assert.equal(h.stored().tripSelection.venueIndex,0);h.click({'data-pass-next':''});h.click({'data-pass-next':''});assert.equal(h.stored().tripSelection.review,true);assert.equal(h.stored().tripSelection.venueIndex,0);assert.equal(h.stored().tripSelection.returnToReview,false);});
test('review arrows persist venue order into saved plans and the reopened editor',async()=>{
 const h=setup(),flush=()=>new Promise(resolve=>setImmediate(resolve));h.click({'data-pass-next':''});await flush();h.choose('sights');for(let i=0;i<4;i++)h.click({'data-pass-next':''});
 assert.equal(h.stored().tripSelection.review,true);
 h.click({'data-venue-stop-move':'up','data-venue-id':'a','data-stop-id':'place:a:shared'});
 assert.deepEqual(h.stored().tripSelection.venueOrders.a,['place:a:shared','event:a']);h.click({'data-review-save':''});const entry=h.library.plans[0];assert.equal(entry.itinerary[0].id,'place:a:shared');
 h.c.window.BUSAN_SHOPPING_PASS.editSaved(entry);assert.deepEqual(h.stored().tripSelection.venueOrders.a,['place:a:shared','event:a']);
});
test('removing a venue from review removes only its draft group and returns to selection when empty',async()=>{
 const h=setup(),original=h.c.window.BUSAN_PASS_MODEL.trip;
 h.c.window.BUSAN_PASS_MODEL.trip=options=>({...original(),route:original().route.filter(row=>options.selection.selected.includes(row.campaign.id))});
 h.click({'data-pass-next':''});await new Promise(resolve=>setImmediate(resolve));h.choose('sights');for(let i=0;i<4;i++)h.click({'data-pass-next':''});
 h.click({'data-venue-remove':'a'});assert.deepEqual(h.stored().tripSelection.selected,['a','b']);assert.match(h.c.document.querySelector('#modal').innerHTML,/이 행사와 주변 플랜을 정말 삭제/);h.click({'data-pass-venue-remove-cancel':''});assert.deepEqual(h.stored().tripSelection.selected,['a','b']);h.click({'data-venue-remove':'a'});h.click({'data-pass-venue-remove-confirm':''});const s=h.stored().tripSelection;assert.deepEqual(s.selected,['b']);assert.equal(s.review,true);assert.equal(s.venueChoices.a,undefined);assert.equal(s.sightPlaces.length,0);assert.equal(h.library.plans.length,0);
 h.click({'data-venue-remove':'b'});h.click({'data-pass-venue-remove-confirm':''});assert.equal(h.stored().tripSelection.review,false);assert.equal(h.stored().tripSelection.step,1);assert.deepEqual(h.stored().tripSelection.selected,[]);
});


test('whole event groups can swap while keeping their own places and persist after saving',async()=>{
 const h=setup();h.click({'data-pass-next':''});await new Promise(resolve=>setImmediate(resolve));h.choose('sights');for(let i=0;i<4;i++)h.click({'data-pass-next':''});
 h.click({'data-venue-group-move':'up','data-venue-id':'a'});assert.deepEqual(h.stored().tripSelection.order,[]);
 h.click({'data-venue-group-move':'up','data-venue-id':'b'});assert.deepEqual(h.stored().tripSelection.order,[]);
 h.click({'data-review-save':''});const original=h.library.plans[0];h.c.window.BUSAN_SHOPPING_PASS.editSaved(original);for(let i=0;i<5;i++)h.click({'data-pass-next':''});
 h.click({'data-venue-group-move':'up','data-venue-id':'b'});assert.deepEqual(h.stored().tripSelection.order,['b','a']);
 h.click({'data-review-save':''});const entry=h.library.plans.at(-1);assert.deepEqual(Array.from(entry.routeSnapshot,row=>row.campaign.id),['b','a']);assert.equal(entry.places[0].eventId,'a');assert.equal(entry.itinerary[0].eventId,'b');
 h.c.window.BUSAN_SHOPPING_PASS.editSaved(entry);assert.deepEqual(h.stored().tripSelection.order,['b','a']);
});

test('switching accounts isolates editing drafts and restores the guest draft on logout',()=>{const h=setup(),api=h.c.window.BUSAN_SHOPPING_PASS;h.click({'data-pass-next':''});api.switchAccount('A');const a=JSON.parse(h.storage.get('busan-shopping-pass:A'));assert.equal(a.tripSelection.selected.length,0);api.switchAccount('B');const b=JSON.parse(h.storage.get('busan-shopping-pass:B'));assert.equal(b.tripSelection.selected.length,0);api.switchAccount(null);assert.equal(h.stored().tripSelection.step,3);assert.deepEqual(h.stored().tripSelection.selected,['a','b']);});

function savedEntryHarness(){
 const h=setup(),c=h.c;const catalog=[{id:'a',brand:'A',start:'2026-11-08',end:'2026-11-12',scheduleStatus:'confirmed'},{id:'b',brand:'B',start:'2026-11-10',end:'2026-11-12',scheduleStatus:'confirmed'},{id:'ended',brand:'Ended',start:'2026-10-01',end:'2026-10-02',scheduleStatus:'confirmed'}];
 const locations=[{id:'a1',brand:'A',lat:35,lng:129},{id:'b1',brand:'B',lat:35,lng:129},{id:'b2',brand:'B',lat:35,lng:129},{id:'old',brand:'Ended',lat:35,lng:129}];
 catalog.forEach(e=>{e.title=e.brand;e.image='test.png';});locations.forEach(v=>{v.name=v.id;v.address='부산';});
 c.window.BUSAN_EVENT_CATALOG=catalog;c.window.BUSAN_STORE_LOCATIONS=locations;c.window.BUSAN_EVENT_DETAILS=Object.fromEntries(catalog.map(e=>[e.brand,{...e,title:e.brand}]));
 c.window.BUSAN_PASS_MODEL.trip=require('../../busan-drop/integration/pass-model').trip;
 c.window.BUSAN_EVENT_SOCIAL={getState:()=>({loaded:true,saved:[{eventId:'b',storeId:'b2'},{eventId:'b',storeId:'b2'},{eventId:'ended',storeId:'old'}]})};
 return h;
}
test('saved-to-plan entry checks eligible saved events and restores the bookmarked branch before navigation',()=>{
 const h=savedEntryHarness();h.c.state.screen='saved';h.click({'data-nav':'pass','data-pass-from-saved':''});
 const s=h.stored().tripSelection;assert.deepEqual(s.selected,['a','b']);assert.equal(s.branches.b,'b2');assert.equal(s.step,1);assert.equal(s.review,false);assert.ok(!s.selected.includes('ended'));
 const html=h.c.window.BUSAN_SHOPPING_PASS.view();assert.match(html,/data-pass-choose="b"[^>]* checked/);assert.match(html,/value="b2" selected/);
});
test('prefill retains an unfinished branch choice and only the saved-entry button reselects unchecked bookmarks',()=>{
 const h=savedEntryHarness();
 h.change({dataset:{passBranch:'b'},value:'b1',matches:s=>s==='[data-pass-branch]'});
 h.click({'data-pass-from-saved':''});assert.equal(h.stored().tripSelection.branches.b,'b1');
 h.change({dataset:{passChoose:'b'},checked:false,matches:s=>s==='[data-pass-choose]'});
 h.c.window.BUSAN_SHOPPING_PASS.view();h.click({'data-nav':'pass'});
 assert.ok(!h.stored().tripSelection.selected.includes('b'));assert.equal(h.stored().tripSelection.branches.b,'b1');
 h.click({'data-pass-from-saved':''});assert.ok(h.stored().tripSelection.selected.includes('b'));
});
test('creating from saved while editing an existing plan starts a separate draft and leaves the saved snapshot intact',()=>{
 const h=savedEntryHarness(),entry={id:'old-plan',start:'2026-11-08',end:'2026-11-12',routeSnapshot:[],selection:{selected:['a'],branches:{},order:[],step:1}};
 h.library.plans.push(entry);h.c.window.BUSAN_SHOPPING_PASS.editSaved(entry);const before=JSON.stringify(entry);
 h.click({'data-pass-from-saved':''});const p=h.stored();assert.equal(p.activeSavedId,undefined);assert.deepEqual(p.tripSelection.selected,['b']);assert.equal(p.tripSelection.branches.b,'b2');assert.equal(JSON.stringify(h.library.plans[0]),before);
});

test('place detail adds sights and food to only the active venue, without duplicates or stale venue writes',async()=>{
 const h=setup();let detail;h.c.window.BUSAN_OPEN_PLACE_DETAIL=(place,options)=>detail={place,options};
 h.click({'data-pass-next':''});await new Promise(resolve=>setImmediate(resolve));
 h.click({'data-pass-place-detail':'shared','data-kind':'sights'});assert.equal(detail.options.selected,false);assert.equal(detail.options.onAdd(),true);assert.equal(detail.options.onAdd(),true);
 let s=h.stored().tripSelection;assert.deepEqual(s.venueChoices.a.sights,['shared']);assert.equal(s.venueChoices.b?.sights?.length||0,0);
 h.click({'data-pass-place-detail':'shared','data-kind':'sights'});assert.equal(detail.options.selected,true);const stale=detail.options.onAdd;
 h.click({'data-pass-next':''});await new Promise(resolve=>setImmediate(resolve));h.click({'data-pass-place-detail':'shared','data-kind':'food'});assert.equal(detail.options.onAdd(),true);
 s=h.stored().tripSelection;assert.deepEqual(s.venueChoices.a.food,['shared']);assert.deepEqual(s.venueChoices.a.sights,['shared']);
 h.click({'data-pass-next':''});assert.equal(stale(),false);
});

test('nearby step numbers continue across every selected event and stay consistent when going back',()=>{const h=setup();h.click({'data-pass-next':''});assert.match(h.c.window.BUSAN_SHOPPING_PASS.view(),/STEP 03/);h.click({'data-pass-next':''});assert.match(h.c.window.BUSAN_SHOPPING_PASS.view(),/STEP 04/);h.click({'data-pass-next':''});assert.match(h.c.window.BUSAN_SHOPPING_PASS.view(),/STEP 05/);h.click({'data-pass-next':''});assert.match(h.c.window.BUSAN_SHOPPING_PASS.view(),/STEP 06/);h.click({'data-venue-back':''});assert.match(h.c.window.BUSAN_SHOPPING_PASS.view(),/STEP 05/);});
