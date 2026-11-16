const crypto=require('node:crypto');
const catalog=require('../busan-drop/data/event-catalog.js');
function createSupabaseSavesHandler({env=process.env,keyFile,fetchImpl=fetch}={}){
 if(keyFile){const fs=require('node:fs'),{parseEnv}=require('node:util');if(fs.existsSync(keyFile))env={...parseEnv(fs.readFileSync(keyFile,'utf8')),...env};}
 const ids=new Set(catalog.map(e=>e.id));
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const send=(status,data)=>res.status(status).json(data);
  if(!['GET','PUT'].includes(req.method)){res.setHeader('Allow','GET, PUT');return send(405,{error:'Method not allowed'});}
  const eventId=req.query?.eventId;
  if(req.method==='PUT'){
   try{if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return send(403,{error:'Invalid origin'});}catch{return send(403,{error:'Invalid origin'});}
   if(!ids.has(eventId)||typeof req.body?.saved!=='boolean'||(req.body.storeId!==undefined&&!/^[a-z0-9-]{1,80}$/.test(req.body.storeId)))return send(400,{error:'Invalid event save'});
  }
  let token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('busandrop_visitor='))?.slice(18);
  if(!/^[a-f0-9]{64}$/.test(token||'')){token=crypto.randomBytes(32).toString('hex');res.setHeader('Set-Cookie',`busandrop_visitor=${token}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);}
  const visitor=crypto.createHash('sha256').update(token).digest('hex');
  try{
   const url=env.BUSANDROP_AUTH_SUPABASE_URL,key=env.BUSANDROP_SAVES_SUPABASE_SECRET_KEY;
   if(!url||!key)throw Error('saves/not-configured');
   const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
   const request=async(path,options={})=>{const r=await fetchImpl(url+path,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(15000),redirect:'error'});if(!r.ok)throw Error(`saves/upstream-${r.status}`);return r;};
   let accountId=null;
   if(req.headers.authorization){
    if(!/^Bearer [A-Za-z0-9_.-]{20,8192}$/.test(req.headers.authorization))return send(401,{error:'Invalid session'});
    const r=await fetchImpl(url+'/auth/v1/user',{headers:{apikey:key,Authorization:req.headers.authorization},signal:AbortSignal.timeout(15000),redirect:'error'});
    if(!r.ok)return send(401,{error:'Invalid session'});
    accountId=(await r.json()).id;if(!accountId)return send(401,{error:'Invalid session'});
   }
   if(req.method==='PUT'){
    if(req.body.saved)await request('/rest/v1/busan_guest_event_saves?on_conflict=visitor_hash,event_id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({visitor_hash:visitor,event_id:eventId,store_id:req.body.storeId||null})});
    else await request(`/rest/v1/busan_guest_event_saves?visitor_hash=eq.${visitor}&event_id=eq.${encodeURIComponent(eventId)}`,{method:'DELETE'});
   }
   const r=await request('/rest/v1/rpc/busan_event_save_snapshot',{method:'POST',body:JSON.stringify({p_visitor:visitor,p_exclude_user:accountId})});
   const data=await r.json();
   return send(200,{saved:data.saved||[],counts:Object.fromEntries([...ids].map(id=>[id,Number(data.counts?.[id])||0]))});
  }catch(error){console.error('Event save storage:',error.message);return send(503,{error:'저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'});}
 };
}
module.exports={createSupabaseSavesHandler};
