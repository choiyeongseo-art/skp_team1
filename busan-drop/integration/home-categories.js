/* Shared flat vector icons; stable category IDs preserve existing data. */
(() => {
 const categories=['전체','로컬','팝업','패션','뷰티','숙박','푸드','디저트'];
 const keys=['all','busan','popup','fashion','beauty','stay','food','dessert'];
 const labels={ko:['전체','부산 이벤트','팝업','패션','뷰티','숙박','푸드','디저트'],en:['All','Busan events','Pop-ups','Fashion','Beauty','Stays','Food','Dessert'],ja:['すべて','釜山イベント','ポップアップ','ファッション','ビューティー','宿泊','グルメ','スイーツ'],zh:['全部','釜山活动','快闪','时尚','美妆','住宿','美食','甜点'],'zh-TW':['全部','釜山活動','快閃','時尚','美妝','住宿','美食','甜點']};
 window.BUSAN_CATEGORY_LABEL=name=>(labels[state.language]||labels.ko)[categories.indexOf(name)]||name;
 window.BUSAN_CATEGORY_ICON=name=>name==='전체'?`<span class="category-glass-icon category-bd-motion" aria-hidden="true"><span class="category-bd-motion-face"><img src="assets/categories/busandrop-all-mark.png" alt="" width="1254" height="1254" decoding="async" draggable="false"></span></span>`:`<img class="category-glass-icon" src="assets/categories/flat-black-yellow-${keys[categories.indexOf(name)]||'all'}.svg?v=20261113-soft48" alt="" width="64" height="64" loading="lazy" decoding="async">`;
 window.BUSAN_HOME_CATEGORY_HTML=()=>`<nav class="home-category-grid" aria-label="카테고리 선택">${categories.map(name=>`<button type="button" class="home-category-button ${(state.homeCategory||'전체')===name?'active':''}" data-home-category="${name}" aria-pressed="${(state.homeCategory||'전체')===name}">${window.BUSAN_CATEGORY_ICON(name)}<span>${window.BUSAN_CATEGORY_LABEL(name)}</span></button>`).join('')}</nav>`;
 const originalHome=home;home=()=>{const html=originalHome(),cut=html.indexOf('<div class="pad">');return cut<0?html:html.slice(0,cut);};
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-home-category]');if(!button||!categories.includes(button.dataset.homeCategory))return;
  const viewport=document.querySelector('#viewport'),scroll=viewport.scrollTop;state.homeCategory=button.dataset.homeCategory;render();viewport.scrollTop=scroll;document.querySelector('.home-discovery')?.scrollIntoView?.({block:'start',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 });
})();
