const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../../busan-drop');
function setup(){const c={window:{},state:{language:'ko'}};vm.createContext(c);
 vm.runInContext(fs.readFileSync(path.join(root,'data/event-catalog.js'),'utf8'),c);
 const stores=fs.readFileSync(path.join(root,'integration/store-mapbox.js'),'utf8');vm.runInContext(stores.slice(stores.indexOf('  const brandCategories='),stores.indexOf('  const categoryLabel=')),c);
 const categories=fs.readFileSync(path.join(root,'integration/home-categories.js'),'utf8');vm.runInContext(categories.slice(categories.indexOf(' const categories='),categories.indexOf(' window.BUSAN_HOME_CATEGORY_HTML=')),c);
 vm.runInContext(fs.readFileSync(path.join(root,'integration/place-card.js'),'utf8'),c);return c.window;}
test('every registered event resolves the same category artwork in new and legacy saved plans',()=>{
 const w=setup(),cards=w.BUSAN_PLACE_CARD;
 assert.ok(w.BUSAN_EVENT_CATALOG.length>10);
 for(const event of w.BUSAN_EVENT_CATALOG){const category=w.BUSAN_STORE_BRAND_CATEGORIES[event.brand]?.[0];assert.ok(category,event.brand+' needs a category');const expected=w.BUSAN_CATEGORY_ICON(category);assert.equal(cards.mapIcon('event',{eventId:event.id}),expected,event.brand);assert.equal(cards.mapIcon('event',{id:'event:'+event.id}),expected,event.brand+' legacy');}
});
test('all seven service categories retain their own artwork, independently of the event name',()=>{
 const w=setup();for(const category of ['로컬','팝업','패션','뷰티','푸드','디저트','숙박']){const row={brand:'테스트 '+category};w.BUSAN_STORE_BRAND_CATEGORIES[row.brand]=[category];assert.equal(w.BUSAN_PLACE_CARD.mapIcon('event',row),w.BUSAN_CATEGORY_ICON(category));}
 assert.match(w.BUSAN_PLACE_CARD.mapIcon('event',{brand:'원피스 무기와라 스토어'}),/flat-black-yellow-popup\.svg/);
 assert.match(w.BUSAN_PLACE_CARD.mapIcon('event',{brand:'유니클로'}),/flat-black-yellow-fashion\.svg/);
});

test('missing tourism and food photos use exactly the map icon in both selection and saved cards',()=>{
 const w=setup();w.BUSAN_TOURISM_I18N={display:p=>p};
 for(const kind of ['sights','food'])for(const selectable of [true,false]){const html=w.BUSAN_PLACE_CARD.render({id:kind,kind,name:'사진 없는 장소',address:'부산'},{selectable});assert.ok(html.includes(w.BUSAN_PLACE_CARD.mapIcon(kind)));assert.doesNotMatch(html,/<img /);}
});
