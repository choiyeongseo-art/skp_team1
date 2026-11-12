const express=require('express'),path=require('node:path');
const app=express(),publicApp=path.join(__dirname,process.env.BUSANDROP_PREVIEW==='1'?'public/busandrop':'busan-drop');
app.use(express.json({limit:'16kb'}));
app.post('/api/busandrop/apple-account-delete',require('./lib/apple-account-delete.cjs').createAppleDeleteHandler());
app.get('/api/busandrop/auth-config',require('./lib/auth-config.cjs').createAuthConfigHandler({keyFile:path.join(__dirname,'.env.local')}));
app.get('/api/busandrop/nearby-attractions',require('./lib/supabase-nearby.cjs').createNearbyHandler({locationFile:path.join(publicApp,'data/store-locations.js'),keyFile:path.join(__dirname,'.env.local')}));
app.get('/api/busandrop/nearby-restaurants',require('./lib/supabase-nearby.cjs').createNearbyHandler({kind:'food',locationFile:path.join(publicApp,'data/store-locations.js'),keyFile:path.join(__dirname,'.env.local')}));
app.get('/api/busandrop/tourism-translations',require('./lib/supabase-nearby.cjs').createNearbyHandler({dictionary:true,locationFile:path.join(publicApp,'data/store-locations.js'),keyFile:path.join(__dirname,'.env.local')}));
app.get('/api/busandrop/restaurant-translations',require('./lib/supabase-nearby.cjs').createNearbyHandler({dictionary:true,kind:'food',locationFile:path.join(publicApp,'data/store-locations.js'),keyFile:path.join(__dirname,'.env.local')}));
app.use('/api/busandrop/event-saves',require('./lib/event-saves')(path.join(__dirname,'.local/event-saves.json')));
app.get(['/','/busandrop','/busandrop/'],(req,res)=>res.redirect('/busandrop/login'));
app.get(["/busandrop/login", "/busandrop/home", "/busandrop/stores", "/busandrop/drop-plan", "/busandrop/saved", "/busandrop/my", "/busandrop/auth/callback"], (req,res)=>{if(req.path.endsWith('/'))return res.redirect(req.path.slice(0,-1)+(req.url.includes('?')?req.url.slice(req.url.indexOf('?')):''));res.sendFile(path.join(publicApp,'index.html'));});
app.get('/busandrop/integration/mapbox-config.js',async(req,res,next)=>{try{res.type('application/javascript').send(await require('./scripts/mapbox-runtime.cjs').loadMapboxConfig());}catch(error){next(error);}});
app.use('/busandrop',express.static(publicApp));
// Compatibility for designers' previous bookmarked standalone URL.
app.get(['/busan-drop','/busan-drop/'],(req,res)=>res.redirect('/busandrop/login'));
app.use((err,req,res,next)=>{console.error(err.message);res.status(500).json({error:'로컬 저장소를 확인해주세요.'});});
if(require.main===module){const port=Number(process.env.PORT||4187),host=process.env.HOST||'127.0.0.1';app.listen(port,host,()=>console.log(`BUSAN DROP: http://${host}:${port}/busandrop/home`));}
module.exports=app;
