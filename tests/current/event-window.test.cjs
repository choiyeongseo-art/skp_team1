const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {koreaToday,monthWindow,select}=require('../../busan-drop/integration/event-window');
const today='2026-11-06';
test('one calendar month is inclusive and clamps month end including leap years',()=>{
 assert.deepEqual(monthWindow(today),{start:today,end:'2026-12-06'});
 assert.equal(monthWindow('2026-01-31').end,'2026-02-28');assert.equal(monthWindow('2028-01-31').end,'2028-02-29');assert.equal(monthWindow('2026-12-31').end,'2027-01-31');
 assert.equal(koreaToday(new Date('2026-11-05T15:00:00Z')),today);assert.equal(koreaToday(new Date('2026-11-05T14:59:59Z')),'2026-11-05');
});
test('includes ongoing and upcoming events from all brands, inclusive edges, excluding ended, later and unknown dates',()=>{
 const dates={ongoing:['2026-10-01','2026-11-20'],endingToday:['2026-11-01',today],boundary:['2026-12-06','2026-12-10'],ended:['2026-10-01','2026-11-05'],tooLate:['2026-12-07','2026-12-09'],unknown:[null,null],spans:['2026-01-01','2027-01-01'],bad:['2026-11-31','2026-12-02']};
 const events=Object.fromEntries(Object.entries(dates).map(([brand,[start,end]])=>[brand,{start,end,category:'뷰티'}]));
 const locations=Object.keys(events).map(brand=>({brand,lat:35,lng:129,region:'서면'}));
 assert.deepEqual(select({today,events,locations}).items.map(s=>s.brand),['ongoing','endingToday','boundary','spans']);
 assert.equal(select({today,events,locations,category:'뷰티',region:'서면'}).items.length,4);assert.equal(select({today,events,locations,category:'패션'}).items.length,0);assert.equal(select({today,events,locations,region:'해운대'}).items.length,0);
});
test('real data displays Monchhichi and confirmed Olive Young branch without asserting unconfirmed store participation',()=>{
 const c={window:{}};for(const f of ['data/event-details.js','data/store-locations.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../busan-drop',f),'utf8'),c);
 const args={today,events:c.window.BUSAN_EVENT_DETAILS,locations:c.window.BUSAN_STORE_LOCATIONS,categories:{'올리브영':['뷰티'],'몬치치':['팝업']}};
 const result=select(args);assert.equal(result.items.length,14);assert.ok(result.items.some(s=>s.id==='oliveyoung-8'));assert.ok(result.items.some(s=>s.brand==='몬치치'));
 assert.equal(select({...args,category:'뷰티'}).items.length,1);assert.equal(select({...args,category:'팝업',region:'해운대'}).items.length,1);
 assert.equal(select({...args,today:'2026-11-08'}).items.length,13);assert.equal(select({...args,today:'2026-11-16'}).items.length,7);
});

test('home tabs filter by administrative district even when legacy shopping-area tags disagree',()=>{
 const events={sample:{start:today,end:'2026-11-30'}};
 const locations=[['진구 외곽','부산광역시 부산진구 백양대로 1','기타'],['중구','부산 중구 중앙대로 1','기타'],['수영구','부산광역시 수영구 수영로 1','기타'],['센텀','부산 해운대구 센텀남대로 35','기타'],['동구 범일','부산광역시 동구 범일로 125','서면'],['기장','부산광역시 기장군 기장해안로 147','해운대']].map(([id,address,region])=>({id,address,region,brand:'sample',lat:35.1,lng:129.1}));
 for(const [region,id] of [['서면','진구 외곽'],['남포동','중구'],['광안리','수영구'],['해운대','센텀']])assert.deepEqual(select({today,events,locations,region}).items.map(s=>s.id),[id]);
 assert.equal(select({today,events,locations,region:'BUSAN'}).items.length,6);
});

test('static confirmed campaign periods drive home pins, with pending schedules excluded in every district',()=>{
 const c={window:{}};for(const f of ['data/event-catalog.js','data/event-details.js','data/store-locations.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../busan-drop',f),'utf8'),c);
 const args={today,catalog:c.window.BUSAN_EVENT_CATALOG,events:c.window.BUSAN_EVENT_DETAILS,locations:c.window.BUSAN_STORE_LOCATIONS};
 for(const [region,count] of [['BUSAN',14],['서면',6],['남포동',1],['광안리',0],['해운대',4]])assert.equal(select({...args,region}).items.length,count,region);
 assert.equal(select({...args,today:'2026-11-07'}).items.length,14);
 assert.equal(select({...args,today:'2026-11-08'}).items.length,13);
 assert.equal(select({...args,today:'2026-11-15'}).items.length,8);
 assert.equal(select({...args,today:'2026-11-16'}).items.length,7);
 // Even numeric dates accidentally populated on a pending record must not publish it.
 const catalog=args.catalog.map(e=>e.brand==='유니클로'?{...e,start:e.reportedStart,end:e.reportedEnd}:e);
 assert.equal(select({...args,catalog}).items.length,14);
 // Static campaign periods, rather than unrelated detail dates, define eligibility.
 assert.equal(select({...args,events:{...args.events,'몬치치':{start:null,end:null}}}).items.length,14);
});

test('same-building events remain individually selectable in a grouped home pin',()=>{
 const c={window:{}};for(const f of ['data/event-catalog.js','data/event-details.js','data/store-locations.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../busan-drop',f),'utf8'),c);
 const args={today,catalog:c.window.BUSAN_EVENT_CATALOG,events:c.window.BUSAN_EVENT_DETAILS,locations:c.window.BUSAN_STORE_LOCATIONS};
 const items=select({...args,region:'서면'}).items;
 const groups=require('../../busan-drop/integration/event-window').groupLocations(items);
 assert.equal(groups.length,1);assert.equal(groups[0].items.length,6);
 assert.deepEqual(groups[0].items.map(s=>s.brand),['와키윌리','원피스 무기와라 스토어','젤라또 피케','리락쿠마·스미코구라시','해리포터 마호도코로','히나쿠우']);
 const all=select(args).items;assert.ok(all.some(s=>s.brand==='와이잭'));
 assert.ok(!select({...args,region:'해운대'}).items.some(s=>s.brand==='와이잭'));
});

test('long-running San-X remains visible through January 31; Maple leaves the map after November 22',()=>{
 const c={window:{}};for(const f of ['data/event-catalog.js','data/event-details.js','data/store-locations.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../busan-drop',f),'utf8'),c);
 const args={catalog:c.window.BUSAN_EVENT_CATALOG,events:c.window.BUSAN_EVENT_DETAILS,locations:c.window.BUSAN_STORE_LOCATIONS};
 assert.ok(select({...args,today:'2026-12-06'}).items.some(s=>s.id==='sanx-popup-2026'));
 assert.ok(select({...args,today:'2027-01-31'}).items.some(s=>s.id==='sanx-popup-2026'));
 assert.ok(!select({...args,today:'2027-02-01'}).items.some(s=>s.id==='sanx-popup-2026'));
 assert.ok(select({...args,today:'2026-11-22'}).items.some(s=>s.id==='maplestory-popup-2026'));
 assert.ok(!select({...args,today:'2026-11-23'}).items.some(s=>s.id==='maplestory-popup-2026'));
});
