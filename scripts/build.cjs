const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=path.join(root,'busan-drop'),target=path.join(root,'public/busandrop');
fs.mkdirSync(target,{recursive:true});
function copy(src,out){for(const entry of fs.readdirSync(src,{withFileTypes:true})){if(entry.name.startsWith('.')||entry.name.endsWith('.md'))continue;const a=path.join(src,entry.name),b=path.join(out,entry.name);if(entry.isDirectory()){fs.mkdirSync(b,{recursive:true});copy(a,b);}else fs.copyFileSync(a,b);}}
copy(source,target);
require('./production-shell.cjs').prepareProduction(target);
require('./mapbox-runtime.cjs').loadMapboxConfig().then(source=>{fs.writeFileSync(path.join(target,'integration/mapbox-config.js'),source);console.log('Built public/busandrop with runtime map configuration.');}).catch(error=>{console.error(error.message);process.exitCode=1;});
