/* Anonymous visitor saves persist on the server; totals are shared across browsers. */
(() => {
 const catalog=window.BUSAN_EVENT_CATALOG,api='/api/busandrop/event-saves';
 let snapshot={saved:[],counts:{}},loaded=false,failed=false;
 const busy=new Set(),heart='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>',share='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m-4 4 4-4 4 4M5 11v9h14v-9"/></svg>';
 const byBrand=brand=>catalog.find(e=>e.brand===brand),isSaved=id=>snapshot.saved.some(e=>e.eventId===id);
 const storeFor=(event,storeId)=>{const rows=(window.BUSAN_STORE_LOCATIONS||[]).filter(s=>s.brand===event.brand);return rows.find(s=>s.id===storeId)||rows[0];};
 const countText=id=>loaded?new Intl.NumberFormat().format(snapshot.counts[id]||0):'—';
 const saveButton=(event,storeId)=>`<button class="event-save-button ${isSaved(event.id)?'is-saved':''}" data-event-social-save="${event.id}" data-event-store="${esc(storeId||'')}" aria-label="${isSaved(event.id)?'저장 취소':'행사 저장'}" aria-pressed="${isSaved(event.id)}" ${!loaded||busy.has(event.id)?'disabled':''}>${heart}</button>`;
 window.BUSAN_EVENT_SOCIAL={
  saveControl:(brand,storeId)=>{const event=byBrand(brand);return event?saveButton(event,storeId):'';},
  getState:()=>({saved:snapshot.saved.map(entry=>({...entry})),loaded,failed}),
  actions:item=>{const event=byBrand(item.brand);return event?`<div class="event-social-actions">${saveButton(event,item.id)}<button class="event-share-button" data-event-share="${event.id}" data-event-store="${esc(item.id||'')}" aria-label="행사 공유">${share}</button></div>`:'';},
  counter:brand=>{const event=byBrand(brand);return event?`<button type="button" class="event-banner-count event-save-button ${isSaved(event.id)?'is-saved':''}" data-event-social-save="${event.id}" data-event-count="${event.id}" aria-label="${isSaved(event.id)?'저장 취소':'행사 저장'}" aria-pressed="${isSaved(event.id)}" ${!loaded||busy.has(event.id)?'disabled':''}>${heart}<span>${countText(event.id)}</span></button>`:'';}
 };
 saved=()=>head()+`<div class="pad saved-events"><div class="saved-events-heading"><h2>저장한 행사 <span>${snapshot.saved.length}</span></h2><span>최근 저장순</span></div>${loaded&&snapshot.saved.length?'<button class="saved-to-pass" data-nav="pass">저장한 행사로 쇼핑패스 만들기 ↗</button>':''}${!loaded?`<p class="saved-events-empty">${failed?'저장한 행사를 불러오지 못했어요.':'저장한 행사를 불러오는 중이에요.'}</p>${failed?'<button class="event-social-retry" data-event-social-retry>다시 불러오기</button>':''}`:snapshot.saved.length?`<div class="saved-event-list">${snapshot.saved.map(entry=>{
  const event=catalog.find(e=>e.id===entry.eventId);if(!event)return '';
  return `<article class="saved-event-card"><button class="saved-event-open" data-saved-event-open="${event.id}" data-event-store="${esc(entry.storeId||'')}"><img src="assets/banners/home-20261105/${event.image}" alt="${esc(event.brand)} 행사 배너" width="1000" height="1000"><div class="saved-event-copy"><span>${esc(event.brand)}</span><h3>${esc(event.title)}</h3><span>행사 자세히 보기 ↗</span></div></button>${saveButton(event,entry.storeId)}</article>`;
 }).join('')}</div>`:'<div class="saved-events-empty"><p>아직 저장한 행사가 없어요.</p><span>행사 정보의 하트를 눌러 모아보세요.</span><button data-nav="home">행사 둘러보기 ↗</button></div>'}</div>`;
 specs.saved=['저장한 행사를 다시 만나기','최근 저장한 행사부터 배너로 표시합니다.',['저장 행사|행사별 한 번 저장|다른 지점에서도 동일 행사 저장 상태 공유','정렬|최근 저장순|저장 해제 후 다시 저장하면 맨 위로 이동','저장 수|서버 집계|브라우저별 익명 사용자 기준']];
 let lastPublished='';
 function publish(){const value=JSON.stringify({saved:snapshot.saved,loaded,failed});if(value!==lastPublished){lastPublished=value;window.dispatchEvent(new Event('busan-saves-updated'));}}
 function sync(){
  document.querySelectorAll('[data-event-social-save]').forEach(button=>{const id=button.dataset.eventSocialSave,on=isSaved(id);button.classList.toggle('is-saved',on);button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'저장 취소':'행사 저장');button.disabled=!loaded||busy.has(id);});
  document.querySelectorAll('[data-event-count]').forEach(node=>{node.querySelector('span').textContent=countText(node.dataset.eventCount);});
 }
 async function load(){
  try{const response=await fetch(api,{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error();snapshot=await response.json();loaded=true;failed=false;}
  catch{failed=true;}
  if(state.screen==='saved'&&!document.querySelector('.event-detail-dialog'))render();else sync();publish();
 }
 function feedback(message){const node=document.querySelector('.event-detail-feedback');if(node){node.textContent=message;setTimeout(()=>{if(node.isConnected)node.textContent='';},2300);}else toast(message);}
 async function toggle(button){
  const id=button.dataset.eventSocialSave;if(!loaded||busy.has(id))return;
  busy.add(id);sync();const saving=!isSaved(id);
  try{const response=await fetch(`${api}/${id}`,{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({saved:saving,storeId:button.dataset.eventStore||undefined})});if(!response.ok)throw Error();snapshot=await response.json();feedback(saving?'행사를 저장했어요':'저장을 취소했어요');}
  catch{feedback('저장하지 못했어요. 다시 시도해주세요.');}
  finally{busy.delete(id);if(state.screen==='saved'&&!document.querySelector('.event-detail-dialog'))render();else sync();publish();}
 }
 async function shareEvent(button){
  const event=catalog.find(e=>e.id===button.dataset.eventShare);if(!event)return;
  const url=new URL('/busandrop/home',location.origin);url.searchParams.set('event',event.id);if(button.dataset.eventStore)url.searchParams.set('store',button.dataset.eventStore);
  try{
   if(navigator.share){await navigator.share({title:event.title,text:event.title,url:url.href});return;}
   if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(url.href);
   else{const field=document.createElement('textarea');field.value=url.href;field.setAttribute('aria-label','공유 링크');field.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.append(field);field.select();const copied=document.execCommand('copy');field.remove();if(!copied)throw Error();}
   feedback('행사 링크를 복사했어요');
  }catch(error){if(error.name!=='AbortError')feedback('링크를 복사하지 못했어요. 다시 시도해주세요.');}
 }
 document.addEventListener('click',event=>{
  const save=event.target.closest('[data-event-social-save]');if(save){toggle(save);return;}
  const share=event.target.closest('[data-event-share]');if(share){shareEvent(share);return;}
  if(event.target.closest('[data-event-social-retry]')){load();return;}
  const open=event.target.closest('[data-saved-event-open]');if(open){const campaign=catalog.find(e=>e.id===open.dataset.savedEventOpen),item=campaign&&storeFor(campaign,open.dataset.eventStore);if(item)window.BUSAN_OPEN_EVENT_DETAIL(item);}
 });
 window.addEventListener('busan-event-detail-closed',()=>{if(state.screen==='saved')render();});
 window.addEventListener('focus',load);
 // Refresh aggregate counts while another visitor saves, without rebuilding maps or sheets.
 setInterval(()=>{if(!document.hidden)load();},30000);
 const query=new URLSearchParams(location.search),shared=catalog.find(e=>e.id===query.get('event'));
 render();load();
 if(shared){const item=storeFor(shared,query.get('store'));if(item)window.BUSAN_OPEN_EVENT_DETAIL(item);}
})();
