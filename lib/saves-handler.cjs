/* Per-request consistent reads + ETag conditional writes preserve concurrent saves. */
function createHandler({catalog,storage,crypto}){
 const ids=new Set(catalog.map(event=>event.id));
 const snapshot=(data,visitor)=>({saved:Object.entries(data.visitors[visitor]||{}).map(([eventId,entry])=>({eventId,...entry})).sort((a,b)=>b.savedAt-a.savedAt),counts:Object.fromEntries(catalog.map(event=>[event.id,Object.values(data.visitors).filter(v=>Object.hasOwn(v,event.id)).length]))});
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(!['GET','PUT'].includes(req.method)){res.setHeader('Allow','GET, PUT');return res.status(405).json({error:'Method not allowed'});}
  let token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('busandrop_visitor='))?.slice(18);
  if(!/^[a-f0-9]{64}$/.test(token||'')){token=crypto.randomBytes(32).toString('hex');res.setHeader('Set-Cookie',`busandrop_visitor=${token}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);}
  const visitor=crypto.createHash('sha256').update(token).digest('hex');
  const eventId=req.query?.eventId;
  if(req.method==='PUT'){
   if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'Invalid origin'});
   if(!ids.has(eventId)||typeof req.body?.saved!=='boolean'||(req.body.storeId!==undefined&&!/^[a-z0-9-]{1,80}$/.test(req.body.storeId)))return res.status(400).json({error:'Invalid event save'});
  }
  try{
   for(let attempt=0;attempt<5;attempt++){
    const {data,etag}=await storage.read();
    if(req.method==='GET')return res.status(200).json(snapshot(data,visitor));
    const entries=data.visitors[visitor]||{};
    if(req.body.saved){if(!entries[eventId])entries[eventId]={savedAt:Date.now(),storeId:req.body.storeId||null};}
    else delete entries[eventId];
    if(Object.keys(entries).length)data.visitors[visitor]=entries;else delete data.visitors[visitor];
    try{await storage.write(data,etag);return res.status(200).json(snapshot(data,visitor));}
    catch(error){if(!['BlobPreconditionFailedError','BlobAlreadyExistsError'].includes(error.name)||attempt===4)throw error;}
   }
  }catch(error){console.error('Event save storage:',error.name);return res.status(503).json({error:'저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'});}
 };
}
module.exports={createHandler};
