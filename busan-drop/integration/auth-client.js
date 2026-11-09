/* Dedicated BUSAN DROP Supabase Auth. Tourism service-role credentials are never used here. */
(()=>{
 let client=null,config=null,user=null,initializing=null,revision=0;
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
 async function sendCode(email){const c=await requireClient('email');const result=await c.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:true,emailRedirectTo:window.location.origin+'/busandrop/auth/callback'}});if(result.error)throw result.error;}
 async function verifyCode(email,token){const c=await requireClient('email'),result=await c.auth.verifyOtp({email:email.trim(),token:token.trim(),type:'email'});if(result.error)throw result.error;await verifySession(result.data.session);if(!user)throw error('auth/verification-failed');return user;}
 async function completeCallback(){try{const c=await requireClient(),params=new URLSearchParams(window.location.search);if(params.has('error')||params.has('error_code'))throw error('auth/provider-returned-error');const code=params.get('code');if(!code)throw error('auth/missing-code');const result=await c.auth.exchangeCodeForSession(code);if(result.error)throw result.error;await verifySession(result.data.session);if(!user)throw error('auth/verification-failed');return user;}finally{window.history.replaceState({screen:'signup'},'','/busandrop/login');}}

 async function signOut(){const c=await requireClient(),result=await c.auth.signOut({scope:'local'});if(result.error)throw result.error;++revision;publish(null);}
 window.BUSAN_AUTH={ready,startOAuth,sendCode,verifyCode,completeCallback,signOut,getClient:()=>client,getUser:()=>user,getProviders:()=>config?.providers||{},isConfigured:()=>!!client};
 // A stored prototype flag is not evidence of a real authenticated session.
 state.joined=false;
 ready();
})();
