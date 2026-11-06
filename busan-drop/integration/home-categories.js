/* Eight home categories replace the old brand shortcuts. */
(() => {
  const categories=['전체','패션','뷰티','굿즈','팝업','디저트','숙박','로컬'];
  const labels={ko:categories,en:['All','Fashion','Beauty','Goods','Pop-up','Dessert','Stays','Local'],ja:['すべて','ファッション','ビューティー','グッズ','ポップアップ','スイーツ','宿泊','ローカル'],zh:['全部','时尚','美妆','周边','快闪','甜点','住宿','本地']};
  const drawings=[
    '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
    '<path d="m8 4-5 4 3 5 3-2v10h6V11l3 2 3-5-5-4c-1 3-7 3-8 0Z"/>',
    '<path d="M4 12h6v9H4zM5 12V7l4-3v8M15 10h5v11h-5zM16 10V6h3v4"/>',
    '<path d="M3 9h18v4H3zM5 13v8h14v-8M12 9v12"/><path d="M12 9C3 9 5 1 9 4l3 5Zm0 0c9 0 7-8 3-5l-3 5Z"/>',
    '<path d="M4 10v11h16V10M3 10l2-6h14l2 6M3 10q3 5 6 0 3 5 6 0 3 5 6 0M9 21v-6h6v6"/>',
    '<path d="M5 12h14l-2 9H7l-2-9Z"/><path d="M6 12a4 4 0 0 1 2-7 4 4 0 0 1 8 0 4 4 0 0 1 2 7M10 15v3m4-3v3"/>',
    '<path d="M3 19V8m0 7h18v4M3 11h5v4M8 9h10a3 3 0 0 1 3 3v3"/>',
    '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
  ];
  window.BUSAN_HOME_CATEGORY_HTML=()=>{
    const language=labels[state.language]?state.language:'ko',selection=categories.includes(state.filter)?state.filter:'전체';
    return `<div class="home-category-grid" role="group" aria-label="카테고리 선택">${categories.map((name,index)=>`<button type="button" class="home-category-button ${selection===name?'active':''}" data-home-category="${name}" aria-pressed="${selection===name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[index]}</svg><span>${labels[language][index]}</span></button>`).join('')}</div>`;
  };
  const originalHome=home;
  home=()=>{
    // The regional event section renders the shared category grid below its area tabs.
    const html=originalHome();
    return html.slice(0,html.indexOf('<div class="pad">'));
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-home-category]');
    if(!button||!categories.includes(button.dataset.homeCategory))return;
    const viewport=document.querySelector('#viewport'),scroll=viewport.scrollTop;
    state.filter=button.dataset.homeCategory;render();viewport.scrollTop=scroll;
  });
})();
