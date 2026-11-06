const express=require('express'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const catalog=require('../busan-drop/data/event-catalog');
module.exports=function eventSaves(file){
 const router=express.Router(),ids=new Set(catalog.map(e=>e.id));
 const read=()=>{try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){if(e.code==='ENOENT')return {visitors:{}};throw e;}};
 const write=data=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(data,null,2));fs.renameSync(file+'.tmp',file);};
 router.use((req,res,next)=>{
  res.set('Cache-Control','no-store');
  let token=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('busandrop_visitor='))?.slice('busandrop_visitor='.length);
  if(!/^[a-f0-9]{64}$/.test(token||'')){
   token=crypto.randomBytes(32).toString('hex');
   res.cookie('busandrop_visitor',token,{httpOnly:true,sameSite:'lax',secure:req.secure,maxAge:365*86400000,path:'/'});
  }
  req.visitor=crypto.createHash('sha256').update(token).digest('hex');next();
 });
 const snapshot=(data,visitor)=>({saved:Object.entries(data.visitors[visitor]||{}).map(([eventId,entry])=>({eventId,...entry})).sort((a,b)=>b.savedAt-a.savedAt),counts:Object.fromEntries(catalog.map(e=>[e.id,Object.values(data.visitors).filter(v=>Object.hasOwn(v,e.id)).length]))});
 router.get('/',(req,res,next)=>{try{res.json(snapshot(read(),req.visitor));}catch(e){next(e);}});
 router.put('/:eventId',(req,res,next)=>{
  if(!ids.has(req.params.eventId)||typeof req.body?.saved!=='boolean'||(req.body.storeId!==undefined&&(!/^[a-z0-9-]{1,80}$/.test(req.body.storeId))))return res.status(400).json({error:'Invalid event save'});
  try{
   const data=read(),visitor=data.visitors[req.visitor]||{},id=req.params.eventId;
   if(req.body.saved){if(!visitor[id])visitor[id]={savedAt:Date.now(),storeId:req.body.storeId||null};}
   else delete visitor[id];
   if(Object.keys(visitor).length)data.visitors[req.visitor]=visitor;else delete data.visitors[req.visitor];
   write(data);res.json(snapshot(data,req.visitor));
  }catch(e){next(e);}
 });
 return router;
};
