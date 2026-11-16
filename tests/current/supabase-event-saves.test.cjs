const test=require('node:test'),assert=require('node:assert/strict');
const {createSupabaseSavesHandler}=require('../../lib/supabase-event-saves.cjs');
const env={BUSANDROP_AUTH_SUPABASE_URL:'https://example.supabase.co',BUSANDROP_SAVES_SUPABASE_SECRET_KEY:'server-secret'};
const cookie='busandrop_visitor='+'a'.repeat(64),id='mugiwara-busan-202611';
function res(){return {headers:{},setHeader(k,v){this.headers[k]=v;},status(s){this.code=s;return this;},json(d){this.body=d;return this;}};}
const req=(extra={})=>({method:'GET',headers:{cookie,host:'example.com'},query:{},...extra});
test('guest snapshot sends only the hashed cookie to server-only RPC and keeps empty counts numeric',async()=>{
 let call;const h=createSupabaseSavesHandler({env,fetchImpl:async(url,o)=>{call={url,o};return {ok:true,json:async()=>({saved:[],counts:{[id]:2}})};}}),r=res();await h(req(),r);
 assert.equal(r.code,200);assert.equal(r.body.counts[id],2);assert.equal(r.body.counts['monchhichi-busan-202611'],0);const p=JSON.parse(call.o.body);assert.match(p.p_visitor,/^[a-f0-9]{64}$/);assert.notEqual(p.p_visitor,'a'.repeat(64));assert.equal(p.p_exclude_user,null);assert.equal(r.headers['Cache-Control'],'no-store');assert.ok(!JSON.stringify(r.body).includes('server-secret'));
});
test('authenticated aggregate verifies the session and excludes exactly that account',async()=>{
 const calls=[],h=createSupabaseSavesHandler({env,fetchImpl:async(url,o)=>{calls.push({url,o});return {ok:true,json:async()=>url.endsWith('/auth/v1/user')?{id:'account-a'}:{saved:[],counts:{}}};}}),r=res();await h(req({headers:{cookie,authorization:'Bearer '+ 't'.repeat(30)}}),r);
 assert.equal(r.code,200);assert.equal(JSON.parse(calls[1].o.body).p_exclude_user,'account-a');assert.equal(calls.length,2);
});
test('invalid tokens cannot exclude arbitrary accounts or read snapshots',async()=>{
 let calls=0;const h=createSupabaseSavesHandler({env,fetchImpl:async()=>{calls++;return {ok:false,status:401};}}),r=res();await h(req({headers:{authorization:'Bearer '+'t'.repeat(30)}}),r);assert.equal(r.code,401);assert.equal(calls,1);
});
test('guest writes use database uniqueness and exact owner/event deletion filters',async()=>{
 const calls=[],h=createSupabaseSavesHandler({env,fetchImpl:async(url,o)=>{calls.push({url,o});return {ok:true,json:async()=>({saved:[],counts:{}})};}});
 await h(req({method:'PUT',query:{eventId:id},body:{saved:true,storeId:'store'}}),res());assert.equal(calls[0].o.headers.Prefer,'resolution=ignore-duplicates');assert.equal(JSON.parse(calls[0].o.body).event_id,id);
 calls.length=0;await h(req({method:'PUT',query:{eventId:id},body:{saved:false}}),res());assert.equal(calls[0].o.method,'DELETE');assert.match(calls[0].url,/visitor_hash=eq\.[a-f0-9]{64}&event_id=eq\.mugiwara-busan-202611/);
});
test('invalid events and cross-site writes never reach Supabase; upstream failure stays unavailable',async()=>{
 let calls=0;const h=createSupabaseSavesHandler({env,fetchImpl:async()=>{calls++;return {ok:false,status:503};}});
 const r=res();await h(req({method:'PUT',query:{eventId:'unknown'},body:{saved:true}}),r);assert.equal(r.code,400);
 const foreign=res();await h(req({method:'PUT',headers:{host:'example.com',origin:'https://foreign.test'},query:{eventId:id},body:{saved:true}}),foreign);assert.equal(foreign.code,403);assert.equal(calls,0);
 const down=res();await h(req(),down);assert.equal(down.code,503);assert.equal(down.body.counts,undefined);
});
