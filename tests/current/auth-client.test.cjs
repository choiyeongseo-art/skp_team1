const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {publicConfig,createAuthConfigHandler}=require('../../lib/auth-config.cjs');
const source=fs.readFileSync(__dirname+'/../../busan-drop/integration/auth-client.js','utf8');
const config={configured:true,url:'https://dedicated.supabase.co',publishableKey:'sb_publishable_test',providers:{google:true,apple:true,email:true}};
function setup({configuration=config,passwordError=null,signupSession={access_token:"registered"},session=null,rpcError=null,rpcData={deleted:true},user={id:'u1',email:'member@example.com'}}={}){let authListener;const calls=[],events=[],location={origin:'https://busandrop.example',pathname:'/busandrop/login',search:''};const auth={onAuthStateChange(fn){authListener=fn;},async getSession(){return {data:{session},error:null};},async getUser(){calls.push(['getUser']);return {data:{user},error:null};},async signInWithOAuth(args){calls.push(['oauth',args]);return {data:{url:'https://provider.example'},error:null};},async signInWithPassword(args){calls.push(['password',args]);return {data:{session:{access_token:'password-session'}},error:passwordError};},async signUp(args){calls.push(['register',args]);return {data:{user,session:signupSession},error:passwordError};},async signInWithOtp(args){calls.push(['otp',args]);return {error:null};},async verifyOtp(args){calls.push(['verify',args]);return {data:{session:{access_token:'verified'}},error:null};},async exchangeCodeForSession(code){calls.push(['exchange',code]);return {data:{session:{access_token:'verified'}},error:null};},async signOut(args){calls.push(['signOut',args]);return {error:null};}};const c={state:{joined:true},persist(){calls.push(['persist']);},fetch:async()=>({ok:true,json:async()=>configuration}),CustomEvent:class{constructor(type){this.type=type;}},setTimeout,URLSearchParams,window:{location,dispatchEvent:e=>events.push(e.type),history:{replaceState(state,title,url){calls.push(['replace',url]);location.pathname=url;}},supabase:{createClient(url,key,options){calls.push(['client',url,key,options]);return {auth,async rpc(name,args){calls.push(['rpc',name,args]);return {data:rpcData,error:rpcError};}};}}}};vm.runInNewContext(source,c);return {api:c.window.BUSAN_AUTH,c,calls,auth,location,events,notify:(event,session)=>authListener(event,session)};}
test('public configuration only exposes a dedicated public key; never promotes tourism/service-role credentials',()=>{assert.deepEqual(publicConfig({TOURISM_SUPABASE_URL:'https://tourism.supabase.co',TOURISM_SUPABASE_SERVICE_ROLE_KEY:'secret'}),{configured:false});for(const key of ['sb_secret_secret','service-role-key',`${Buffer.from('{}').toString('base64url')}.${Buffer.from('{"role":"service_role"}').toString('base64url')}.sig`])assert.deepEqual(publicConfig({BUSANDROP_AUTH_SUPABASE_URL:config.url,BUSANDROP_AUTH_SUPABASE_PUBLISHABLE_KEY:key}),{configured:false});assert.equal(publicConfig({BUSANDROP_AUTH_SUPABASE_URL:config.url,BUSANDROP_AUTH_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test',BUSANDROP_AUTH_APPLE_ENABLED:'false'}).providers.apple,false);});
test('config handler never serializes unrelated server secrets and disables caching',()=>{const headers={},env={BUSANDROP_AUTH_SUPABASE_URL:config.url,BUSANDROP_AUTH_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test',SERVICE_ROLE_KEY:'do-not-expose'};let body;createAuthConfigHandler({env})({}, {setHeader:(k,v)=>headers[k]=v,json:value=>body=value});assert.equal(headers['Cache-Control'],'no-store');assert.ok(!JSON.stringify(body).includes('do-not-expose'));});
test('Google and Apple use PKCE with dedicated storage and fixed same-origin callback',async()=>{const h=setup();await h.api.ready();assert.equal(h.c.state.joined,false);const client=h.calls.find(c=>c[0]==='client');assert.equal(client[3].auth.flowType,'pkce');assert.equal(client[3].auth.detectSessionInUrl,false);assert.equal(client[3].auth.storageKey,'busandrop-auth-v1');await h.api.startOAuth('google');await h.api.startOAuth('apple');const oauth=h.calls.filter(c=>c[0]==='oauth');assert.equal(oauth[0][1].options.redirectTo,'https://busandrop.example/busandrop/auth/callback');assert.equal(oauth[0][1].options.queryParams.prompt,'select_account');assert.equal(oauth[1][1].options.scopes,'email name');await assert.rejects(h.api.startOAuth('unknown'),/auth\/invalid-provider/);});
test('email only completes login after successful OTP verification and server user verification',async()=>{const h=setup();await h.api.ready();await h.api.sendCode(' member@example.com ');assert.equal(h.api.getUser(),null);assert.equal(h.calls.find(c=>c[0]==='otp')[1].email,'member@example.com');await h.api.verifyCode('member@example.com',' 123456 ');assert.equal(h.api.getUser().id,'u1');assert.equal(h.c.state.joined,true);assert.equal(h.calls.find(c=>c[0]==='verify')[1].type,'email');await h.api.signOut();assert.equal(h.api.getUser(),null);assert.equal(h.c.state.joined,false);assert.equal(h.calls.find(c=>c[0]==='signOut')[1].scope,'local');});
test('OAuth callback exchanges code, verifies user and removes code from browser history',async()=>{const h=setup();await h.api.ready();h.location.search='?code=one-time-code&next=https://malicious.example';await h.api.completeCallback();assert.equal(h.api.getUser().id,'u1');assert.equal(h.calls.find(c=>c[0]==='exchange')[1],'one-time-code');assert.equal(h.calls.filter(c=>c[0]==='replace').at(-1)[1],'/busandrop/login');});
test('configuration and provider errors do not fake successful authentication',async()=>{const h=setup({configuration:{configured:false}});assert.equal(await h.api.ready(),false);await assert.rejects(h.api.startOAuth('google'),/auth\/not-configured/);assert.equal(h.c.state.joined,false);const disabled=setup({configuration:{...config,providers:{google:false}}});await assert.rejects(disabled.api.startOAuth('google'),/auth\/provider-disabled/);assert.equal(disabled.calls.filter(c=>c[0]==='oauth').length,0);});
test('saved sessions require server getUser verification; expired sessions remain logged out',async()=>{const h=setup({session:{access_token:'saved'},user:null});await h.api.ready();assert.equal(h.c.state.joined,false);assert.equal(h.api.getUser(),null);assert.ok(h.calls.some(c=>c[0]==='getUser'));});
test('callback captures its code before asynchronous auth setup or routing can replace the URL',async()=>{
 const h=setup();h.location.search='?code=original-code';
 const completion=h.api.completeCallback();h.location.search='';
 assert.equal((await completion).id,'u1');
 assert.deepEqual(h.calls.filter(call=>call[0]==='exchange'),[['exchange','original-code']]);
});
test('native completion reuses the live client and verifies the server user without navigating or reinitializing',async()=>{
 const h=setup();await h.api.ready();await h.api.startOAuth('google');
 assert.equal((await h.api.completeOAuthCode('native-code')).id,'u1');
 assert.equal(h.calls.filter(call=>call[0]==='client').length,1);
 assert.equal(h.calls.filter(call=>call[0]==='exchange').length,1);
 assert.equal(h.c.state.joined,true);assert.equal(h.calls.filter(call=>call[0]==='replace').length,0);
 const invalid=setup({user:null});await invalid.api.ready();
 await assert.rejects(invalid.api.completeOAuthCode('unverified'),/auth\/verification-failed/);
 assert.equal(invalid.c.state.joined,false);
});
test('sign-out during native code exchange prevents a stale login from restoring the old account',async()=>{
 const h=setup();await h.api.ready();let finish;
 h.auth.exchangeCodeForSession=()=>new Promise(resolve=>{finish=resolve;});
 const completion=h.api.completeOAuthCode('pending-code');await new Promise(resolve=>setImmediate(resolve));
 h.notify('SIGNED_OUT',null);finish({data:{session:{access_token:'test'}},error:null});
 await assert.rejects(completion,/auth\/cancelled/);assert.equal(h.api.getUser(),null);assert.equal(h.c.state.joined,false);
});
test('expired OTP or failed session exchange never logs in, and callback errors are scrubbed',async()=>{const h=setup();await h.api.ready();h.auth.verifyOtp=async()=>({error:new Error('expired')});await assert.rejects(h.api.verifyCode('member@example.com','123456'),/expired/);assert.equal(h.api.getUser(),null);h.location.search='?error=access_denied&error_description=sensitive';await assert.rejects(h.api.completeCallback(),/auth\/provider-returned-error/);assert.equal(h.calls.filter(c=>c[0]==='exchange').length,0);assert.equal(h.calls.filter(c=>c[0]==='replace').at(-1)[1],'/busandrop/login');});


test('password login passes credentials to Supabase and verifies the user before publishing login',async()=>{
 const h=setup();await h.api.ready();await h.api.signInAccount(' member@example.com ',' secret password ');
 assert.equal(h.api.getUser().id,'u1');const args=h.calls.find(c=>c[0]==='password')[1];assert.equal(args.email,'member@example.com');assert.equal(args.password,' secret password ');assert.ok(h.calls.some(c=>c[0]==='getUser'));
 const denied=setup({passwordError:{code:'invalid_credentials'}});await denied.api.ready();await assert.rejects(denied.api.signInAccount('x@example.com','wrong'));assert.equal(denied.api.getUser(),null);
 const invalid=setup({user:null});await invalid.api.ready();await assert.rejects(invalid.api.signInAccount('x@example.com','password'),/auth\/verification-failed/);assert.equal(invalid.c.state.joined,false);
});

test('username registration creates a canonical identity and never treats missing sessions as login',async()=>{
 const active=setup();await active.api.ready();const result=await active.api.registerAccount(' New_User ','password123');assert.equal(result.signedIn,true);assert.equal(active.api.getUser().id,'u1');const args=active.calls.find(c=>c[0]==='register')[1];assert.equal(args.email,'new_user@accounts.busandrop.invalid');assert.equal(args.password,'password123');assert.equal(args.options.data.username,'new_user');assert.equal(args.options.emailRedirectTo,undefined);
 const pending=setup({signupSession:null});await pending.api.ready();await assert.rejects(pending.api.registerAccount('new_user','password123'),/auth\/account-signup-unavailable/);assert.equal(pending.api.getUser(),null);assert.equal(pending.c.state.joined,false);
});

test('sign-out during password login prevents a late response from publishing a signed-in account',async()=>{
 const h=setup();await h.api.ready();let release;h.auth.signInWithPassword=()=>new Promise(r=>release=r);const login=h.api.signInAccount('member@example.com','password123');await new Promise(r=>setImmediate(r));await h.api.signOut();release({data:{session:{access_token:'late'}},error:null});await assert.rejects(login,/auth\/cancelled/);assert.equal(h.api.getUser(),null);
});


test('username login is case-insensitive and uses the same canonical identity as registration',async()=>{
 const h=setup();await h.api.ready();await h.api.registerAccount(' Member_01 ','password123');await h.api.signOut();await h.api.signInAccount('MEMBER_01','password123');const signup=h.calls.find(c=>c[0]==='register')[1],login=h.calls.find(c=>c[0]==='password')[1];assert.equal(signup.email,'member_01@accounts.busandrop.invalid');assert.equal(login.email,signup.email);assert.equal(h.api.getUser().id,'u1');
});
test('invalid or email-shaped registration IDs are rejected before contacting the identity provider',async()=>{
 const h=setup();await h.api.ready();for(const id of ['abc','a'.repeat(21),'user name','user+name','가나다라','new@example.com','user<script>'])await assert.rejects(h.api.registerAccount(id,'password123'),/auth\/invalid-username/);await assert.rejects(h.api.registerAccount('valid_id','short'),/auth\/weak-password/);assert.equal(h.calls.filter(c=>c[0]==='register').length,0);await assert.rejects(h.api.signInAccount('bad name','password123'),/auth\/invalid-username/);assert.equal(h.calls.filter(c=>c[0]==='password').length,0);
});
test('duplicate username registration never changes or signs in to the existing account',async()=>{
 const h=setup({passwordError:{code:'user_already_exists'}});await h.api.ready();await assert.rejects(h.api.registerAccount('existing','password123'));assert.equal(h.api.getUser(),null);assert.equal(h.c.state.joined,false);
});


test('account deletion verifies the server identity and never sends a caller-chosen user ID',async()=>{
 const h=setup({session:{access_token:'signed'}});await h.api.ready();await h.api.deleteAccount();
 const rpc=h.calls.find(c=>c[0]==='rpc');assert.equal(rpc[1],'busan_delete_my_account');assert.deepEqual(JSON.parse(JSON.stringify(rpc[2])),{p_confirmation:'DELETE_MY_ACCOUNT'});assert.equal(h.api.getUser(),null);assert.equal(h.c.state.joined,false);assert.ok(h.events.includes('busan-account-deleted'));
});
test('deletion failure preserves the signed-in account and data',async()=>{
 const h=setup({session:{access_token:'signed'},rpcError:new Error('database unavailable')});await h.api.ready();await assert.rejects(h.api.deleteAccount());assert.equal(h.api.getUser().id,'u1');assert.ok(!h.events.includes('busan-account-deleted'));assert.ok(!h.calls.some(c=>c[0]==='signOut'));
});
test('deletion rejects an unverified identity before contacting the delete function',async()=>{
 const h=setup({user:null});await h.api.ready();await assert.rejects(h.api.deleteAccount(),/verification-failed/);assert.ok(!h.calls.some(c=>c[0]==='rpc'));
});
test('unexpected delete response never clears account data',async()=>{
 const h=setup({session:{access_token:'signed'},rpcData:{deleted:false}});await h.api.ready();await assert.rejects(h.api.deleteAccount(),/deletion-failed/);assert.equal(h.api.getUser().id,'u1');assert.ok(!h.events.includes('busan-account-deleted'));
});

test('Apple deletion uses the protected server route with its provider token, never the direct SQL RPC',async()=>{
 const h=setup({session:{access_token:'signed',provider_refresh_token:'apple-refresh'},user:{id:'u1',identities:[{provider:'apple'}]}});await h.api.ready();let sent;
 h.c.fetch=async(url,options)=>{sent={url,options};return {ok:true,json:async()=>({deleted:true,appleRevoked:true})};};
 await h.api.deleteAccount();assert.equal(sent.url,'/api/busandrop/apple-account-delete');const body=JSON.parse(sent.options.body);assert.equal(body.providerRefreshToken,'apple-refresh');assert.equal(body.user_id,undefined);assert.equal(sent.options.headers.Authorization,'Bearer signed');assert.ok(!h.calls.some(x=>x[0]==='rpc'));assert.equal(h.api.getUser(),null);
});
test('Apple reauthentication failure keeps account, while revocation proof is retained for a safe database retry',async()=>{
 const h=setup({session:{access_token:'signed'},user:{id:'u1',identities:[{provider:'apple'}]}});await h.api.ready();let count=0;
 h.c.fetch=async(url,options)=>{count++;if(count===1)return {ok:false,json:async()=>({error:'auth/deletion-retry',revocationProof:'signed-owner-proof'})};const body=JSON.parse(options.body);assert.equal(body.revocationProof,'signed-owner-proof');return {ok:true,json:async()=>({deleted:true})};};
 await assert.rejects(h.api.deleteAccount(),/deletion-retry/);assert.equal(h.api.getUser().id,'u1');assert.ok(!h.events.includes('busan-account-deleted'));await h.api.deleteAccount();assert.equal(h.api.getUser(),null);
});
