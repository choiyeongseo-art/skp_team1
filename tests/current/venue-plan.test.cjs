const test=require('node:test'),assert=require('node:assert/strict'),model=require('../../busan-drop/integration/my-library-model');
const route=[{campaign:{id:'a',title:'A',start:'2026-11-01',end:'2026-11-09'},event:{title:'A'},item:{id:'v1',address:'one',lat:35,lng:129}},{campaign:{id:'b',title:'B',start:'2026-11-10',end:'2026-11-12'},event:{title:'B'},item:{id:'v2',address:'two',lat:35.2,lng:129.2}}];
const places=[{id:'shared',eventId:'a',nearStoreId:'v1',name:'Sight A',kind:'sights'},{id:'food',eventId:'a',nearStoreId:'v1',name:'Food A',kind:'food'},{id:'shared',eventId:'b',nearStoreId:'v2',name:'Sight B',kind:'sights'}];
test('each venue owns its sights and restaurants, including repeated source place IDs',()=>{const groups=model.venueGroups(route,places);assert.deepEqual(groups.map(g=>g.places.map(p=>p.name)),[['Sight A','Food A'],['Sight B']]);const rows=model.venueItinerary(route,places);assert.equal(rows.length,5);assert.equal(new Set(rows.map(p=>p.id)).size,5);assert.ok(rows.every(row=>row.date===''));assert.deepEqual(rows.map(row=>row.eventId),['a','a','a','b','b']);});
test('two campaigns at the same venue retain separate selections',()=>{const same=route.map(c=>({...c,item:route[0].item}));assert.deepEqual(model.venueGroups(same,places).map(g=>g.places.length),[2,1]);});
test('manual completion advances within a venue then to another currently available venue',()=>{const rows=model.venueItinerary(route,places),entry={id:'p',flow:'venue-groups',stops:route.map(c=>({id:c.campaign.id})),routeSnapshot:route,places,itinerary:rows};let state={plans:[entry],places:[]};assert.equal(model.venueJourney(entry,rows,'2026-11-08').next.id,'event:a');state=model.updateVisit(state,'p','event:a','',true);assert.equal(model.venueJourney(state.plans[0],rows,'2026-11-08').next.placeId,'shared');assert.equal(model.venueJourney(entry,rows,'2026-11-10').next.id,'event:b');assert.equal(model.venueJourney(entry,rows,'2026-11-13').stops.length,0);});
test('old saved plans keep matching visit IDs and progress when displayed as venue groups',()=>{const itinerary=model.itinerary(route,places,[],{},'2026-11-08');const entry={routeSnapshot:route,places,itinerary};const rows=model.groupedRows(entry);assert.equal(rows[0].id,itinerary[0].id);assert.equal(rows[0].date,itinerary[0].date);assert.ok(rows.every(row=>row.eventId));});
test('known closure days are excluded from next-place recommendations',()=>{const closed=route.map(c=>({...c,event:{...c.event,closed:['2026-11-08']}}));assert.equal(model.venueJourney({},model.venueItinerary(closed,places),'2026-11-08').stops.length,0);});
test('visit order moves any stop including the event while preserving other venue groups',()=>{
 const before={},next=model.moveVenueStop(route,places,before,'a','place:a:food','up');
 assert.deepEqual(model.venueItinerary(route,places,next).map(row=>row.id),['event:a','place:a:food','place:a:shared','event:b','place:b:shared']);
 const moved=model.moveVenueStop(route,places,next,'a','place:a:food','up');assert.equal(model.venueItinerary(route,places,moved)[0].id,'place:a:food');assert.deepEqual(before,{});assert.equal(next.a[0],'event:a');
 assert.deepEqual(model.moveVenueStop(route,places,moved,'a','place:a:food','up'),moved);assert.deepEqual(model.moveVenueStop(route,places,moved,'b','place:a:food','down'),moved);
});
test('saved order survives reload, removes stale IDs and appends newly selected places',()=>{
 const selection={venueOrders:{a:['place:a:food','event:a','place:a:shared','removed']}};
 const entry=JSON.parse(JSON.stringify({flow:'venue-groups',routeSnapshot:route,places,selection}));
 assert.deepEqual(model.groupedRows(entry).slice(0,3).map(row=>row.id),['place:a:food','event:a','place:a:shared']);
 entry.places=entry.places.filter(p=>p.kind!=='food');entry.places.push({id:'new',eventId:'a',kind:'food'});
 assert.deepEqual(model.groupedRows(entry).filter(row=>row.eventId==='a').map(row=>row.id),['event:a','place:a:shared','place:a:new']);
});
