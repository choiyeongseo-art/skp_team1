/* Dedicated BUSAN DROP Supabase Auth. Tourism service-role credentials are never used here. */
(()=>{
 let client=null,config=null,user=null,initializing=null,revision=0,revocationProof=null;
 const error=code=>Object.assign(new Error(code),{code});
 function publish(next){user=next||null;state.joined=!!user;try{persist();}catch{}window.dispatchEvent(new CustomEvent('busan-auth-updated'));}
 async function verifySession(session){const current=revision;if(!session){publish(null);return;}try{const result=await client.auth.getUser();if(current!==revision)return;if(result.error||!result.data.user){publish(null);return;}publish(result.data.user);}catch{if(current===revision)publish(null);}}
 async function initialize(){
  try{const response=await fetch('/api/busandrop/auth-config',{cache:'no-store'});if(!response.ok)throw error('auth/config-unavailable');config=await response.json();if(!config.configured){publish(null);return false;}if(!window.supabase?.createClient)throw error('auth/sdk-unavailable');
   client=window.supabase.createClient(config.url,config.publishableKey,{auth:{storageKey:'busandrop-auth-v1',flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
   client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){++revision;publish(null);}else if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED'||event==='USER_UPDATED')setTimeout(()=>verifySession(session),0);});
   const session=await client.auth.getSession();if(session.error)throw session.error;await verifySession(session.data.session);return true;
  }catch{publish(null);return false;}
 }
 const ready=()=>initializing||(initializing=initialize());
 async function requireClient(provider){if(!await ready()||!client)throw error('auth/not-configured');if(provider&&!config.providers?.[provider])throw error('auth/provider-disabled');return client;}
 async function startOAuth(provider){if(!['google','apple'].includes(provider))throw error('auth/invalid-provider');const c=await requireClient(provider),options={redirectTo:window.location.origin+'/busandrop/auth/callback'};if(provider==='google')options.queryParams={prompt:'select_account'};else options.scopes='email name';const result=await c.auth.signInWithOAuth({provider,options});if(result.error)throw result.error;return result.data;}
 async function passwordSession(result,current){if(result.error)throw result.error;if(current!==revision)throw error('auth/cancelled');await verifySession(result.data.session);if(current!==revision||!user)throw error('auth/verification-failed');return user;}
 // Keep username identities in a reserved, non-deliverable namespace.
 // Identity is canonical and unique in Supabase Auth; editable profile metadata is not used to authenticate.
 const usernameDomain='accounts.busandrop.invalid';
 function usernameValue(value){const username=String(value).trim().toLowerCase();if(!/^[a-z0-9_]{4,20}$/.test(username))throw error('auth/invalid-username');return username;}
 function accountAddress(value){const identifier=String(value).trim();if(identifier.includes('@')){if(identifier.length>254||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier))throw error('auth/invalid-username');return identifier;}return usernameValue(identifier)+'@'+usernameDomain;}
 async function signInAccount(identifier,password){const email=accountAddress(identifier),c=await requireClient('email'),current=revision;const result=await c.auth.signInWithPassword({email,password});return passwordSession(result,current);}
 async function registerAccount(identifier,password){const username=usernameValue(identifier);if(typeof password!=='string'||password.length<8)throw error('auth/weak-password');const c=await requireClient('email'),current=revision;const result=await c.auth.signUp({email:username+'@'+usernameDomain,password,options:{data:{username}}});if(result.error)throw result.error;if(current!==revision)throw error('auth/cancelled');if(!result.data.session)throw error('auth/account-signup-unavailable');await passwordSession(result,current);return {signedIn:true};}
 async function sendCode(email){const c=await requireClient('email');const result=await c.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:true,emailRedirectTo:window.location.origin+'/busandrop/auth/callback'}});if(result.error)throw result.error;}
 async function verifyCode(email,token){const c=await requireClient('email'),result=await c.auth.verifyOtp({email:email.trim(),token:token.trim(),type:'email'});if(result.error)throw result.error;await verifySession(result.data.session);if(!user)throw error('auth/verification-failed');return user;}
 async function completeOAuthCode(code){if(typeof code!=='string'||!code)throw error('auth/missing-code');const c=await requireClient(),current=revision,result=await c.auth.exchangeCodeForSession(code);if(result.error)throw result.error;if(current!==revision)throw error('auth/cancelled');await verifySession(result.data.session);if(current!==revision||!user)throw error('auth/verification-failed');return user;}
 async function completeCallback(){const params=new URLSearchParams(window.location.search);try{if(params.has('error')||params.has('error_code'))throw error('auth/provider-returned-error');return await completeOAuthCode(params.get('code'));}finally{window.history.replaceState({screen:'signup'},'','/busandrop/login');}}

 async function deleteAccount(){
  const c=await requireClient(),current=revision,expectedId=user?.id;
  const verified=await c.auth.getUser();
  if(verified.error||!verified.data.user||!expectedId||verified.data.user.id!==expectedId||current!==revision)throw error('auth/verification-failed');
  const id=verified.data.user.id;
  let result;
  const hasApple=verified.data.user.identities?.some(x=>x.provider==='apple');
  if(hasApple){
   const session=await c.auth.getSession();if(session.error||!session.data.session?.access_token)throw error('auth/verification-failed');
   const value=session.data.session;
   const response=await fetch('/api/busandrop/apple-account-delete',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+value.access_token},body:JSON.stringify({confirmation:'DELETE_MY_ACCOUNT',providerRefreshToken:value.provider_refresh_token||'',...(revocationProof?.id===id?{revocationProof:revocationProof.value}:{})})});
   const data=await response.json();if(data.revocationProof)revocationProof={id,value:data.revocationProof};
   if(!response.ok)throw error(data.error||'auth/deletion-failed');result={data};
  }else result=await c.rpc('busan_delete_my_account',{p_confirmation:'DELETE_MY_ACCOUNT'});
  if(result.error)throw result.error;
  if(result.data?.deleted!==true)throw error('auth/deletion-failed');
  // Delete succeeded: local cleanup must not depend on a now-deleted server session.
  ++revision;revocationProof=null;user=null;state.joined=false;
  window.dispatchEvent(new CustomEvent('busan-account-deleted',{detail:{id}}));
  try{await c.auth.signOut({scope:'local'});}catch{}
  try{for(const key of ['busandrop-auth-v1','busandrop-auth-v1-code-verifier','busan-account-v1:'+id,'busan-shopping-pass:'+id])localStorage.removeItem(key);}catch{}
  publish(null);
  return true;
 }
 async function signOut(){const c=await requireClient(),result=await c.auth.signOut({scope:'local'});if(result.error)throw result.error;++revision;publish(null);}
 window.BUSAN_AUTH={ready,startOAuth,signInAccount,registerAccount,sendCode,verifyCode,completeCallback,completeOAuthCode,signOut,deleteAccount,getClient:()=>client,getUser:()=>user,getProviders:()=>config?.providers||{},isConfigured:()=>!!client};
 // A stored prototype flag is not evidence of a real authenticated session.
 state.joined=false;
 ready();
})();
