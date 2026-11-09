const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {group,status}=require('../../busan-drop/integration/store-events-model');
const c={window:{}};for(const file of ['data/event-details.js','data/store-locations.js','data/event-catalog.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../busan-drop',file),'utf8'),c);
const rows=c.window.BUSAN_STORE_LOCATIONS,catalog=c.window.BUSAN_EVENT_CATALOG,events=c.window.BUSAN_EVENT_DETAILS;
test('33 locations become twenty campaign cards while retaining every matching branch',()=>{
 const groups=group(rows,catalog,events);assert.equal(groups.length,20);assert.equal(groups.reduce((count,g)=>count+g.items.length,0),33);assert.equal(groups.find(g=>g.brand==='유니클로').items.length,9);assert.equal(groups.find(g=>g.brand==='올리브영').items.length,3);
});
test('area-filtered rows only offer branches inside the selected area',()=>{
 const groups=group(rows.filter(item=>item.region==='서면'),catalog,events);assert.deepEqual(groups.map(g=>[g.brand,g.items.length]),[['유니클로',2],['자라',1],['와키윌리',1],['원피스 무기와라 스토어',1],['젤라또 피케',1],['리락쿠마·스미코구라시',1],['해리포터 마호도코로',1],['히나쿠우',1]]);assert.ok(groups.every(g=>g.items.every(item=>item.region==='서면')));assert.equal(group([],catalog,events).length,0);
});
test('campaign statuses distinguish future, ongoing, ended and unconfirmed schedules',()=>{
 assert.equal(status(events['올리브영'],'2026-11-06'),'진행 중');assert.equal(status(events['올리브영'],'2026-11-08'),'종료');assert.equal(status(events['몬치치'],'2026-11-01'),'진행 예정');assert.equal(status(events['유니클로'],'2026-11-06'),'일정 확인 중');assert.equal(status(null,'2026-11-06'),'행사 안내 준비 중');
});
