const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/../../busan-drop/integration/shopping-pass.js','utf8'),c={};vm.createContext(c);vm.runInContext(source.slice(source.indexOf(' function milestoneState('),source.indexOf(' function milestone(route)')),c);
const route=n=>Array.from({length:n},(_,i)=>({campaign:{title:'행사 '+(i+1)}}));
test('milestone expands with event count and distinguishes each venue optional steps from final review',()=>{
 const s=c.milestoneState(route(2),3,1,false,true);assert.equal(s.total,7);assert.equal(s.current,5);assert.equal(s.steps[4].venueNumber,2);assert.equal(s.steps[4].optional,true);assert.equal(s.steps[6].label,'플랜 확인·저장');assert.equal(c.milestoneState(route(2),4,1,false,true).current,6);assert.equal(c.milestoneState(route(2),4,1,true,true).current,7);assert.equal(c.milestoneState(route(1),3,0,false,true).total,5);
});
test('preparation waits for event selection and back navigation restores the corresponding stage',()=>{
 assert.equal(c.milestoneState([],1,0,false,false).current,1);const ready=c.milestoneState([],1,0,false,true);assert.equal(ready.current,2);assert.equal(ready.confirmed,false);assert.equal(c.milestoneState(route(3),3,2,false,true).current,7);assert.equal(c.milestoneState(route(3),4,1,false,true).current,6);
});
