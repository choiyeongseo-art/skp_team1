const fs=require('node:fs');
const catalog=require('../busan-drop/data/event-catalog.js'),ids=new Set(catalog.map(e=>e.id));
async function main(){
 const file=process.argv[2];if(!file)throw Error('Pass a legacy JSON path; use --apply only after validating the summary.');
 const data=JSON.parse(fs.readFileSync(file,'utf8')),rows=[];
 if(!data.visitors||typeof data.visitors!=='object'||Array.isArray(data.visitors))throw Error('Invalid visitors');
 for(const [visitor,entries] of Object.entries(data.visitors)){
  if(!/^[a-f0-9]{64}$/.test(visitor)||!entries||typeof entries!=='object')throw Error('Invalid legacy visitor');
  for(const [id,e] of Object.entries(entries)){
   if(!ids.has(id)||!Number.isFinite(e.savedAt)||!Number.isFinite(new Date(e.savedAt).getTime())||(e.storeId!==null&&e.storeId!==undefined&&!/^[a-z0-9-]{1,80}$/.test(e.storeId)))throw Error('Invalid legacy save');
   rows.push({visitor_hash:visitor,event_id:id,store_id:e.storeId||null,saved_at:new Date(e.savedAt).toISOString()});
  }
 }
 console.log(JSON.stringify({visitors:Object.keys(data.visitors).length,saves:rows.length,apply:process.argv.includes('--apply')}));
 if(!process.argv.includes('--apply'))return;
 const url=process.env.BUSANDROP_AUTH_SUPABASE_URL,key=process.env.BUSANDROP_SAVES_SUPABASE_SECRET_KEY;if(!url||!key)throw Error('Server configuration missing');
 for(let i=0;i<rows.length;i+=100){const r=await fetch(url+'/rest/v1/busan_guest_event_saves?on_conflict=visitor_hash,event_id',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates'},body:JSON.stringify(rows.slice(i,i+100)),signal:AbortSignal.timeout(15000),redirect:'error'});if(!r.ok)throw Error('Restore failed: HTTP '+r.status);}
 console.log('Legacy restore complete; existing rows preserved.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
