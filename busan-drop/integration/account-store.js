/* Verified Supabase identities own all cloud rows. Guest storage stays separate. */
(()=>{
 const empty=()=>({plans:[],places:[]}),copy=x=>JSON.parse(JSON.stringify(x));
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}};
 const save=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
 let owner=null,epoch=0,hydrated=false,failed=false,running=false,currentReady=Promise.resolve(),guestLanguage=state.language||'ko';
 let library=empty(),events=[],pending=[],guestLibrary=window.BUSAN_MY_LIBRARY.get();
 const key=()=>`busan-account-v1:${owner}`;
 function cache(){if(owner)save(key(),{library,events,pending});}
 function announce(){window.dispatchEvent(new Event('busan-account-updated'));}
 function view(reset=false){window.BUSAN_MY_LIBRARY.replace(library,reset);window.BUSAN_EVENT_SOCIAL.refreshAccount();announce();}
 function queue(op){pending=pending.filter(item=>!(item.table===op.table&&item.id===op.id));pending.push({...op,token:Date.now()+':'+Math.random()});cache();announce();flush();}
 async function checked(query){const result=await query;if(result.error)throw result.error;return result.data;}
 async function flush(){
  if(!owner||!hydrated||running||!pending.length)return;
  const id=owner,version=epoch,client=window.BUSAN_AUTH.getClient();running=true;
  try{while(pending.length&&version===epoch){const op=pending[0];let query=client.from(op.table);
   if(op.remove)query=query.delete().eq('user_id',id).eq(op.column,op.id);
   else query=query.upsert({...op.row,user_id:id});
   await checked(query);if(version!==epoch)return;
   if(op.analytics){window.BUSAN_ANALYTICS?.track(op.analytics.name,op.analytics.data);}
   if(op.table==='busan_account_plans'&&!op.remove&&op.row.payload.analyticsDraftId)window.BUSAN_ANALYTICS?.track('plan_cloud_synced',{plan_id:op.id,draft_id:op.row.payload.analyticsDraftId,save_scope:'account'});
   pending=pending.filter(item=>item.token!==op.token);cache();
  }failed=false;}catch{if(version===epoch){failed=true;window.BUSAN_ANALYTICS?.track('operation_failed',{operation:'account_sync',error_code:'request_failed'});}}finally{running=false;if(version===epoch)announce();else flush();}
 }
 function updateLibrary(next){if(!owner){guestLibrary=copy(next);return false;}
  const before=library;library=copy(next);const old=new Map(before.plans.map(p=>[String(p.id),p])),now=new Map(library.plans.map(p=>[String(p.id),p]));
  for(const [id,plan] of now)if(JSON.stringify(old.get(id))!==JSON.stringify(plan))queue({table:'busan_account_plans',column:'plan_id',id,row:{plan_id:id,payload:plan,updated_at:new Date().toISOString()}});
  for(const [id] of old)if(!now.has(id))queue({table:'busan_account_plans',column:'plan_id',id,remove:true,analytics:{name:'plan_deleted',data:{plan_id:id,save_scope:'account'}}});
  cache();return true;
 }
 async function toggleEvent(id,storeId,saving){if(!owner||!hydrated)throw Error('account/loading');
  events=events.filter(e=>e.eventId!==id);const row={eventId:id,storeId:storeId||null,savedAt:new Date().toISOString()};if(saving)events.unshift(row);
  queue({table:'busan_account_events',column:'event_id',id,analytics:{name:saving?'event_like_added':'event_like_removed',data:{event_id:id,store_id:storeId,save_scope:'account'}},...(saving?{row:{event_id:id,store_id:row.storeId,saved_at:row.savedAt}}:{remove:true})});view();
 }
 function setLanguage(language){if(!owner){guestLanguage=language;return;}if(!['ko','en','ja','zh','zh-TW'].includes(language))return;queue({table:'busan_account_preferences',id:owner,row:{language,updated_at:new Date().toISOString()}});}
 function overlay(){for(const op of pending){if(op.table==='busan_account_plans'){library.plans=library.plans.filter(p=>String(p.id)!==op.id);if(!op.remove)library.plans.unshift(copy(op.row.payload));}if(op.table==='busan_account_events'){events=events.filter(e=>e.eventId!==op.id);if(!op.remove)events.unshift({eventId:op.id,storeId:op.row.store_id,savedAt:op.row.saved_at});}}}
 async function switchUser(){const id=window.BUSAN_AUTH.getUser()?.id||null;if(id===owner)return currentReady;
  const version=++epoch;owner=id;window.BUSAN_SHOPPING_PASS?.switchAccount(id);hydrated=false;failed=false;state.language=guestLanguage;state.pendingLanguage=guestLanguage;document.documentElement.lang=guestLanguage;persist();
  if(!owner){library=copy(guestLibrary);events=[];pending=[];view(true);return;}
  const local=read(key(),{});library=local.library||empty();events=local.events||[];pending=local.pending||[];view(true);
  currentReady=(async()=>{try{
   const client=window.BUSAN_AUTH.getClient();const [plans,saves,prefs]=await Promise.all([
    checked(client.from('busan_account_plans').select('plan_id,payload').eq('user_id',id)),
    checked(client.from('busan_account_events').select('event_id,store_id,saved_at').eq('user_id',id)),
    checked(client.from('busan_account_preferences').select('language').eq('user_id',id))]);
   if(version!==epoch)return;
   library={plans:plans.map(p=>p.payload),places:library.places||[]};events=saves.map(e=>({eventId:e.event_id,storeId:e.store_id,savedAt:e.saved_at})).sort((a,b)=>b.savedAt.localeCompare(a.savedAt));
   // Claim legacy local plans once per browser. Existing cloud IDs win.
   const claim=read('busan-account-guest-claim',null);if(!claim){
    const response=await fetch('/api/busandrop/event-saves',{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error('guest/import-unavailable');const guest=await response.json();if(version!==epoch)return;
    const old=copy(library),seen=new Set(old.plans.map(p=>String(p.id)));old.plans.push(...guestLibrary.plans.filter(p=>!seen.has(String(p.id))));updateLibrary(old);
    for(const e of guest.saved||[])if(!events.some(row=>row.eventId===e.eventId)){events.push(e);queue({table:'busan_account_events',column:'event_id',id:e.eventId,row:{event_id:e.eventId,store_id:e.storeId||null,saved_at:e.savedAt?new Date(e.savedAt).toISOString():new Date().toISOString()}});}
    cache();save('busan-account-guest-claim',id);
   }
   overlay();const languageOp=[...pending].reverse().find(op=>op.table==='busan_account_preferences'),language=languageOp?.row.language||prefs[0]?.language;
   if(language){state.language=language;state.pendingLanguage=language;state.languageReady=true;document.documentElement.lang=language;persist();}
   else setLanguage(state.language||'ko');
   hydrated=true;cache();view();await flush();
  }catch{if(version===epoch){failed=true;view();}}})();return currentReady;
 }
 window.BUSAN_ACCOUNT_STORE={getOwner:()=>owner,isLoading:()=>!!owner&&!hydrated,getEvents:()=>copy(events),updateLibrary,toggleEvent,ready:()=>currentReady,retry:()=>{if(!hydrated&&owner){owner=null;return switchUser();}return flush();},status:()=>({owner,loading:!!owner&&!hydrated,failed,pending:pending.length})};
 window.addEventListener('busan-account-deleted',e=>{
  if(e.detail?.id!==owner)return;
  ++epoch;pending=[];hydrated=false;library=empty();events=[];
 });
 window.addEventListener('busan-auth-updated',switchUser);
 window.addEventListener('busan-language-changed',()=>setLanguage(state.language));
 document.addEventListener('click',e=>{if(e.target.closest('[data-language-enter]'))setLanguage(state.language);});
 window.addEventListener('online',()=>window.BUSAN_ACCOUNT_STORE.retry());
 setInterval(()=>{if(owner&&pending.length)window.BUSAN_ACCOUNT_STORE.retry();},15000);
 // Persistent status is visible on My even when background writes fail.
 function statusView(){const node=document.querySelector('.my-library-heading');if(!node)return;document.querySelector('[data-account-sync]')?.remove();if(!owner)return;const p=document.createElement('p');p.dataset.accountSync='';p.setAttribute('role','status');p.style.cssText='font-size:12px;color:#667085;margin:8px 0';const lang=state.language||'ko',labels={ko:['계정 데이터를 불러오는 중','동기화 대기 · 연결되면 다시 시도합니다','계정에 저장 중','계정에 저장됨'],en:['Loading account data','Sync pending · retrying when connected','Saving to account','Saved to account'],ja:['アカウントを読み込み中','同期待ち・接続後に再試行','保存中','アカウントに保存済み'],zh:['正在加载账户数据','等待同步 · 连接后重试','正在保存到账户','已保存到账户'],'zh-TW':['正在載入帳戶資料','等待同步 · 連線後重試','正在儲存至帳戶','已儲存至帳戶']};p.textContent=(labels[lang]||labels.en)[failed?1:!hydrated?0:pending.length?2:3];node.after(p);}
 const priorRender=render;render=(...args)=>{priorRender(...args);statusView();};
 window.addEventListener('busan-account-updated',statusView);
 window.BUSAN_AUTH.ready().then(switchUser);
})();
