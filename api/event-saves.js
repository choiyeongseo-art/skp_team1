const crypto=require('node:crypto');
const catalog=require('../busan-drop/data/event-catalog.js');
const {createHandler}=require('../lib/saves-handler.cjs');
const {get,put}=require('@vercel/blob');
const pathname='busandrop/event-saves.json';
const storage={
 async read(){const result=await get(pathname,{access:'private',useCache:false});if(!result)return {data:{visitors:{}},etag:null};return {data:JSON.parse(await new Response(result.stream).text()),etag:result.blob.etag};},
 async write(data,etag){await put(pathname,JSON.stringify(data),{access:'private',contentType:'application/json',addRandomSuffix:false,allowOverwrite:!!etag,...(etag?{ifMatch:etag}:{})});}
};
module.exports=createHandler({catalog,storage,crypto});
