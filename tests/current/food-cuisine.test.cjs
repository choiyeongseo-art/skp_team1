const test=require('node:test'),assert=require('node:assert/strict'),model=require('../../busan-drop/integration/my-library-model');
test('database cuisines map into five disjoint categories without name-based guessing',()=>{
 const rows=['busan_local','korean','noodle','seafood','other',null,'unknown'].map((cuisine,i)=>({id:String(i),cuisine,name:'스시 카페'}));
 assert.deepEqual(model.filterFoodCuisine(rows,'all'),rows);
 for(const key of ['busan_local','korean','noodle','seafood'])assert.equal(model.filterFoodCuisine(rows,key).length,1);
 assert.equal(model.filterFoodCuisine(rows,'other').length,3);
 assert.equal(new Set(['busan_local','korean','noodle','seafood','other'].flatMap(key=>model.filterFoodCuisine(rows,key).map(p=>p.id))).size,rows.length);
});
