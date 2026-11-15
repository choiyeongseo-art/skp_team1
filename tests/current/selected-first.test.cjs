const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/../../busan-drop/integration/shopping-pass.js','utf8');
test('checked events and nearby places float to the top without mutating their base order',()=>{
 const c={};vm.createContext(c);vm.runInContext(source.slice(source.indexOf(' function selectedFirst('),source.indexOf(' function choices(')),c);
 const rows=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}],before=JSON.stringify(rows),selected=new Set(['d','b']);
 assert.deepEqual(Array.from(c.selectedFirst(rows,row=>selected.has(row.id)),row=>row.id),['b','d','a','c']);assert.equal(JSON.stringify(rows),before);
 selected.delete('b');assert.deepEqual(Array.from(c.selectedFirst(rows,row=>selected.has(row.id)),row=>row.id),['d','a','b','c']);
 selected.clear();assert.deepEqual(Array.from(c.selectedFirst(rows,row=>selected.has(row.id)),row=>row.id),['a','b','c','d']);
});
