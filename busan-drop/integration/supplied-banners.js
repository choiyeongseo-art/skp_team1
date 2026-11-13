/* Keep product brand indices stable; register supplied brands and artwork separately. */
(() => {
  for(const brand of [
    {name:'몬치치',logo:'MONCHHICHI',cat:'팝업',sale:'몬치치',desc:'몬치치 브랜드와 팝업 소식',asset:'monchhichi-restored-20261112.png'},
    {name:'티파니앤코',logo:'TIFFANY & CO.',cat:'패션',sale:'티파니앤코',desc:'티파니앤코 주얼리 브랜드 소식',asset:'tiffany.jpg'},
    {name:'와키윌리',logo:'WACKY WILLY',cat:'패션',sale:'리센느 원이도 빠진 와키윌리 패션',desc:'와키윌리 × 리센느 원이 부산본점 팝업',asset:'wackywilly-user-20261106.png'},
    {name:'참치학교',logo:'TUNA SCHOOL',cat:'팝업',sale:'참치학교 광복점 팝업',desc:'광복점 B1에서 만나는 참치학교',asset:'tunaschool-photo-20261112.jpeg'},
    {"name": "원피스 무기와라 스토어", "logo": "MUGIWARA STORE", "cat": "굿즈", "sale": "무기와라 스토어 팝업", "desc": "서면에 모인 밀짚모자 굿즈. 원피스 캐릭터 상품과 한국 오리지널 굿즈를 부산본점에서 만나보세요.", "asset": "mugiwara-poster-20261112.webp"},
    {"name": "와이잭", "logo": "YJACK", "cat": "패션", "sale": "와이잭 동부산 팝업", "desc": "기장에서 만나는 와이잭 특가. 티셔츠·팬츠와 시그니처·캐시미어 라인을 동부산점 팝업에서 살펴보세요.", "asset": "yjack-user-20261106.png"},
    {"name": "젤라또 피케", "logo": "GELATO PIQUE", "cat": "패션", "sale": "젤라또 피케 룸웨어 · 부산본점", "desc": "서면에서 만나는 포근한 룸웨어. 젤라또 피케의 룸웨어와 잡화, 구매금액별 사은품을 만나보세요.", "asset": "gelatopique-user-20261106.png"},
    {"name": "리락쿠마·스미코구라시", "logo": "SAN-X", "cat": "굿즈", "sale": "리락쿠마·스미코구라시 굿즈 · 부산본점", "desc": "서면에서 만나는 산엑스 친구들. 리락쿠마·스미코구라시 캐릭터 상품과 코구마르쉐 특별상품을 만나보세요.", "asset": "sanx-user-20261112.png"},
    {"name": "메이플스토리", "logo": "MAPLESTORY", "cat": "팝업", "sale": "메이플스토리 체험·굿즈 · 롯데월드 부산", "desc": "기장에서 만나는 메이플 월드. 캐릭터 만들기·모바일 스탬프 랠리·공연·포토존과 굿즈를 즐기는 가을 시즌 축제예요.", "asset": "maplestory-poster-20261112.jpg"},
{
  "name": "시그니엘 부산",
  "logo": "시그니엘 부산",
  "cat": "숙박",
  "sale": "시그니엘 부산 · 해운대 숙박 패키지",
  "desc": "해운대 바다 곁에서 즐기는 디저트·프라이빗 다이닝·캔들 패키지와 브랜드 페스타를 살펴보세요.",
  "asset": "signiel-user-20261112.png"
},
{
  "name": "웨스틴 조선 부산",
  "logo": "웨스틴 조선 부산",
  "cat": "숙박",
  "sale": "해운대에서 누리는 쓱데이",
  "desc": "객실 단독·조식·스위트 특가와 별도 다이닝 오퍼를 선택해 해운대에서 쉬어가세요.",
  "asset": "westin-josun.svg"
},
{
  "name": "그랜드 조선 부산",
  "logo": "그랜드 조선 부산",
  "cat": "숙박",
  "sale": "그랜드 조선 부산 · 객실 패키지",
  "desc": "디럭스·키즈 객실과 조식·스위트 패키지, 별도 다이닝 오퍼로 나만의 휴식을 준비하세요.",
  "asset": "grand-josun.svg"
},
{
  "name": "해리포터 마호도코로",
  "logo": "HARRY POTTER",
  "cat": "굿즈",
  "sale": "해리포터 마호도코로 굿즈 · 서면",
  "desc": "해리포터 세계관을 담은 가방·파우치·양말 등 생활 잡화를 만나보세요. 부산점 구매 사은품과 온라인 기획전은 각각의 조건을 확인해주세요.",
  "asset": "harrypotter-user-20261112.png"
},
{
  "name": "히나쿠우",
  "logo": "HINAKUU",
  "cat": "굿즈",
  "sale": "히나쿠우 캐릭터 굿즈 · 부산 팝업",
  "desc": "히나쿠우 캐릭터 굿즈와 코지하우스 상품을 만나보세요. 구매금액별 포토카드와 SNS 후기 엽서 등 조건별 선물을 확인할 수 있어요.",
  "asset": "hinakuu-user-20261106.png"
},
{
  "name": "달달더마켓",
  "logo": "달달더마켓",
  "cat": "로컬",
  "sale": "달달더마켓 · 부산 디저트 16곳 한자리에",
  "desc": "부산 지역 디저트·간식 브랜드 16개사가 참여하는 기간 한정 판매전. 미리 만나는 크리스마스를 테마로 베이커리·천연 아이스크림·음료 등 다양한 간식을 소개해요.",
  "asset": "daldal-poster-20261112.jpg"
},
{
  "name": "광안리 M 드론×레이저쇼",
  "logo": "광안리 M 드론×레이저쇼",
  "cat": "로컬",
  "sale": "성의 수호자 with 레이저쇼",
  "desc": "11월 21일 광안리 밤하늘에서 만나는 드론과 레이저 결합 공연. 19시·21시 두 차례, 회당 약 24분 동안 진행돼요.",
  "asset": "gwangalli-poster-20261112.jpg"
},
{
  "name": "G-STAR",
  "logo": "G-STAR",
  "cat": "로컬",
  "sale": "신작 게임을 만나는 부산 벡스코",
  "desc": "11월 19~22일 벡스코에서 열리는 일반 관람 BTC 게임 전시. 관람 전날까지 온라인 예매가 필요하며 현장 판매는 없어요. 부스별 체험·굿즈·대기·연령 조건은 각각 확인해주세요.",
  "asset": "gstar-poster-20261112.jpg"
}
  ]){
    if(!brands.some(existing=>existing.name===brand.name))brands.push({...brand,verified:false,start:null,end:null,period:'공식 일정 확인 전',reported:'미등록',source:'',url:'',categories:[],supplied:true});
  }
  // Archive TOPTEN without reassigning product and store brand indices.
  for(const brand of brands)brand.active=brand.name!=='탑텐';
  if(brands[state.brand]?.active===false)state.brand=brands.findIndex(b=>b.active);
  const uniqlo=brands.find(brand=>brand.name==='유니클로');
  if(uniqlo){uniqlo.sale='연말 행사 안내';uniqlo.verified=false;uniqlo.start=null;uniqlo.end=null;}
  const zara=brands.find(brand=>brand.name==='자라');
  if(zara){zara.sale='블랙프라이데이 안내';zara.verified=false;zara.start=null;zara.end=null;}
  const allSlides=[
    {brand:1,file:'oliveyoung.jpg',tone:'olive'},
    {brand:2,file:'uniqlo.jpg',tone:'fashion'},
    {brand:3,file:'zara.jpg',tone:'fashion'},
    {brand:brands.findIndex(b=>b.name==='몬치치'),file:'monchhichi-restored-20261112.png',tone:'monchhichi'},
    {brand:brands.findIndex(b=>b.name==='티파니앤코'),file:'tiffany.jpg',tone:'tiffany'},
    {brand:brands.findIndex(b=>b.name==='와키윌리'),file:'wackywilly-user-20261106.png',tone:'fashion'},
    {brand:brands.findIndex(b=>b.name==='참치학교'),file:'tunaschool-photo-20261112.jpeg',tone:'fashion'},
    {brand:brands.findIndex(b=>b.name==="원피스 무기와라 스토어"),file:"mugiwara-poster-20261112.webp",tone:'fashion'},
    {brand:brands.findIndex(b=>b.name==="와이잭"),file:"yjack-user-20261106.png",tone:'fashion'},
    {brand:brands.findIndex(b=>b.name==="젤라또 피케"),file:"gelatopique-user-20261106.png",tone:'fashion'},
    {brand:brands.findIndex(b=>b.name==="리락쿠마·스미코구라시"),file:"sanx-user-20261112.png",tone:'fashion'},
    {brand:brands.findIndex(b=>b.name==="메이플스토리"),file:"maplestory-poster-20261112.jpg",tone:'fashion'},
{brand:brands.findIndex(b=>b.name==="시그니엘 부산"),file:'signiel-user-20261112.png',tone:'fashion'},
{brand:brands.findIndex(b=>b.name==="웨스틴 조선 부산"),file:'westin-josun.svg',tone:'fashion'},
{brand:brands.findIndex(b=>b.name==="그랜드 조선 부산"),file:'grand-josun.svg',tone:'fashion'},
{brand:brands.findIndex(b=>b.name==="해리포터 마호도코로"),file:'harrypotter-user-20261112.png',tone:'magic'},
{brand:brands.findIndex(b=>b.name==="히나쿠우"),file:'hinakuu-user-20261106.png',tone:'fashion'},
{brand:brands.findIndex(b=>b.name==="달달더마켓"),file:'daldal-poster-20261112.jpg',tone:'fashion'},
{brand:brands.findIndex(b=>b.name==="광안리 M 드론×레이저쇼"),file:'gwangalli-poster-20261112.jpg',tone:'fashion'},
{brand:brands.findIndex(b=>b.name==="G-STAR"),file:'gstar-poster-20261112.jpg',tone:'fashion'}
  ];
  const homeBannerCopy={
    '올리브영':'부산 여행 파우치, 여기서 채울까?',
    '유니클로':'매일 입을 옷이 제일 중요하니까',
    '자라':'여행 사진 속 내 룩, 조금 더 과감하게',
    '몬치치':'눈 마주치면 데려오게 될걸?',
    '티파니앤코':'민트빛 설렘을 나에게 선물할 시간',
    '참치학교':'먹는 참치 아니고, 데려가는 참치!',
    '리락쿠마·스미코구라시':'귀여운 애 옆에 또 귀여운 애',
    '메이플스토리':'오늘의 퀘스트는 부산에서!',
    '시그니엘 부산':'부산 여행에 하루쯤은 이런 호사',
    '웨스틴 조선 부산':'바다 앞에서 아무것도 안 할 자유',
    '그랜드 조선 부산':'체크인하는 순간, 여기가 내 여행지',
    '달달더마켓':'밥 배 따로, 부산 디저트 배 따로',
    '광안리 M 드론×레이저쇼':'광안리의 밤, 하늘이 무대가 된다',
    'G-STAR':'화면 너머 기다리던 게임, 직접 만나러',
    '와키윌리':'이번 가을, 원이처럼 입어볼까?',
    '히나쿠우':'히나쿠우가 부산에 놀러 왔다',
    '젤라또 피케':'잠옷 입고 약속 잡고 싶어지는',
    '와이잭':'기본템 쇼핑, 여기서 끝낼까?',
    '해리포터 마호도코로':'해덕들 주목! 마법 한 스푼을 일상에',
    '원피스 무기와라 스토어':'부산에 상륙한 밀짚모자 일당'
  };
  const directory='assets/banners/home-20261105/';
  let slides=[];
  const todayInKorea=()=>window.BUSAN_EVENT_WINDOW?.koreaToday()||new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const validDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
  const selectBannerSchedule=(campaign,today)=>{
    if(!campaign||campaign.scheduleStatus!=='confirmed'||campaign.isActive===false)return null;
    const schedules=campaign.scheduleKind==='booking'&&campaign.offers?.length?campaign.offers.map(offer=>({start:offer.bookingStart,end:offer.bookingEnd,name:offer.name})): [campaign];
    return schedules.filter(s=>validDay(s.start)&&validDay(s.end)&&s.start<=s.end&&s.end>=today).sort((a,b)=>a.end.localeCompare(b.end)||a.start.localeCompare(b.start))[0]||null;
  };
  refreshCampaigns=()=>{
    const today=todayInKorea(),currentBrand=slides[state.banner]?.brand;
    const next=allSlides.map(slide=>({...slide,schedule:selectBannerSchedule(window.BUSAN_EVENT_CATALOG?.find(event=>event.brand===brands[slide.brand]?.name),today)}))
      .filter(slide=>slide.schedule&&brands[slide.brand]?.active!==false&&window.BUSAN_EVENT_DETAILS?.[brands[slide.brand].name]?.isActive!==false)
      .sort((a,b)=>a.schedule.end.localeCompare(b.schedule.end)||a.schedule.start.localeCompare(b.schedule.start)||a.brand-b.brand).slice(0,10);
    const changed=JSON.stringify(slides)!==JSON.stringify(next);
    slides=next;banners.splice(0,banners.length,...slides.map(slide=>slide.brand));
    const retained=slides.findIndex(slide=>slide.brand===currentBrand);
    state.banner=retained>=0?retained:Math.max(0,Math.min(state.banner,slides.length-1));
    return changed;
  };
  const bannerActions=()=>window.BUSAN_EVENT_SOCIAL?.counter(brands[slides[state.banner].brand].name)||'';
  const bannerMeta=name=>{
    const campaign=slides.find(slide=>brands[slide.brand].name===name)?.schedule,details=window.BUSAN_EVENT_DETAILS?.[name];
    const rows=(window.BUSAN_STORE_LOCATIONS||[]).filter(item=>item.brand===name&&(item.eventParticipation||item.profile?.eventParticipation)!=='unconfirmed');
    const period=campaign?.start&&campaign?.end?`${campaign.start.replaceAll('-','.')} – ${campaign.end.replaceAll('-','.')}`:'행사 일정 안내 전';
    const place=name==='올리브영'?'부산 올리브영 전 매장':details?.bannerVenue||details?.venue||(rows.length===1?rows[0].name:'부산 · 매장별 위치 확인');
    return `<div class="supplied-banner-meta"><span class="supplied-banner-period">${details?.periodLabel?esc(details.periodLabel)+' · ':''}${esc(period)}</span><span class="supplied-banner-place">${esc(place)}</span></div>`;
  };
  campaignBanner=()=>{
    refreshCampaigns();
    if(!slides.length)return '';
    return `<div class="campaign-stage supplied-campaign"><div class="supplied-banner-viewport" id="hero" role="region" aria-label="브랜드 행사 배너" tabindex="0"><div class="supplied-banner-track" style="transform:translate3d(${-state.banner*100}%,0,0)">${slides.map((slide,index)=>{const brand=brands[slide.brand];return `<section class="supplied-slide tone-${slide.tone}${homeBannerCopy[brand.name]?' supplied-editorial':''}" data-supplied-slide="${index}" aria-hidden="${index!==state.banner}" ${index!==state.banner?'inert':''}><img src="${directory+slide.file}" alt="${esc(brand.name)} 행사 배너" width="1000" height="1000" decoding="async" draggable="false"><div class="supplied-banner-copy"><span>${esc(brand.name)}</span><h2>${esc(homeBannerCopy[brand.name]||(slide.schedule.name&&brand.name==='시그니엘 부산'?slide.schedule.name:brand.sale))}</h2>${bannerMeta(brand.name)}</div><button class="supplied-detail-link" data-banner-detail="${slide.brand}" aria-label="${esc(brand.name)} 행사 상세 보기"></button></section>`;}).join('')}</div><div class="supplied-banner-actions">${bannerActions()}</div></div><div class="campaign-pagination" aria-label="행사 배너 선택"><div class="dots">${slides.map((slide,index)=>`<button data-banner="${index}" class="${index===state.banner?'on':''}" aria-label="${esc(brands[slide.brand].name)} 행사 배너" aria-pressed="${index===state.banner}"></button>`).join('')}</div></div></div>`;
  };
  switchCampaign=next=>{
    restartBannerRotation();
    if(refreshCampaigns()){if(state.screen==='home')render();return;}
    if(document.querySelector('.header-language[open]')||!Number.isInteger(next)||next<0||next>=slides.length)return;
    state.banner=next;
    const actions=document.querySelector('.supplied-banner-actions');if(actions)actions.innerHTML=bannerActions();
    const track=document.querySelector('.supplied-banner-track');
    if(track)track.style.transform=`translate3d(${-100*next}%,0,0)`;
    document.querySelectorAll('[data-supplied-slide]').forEach(slide=>{
      const inactive=Number(slide.dataset.suppliedSlide)!==next;
      slide.setAttribute('aria-hidden',String(inactive));slide.inert=inactive;
    });
    document.querySelectorAll('[data-banner]').forEach(button=>{
      const active=Number(button.dataset.banner)===next;
      button.classList.toggle('on',active);button.setAttribute('aria-pressed',String(active));
    });
  };
  let bannerPointer=null,bannerDragged=false;
  document.addEventListener('pointerdown',event=>{
    if(!event.target.closest('.supplied-banner-viewport'))return;
    bannerPointer={id:event.pointerId,x:event.clientX,y:event.clientY};bannerDragged=false;
  });
  document.addEventListener('pointermove',event=>{
    if(bannerPointer?.id===event.pointerId&&Math.hypot(event.clientX-bannerPointer.x,event.clientY-bannerPointer.y)>12)bannerDragged=true;
  });
  document.addEventListener('pointercancel',()=>{bannerPointer=null;bannerDragged=true;});
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-banner-detail]');
    if(!button||event.detail!==0&&bannerDragged)return;
    const brand=brands[Number(button.dataset.bannerDetail)];
    const item=(window.BUSAN_STORE_LOCATIONS||[]).find(item=>item.brand===brand?.name&&!window.BUSAN_EVENT_WINDOW?.locationExpired(item));
    if(item)window.BUSAN_OPEN_EVENT_DETAIL?.(item);
  });
  const originalBrandPage=brandPage;
  brandPage=()=>{
    const brand=brands[state.brand];if(!brand.supplied)return originalBrandPage();
    return head(brand.name+' 브랜드관',true)+`<div class="pad supplied-brand-page"><img src="${directory+brand.asset}" alt="${esc(brand.name)} 브랜드 이미지" width="1000" height="1000"><h2>${esc(brand.name)}</h2><p>${esc(brand.desc)}</p><p class="notice">행사 일정과 상세 정보를 준비하고 있어요.</p></div>`;
  };
  const originalStoreMap=storeMap;
  storeMap=()=>originalStoreMap().replace(/<button data-map-brand="(\d+)"[\s\S]*?<\/button>/g,(html,index)=>brands[Number(index)]?.supplied?'':html);
  const originalBind=bindView;
  bindView=()=>{
    originalBind();
    document.querySelector('.supplied-banner-viewport')?.addEventListener('keydown',event=>{
      if(!['ArrowRight','ArrowLeft'].includes(event.key))return;
      event.preventDefault();switchCampaign((state.banner+(event.key==='ArrowRight'?1:slides.length-1))%slides.length);
    });
  };
  specs.home[2][1]='캠페인 배너|종료일이 가까운 확정 행사 최대 10개|한국 날짜 기준 종료 행사 제외 · 3초마다 전환';
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.screen==='home'&&refreshCampaigns())render();});
  refreshCampaigns();
})();
