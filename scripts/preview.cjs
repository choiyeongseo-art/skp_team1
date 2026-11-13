/* Serve the built app with local persistence and public read fallbacks. */
process.env.BUSANDROP_PREVIEW='1';
const fs=require('node:fs'),path=require('node:path'),express=require('express');
const preview=express(),envFile=path.join(__dirname,'../.env.local');
const envText=fs.existsSync(envFile)?fs.readFileSync(envFile,'utf8'):'';
const hasTourismKey=!!process.env.TOURISM_SUPABASE_SERVICE_ROLE_KEY||/^TOURISM_SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^\s'"#]/m.test(envText);
if(!hasTourismKey)preview.use(require('../lib/preview-read-proxy.cjs').createPreviewReadProxy());
preview.use(require('../server.js'));
const host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||4188);
preview.listen(port,host,()=>console.log(`BUSAN DROP production preview: http://${host}:${port}/busandrop/home`));
