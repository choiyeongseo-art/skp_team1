const test=require('node:test'),assert=require('node:assert/strict');const {build,status,directions}=require('../../busan-drop/integration/pass-model');
const events={A:{start:'2026-11-01',end:'2026-11-10'},B:{start:'2026-11-05',end:'2026-11-15',closed:['2026-11-09']},C:{start:null,end:null}};
const catalog=['A','B','C'].map(brand=>({id:brand,brand}));const locations=[{id:'a1',brand:'A',lat:35,lng:129},{id:'a2',brand:'A',lat:35.1,lng:129.1},{id:'b',brand:'B',lat:35.2,lng:129.2},{id:'c',brand:'C',lat:35.3,lng:129.3}];const saved=['A','B','C'].map(eventId=>({eventId}));
test('multiple branches require explicit branch selection while single locations are selected automatically',()=>{
 const result=build({saved,catalog,locations,events,day:'2026-11-06'});assert.equal(result.candidates.length,3);assert.equal(result.candidates[0].item,null);assert.deepEqual(result.route.map(c=>c.campaign.id),['B','C']);
 const chosen=build({saved,catalog,locations,events,day:'2026-11-06',selection:{branches:{A:'a2'},order:['C','A','B'],excluded:['B']}});assert.deepEqual(chosen.route.map(c=>c.campaign.id),['C','A']);assert.equal(chosen.route[1].item.id,'a2');
});
test('saved branch is reused, and holiday/ended events stay out of daily routes without deleting saves',()=>{
 const entries=[{eventId:'A',storeId:'a1'},{eventId:'B'}];const result=build({saved:entries,catalog,locations,events,day:'2026-11-09'});assert.equal(result.candidates.length,2);assert.deepEqual(result.route.map(c=>c.campaign.id),['A']);assert.equal(result.candidates[1].status.label,'선택한 날 휴점');assert.equal(entries.length,2);
 assert.equal(build({saved:entries,catalog,locations,events,day:'2026-11-16'}).route.length,0);
 assert.equal(status(events.C,'2026-11-06').kind,'check');assert.equal(status(events.A,'2026-11-06',{eventParticipation:'unconfirmed'}).kind,'check');
});
test('directions use public selected coordinates and the chosen travel mode without invented travel times',()=>{
 const first=new URL(directions(locations[0],null));assert.equal(first.searchParams.get('travelmode'),'transit');assert.equal(first.searchParams.get('origin'),null);
 const next=new URL(directions(locations[2],locations[1],'walking'));assert.equal(next.searchParams.get('origin'),'35.1,129.1');assert.equal(next.searchParams.get('destination'),'35.2,129.2');assert.equal(next.searchParams.get('travelmode'),'walking');
});

test('Wacky Willy closes November 9 and Tuna School stays available through November 19',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),c={window:{}};
 for(const f of ['data/event-details.js','data/store-locations.js','data/event-catalog.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../busan-drop',f),'utf8'),c);
 const model=require('../../busan-drop/integration/pass-model');
 assert.equal(model.status(c.window.BUSAN_EVENT_DETAILS['와키윌리'],'2026-11-09',{}).blocked,true);
 assert.equal(model.status(c.window.BUSAN_EVENT_DETAILS['와키윌리'],'2026-11-13',{}).blocked,true);
 assert.equal(model.status(c.window.BUSAN_EVENT_DETAILS['참치학교'],'2026-11-19',{}).blocked,false);
 assert.equal(model.status(c.window.BUSAN_EVENT_DETAILS['참치학교'],'2026-11-20',{}).blocked,true);
});

 test('hotel reservations and stay dates are distinct; room exclusions do not close dining',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../busan-drop/data/event-details.js'),'utf8'),c);
 const hotel=c.window.BUSAN_EVENT_DETAILS['그랜드 조선 부산'];
 assert.equal(status(hotel,'2026-12-01').blocked,false);
 assert.match(status(hotel,'2026-11-07').label,/다이닝/);
 assert.equal(status(hotel,'2027-04-01').blocked,true);
 });

test('trip discovery uses all confirmed campaigns and keeps events open for any part of the travel range',()=>{
 const {trip}=require('../../busan-drop/integration/pass-model');
 const list=[{id:'A',brand:'A',scheduleStatus:'confirmed'},{id:'B',brand:'B',scheduleStatus:'confirmed'},{id:'C',brand:'C',scheduleStatus:'unconfirmed'}];
 const result=trip({start:'2026-11-10',end:'2026-11-12',catalog:list,locations,events});
 assert.deepEqual(result.candidates.map(c=>c.campaign.id),['A','B']);assert.equal(result.route.length,0);
 const chosen=trip({start:'2026-11-10',end:'2026-11-12',catalog:list,locations,events,selection:{selected:['A','B'],branches:{A:'a2'},visitDates:{B:'2026-11-12'}}});
 assert.deepEqual(chosen.route.map(c=>[c.campaign.id,c.visitDate]),[['A','2026-11-10'],['B','2026-11-12']]);
 assert.equal(trip({start:null,end:null,catalog:list,locations,events}).candidates.length,0);
});
test('trip discovery skips closed days and unconfirmed branches, but later available days stay selectable',()=>{
 const {trip}=require('../../busan-drop/integration/pass-model'),catalog=[{id:'B',brand:'B',scheduleStatus:'confirmed'}];
 assert.equal(trip({start:'2026-11-09',end:'2026-11-09',catalog,locations,events}).candidates.length,0);
 const result=trip({start:'2026-11-09',end:'2026-11-10',catalog,locations,events,selection:{selected:['B']}});
 assert.equal(result.route[0].visitDate,'2026-11-10');
 assert.equal(trip({start:'2026-11-09',end:'2026-11-10',catalog,locations:locations.map(s=>({...s,eventParticipation:'unconfirmed'})),events}).candidates.length,0);
 const invalid=trip({start:'2026-11-09',end:'2026-11-10',catalog,locations,events,selection:{selected:['B'],visitDates:{B:'2026-11-09'}}});assert.equal(invalid.route.length,0);assert.equal(invalid.candidates[0].status.blocked,true);
});
test('real trip discovery lists unsaved events and uses hotel stay periods after booking has ended',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),c={window:{}};
 for(const f of ['data/event-details.js','data/store-locations.js','data/event-catalog.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../busan-drop',f),'utf8'),c);
 const {trip}=require('../../busan-drop/integration/pass-model'),args={catalog:c.window.BUSAN_EVENT_CATALOG,locations:c.window.BUSAN_STORE_LOCATIONS,events:c.window.BUSAN_EVENT_DETAILS};
 const result=trip({...args,start:'2026-11-06',end:'2026-11-08'});assert.equal(result.candidates.length,15);assert.equal(result.route.length,0);assert.ok(!result.candidates.some(c=>c.campaign.brand==='유니클로'));
 const hotel=trip({...args,start:'2026-12-01',end:'2026-12-01',selection:{selected:['grand-josun-busan-202611']}});assert.equal(hotel.route[0].campaign.brand,'그랜드 조선 부산');assert.match(hotel.route[0].status.label,/사전 예약/);
});

test('new character popups stay selectable until their distinct final days and exclude November 9',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../busan-drop/data/event-details.js'),'utf8'),c);
 const harry=c.window.BUSAN_EVENT_DETAILS['해리포터 마호도코로'],hina=c.window.BUSAN_EVENT_DETAILS['히나쿠우'];
 assert.equal(status(hina,'2026-11-09').blocked,true);assert.equal(status(hina,'2026-11-10').blocked,false);assert.equal(status(hina,'2026-11-11').blocked,true);
 assert.equal(status(harry,'2026-11-09').blocked,true);assert.equal(status(harry,'2027-01-07').blocked,false);assert.equal(status(harry,'2027-01-08').blocked,true);
});

 test('Olive Young trip picker includes all three requested branches without claiming unverified benefits',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),c={window:{}};
 for(const f of ['data/event-details.js','data/store-locations.js','data/event-catalog.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../busan-drop',f),'utf8'),c);
 const args={catalog:c.window.BUSAN_EVENT_CATALOG,locations:c.window.BUSAN_STORE_LOCATIONS,events:c.window.BUSAN_EVENT_DETAILS,start:'2026-11-06',end:'2026-11-07'};
 const {trip}=require('../../busan-drop/integration/pass-model');
 const olive=trip(args).candidates.find(c=>c.campaign.brand==='올리브영');
 assert.deepEqual(Array.from(olive.branches,s=>s.id).sort(),['oliveyoung-0','oliveyoung-30','oliveyoung-8']);
 for(const branchId of ['oliveyoung-0','oliveyoung-30']){
  const result=trip({...args,selection:{selected:[olive.campaign.id],branches:{[olive.campaign.id]:branchId}}});
  assert.equal(result.route[0].item.id,branchId);assert.equal(result.route[0].status.kind,'check');assert.equal(result.route[0].status.blocked,false);
 }
});

test('route pins retain every visit number at identical coordinates and refresh numbers after reorder',()=>{
 const {coordinateGroups}=require('../../busan-drop/integration/pass-model');
 const route=[{item:{id:'a',lng:129,lat:35}},{item:{id:'b',lng:130,lat:36}},{item:{id:'c',lng:129,lat:35}}];
 const groups=coordinateGroups(route);assert.equal(groups.length,2);assert.deepEqual(groups[0].entries.map(e=>e.number),[1,3]);assert.deepEqual(groups[0].entries.map(e=>e.entry.item.id),['a','c']);
 const moved=coordinateGroups([route[1],route[0],route[2]]);assert.deepEqual(moved[1].entries.map(e=>e.number),[2,3]);assert.equal(moved[1].lng,129);assert.equal(moved[1].lat,35);
 assert.equal(coordinateGroups([...route,{item:{lng:129.000001,lat:35}}]).length,3);
});
test('trip routes keep calendar order ahead of manual order and reorder only within a day',()=>{const {trip}=require('../../busan-drop/integration/pass-model');const brands=['A','B','C'],catalog=brands.map(brand=>({id:brand,brand,scheduleStatus:'confirmed'})),locations=brands.map((brand,i)=>({id:brand,brand,lat:35+i/100,lng:129})),events=Object.fromEntries(brands.map(brand=>[brand,{start:'2026-11-01',end:'2026-11-30'}]));const result=trip({start:'2026-11-08',end:'2026-11-09',catalog,locations,events,selection:{selected:brands,visitDates:{A:'2026-11-09',B:'2026-11-08',C:'2026-11-08'},order:['A','C','B']}});assert.deepEqual(result.route.map(c=>c.campaign.id),['C','B','A']);assert.deepEqual(result.route.map(c=>c.visitDate),['2026-11-08','2026-11-08','2026-11-09']);});
