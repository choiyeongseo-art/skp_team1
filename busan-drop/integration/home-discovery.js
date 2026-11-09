/* Home: reserved local carousel, followed by four confirmed pop-up events. */
(() => {
  if(typeof specs!=='undefined')specs.home=['로컬과 팝업을 만나는 홈','행사 배너 아래에 로컬 카드 공간과 팝업 행사 4개를 배치했습니다.',['로컬|가로 스크롤|카드 2개와 다음 카드 ¼ 노출 · 콘텐츠 등록 전 공간 확보','팝업|2열 × 2행|이미지와 행사명 · 종료일이 가까운 확정 행사 4개','전체 보기|팝업 카테고리 이동|매장찾기의 팝업 목록으로 연결']];
  const copy = () => ({
    ko:['로컬','팝업','전체 보기','로컬 콘텐츠 준비 공간','등록된 팝업 행사가 없습니다.'],
    en:['Local','Pop-ups','View all','Space reserved for local stories','No pop-up events available.'],
    ja:['ローカル','ポップアップ','すべて見る','ローカル情報の掲載予定スペース','掲載中のポップアップはありません。'],
    zh:['本地','快闪活动','查看全部','本地内容预留空间','暂无快闪活动。']
  })[state.language] || ['로컬','팝업','전체 보기','로컬 콘텐츠 준비 공간','등록된 팝업 행사가 없습니다.'];
  function categoryEvents(category,limit=4) {
    const today=window.BUSAN_EVENT_WINDOW.koreaToday();
    return window.BUSAN_EVENT_CATALOG.filter(campaign=>
      campaign.isActive!==false && (campaign.scheduleStatus==='confirmed' && campaign.start && campaign.end>=today || category==='패션' && campaign.scheduleStatus!=='confirmed' && !campaign.end) &&
      (category!=='로컬'||campaign.scheduleKind!=='booking') &&
      (window.BUSAN_STORE_BRAND_CATEGORIES[campaign.brand]||[]).includes(category) &&
      window.BUSAN_STORE_LOCATIONS.some(location=>location.brand===campaign.brand)
    ).sort((a,b)=>(a.end||'9999').localeCompare(b.end||'9999')||(a.start||'9999').localeCompare(b.start||'9999')).slice(0,limit);
  }
  home=()=>{
    refreshCampaigns();
    const t=copy(),events=categoryEvents('팝업');
    const categoryNames=({ko:['뷰티','패션'],en:['Beauty','Fashion'],ja:['ビューティー','ファッション'],zh:['美妆','时尚']})[state.language]||['뷰티','패션'];
    return head()+campaignBanner()+`<div class="home-discovery">
      <section class="home-local-section" aria-labelledby="homeLocalTitle">
        <h3 id="homeLocalTitle">${t[0]}</h3>
        <div class="home-local-rail" tabindex="0" role="region" aria-label="${t[0]}">
          ${categoryEvents('로컬',3).map(campaign=>`<button class="home-rail-event" data-home-popup="${esc(campaign.id)}"><img src="assets/banners/home-20261105/${esc(campaign.image)}" alt="" width="500" height="500" loading="lazy"><span>${esc(campaign.title)}</span></button>`).join('')}
        </div>
      </section>
      <section class="home-popup-section" aria-labelledby="homePopupTitle">
        <div class="home-popup-heading"><h3 id="homePopupTitle">${t[1]}</h3><button data-home-popup-all>${t[2]} ↗</button></div>
        <div class="home-popup-grid">${events.map(campaign=>`<button class="home-popup-card" data-home-popup="${esc(campaign.id)}"><img src="assets/banners/home-20261105/${esc(campaign.image)}" alt="" width="500" height="500" loading="lazy"><span>${esc(campaign.title)}</span></button>`).join('')||`<p class="home-popup-empty">${t[4]}</p>`}</div>
      </section>
      ${['뷰티','패션'].map((category,index)=>`<section class="home-local-section home-category-rail-section" aria-labelledby="homeRailTitle${index}">
        <div class="home-popup-heading"><h3 id="homeRailTitle${index}">${categoryNames[index]}</h3><button data-home-category-all="${category}">${t[2]} ↗</button></div>
        <div class="home-local-rail" tabindex="0" role="region" aria-label="${categoryNames[index]}">
          ${categoryEvents(category,3).map(campaign=>`<button class="home-rail-event" data-home-popup="${esc(campaign.id)}"><img src="assets/banners/home-20261105/${esc(campaign.image)}" alt="" width="500" height="500" loading="lazy"><span>${esc(campaign.title)}</span>${campaign.scheduleStatus!=='confirmed'?`<small class="home-rail-status">${({ko:'일정 확인 중',en:'Dates to be confirmed',ja:'日程確認中',zh:'日期待确认'})[state.language]||'일정 확인 중'}</small>`:''}</button>`).join('')}
        </div>
      </section>`).join('')}
    </div>`;
  };
  document.addEventListener('click',event=>{
    const card=event.target.closest('[data-home-popup]');
    if(card){
      const campaign=window.BUSAN_EVENT_CATALOG.find(item=>item.id===card.dataset.homePopup);
      const location=window.BUSAN_STORE_LOCATIONS.find(item=>item.brand===campaign?.brand);
      if(location)window.BUSAN_OPEN_EVENT_DETAIL(location);
    }
    const categoryLink=event.target.closest('[data-home-category-all]');
    if(event.target.closest('[data-home-popup-all]')||categoryLink){
      state.storeCategory=categoryLink?.dataset.homeCategoryAll||'팝업';state.storeRegion=null;state.mapLocal=true;state.realStoreId=null;state.screen='stores';render();document.querySelector('#viewport').scrollTop=0;
    }
  });
  render();
})();
