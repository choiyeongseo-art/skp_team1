/* Serve the same generated app shell as Vercel, with local API handlers. */
process.env.BUSANDROP_PREVIEW='1';
const app=require('../server.js'),host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||4188);
app.listen(port,host,()=>console.log(`BUSAN DROP production preview: http://${host}:${port}/busandrop/login`));
