/* Brand locations on the same Mapbox style as home, without demo SVG pins. */
(() => {
  const rows=window.BUSAN_STORE_LOCATIONS||[];
  if(typeof state.mapLocal!=='boolean')state.mapLocal=true;
  if(typeof specs!=='undefined')specs.stores=['부산 매장·행사 찾기','지역·카테고리·브랜드로 위치를 찾고, 핀에서 행사 상세를 확인합니다.',['행사 목록|썸네일·행사명·기간·저장|브랜드별 행사를 묶고 지점별 상세 진입','지도|홈과 같은 Mapbox 지도|지역별 기본 중심·축척 공유','검색 필터|지역 → 카테고리 → 브랜드|등록된 실제 위치만 표시','행사 상세|배너·기간·장소·혜택·입장 조건|공식 확인과 간접 정보를 구분']];
  const regions=['서면','남포동','광안리','해운대'];
  const categories=['전체','패션','뷰티','굿즈','팝업','디저트','숙박','로컬'];
  const brandCategories={"해리포터 마호도코로":[
  "굿즈",
  "팝업"
],"히나쿠우":[
  "굿즈",
  "팝업"
],"시그니엘 부산":[
  "숙박"
],"웨스틴 조선 부산":[
  "숙박",
  "로컬"
],"그랜드 조선 부산":[
  "숙박",
  "로컬"
],'올리브영':['뷰티'],'유니클로':['패션'],'자라':['패션'],'몬치치':['팝업'],'티파니앤코':['패션'],'와키윌리':['패션','팝업'],'참치학교':['팝업'],"원피스 무기와라 스토어":["굿즈", "팝업"],"와이잭":["패션", "팝업"],"젤라또 피케":["패션", "팝업"],"리락쿠마·스미코구라시":["굿즈", "팝업"],"메이플스토리":["팝업"]};
  window.BUSAN_STORE_BRAND_CATEGORIES=brandCategories;
  const categoryLabels={ko:categories,en:['All','Fashion','Beauty','Goods','Pop-up','Dessert','Stays','Local'],ja:['すべて','ファッション','ビューティー','グッズ','ポップアップ','スイーツ','宿泊','ローカル'],zh:['全部','时尚','美妆','周边','快闪','甜点','住宿','本地']};
  const category=()=>categories.includes(state.storeCategory)?state.storeCategory:'전체';
  const categoryLabel=name=>(categoryLabels[state.language]||categories)[categories.indexOf(name)];
  const matchesCategory=name=>brands.some(b=>b.name===name&&b.active!==false)&&(category()==='전체'||brandCategories[name]?.includes(category()));
  const filterLabels=()=>({ko:['지역','카테고리','브랜드','부산'],en:['Area','Category','Brand','Busan'],ja:['エリア','カテゴリー','ブランド','釜山'],zh:['地区','类别','品牌','釜山']})[state.language]||['지역','카테고리','브랜드','부산'];
  const copy=()=>({ko:['전체','매장찾기','등록된 위치','등록된 위치가 없어요','매장 선택','지도 불러오는 중','지도를 불러오지 못했어요','다시 시도','길찾기'],en:['All','Find stores','locations','No locations registered','Choose a store','Loading map','Unable to load map','Retry','Directions'],ja:['すべて','店舗検索','登録地点','登録された場所はありません','店舗を選択','地図を読み込み中','地図を読み込めませんでした','再試行','ルート'],zh:['全部','查找门店','个地点','暂无登记地点','选择门店','正在加载地图','无法加载地图','重试','路线']})[state.language]||[];
  const regionLabel=r=>({en:{서면:'Seomyeon',남포동:'Nampo',광안리:'Gwangalli',해운대:'Haeundae'},ja:{서면:'西面',남포동:'南浦洞',광안리:'広安里',해운대:'海雲台'},zh:{서면:'西面',남포동:'南浦洞',광안리:'广安里',해운대:'海云台'}})[state.language]?.[r]||r;
  const visible=()=>rows.filter(s=>matchesCategory(s.brand)&&(state.mapLocal||s.brand===brands[state.brand]?.name)&&(!state.storeRegion||s.region===state.storeRegion));
  const results=(list,t)=>{
    const groups=window.BUSAN_STORE_EVENTS?.group(list,window.BUSAN_EVENT_CATALOG,window.BUSAN_EVENT_DETAILS)||[];
    groups.sort((a,b)=>Number(!a.event?.start)-Number(!b.event?.start));
    const toolbar=`<div class="store-results-toolbar"><div><strong>행사 안내 <em>${groups.length}</em></strong><span>${list.length}개 지점</span></div><div class="store-view-toggle" role="group" aria-label="결과 보기 방식"><button data-store-view="list" aria-pressed="${state.storeView!=='map'}">목록</button><button data-store-view="map" aria-pressed="${state.storeView==='map'}">지도</button></div></div>`;
    if(state.storeView==='map')return toolbar+`${list.length?`<select class="store-location-select" aria-label="${t[4]}"><option value="">${t[4]}</option>${list.map(s=>`<option value="${esc(s.id)}" ${state.realStoreId===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select>`:''}<div class="home-event-map-frame store-mapbox-frame"><div id="storeMapbox" aria-label="${t[1]}"></div><div class="store-map-loading home-map-status" role="status">${t[5]}</div><div class="store-map-error home-map-error" role="status" hidden><p>${t[6]}</p><button data-store-map-retry>${t[7]}</button></div><div class="home-map-controls"><button data-store-zoom="in" aria-label="지도 확대">+</button><button data-store-zoom="out" aria-label="지도 축소">−</button></div>${list.length?'':`<p class="store-map-empty">${t[3]}</p>`}<div class="store-location-detail" hidden></div></div>`;
    return toolbar+`<div class="store-event-results">${groups.length?groups.map(group=>{
      const {brand,campaign,event,items}=group;
      const image=campaign?.image,title=event?.title||campaign?.title||brand+' 행사 안내';
      const date=event?.start&&event?.end?(event.start.slice(0,4)!==event.end.slice(0,4)?event.start.replaceAll('-','.')+' – '+event.end.replaceAll('-','.'):event.start.slice(5).replace('-','.')+' – '+event.end.slice(5).replace('-','.')):'공식 일정 안내 전';
      const status=window.BUSAN_STORE_EVENTS.status(event,window.BUSAN_EVENT_WINDOW?.koreaToday()||new Date().toISOString().slice(0,10));
      const key=items[0].id;
      return `<article class="store-event-card"><button class="store-event-open" data-store-event-open="${key}" aria-expanded="false"><span class="store-event-image">${image?`<img src="assets/banners/home-20261105/${image}" alt="${esc(brand)} 행사 배너" width="200" height="200">`:icon('store')}<span>${esc(status)}</span></span><span class="store-event-copy"><small>${esc(brand)} · ${esc(categoryLabel(brandCategories[brand]?.[0]||'전체'))}</small><strong>${esc(title)}</strong><span class="store-event-date">${event?.periodLabel?esc(event.periodLabel)+' · ':''}${esc(date)}</span><span class="store-event-location">${items.length===1?esc(items[0].name):items.length+'개 지점에서 위치 확인'}</span><span class="store-event-more">${items.length===1?'행사 정보 보기 ↗':'지점 선택 · 행사 보기 ⌄'}</span></span></button>${window.BUSAN_EVENT_SOCIAL?.saveControl(brand,items.length===1?items[0].id:null)||''}<div class="store-event-branches" data-store-event-branches="${key}" hidden><p>${branchCopy()[0]}</p><button class="branch-map-overview" data-branch-overview>${state.language==='ko'?'전체 지점 보기':'All branches'} ↗</button><div class="branch-location-map" data-branch-map="${key}" aria-label="${esc(brand)} ${branchCopy()[0]}"></div><span class="branch-map-status" role="status">${branchCopy()[3]}</span><div class="branch-number-choices" role="group" aria-label="${branchCopy()[0]}">${items.map((item,i)=>`<button data-branch-pin="${item.id}" aria-pressed="${i===0}" aria-label="${i+1}. ${esc(branchName(item))}">${i+1}<span>${esc(branchArea(item))}</span></button>`).join('')}</div><div class="branch-selected-location" aria-live="polite"></div></div></article>`;
    }).join(''):`<div class="store-results-empty">${icon('search')}<h3>선택한 조건의 행사가 없어요.</h3><p>다른 지역이나 카테고리로 찾아보세요.</p><button data-store-reset>전체 행사 보기</button></div>`}</div>`;
  };
  const branchCopy=()=>({ko:['지도에서 방문할 지점을 선택하세요','행사 보기','지도를 불러오지 못했어요. 아래 번호로 지점을 선택해주세요.','지도 불러오는 중'],en:['Choose a branch on the map','View event','Map unavailable. Choose a numbered branch below.','Loading map'],ja:['地図から店舗を選んでください','イベントを見る','地図を読み込めません。下の番号から選んでください。','地図を読み込み中'],zh:['在地图上选择门店','查看活动','地图加载失败，请选择下方编号。','正在加载地图']})[state.language]||['Choose a branch on the map','View event','Map unavailable. Choose a numbered branch below.','Loading map'];
  const englishBranches={'oliveyoung-8':'OLIVE YOUNG Connect Hyundai Busan','oliveyoung-0':'OLIVE YOUNG Nampo Town','oliveyoung-30':'OLIVE YOUNG Millac the Market','uniqlo-4':'UNIQLO Busan Saha','uniqlo-1':'UNIQLO Lotte Gwangbok','uniqlo-5':'UNIQLO Busan Beomil','uniqlo-0':'UNIQLO Samjung Tower','uniqlo-6':'UNIQLO Lotte Seomyeon','uniqlo-7':'UNIQLO Lotte Mart Hwamyeong','uniqlo-8':'UNIQLO Lotte Mart Dongnae','uniqlo-2':'UNIQLO Lotte Centum City','uniqlo-3':'UNIQLO Lotte Mall Dongbusan','zara-14970':'ZARA Lotte Centum City','zara-9302':'ZARA Seomyeon','zara-16694':'ZARA Lotte Mall Dongbusan'};
  const branchName=item=>state.language==='ko'?item.name:englishBranches[item.id]||item.name;
  const branchArea=item=>{const district=item.address?.match(/(?:부산광역시|부산)\s+(\S+[구군])/);return state.language==='ko'?(district?.[1]||item.region):({부산진구:'Seomyeon',중구:'Nampo',수영구:'Gwangalli',해운대구:'Haeundae',동구:'Beomil',사하구:'Saha',북구:'Hwamyeong',동래구:'Dongnae',기장군:'Gijang'})[district?.[1]]||item.region;};
  let branchMap=null,branchMarkers=[],branchPanel=null,branchItems=[];
  const disposeBranches=()=>{branchMarkers.forEach(m=>m.remove());branchMarkers=[];branchMap?.remove();branchMap=null;branchPanel=null;branchItems=[];};
  const chooseBranch=(id,fly=true)=>{
    const item=branchItems.find(s=>s.id===id);if(!item||!branchPanel)return;
    const index=branchItems.indexOf(item),info=branchPanel.querySelector('.branch-selected-location');
    info.innerHTML=`<div class="branch-selection-heading"><b>${index+1}</b><div><strong>${esc(branchName(item))}</strong>${state.language==='ko'?'':`<small>${esc(item.name)}</small>`}</div></div><p>${esc(item.address)}</p><button data-store-detail="${esc(item.id)}">${branchCopy()[1]} ↗</button>`;
    branchPanel.querySelectorAll('[data-branch-pin]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.branchPin===id)));
    branchMarkers.forEach(marker=>marker.getElement().setAttribute('aria-pressed',String(marker.getElement().dataset.branchId===id)));
    if(fly&&branchMap)branchMap.flyTo({center:[item.lng,item.lat],zoom:13.5,duration:650});
  };
  const mountBranches=(panel,items)=>{
    disposeBranches();branchPanel=panel;branchItems=items;chooseBranch(items[0].id,false);
    const status=panel.querySelector('.branch-map-status'),host=panel.querySelector('[data-branch-map]');
    try{
      if(!window.mapboxgl||!window.BUSAN_MAPBOX_CONFIG?.token)throw Error('Map unavailable');
      mapboxgl.accessToken=window.BUSAN_MAPBOX_CONFIG.token;
      branchMap=new mapboxgl.Map({container:host,style:window.BUSAN_MAPBOX_CONFIG.style,...window.BUSAN_MAPBOX_VIEWS.BUSAN,cooperativeGestures:true,attributionControl:false});
      branchMap.addControl(new mapboxgl.AttributionControl({compact:true}),'bottom-right');
      const current=branchMap;
      branchMap.on('load',()=>{if(branchMap!==current)return;status.hidden=true;branchMap.resize();const field={ko:'name_ko',en:'name_en',ja:'name_ja',zh:'name_zh-Hans'}[state.language]||'name_en';for(const layer of ['settlement-label','settlement-subdivision-label','poi-label','road-label'])if(current.getLayer(layer))current.setLayoutProperty(layer,'text-field',['coalesce',['get',field],['get','name']]);});
      branchMap.on('error',()=>{if(branchMap===current&&!current.isStyleLoaded()){status.hidden=false;status.textContent=branchCopy()[2];}});
      const bounds=new mapboxgl.LngLatBounds();
      items.forEach((item,i)=>{if(!Number.isFinite(item.lat)||!Number.isFinite(item.lng))return;const pin=document.createElement('button');pin.type='button';pin.className='branch-map-pin';pin.dataset.branchId=item.id;pin.textContent=String(i+1);pin.setAttribute('aria-label',`${i+1}. ${branchName(item)}`);pin.setAttribute('aria-pressed',String(i===0));pin.addEventListener('click',e=>{e.stopPropagation();chooseBranch(item.id);});branchMarkers.push(new mapboxgl.Marker({element:pin,anchor:'bottom'}).setLngLat([item.lng,item.lat]).addTo(branchMap));bounds.extend([item.lng,item.lat]);});
      branchMap.fitBounds(bounds,{padding:35,maxZoom:13,duration:0});
    }catch{status.textContent=branchCopy()[2];}
  };
  let map=null,markers=[],retained=null,lastFilter=null;
  const dispose=()=>{markers.forEach(m=>m.remove());markers=[];map?.remove();map=null;lastFilter=null;};
  storeMap=()=>{
    if(brands[state.brand]?.active===false){state.brand=brands.findIndex(b=>b.active!==false);state.mapLocal=true;state.realStoreId=null;}
    const t=copy(),list=visible(),labels=filterLabels();
    const intro=({ko:['행사 둘러보기','취향에 맞는 행사를 찾고,','가고 싶은 매장을 발견해요.'],en:['Discover events','Find events that match your taste,','and discover your next shopping stop.'],ja:['イベントを探す','好みに合うイベントを見つけて、','行きたいお店に出会いましょう。'],zh:['发现活动','寻找符合喜好的活动，','发现想去的店铺。']})[state.language]||['행사 둘러보기','취향에 맞는 행사를 찾고,','가고 싶은 매장을 발견해요.'];
    return head()+`<section class="store-mapbox-page"><div class="pass-title store-page-intro"><span>FIND YOUR NEXT STOP</span><h2>${intro[0]}${icon('store')}</h2><p>${intro[1]}<br>${intro[2]}</p></div><div class="store-filter-group"><h3>${labels[0]}</h3><nav class="home-event-regions" aria-label="${labels[0]}">${[null,...regions].map(r=>`<button data-store-region="${r||''}" class="${(state.storeRegion||null)===r?'active':''}" aria-pressed="${(state.storeRegion||null)===r}">${r?regionLabel(r):labels[3]}</button>`).join('')}</nav></div><div class="store-filter-group"><h3>${labels[1]}</h3><nav class="store-category-filters" aria-label="${labels[1]}">${categories.map(name=>`<button data-store-category="${name}" class="${category()===name?'active':''}" aria-pressed="${category()===name}">${categoryLabel(name)}</button>`).join('')}</nav></div><div class="store-filter-group"><h3>${labels[2]}</h3><nav class="store-brand-filters" aria-label="${labels[2]}"><button data-store-brand="all" class="${state.mapLocal?'active':''}" aria-pressed="${!!state.mapLocal}">${t[0]}</button>${brands.map((b,i)=>matchesCategory(b.name)?`<button data-store-brand="${i}" class="${!state.mapLocal&&state.brand===i?'active':''}" aria-pressed="${!state.mapLocal&&state.brand===i}">${esc(b.name)}</button>`:'').join('')}</nav></div>${results(list,t)}</section>`;
  };
  const status=ready=>{
    const loading=document.querySelector('.store-map-loading'),error=document.querySelector('.store-map-error');
    if(loading)loading.hidden=ready!=='loading';if(error)error.hidden=ready!=='error';
    const host=document.querySelector('#storeMapbox');if(host)host.dataset.mapState=ready;
  };
  const localize=()=>{
    if(!map?.isStyleLoaded())return;
    const field={ko:'name_ko',en:'name_en',ja:'name_ja',zh:'name_zh-Hans'}[state.language]||'name_en';
    for(const id of ['country-label','state-label','settlement-label','settlement-subdivision-label','poi-label','road-label'])if(map.getLayer(id))map.setLayoutProperty(id,'text-field',['coalesce',['get',field],['get','name']]);
  };
  const select=id=>{
    const item=visible().find(s=>s.id===id);
    state.realStoreId=item?.id||null;if(!item)return;
    const dropdown=document.querySelector('.store-location-select');if(dropdown)dropdown.value=item.id;
    window.BUSAN_OPEN_EVENT_DETAIL?.(item);
  };
  const sync=()=>{
    markers.forEach(m=>m.remove());markers=[];
    const list=visible();
    list.forEach(s=>{
      const pin=document.createElement('button');pin.type='button';pin.className='real-store-pin';pin.setAttribute('aria-label',s.name);pin.innerHTML=icon('store');pin.addEventListener('click',()=>select(s.id));
      markers.push(new mapboxgl.Marker({element:pin,anchor:'bottom'}).setLngLat([s.lng,s.lat]).addTo(map));
    });
    const filter=`${category()}/${state.mapLocal?'all':state.brand}/${state.storeRegion||''}`;
    if(filter!==lastFilter){
      map.jumpTo({...window.BUSAN_MAPBOX_VIEWS[state.storeRegion||'BUSAN'],padding:0});
      lastFilter=filter;
    }

    localize();
  };
  const originalBind=bindStoreMap;
  bindStoreMap=()=>{
    if(state.screen!=='stores')return originalBind();
    const host=document.querySelector('#storeMapbox');
    const strip=document.querySelector('.store-brand-filters'),active=strip?.querySelector('.active');
    if(strip&&active)strip.scrollLeft=Math.max(0,active.offsetLeft-strip.offsetLeft-(strip.clientWidth-active.offsetWidth)/2);
    if(!host)return;
    if(!map){
      if(!window.mapboxgl||!window.BUSAN_MAPBOX_CONFIG?.token){status('error');return;}
      try{
        mapboxgl.accessToken=window.BUSAN_MAPBOX_CONFIG.token;
        map=new mapboxgl.Map({container:host,style:window.BUSAN_MAPBOX_CONFIG.style,...window.BUSAN_MAPBOX_VIEWS.BUSAN,cooperativeGestures:true,attributionControl:false});
        map.addControl(new mapboxgl.AttributionControl({compact:true}),'bottom-right');
        const current=map;
        map.on('load',()=>{if(map!==current)return;status('ready');localize();map.resize();});
        map.on('error',()=>{if(map===current&&!map.isStyleLoaded())status('error');});
        sync();
      }catch{dispose();status('error');}
    }
    document.querySelector('.store-location-select')?.addEventListener('change',e=>select(e.target.value));
  };
  const originalRender=render;
  render=()=>{
    retained=state.screen==='stores'&&state.storeView==='map'&&map?document.querySelector('#storeMapbox'):null;
    if(state.screen!=='stores'||state.storeView!=='map')dispose();
    disposeBranches();
    originalRender();
    if(retained){document.querySelector('#storeMapbox').replaceWith(retained);retained=null;map.resize();sync();status(map.isStyleLoaded()?'ready':'loading');}
  };
  document.addEventListener('click',e=>{
    const view=e.target.closest('[data-store-view]');if(view){state.storeView=view.dataset.storeView;render();return;}
    const open=e.target.closest('[data-store-event-open]');if(open){const item=visible().find(s=>s.id===open.dataset.storeEventOpen);if(!item)return;const matching=visible().filter(s=>s.brand===item.brand);if(matching.length===1)select(item.id);else{const panel=document.querySelector(`[data-store-event-branches="${item.id}"]`);const opening=panel.hidden;disposeBranches();document.querySelectorAll('[data-store-event-branches]').forEach(other=>{other.hidden=true;});document.querySelectorAll('[data-store-event-open]').forEach(button=>button.setAttribute('aria-expanded','false'));panel.hidden=!opening;open.setAttribute('aria-expanded',String(opening));if(opening)mountBranches(panel,matching);}return;}
    if(e.target.closest('[data-branch-overview]')&&branchMap){const bounds=new mapboxgl.LngLatBounds();branchItems.forEach(item=>bounds.extend([item.lng,item.lat]));branchMap.fitBounds(bounds,{padding:35,maxZoom:13,duration:500});return;}
    const branch=e.target.closest('[data-branch-pin]');if(branch){chooseBranch(branch.dataset.branchPin);return;}
    const detail=e.target.closest('[data-store-detail]');if(detail){select(detail.dataset.storeDetail);return;}
    if(e.target.closest('[data-store-reset]')){state.storeRegion=null;state.storeCategory='전체';state.mapLocal=true;render();return;}
    const brand=e.target.closest('[data-store-brand]'),region=e.target.closest('[data-store-region]'),zoom=e.target.closest('[data-store-zoom]'),categoryButton=e.target.closest('[data-store-category]');
    if(categoryButton&&categories.includes(categoryButton.dataset.storeCategory)){state.storeCategory=categoryButton.dataset.storeCategory;state.mapLocal=true;state.realStoreId=null;render();}
    if(brand&& (brand.dataset.storeBrand==='all'||matchesCategory(brands[Number(brand.dataset.storeBrand)]?.name))){state.mapLocal=brand.dataset.storeBrand==='all';if(!state.mapLocal)state.brand=Number(brand.dataset.storeBrand);state.realStoreId=null;render();}
    if(region){state.storeRegion=region.dataset.storeRegion||null;state.realStoreId=null;render();}
    if(zoom){if(zoom.dataset.storeZoom==='in')map?.zoomIn();else map?.zoomOut();}
    if(e.target.closest('[data-store-map-retry]')){dispose();status('loading');bindStoreMap();}
  });
})();
