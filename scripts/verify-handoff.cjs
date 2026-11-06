const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),manifest=require('../internal/releases/20261106-production.json');
(async()=>{
 const changed=[];
 for(const file of manifest.files){const target=path.join(root,'busan-drop',file.path);let bytes;
 if(file.path==='integration/mapbox-config.js')bytes=Buffer.from(await require('./mapbox-runtime.cjs').loadMapboxConfig());
 else if(fs.existsSync(target))bytes=fs.readFileSync(target);
 if(!bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==file.sha256)changed.push(file.path);}
 if(changed.length){console.error('Changed from the 2026-11-06 production handoff:',changed.join('\n'));process.exitCode=1;}
 else console.log(`PASS: ${manifest.files.length} runtime files match the production handoff byte for byte.`);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
