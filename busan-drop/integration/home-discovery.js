/* Home: pop-ups use a 2×2 grid; other categories use a single swipeable row. */
(() => {
  if(typeof specs!=='undefined')specs.home=['부산 행사 둘러보기','팝업은 2×2 그리드, 나머지는 가로 한 줄 슬라이드로 보여줍니다.',['팝업|2×2 카드|최대 4개 행사','다른 카테고리|가로 슬라이드|3개 이상이면 세 번째 카드의 약 1/3 노출']];
  const copy = () => ({
    ko:['부산에서 즐기는 전시·축제','이번 주 놓치기 아쉬운 팝업','전체 보기','로컬 콘텐츠 준비 공간','등록된 팝업 행사가 없습니다.'],
    en:['Local','Pop-ups','View all','Space reserved for local stories','No pop-up events available.'],
    ja:['ローカル','ポップアップ','すべて見る','ローカル情報の掲載予定スペース','掲載中のポップアップはありません。'],
    zh:['本地','快闪活动','查看全部','本地内容预留空间','暂无快闪活动。']
  })[state.language] || ['부산에서 즐기는 전시·축제','이번 주 놓치기 아쉬운 팝업','전체 보기','로컬 콘텐츠 준비 공간','등록된 팝업 행사가 없습니다.'];
  function categoryEvents(category,limit=5) {
    const today=window.BUSAN_EVENT_WINDOW.koreaToday();const weekStart=new Date(today+'T00:00:00Z');weekStart.setUTCDate(weekStart.getUTCDate()-((weekStart.getUTCDay()+6)%7));const weekEnd=new Date(weekStart);weekEnd.setUTCDate(weekEnd.getUTCDate()+6);const endOfWeek=weekEnd.toISOString().slice(0,10);
    return window.BUSAN_EVENT_CATALOG.filter(campaign=>
      campaign.isActive!==false && (campaign.scheduleStatus==='confirmed' && campaign.start && campaign.start<=endOfWeek && campaign.end>=today || category==='패션' && campaign.scheduleStatus!=='confirmed' && !campaign.end) &&
      (category!=='로컬'||campaign.scheduleKind!=='booking') &&
      (window.BUSAN_STORE_BRAND_CATEGORIES[campaign.brand]||[]).includes(category) &&
      window.BUSAN_STORE_LOCATIONS.some(location=>location.brand===campaign.brand)
    ).sort((a,b)=>(a.end||'9999').localeCompare(b.end||'9999')||(a.start||'9999').localeCompare(b.start||'9999')).slice(0,limit);
  }
  home=()=>{
    refreshCampaigns();
    const t=copy(),selected=state.homeCategory==='숙박'?'전체':state.homeCategory||'전체',categories=['로컬','팝업','패션','뷰티','푸드','디저트'];
    const titleFor=category=>category==='로컬'?t[0]:category==='팝업'?t[1]:category==='패션'?'부산에서 만나는 패션 브랜드':category==='뷰티'?'뷰티 브랜드 혜택 모아보기':category==='푸드'?'부산에서 즐기는 맛있는 한 끼':'달콤하게 즐기는 부산 디저트';
    const cardTitle=campaign=>campaign.brand==='몬치치'?'KARYLAND in BUSAN':campaign.title;
    const cardInfo=campaign=>`<small class="home-card-brand">${esc(campaign.brand)}</small><span class="home-card-title">${esc(cardTitle(campaign))}</span>`;
    const cardDate=campaign=>campaign.start&&campaign.end?`${esc(campaign.start.slice(5).replace('-','.'))} – ${esc(campaign.end.slice(5).replace('-','.'))}`:'일정 확인 중';
    const sections=categories.filter(category=>selected==='전체'||selected===category).map((category,index)=>{
      const isPopup=category==='팝업',events=categoryEvents(category,isPopup?4:Infinity),title=titleFor(category),id='homeCategorySection'+index;
      const layoutClass=isPopup?'':' home-event-grid--rail'+(events.length>=3?' home-event-grid--peek':'');
      return `<section class="home-event-section" data-home-section="${category}" aria-labelledby="${id}"><div class="home-popup-heading"><h3 id="${id}">${title}</h3></div><div class="home-event-grid${layoutClass}">${events.map(campaign=>`<button class="home-event-card" data-home-popup="${esc(campaign.id)}"><span class="home-card-artwork"><img src="assets/banners/home-20261105/${esc(campaign.image)}" alt="" width="500" height="500" loading="lazy"><small class="home-card-date-ribbon">${cardDate(campaign)}</small></span>${cardInfo(campaign)}</button>`).join('')||'<p class="home-category-empty">지금 확인된 행사가 없어요. 새로운 소식을 준비하고 있어요.</p>'}</div></section>`;
    }).join('');
    return `<div class="home-feature-band">${head()}${campaignBanner()}${window.BUSAN_HOME_CATEGORY_HTML?.()||''}</div><div class="home-discovery" aria-live="polite">${sections}</div>`;
  };
  document.addEventListener('click',event=>{
    const card=event.target.closest('[data-home-popup]');
    if(card){
      const campaign=window.BUSAN_EVENT_CATALOG.find(item=>item.id===card.dataset.homePopup);
      const location=window.BUSAN_STORE_LOCATIONS.find(item=>item.brand===campaign?.brand);
      if(location)window.BUSAN_OPEN_EVENT_DETAIL(location);
    }
  });
  render();
})();
