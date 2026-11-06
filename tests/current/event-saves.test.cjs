const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),express=require('express');
const createRouter=require('../../lib/event-saves');
test('save API persists, deduplicates by visitor and campaign, isolates visitors and sorts newest first',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'busandrop-saves-')),file=path.join(dir,'saves.json'),app=express();app.use(express.json());app.use('/saves',createRouter(file));
 const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
 t.after(()=>{server.close();fs.rmSync(dir,{recursive:true,force:true});});
 const base=`http://127.0.0.1:${server.address().port}/saves`,olive='oliveyoung-blackfriday-2026',monch='monchhichi-busan-202611';
 const first=await fetch(base),cookie=first.headers.get('set-cookie').split(';')[0];assert.match(first.headers.get('set-cookie'),/HttpOnly/);assert.match(first.headers.get('set-cookie'),/SameSite=Lax/);
 const other=await fetch(base),otherCookie=other.headers.get('set-cookie').split(';')[0];
 const put=async(id,saved,c=cookie,storeId='oliveyoung-8')=>{const res=await fetch(`${base}/${id}`,{method:'PUT',headers:{'Content-Type':'application/json',Cookie:c},body:JSON.stringify({saved,storeId})});assert.equal(res.status,200);return res.json();};
 let data=await put(olive,true);assert.equal(data.counts[olive],1);const originalTime=data.saved[0].savedAt;
 data=await put(olive,true,cookie,'oliveyoung-0');assert.equal(data.counts[olive],1);assert.equal(data.saved[0].savedAt,originalTime);
 data=await put(olive,true,otherCookie);assert.equal(data.counts[olive],2);assert.equal(data.saved.length,1);
 data=await put(monch,true,cookie,'monchhichi-0');assert.deepEqual(data.saved.map(e=>e.eventId),[monch,olive]);
 data=await put(olive,false);assert.equal(data.counts[olive],1);assert.equal(data.saved.length,1);
 data=await put(olive,false);assert.equal(data.counts[olive],1);
 const persisted=JSON.parse(fs.readFileSync(file));assert.equal(Object.keys(persisted.visitors).length,2);
 const reloaded=await fetch(base,{headers:{Cookie:otherCookie}}).then(r=>r.json());assert.equal(reloaded.saved[0].eventId,olive);assert.equal(reloaded.counts[monch],1);
 for(const [eventId,storeId] of [['wackywilly-busan-202610','wackywilly-busan-b1'],['tunaschool-gwangbok-202611','tunaschool-gwangbok-b1'],['mugiwara-busan-202611','mugiwara-popup-202611'],['yjack-busan-202611','yjack-popup-202611'],['gelatopique-busan-202611','gelatopique-popup-202611'],['sanx-busan-202610','sanx-popup-2026'],['maplestory-busan-202608','maplestory-popup-2026'],['signiel-busan-202611','signiel-busan'],['westin-josun-busan-202611','westin-josun-busan'],['grand-josun-busan-202611','grand-josun-busan'],['harrypotter-busan-202610','harrypotter-popup-2026'],['hinakuu-busan-202610','hinakuu-popup-2026']]){const added=await put(eventId,true,cookie,storeId);assert.equal(added.counts[eventId],1);assert.ok(added.saved.some(e=>e.eventId===eventId&&e.storeId===storeId));await put(eventId,false);}
 const invalid=await fetch(`${base}/bogus`,{method:'PUT',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({saved:true})});assert.equal(invalid.status,400);
});
