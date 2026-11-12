const crypto=require('node:crypto');
const {publicConfig}=require('./auth-config.cjs');
const fail=(code,status=400)=>Object.assign(new Error(code),{code,status});
const encoded=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
function clientSecret(env,now){
 const key=crypto.createPrivateKey(env.BUSANDROP_APPLE_PRIVATE_KEY.replace(/\\n/g,'\n'));
 if(key.asymmetricKeyType!=='ec'||key.asymmetricKeyDetails?.namedCurve!=='prime256v1')throw fail('apple/not-configured',503);
 const head=encoded({alg:'ES256',kid:env.BUSANDROP_APPLE_KEY_ID});
 const body=encoded({iss:env.BUSANDROP_APPLE_TEAM_ID,iat:now,exp:now+300,aud:'https://appleid.apple.com',sub:env.BUSANDROP_APPLE_CLIENT_ID});
 const input=head+'.'+body;return input+'.'+crypto.sign('sha256',Buffer.from(input),{key,dsaEncoding:'ieee-p1363'}).toString('base64url');
}
function verifyIdentity(token,keys,clientId,subject,now){
 try{
  const parts=token.split('.');if(parts.length!==3)throw Error();
  const h=JSON.parse(Buffer.from(parts[0],'base64url')),p=JSON.parse(Buffer.from(parts[1],'base64url'));
  const jwk=keys.find(k=>k.kid===h.kid&&k.kty==='RSA');
  if(h.alg!=='RS256'||!jwk||p.iss!=='https://appleid.apple.com'||p.aud!==clientId||p.sub!==subject||!Number.isFinite(p.exp)||p.exp<=now||!Number.isFinite(p.iat)||p.iat>now+60)throw Error();
  if(!crypto.verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),crypto.createPublicKey({key:jwk,format:'jwk'}),Buffer.from(parts[2],'base64url')))throw Error();
 }catch{throw fail('apple/identity-mismatch',403);}
}
function proofKey(env){return crypto.createHash('sha256').update('busandrop-apple-deletion-v1\n'+env.BUSANDROP_APPLE_PRIVATE_KEY).digest();}
function makeProof(env,id,subject,now){const payload=encoded({id,subject,exp:now+86400});return payload+'.'+crypto.createHmac('sha256',proofKey(env)).update(payload).digest('base64url');}
function validProof(env,proof,id,subject,now){try{const [payload,sig,...extra]=proof.split('.');if(extra.length)return false;const expected=crypto.createHmac('sha256',proofKey(env)).update(payload).digest(),actual=Buffer.from(sig,'base64url');if(actual.length!==expected.length||!crypto.timingSafeEqual(actual,expected))return false;const p=JSON.parse(Buffer.from(payload,'base64url'));return p.id===id&&p.subject===subject&&p.exp>now&&p.exp<=now+86400;}catch{return false;}}
function createAppleDeleteHandler({env=process.env,fetchImpl=fetch,now=()=>Math.floor(Date.now()/1000)}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  const send=(status,body)=>res.status(status).json(body);
  if(req.method!=='POST'){res.setHeader('Allow','POST');return send(405,{error:'method-not-allowed'});}
  let proof;
  try{
   const config=publicConfig(env);
   if(!config.configured||!['BUSANDROP_APPLE_PRIVATE_KEY','BUSANDROP_APPLE_TEAM_ID','BUSANDROP_APPLE_KEY_ID','BUSANDROP_APPLE_CLIENT_ID'].every(k=>env[k]))throw fail('apple/not-configured',503);
   const origin=req.headers.origin;if(origin&&origin!=='https://busandrop.vercel.app'&&!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))throw fail('auth/origin-rejected',403);
   const match=String(req.headers.authorization||'').match(/^Bearer ([A-Za-z0-9_.-]{20,8192})$/);if(!match)throw fail('auth/required',401);
   const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
   if(!body||JSON.stringify(body).length>16384||body.confirmation!=='DELETE_MY_ACCOUNT'||Object.keys(body).some(k=>!['confirmation','providerRefreshToken','revocationProof'].includes(k)))throw fail('auth/invalid-request');
   const headers={apikey:config.publishableKey,Authorization:'Bearer '+match[1]};
   const request=(url,options={})=>fetchImpl(url,{...options,signal:AbortSignal.timeout(15000),redirect:'error'});
   const verified=await request(config.url+'/auth/v1/user',{headers});if(!verified.ok)throw fail('auth/required',401);
   const user=await verified.json(),identity=user.identities?.find(x=>x.provider==='apple'),subject=identity?.identity_data?.sub||identity?.id;
   if(!user.id||typeof subject!=='string'||!subject)throw fail('apple/identity-required',403);
   if(body.revocationProof&&validProof(env,body.revocationProof,user.id,subject,now()))proof=body.revocationProof;
   else{
    const token=body.providerRefreshToken;if(typeof token!=='string'||token.length<10||token.length>8192)throw fail('apple/reauth-required',409);
    const secret=clientSecret(env,now()),common={client_id:env.BUSANDROP_APPLE_CLIENT_ID,client_secret:secret};
    const refreshed=await request('https://appleid.apple.com/auth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({...common,grant_type:'refresh_token',refresh_token:token}).toString()});
    if(!refreshed.ok)throw fail('apple/reauth-required',409);
    const data=await refreshed.json();if(typeof data.id_token!=='string')throw fail('apple/identity-mismatch',403);
    const jwks=await request('https://appleid.apple.com/auth/keys');if(!jwks.ok)throw fail('apple/unavailable',502);
    verifyIdentity(data.id_token,(await jwks.json()).keys||[],env.BUSANDROP_APPLE_CLIENT_ID,subject,now());
    const revoked=await request('https://appleid.apple.com/auth/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({...common,token,token_type_hint:'refresh_token'}).toString()});
    if(!revoked.ok)throw fail('apple/revoke-failed',502);
    proof=makeProof(env,user.id,subject,now());
   }
   const deleted=await request(config.url+'/rest/v1/rpc/busan_delete_my_account',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({p_confirmation:'DELETE_MY_ACCOUNT'})});
   if(!deleted.ok||(await deleted.json()).deleted!==true)throw fail('auth/deletion-retry',502);
   return send(200,{deleted:true,appleRevoked:true});
  }catch(e){return send(e.status||502,{error:e.code||'apple/unavailable',...(proof?{revocationProof:proof}:{})});}
 };
}
module.exports={createAppleDeleteHandler,clientSecret,verifyIdentity,makeProof,validProof};
