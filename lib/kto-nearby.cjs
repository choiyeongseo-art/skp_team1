const fs=require('node:fs'),vm=require('node:vm');
const excluded=name=>/(전포카페거리|해리단길)/.test(String(name).replace(/\s/g,''));
function privateKey(file){if(process.env.KTO_API_KEY)return process.env.KTO_API_KEY;try{return fs.readFileSync(file,'utf8').match(/^KTO_API_KEY\s*=\s*(.+)$/m)?.[1].trim().replace(/^['"]|['"]$/g,'')||'';}catch{return '';}}
function readLocations(file){const context={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),context);return context.window.BUSAN_STORE_LOCATIONS;}
function imageUrl(value){try{const url=new URL(value);if(!['http:','https:'].includes(url.protocol))return '';url.protocol='https:';return url.href;}catch{return '';}}
function createNearbyHandler({locations,locationFile,keyFile,fetcher=fetch,key,ttl=3600000}={}){
 const stores=locations||readLocations(locationFile),cache=new Map(),inflight=new Map();
 async function load(location){const cacheKey=`${location.lng},${location.lat}`,hit=cache.get(cacheKey);if(hit&&Date.now()-hit.at<ttl)return hit.items;if(inflight.has(cacheKey))return inflight.get(cacheKey);
  const promise=(async()=>{const serviceKey=key||privateKey(keyFile);if(!serviceKey)throw new Error('configuration');let decoded=serviceKey;try{decoded=decodeURIComponent(serviceKey);}catch{}
   const query=new URLSearchParams({serviceKey:decoded,MobileOS:'WEB',MobileApp:'BusanDrop',_type:'json',mapX:String(location.lng),mapY:String(location.lat),radius:'3000',contentTypeId:'12',numOfRows:'20',pageNo:'1',arrange:'E'});
   const response=await fetcher('https://apis.data.go.kr/B551011/KorService2/locationBasedList2?'+query,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error('upstream');const json=await response.json(),header=json?.response?.header,body=json?.response?.body;if(header?.resultCode!=='0000'||!body)throw new Error('upstream');
   const raw=body.items?.item,items=(Array.isArray(raw)?raw:raw?[raw]:[]).filter(item=>String(item.contenttypeid)==='12'&&!excluded(item.title)&&String(item.areacode)==='6'&&Number.isFinite(Number(item.mapx))&&Number.isFinite(Number(item.mapy))).map(item=>({id:'kto-'+item.contentid,contentId:String(item.contentid),kind:'sights',name:String(item.title),address:[item.addr1,item.addr2].filter(Boolean).join(' '),lat:Number(item.mapy),lng:Number(item.mapx),image:imageUrl(item.firstimage2||item.firstimage),distance:Number.isFinite(Number(item.dist))?Math.round(Number(item.dist)):null,description:'한국관광공사 관광지 정보',source:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(item.title+' '+item.addr1),provider:'KTO TourAPI'}));
   cache.set(cacheKey,{at:Date.now(),items});if(cache.size>200)cache.delete(cache.keys().next().value);return items;
  })();inflight.set(cacheKey,promise);try{return await promise;}finally{inflight.delete(cacheKey);}
 }
 return async(req,res)=>{res.setHeader('Cache-Control','no-store');if(req.method!=='GET')return res.status(405).json({error:'method_not_allowed'});
  const ids=typeof req.query?.stores==='string'?[...new Set(req.query.stores.split(',').filter(Boolean))]:[];if(!ids.length||ids.length>20||ids.some(id=>!stores.some(s=>s.id===id)))return res.status(400).json({error:'invalid_stores'});
  const selected=ids.map(id=>stores.find(s=>s.id===id)),unique=[...new Map(selected.map(s=>[`${s.lng},${s.lat}`,s])).values()],merged=new Map(),deadline=Date.now()+36000;let failed=0;
  // Bound upstream parallelism and reuse queries shared by venues at identical coordinates.
  for(let i=0;i<unique.length;i+=3){if(Date.now()>=deadline){failed+=unique.length-i;break;}await Promise.all(unique.slice(i,i+3).map(async venue=>{try{for(const place of await load(venue)){const old=merged.get(place.id);if(!old||(place.distance??Infinity)<(old.distance??Infinity))merged.set(place.id,{...place,nearStore:venue.name,nearStoreId:venue.id});}}catch{failed++;}}));}
  if(failed===unique.length)return res.status(502).json({error:'tourism_unavailable',message:'관광지 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'});
  return res.json({places:[...merged.values()].sort((a,b)=>(a.distance??Infinity)-(b.distance??Infinity)).slice(0,30),radius:3000,partial:failed>0,provider:'KTO TourAPI',fetchedAt:new Date().toISOString()});
 };
}
module.exports={createNearbyHandler,excluded};
