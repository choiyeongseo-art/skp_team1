/* Local preview only: public read APIs, never database secrets or write forwarding. */
const paths=new Set(['/api/busandrop/nearby-attractions','/api/busandrop/nearby-restaurants','/api/busandrop/tourism-translations','/api/busandrop/restaurant-translations']);
function createPreviewReadProxy({fetcher=fetch}={}){return async(req,res,next)=>{
 if(req.method!=='GET'||!paths.has(req.path))return next();
 const url=new URL(req.path,'https://busandrop.vercel.app');if(typeof req.query.stores==='string')url.searchParams.set('stores',req.query.stores);
 try{const upstream=await fetcher(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});res.setHeader('Cache-Control','no-store');const body=await upstream.json();res.status(upstream.status).json(body);}catch{res.status(502).json({error:'preview_upstream_unavailable',message:'공개 데이터 연결을 확인해주세요.'});}
};}
module.exports={createPreviewReadProxy};
