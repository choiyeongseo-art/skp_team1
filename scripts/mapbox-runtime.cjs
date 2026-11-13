/* Map configuration is supplied at runtime, never committed as a token. */
const fs=require('node:fs'),path=require('node:path');
const local=path.join(__dirname,'../busan-drop/integration/mapbox-config.js');
let pending;
function loadMapboxConfig(){
 if(fs.existsSync(local))return Promise.resolve(fs.readFileSync(local,'utf8'));
 const built=path.join(__dirname,'../public/busandrop/integration/mapbox-config.js');
 if(fs.existsSync(built)){const source=fs.readFileSync(built,'utf8');if(source.includes('window.BUSAN_MAPBOX_CONFIG')&&!source.includes('<html'))return Promise.resolve(source);}
 if(!pending)pending=(async()=>{
  const response=await fetch('https://busandrop.vercel.app/busandrop/integration/mapbox-config.js',{signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Map configuration unavailable: '+response.status);
  const source=await response.text();
  if(!source.includes('window.BUSAN_MAPBOX_CONFIG')||source.includes('<html'))throw Error('Invalid map configuration');
  return source;
 })().catch(error=>{pending=null;throw error;});
 return pending;
}
module.exports={loadMapboxConfig};
