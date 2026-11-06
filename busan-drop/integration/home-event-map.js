/* Real Mapbox base map for home; regional tabs reuse one map instance. */
(() => {
  const regions=['BUSAN','서면','남포동','광안리','해운대'];
  const destinations=window.BUSAN_HOME_MAPBOX_VIEWS;
  const text=()=>({ko:['내 여행지 이벤트 모아보기','행사 위치는 정보 등록 후 표시됩니다.','지도를 불러오지 못했어요.','다시 시도','지도 불러오는 중'],en:['Events for my trip','Event locations will appear once registered.','The map could not be loaded.','Retry','Loading map'],ja:['旅先のイベントを探す','イベント情報の登録後に場所を表示します。','地図を読み込めませんでした。','再試行','地図を読み込み中'],zh:['发现旅行目的地活动','活动信息登记后将显示地点。','无法加载地图。','重试','正在加载地图']})[state.language];
  const regionLabel=name=>({ko:{BUSAN:'부산'},en:{BUSAN:'Busan',서면:'Seomyeon',남포동:'Nampo',광안리:'Gwangalli',해운대:'Haeundae'},ja:{BUSAN:'釜山',서면:'西面',남포동:'南浦洞',광안리:'広安里',해운대:'海雲台'},zh:{BUSAN:'釜山',서면:'西面',남포동:'南浦洞',광안리:'广安里',해운대:'海云台'}})[state.language]?.[name]||name;
  let map=null,retainedNode=null,instances=0,eventMarkers=[],venuePopup=null;
  const eventWindow=()=>window.BUSAN_EVENT_WINDOW?.select({catalog:window.BUSAN_EVENT_CATALOG,locations:window.BUSAN_STORE_LOCATIONS,events:window.BUSAN_EVENT_DETAILS,categories:window.BUSAN_STORE_BRAND_CATEGORIES,category:state.filter||'전체',region:state.mapRegion||'BUSAN'})||{start:'',end:'',items:[]};
  const rangeText=range=>`${destinations[state.mapRegion||'BUSAN'].district} · ${range.start.replaceAll('-','.')} – ${range.end.replaceAll('-','.')} · ${range.items.length}곳`;
  const originalHome=home;
  home=()=>{
    if(!regions.includes(state.mapRegion))state.mapRegion=null;
    const html=originalHome(),copy=text();
    const section=`<section class="home-event-map" aria-labelledby="homeEventMapTitle"><h3 id="homeEventMapTitle">${copy[0]}</h3><h4 class="home-event-filter-label">${({ko:'지역',en:'Area',ja:'エリア',zh:'地区'})[state.language]||'지역'}</h4><nav class="home-event-regions" aria-label="행사 지역 선택">${regions.map(region=>`<button data-home-event-region="${region}" class="${(state.mapRegion||'BUSAN')===region?'active':''}" aria-pressed="${(state.mapRegion||'BUSAN')===region}">${regionLabel(region)}</button>`).join('')}</nav><h4 class="home-event-filter-label">${({ko:'카테고리',en:'Category',ja:'カテゴリー',zh:'类别'})[state.language]||'카테고리'}</h4>${window.BUSAN_HOME_CATEGORY_HTML()}<p class="home-event-window" aria-live="polite">${rangeText(eventWindow())}</p><div class="home-event-map-frame"><div id="homeMapbox" aria-label="${destinations[state.mapRegion||'BUSAN'].district} 행사 지도"></div><div class="home-map-status" role="status">${copy[4]}</div><div class="home-map-error" role="status" hidden><p>${copy[2]}</p><button data-home-map-retry>${copy[3]}</button></div><div class="home-map-controls" aria-label="지도 확대와 축소"><button data-home-map-zoom="in" aria-label="지도 확대">+</button><button data-home-map-zoom="out" aria-label="지도 축소">−</button></div></div></section>`;
    return html+section;
  };
  const status=(stateValue)=>{
    const host=document.querySelector('#homeMapbox');if(host)host.dataset.mapState=stateValue;
    const loading=document.querySelector('.home-map-status');if(loading)loading.hidden=stateValue!=='loading';
    const error=document.querySelector('.home-map-error');if(error)error.hidden=stateValue!=='error';
  };
  const language=()=>{
    if(!map?.isStyleLoaded())return;
    const field={ko:'name_ko',ja:'name_ja',zh:'name_zh-Hans',en:'name_en'}[state.language]||'name_en';
    for(const name of ['country-label','state-label','settlement-label','settlement-subdivision-label','poi-label','road-label']){
      if(map.getLayer(name))map.setLayoutProperty(name,'text-field',['coalesce',['get',field],['get','name']]);
    }
  };
  const syncEvents=()=>{
    venuePopup?.remove();venuePopup=null;eventMarkers.forEach(marker=>marker.remove());eventMarkers=[];
    if(!map||typeof mapboxgl.Marker!=='function')return;
    const range=eventWindow(),items=range.items;
    const caption=document.querySelector('.home-event-window');if(caption)caption.textContent=rangeText(range);
    const groups=window.BUSAN_EVENT_WINDOW.groupLocations(items);
    groups.forEach(group=>{
      const pin=document.createElement('button');pin.type='button';pin.className='real-store-pin';
      pin.setAttribute('aria-label',group.items.length===1?group.items[0].name+' 행사 정보':group.items.map(item=>item.brand).join(' · ')+' 행사 '+group.items.length+'개');
      pin.innerHTML=icon('store')+(group.items.length>1?`<span class="home-venue-count">${group.items.length}</span>`:'');
      pin.addEventListener('click',event=>{
        event.stopPropagation();
        if(group.items.length===1){window.BUSAN_OPEN_EVENT_DETAIL?.(group.items[0]);return;}
        venuePopup?.remove();
        const list=document.createElement('div');list.className='home-venue-events';
        const title=document.createElement('p');title.className='home-venue-heading';title.textContent='방문할 행사를 선택하세요 · '+group.items.length+'개';list.appendChild(title);
        group.items.forEach(item=>{
          const details=window.BUSAN_EVENT_DETAILS?.[item.brand];
          const name=(details?.mapTitle||details?.title||item.name).replace(/ 부산 롯데 팝업$| 부산본점 팝업스토어$| 팝업$/,'');
          const period=details?.start&&details?.end?`${details.start.slice(5).replace('-','.')} – ${details.end.slice(5).replace('-','.')}`:'';
          const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',item.name+' 행사 보기');
          button.innerHTML=`<span class="home-venue-row-copy"><strong>${esc(name)}</strong><small>${esc(details?.venue||item.address)}</small>${period?`<span class="home-venue-row-date">${esc(period)}</span>`:''}</span><span class="home-venue-row-arrow" aria-hidden="true">↗</span>`;
          button.addEventListener('click',()=>{venuePopup?.remove();venuePopup=null;window.BUSAN_OPEN_EVENT_DETAIL?.(item);});list.appendChild(button);
        });
        venuePopup=new mapboxgl.Popup({className:'home-venue-popup',offset:30,maxWidth:'none',focusAfterOpen:true}).setLngLat([group.lng,group.lat]).setDOMContent(list).addTo(map);
      });
      eventMarkers.push(new mapboxgl.Marker({element:pin,anchor:'bottom'}).setLngLat([group.lng,group.lat]).addTo(map));
    });
  };
  let lastToday=window.BUSAN_EVENT_WINDOW?.koreaToday();
  const refreshDate=()=>{const today=window.BUSAN_EVENT_WINDOW?.koreaToday();if(today!==lastToday){lastToday=today;if(state.screen==='home')syncEvents();}};
  window.addEventListener?.('focus',refreshDate);
  document.addEventListener('visibilitychange',refreshDate);
  if(typeof setInterval==='function')setInterval(refreshDate,60000);
  const dispose=()=>{venuePopup?.remove();venuePopup=null;eventMarkers.forEach(marker=>marker.remove());eventMarkers=[];if(map){map.remove();map=null;}};
  const bindHome=()=>{
    const container=document.querySelector('#homeMapbox');if(!container)return;
    if(!retainedNode&&!map){
      if(typeof mapboxgl==='undefined'||!window.BUSAN_MAPBOX_CONFIG?.token){status('error');return;}
      try{
        mapboxgl.accessToken=window.BUSAN_MAPBOX_CONFIG.token;
        const destination=destinations[state.mapRegion||'BUSAN'];
        map=new mapboxgl.Map({container,style:window.BUSAN_MAPBOX_CONFIG.style,bounds:destination.bounds,fitBoundsOptions:{padding:24},cooperativeGestures:true,attributionControl:false});
        map.addControl(new mapboxgl.AttributionControl({compact:true}),'bottom-right');
        instances++;container.dataset.mapInstance=String(instances);
        const current=map;
        map.on('load',()=>{if(map!==current)return;status('ready');language();map.resize();syncEvents();});
        map.on('error',()=>{if(map===current&&!map.isStyleLoaded())status('error');});
        map.on('idle',()=>{if(map===current)status('ready');});
      }catch{dispose();status('error');}
    }
    document.querySelectorAll('[data-home-map-zoom]').forEach(button=>button.addEventListener('click',()=>{
      if(button.dataset.homeMapZoom==='in')map?.zoomIn();else map?.zoomOut();
    }));
  };
  const originalBind=bindStoreMap;
  bindStoreMap=()=>state.screen==='home'?bindHome():originalBind();
  const originalRender=render;
  render=()=>{
    const scroll=state.screen==='home'?document.querySelector('#viewport').scrollTop:null;
    retainedNode=state.screen==='home'&&map?document.querySelector('#homeMapbox'):null;
    if(state.screen!=='home')dispose();
    originalRender();
    if(retainedNode){
      document.querySelector('#homeMapbox').replaceWith(retainedNode);retainedNode=null;
      map.resize();language();syncEvents();status(map.isStyleLoaded()?'ready':'loading');
    }
    if(scroll!==null)document.querySelector('#viewport').scrollTop=scroll;
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-home-event-region]');
    if(button&&regions.includes(button.dataset.homeEventRegion)){
      const region=button.dataset.homeEventRegion;state.mapRegion=region==='BUSAN'?null:region;
      document.querySelectorAll('[data-home-event-region]').forEach(item=>{
        const active=item.dataset.homeEventRegion===region;
        item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));
      });
      const destination=destinations[region];
      syncEvents();
      map?.fitBounds(destination.bounds,{padding:24,duration:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:700});
      document.querySelector('#homeMapbox')?.setAttribute('aria-label',destination.district+' 행사 지도');
    }
    if(event.target.closest('[data-home-map-retry]')){dispose();status('loading');bindHome();}
  });
})();
