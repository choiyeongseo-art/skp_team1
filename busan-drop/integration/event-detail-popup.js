/* A banner-first, scrollable detail sheet for event and store pins. */
(() => {
  let previousFocus=null,venueMap=null,venueObserver=null;
  const validCoordinates=item=>typeof item.lat==='number'&&typeof item.lng==='number'&&Number.isFinite(item.lat)&&Number.isFinite(item.lng)&&Math.abs(item.lat)<=90&&Math.abs(item.lng)<=180;
  const disposeMap=()=>{venueObserver?.disconnect();venueObserver=null;venueMap?.remove();venueMap=null;};
  const mountMap=item=>{
    disposeMap();
    const container=document.querySelector('#eventVenueMap'),config=window.BUSAN_MAPBOX_CONFIG;
    if(!validCoordinates(item)||!container||!window.mapboxgl||!config)return;
    try{
      const map=new window.mapboxgl.Map({container,accessToken:config.token,style:window.BUSAN_BASEMAP_STYLE||config.style,center:[item.lng,item.lat],zoom:15,cooperativeGestures:true,performanceMetricsCollection:false,attributionControl:false});
      window.BUSAN_STYLE_MAP?.(map);
      venueMap=map;
      map.addControl(new window.mapboxgl.AttributionControl({compact:true}),'bottom-right');
      map.addControl(new window.mapboxgl.NavigationControl({showCompass:false}),'top-right');
      const pin=document.createElement('span');
      pin.className='bd-event-location-pin';
      pin.setAttribute('aria-hidden','true');
      pin.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 10l2-5h12l2 5v2a2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0zM6 14v5h12v-5M10 19v-4h4v4"/></svg>';
      new window.mapboxgl.Marker({element:pin}).setLngLat([item.lng,item.lat]).addTo(map);
      map.on('load',()=>{if(venueMap===map)map.resize();});
      map.on('error',()=>{if(venueMap===map)container.setAttribute('aria-label','지도를 불러올 수 없어요. 아래 길찾기를 이용해주세요.');});
      if(typeof MutationObserver!=='undefined'){
        venueObserver=new MutationObserver(()=>{if(!container.isConnected)disposeMap();});
        venueObserver.observe(document.querySelector('#modal'),{childList:true});
      }
    }catch{disposeMap();container.textContent='지도를 불러올 수 없어요. 아래 길찾기를 이용해주세요.';}
  };
  const safe=value=>esc(String(value??''));
  const date=value=>value?.replaceAll('-','.');
  const research=()=>window.BUSAN_EVENT_DETAILS||{};
  const names={ko:['행사 정보','닫기','기간','운영시간','장소 · 교통','혜택 · 조건','입장 · 예약','외국인 방문 안내','방문 전 확인','확인 정보','길찾기','확인 전','주소 복사','입장료','외국인 이용·예약','해외 카드·간편결제','택스리펀','여권 필요 여부'],en:['Event details','Close','Dates','Hours','Location & transit','Offers & conditions','Entry & booking','International visitors','Before you visit','Sources','Directions','Not confirmed','Copy address','Entry fee','Visitor eligibility & booking','Foreign cards & mobile payments','Tax refund','Passport required'],ja:['イベント情報','閉じる','開催期間','営業時間','場所・アクセス','特典・条件','入場・予約','海外からのお客様へ','来場前の確認','確認情報','ルート','未確認','住所をコピー','入場料','外国人の利用・予約','海外カード・スマホ決済','免税','パスポートの要否'],zh:['活动详情','关闭','活动日期','营业时间','地点与交通','优惠与条件','入场与预约','海外游客须知','到访前确认','信息来源','路线','待确认','复制地址','入场费','外国游客参与及预约','境外卡与移动支付','退税','是否需要护照']};
  const close=()=>{
    disposeMap();
    const layer=document.querySelector('.event-detail-overlay');if(!layer)return;
    layer.remove();document.querySelector('#phone')?.classList.remove('event-detail-open');
    previousFocus?.isConnected&&previousFocus.focus();previousFocus=null;
    window.dispatchEvent?.(new Event('busan-event-detail-closed'));
  };
  const build=(item)=>{
    if(window.BUSAN_EVENT_WINDOW?.locationExpired(item))return '';
    const t=names[state.language]||names.ko,baseEvent=research()[item.brand],event=baseEvent?{...baseEvent,...item.eventOverrides}:null,brand=brands.find(b=>b.name===item.brand);
    const files={'유니클로':'uniqlo.jpg','자라':'zara.jpg','티파니앤코':'tiffany.jpg'};
    const image=event?.image||files[item.brand];
    const section=(title,body)=>`<section class="event-info-section"><h3>${safe(title)}</h3>${body}</section>`;
    const copy=value=>safe(value).replace(/#[\p{L}\p{N}_]+/gu,tag=>`<span translate="no">${tag}</span>`);
    const p=value=>`<p>${copy(value)}</p>`,note=value=>value?`<small>${safe(value)}</small>`:'';
    const directionsUrl=`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;
    const range=event?.start&&event?.end?`${date(event.start)} — ${date(event.end)}`:(event?.dateLabel||t[11]);
    const holiday=event?.closed?.length?`<div class="event-closure">11.09 휴점 · 이날은 방문할 수 없어요</div>`:'';
    const richSections=(event?.sections||[]).map(info=>section(info.title,

      (info.columns?`<div class="event-table-wrap"><table><thead><tr>${info.columns.map(c=>`<th scope="col">${safe(c)}</th>`).join('')}</tr></thead><tbody>${info.rows.map(row=>`<tr>${row.map(c=>`<td>${safe(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'')+
      (info.items?`<ul class="event-detail-list">${info.items.map(text=>`<li>${copy(text)}</li>`).join('')}</ul>`:'')+note(info.visitorNote??info.note))).join('');
    const highlights=event?.highlights?`<div class="event-highlights">${event.highlights.map(([label,value])=>`<div><span>${safe(label)}</span><strong>${safe(value)}</strong></div>`).join('')}</div>`:'';
    const storeProfile=item.profile?section('이 매장의 특징',`<strong>${safe(item.profile.headline)}</strong>${p(item.profile.description)}<ul class="event-detail-list">${item.profile.features.map(feature=>`<li>${safe(feature)}</li>`).join('')}</ul>${note(item.profile.eventNotice)}`):'';
    const title=event?.title||item.name;
    const intro=event?.description||'행사 상세 정보를 준비하고 있어요. 현재는 등록된 매장 위치를 안내합니다.';
    const unknown=`<span class="event-unknown">${t[11]}</span>`;
    const visitor=[['fee',t[13]],['foreign',t[14]],['payment',t[15]],['taxFree',t[16]],['passport',t[17]]].map(([field,label])=>`<div><dt>${safe(label)}</dt><dd>${event?.[field]!=null?`<span class="event-visitor-value">${safe(event[field])}</span>`:unknown}</dd></div>`).join('');
    return `<div class="event-detail-overlay"><section class="event-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="eventDetailTitle" tabindex="-1"><button class="event-detail-close" data-event-detail-close aria-label="${t[1]}">×</button><div class="event-detail-scroll">${image?`<div class="event-detail-banner"><img src="assets/banners/home-20261105/${image}" alt="${safe(item.brand)} 행사 일러스트" width="1000" height="1000"></div>`:''}<div class="event-detail-content"><div class="event-detail-tags"><span>${safe(event?.type||brand?.cat||'매장')}</span><span>${safe(item.brand)}</span>${window.BUSAN_EVENT_SOCIAL?.actions(item)||''}</div><h2 id="eventDetailTitle">${safe(title)}</h2>${event?`<p class="event-detail-subtitle">${safe(event.subtitle)}</p>`:''}<p class="event-detail-intro">${safe(intro)}</p>${storeProfile}${highlights}${event?`<div class="event-date-card"><span>${safe(event.periodLabel||t[2])}</span><strong>${range}</strong>${holiday}</div>`:''}${section(t[4],`<strong>${safe(event?.venue||item.name)}</strong>${p(item.address)}${validCoordinates(item)?`<div id="eventVenueMap" class="event-venue-map" role="region" aria-label="${safe(item.name)} 위치 지도"></div>`:''}<button class="event-address-copy" data-event-copy-address="${safe(item.address)}">${t[12]} ⧉</button>${event?.transit?p(event.transit):note('대중교통·출구 정보는 확인 전입니다.')}${note(event?.transitNote)}${note(item.coordinateNote)}`)}${section(t[3],p(event?.hours||t[11])+note(event?.hoursNote))}${event?.sections?.length?'':section(t[5],p(event?.benefit||t[11])+note(event?.benefitNote))}${richSections}${event?.sections?.some(info=>info.title==='예약하고 방문하기')?'':section(t[6],p(event?.entry||t[11])+note(event?.entryNote))}${section(t[7],`<dl class="event-visitor-grid">${visitor}</dl>`)}${section(t[8],p(event?.notice||'해당 매장의 행사 일정과 이용 조건은 확인 전입니다.'))}${event?.phone?section(({ko:'문의',en:'Contact',ja:'お問い合わせ',zh:'咨询'})[state.language]||'Contact',`<a class="event-contact" href="tel:${event.phone}">${event.phone} ↗</a>`):''}</div></div><footer class="event-detail-actions"><a class="event-directions" href="${directionsUrl}" target="_blank" rel="noopener noreferrer">${t[10]} ↗</a>${event?.source?`<a class="event-official" href="${safe(event.source)}" target="_blank" rel="noopener noreferrer">${safe(event.action)} ↗</a>`:''}</footer><span class="event-detail-feedback" role="status"></span></section></div>`;
  };
  window.BUSAN_EVENT_DETAIL_HTML=build;
  window.BUSAN_OPEN_EVENT_DETAIL=item=>{
    if(!item||window.BUSAN_EVENT_WINDOW?.locationExpired(item))return;
    close();previousFocus=document.activeElement;
    document.querySelector('#modal').innerHTML=build(item);
    document.querySelector('#phone').classList.add('event-detail-open');
    mountMap(item);
    document.querySelector('.event-detail-close')?.focus({preventScroll:true});
  };
  document.addEventListener('click',async e=>{
    if(e.target.closest('[data-event-detail-close]')||e.target.classList?.contains('event-detail-overlay'))close();
    const copy=e.target.closest('[data-event-copy-address]');if(!copy)return;
    try{await navigator.clipboard.writeText(copy.dataset.eventCopyAddress);document.querySelector('.event-detail-feedback').textContent=({ko:'주소를 복사했어요',en:'Address copied',ja:'住所をコピーしました',zh:'地址已复制'})[state.language]||'Address copied';}
    catch{document.querySelector('.event-detail-feedback').textContent='주소를 길게 눌러 복사해주세요.';}
  });
  window.addEventListener?.('busan-event-date-changed',close);
  document.addEventListener('keydown',e=>{
    const dialog=document.querySelector('.event-detail-dialog');if(!dialog)return;
    if(e.key==='Escape'){close();return;}
    if(e.key==='Tab'){
      const focusable=[...dialog.querySelectorAll('button,a[href],[tabindex="0"],summary')],first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    }
  },true);
})();
