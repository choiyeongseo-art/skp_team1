/* A banner-first, scrollable detail sheet for event and store pins. */
(() => {
  let previousFocus=null,venueMap=null,venueObserver=null,placePlanAction=null;
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
      if(window.BUSAN_CATEGORY_ICON && window.BUSAN_PLACE_CARD){
        const kind=item.kind||'event';
        pin.innerHTML=window.BUSAN_PLACE_CARD.mapIcon(kind,item);
      }
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
  // Keep one source language so the shared translator handles all five locales consistently.
  const names=['행사 정보','닫기','기간','운영시간','장소 · 교통','혜택 · 조건','입장 · 예약','외국인 방문 안내','방문 전 확인','확인 정보','길찾기','확인 전','주소 복사','입장료','외국인 이용·예약','해외 카드·간편결제','택스리펀','여권 필요 여부'];
  const close=()=>{
    placePlanAction=null;
    disposeMap();
    const layer=document.querySelector('.event-detail-overlay');if(!layer)return;
    layer.remove();document.querySelector('#phone')?.classList.remove('event-detail-open');
    previousFocus?.isConnected&&previousFocus.focus();previousFocus=null;
    window.dispatchEvent?.(new Event('busan-event-detail-closed'));
  };
  // Split explicit lists without breaking a date range or a building/floor name.
  const summaryLines=(input,kind)=>{
    if(Array.isArray(input))return input.flatMap(value=>summaryLines(value,kind));
    if(input==null)return [];
    if(typeof input==='object'&&input.start&&input.end)return [(input.label?String(input.label)+' · ':'')+date(input.start)+' — '+date(input.end)];
    const text=String(input).trim();
    const pattern=kind==='entry'?/\n+|\s+\/\s+|,\s+|(?<=[.!?])\s+/ : kind==='fee'?/\n+|\s+\/\s+|\s+·\s+/ : /\n+|\s+\/\s+/;
    return text.split(pattern).map(s=>s.trim()).filter(Boolean);
  };
  const schedulePairs=hours=>{
    if(Array.isArray(hours))return hours.map(row=>({label:String(row.date||row.label||''),time:String(row.time||''),note:row.note||''}));
    if(!hours)return [{label:'운영시간',time:'확인 전'}];
    const text=String(hours);
    // These published descriptions contain different milestones, not a continuous opening range.
    if(/체크인\s+\d/.test(text))return text.split(/\s+·\s+/).map(part=>{const m=part.match(/^(.*?)\s+(\d{1,2}:\d{2})$/);return m?{label:m[1],time:m[2]}:{label:'운영시간',time:part};});
    const dated=text.match(/^(\d{1,2})월\s*(\d{1,2})일\s+(.+)$/);
    if(dated){
      const label=dated[1].padStart(2,'0')+'.'+dated[2].padStart(2,'0'),rows=[];
      for(const part of dated[3].split(/\s+\/\s+|\s+·\s+|,\s*/)){
        const m=part.match(/^(.*?)\s*(\d{1,2}:\d{2})\s*(.*)$/);
        if(m)rows.push({label,time:m[2],qualifier:[m[1].trim(),m[3].trim()].filter(Boolean).join(' ')});
        else if(rows.length)rows[rows.length-1].note=part;
      }
      if(rows.length)return rows;
    }
    const parts=text.split(/\s+\/\s+/);
    return parts.map(part=>{
      const m=part.match(/^(.*?)\s*(\d{1,2}:\d{2}[–~－-]\d{1,2}:\d{2})$/);
      return m?{label:m[1].trim()||'운영시간',time:m[2]}:{label:'운영시간',time:part};
    });
  };
  const sentenceLines=value=>String(value).replace(/([.!?。！？])(?:[ \t]+|(?=[가-힣])|(?<=[。！？])(?=\S))/g,(match,mark,offset,text)=>{
    const prefix=text.slice(0,offset+1);
    if(mark==='.'&&/(?:\b(?:Mr|Mrs|Ms|Dr|Prof|St|vs|etc)|\be\.g|\bi\.e)\.$/i.test(prefix))return match;
    return mark+'\n';
  });
  window.BUSAN_EVENT_SENTENCE_LINES=sentenceLines;
  const build=(item,options={})=>{
    if(window.BUSAN_EVENT_WINDOW?.locationExpired(item))return '';
    const t=names,baseEvent=research()[item.brand],event=baseEvent?{...baseEvent,...item.eventOverrides}:null,brand=brands.find(b=>b.name===item.brand);
    const flow=window.BUSAN_EVENT_DISPLAY_FLOW;
    if(!flow)return '';
    const files={'유니클로':'uniqlo.jpg','자라':'zara.jpg','티파니앤코':'tiffany.jpg'};
    const image=event?.image||files[item.brand],title=event?.title||item.name;
    const section=(title,body)=>`<article class="event-flow-article"><h4>${safe(title)}</h4>${body}</article>`;
    const copy=value=>safe(value).replace(/#[\p{L}\p{N}_]+/gu,tag=>`<span translate="no">${tag}</span>`);
    const p=(value,sentences=false)=>`<p>${copy(sentences?sentenceLines(value):value)}</p>`,note=value=>value?`<small class="event-guidance-callout">${safe(sentenceLines(value))}</small>`:'';
    const webUrl=value=>typeof value==='string'&&/^https?:\/\/[^\s]+$/i.test(value)?safe(value):'';
    const today=window.BUSAN_EVENT_WINDOW?.koreaToday?.()||new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
    const requested=options.visitDate||item.visitDate||state.visitStart;
    const visitDate=/^\d{4}-\d{2}-\d{2}$/.test(requested||'')?requested:today;
    const venue=event?.venue&&!event.venue.includes(' / ')?event.venue:item.name;
    const range=event?.start&&event?.end?`${date(event.start)} — ${date(event.end)}`:(event?.dateLabel||t[11]);
    const unknown=`<span class="event-unknown">${t[11]}</span>`;
    const value=x=>x!=null?safe(x):unknown;
    const groups=Object.fromEntries(flow.sections.map(s=>[s.key,[]]));
    const renderRich=(info,key)=>{
      let table='';
      if(info.columns){
        const rows=info.rows||[],head=`<thead><tr>${info.columns.map(c=>`<th scope="col">${safe(c)}</th>`).join('')}</tr></thead>`;
        const renderTable=list=>`<div class="event-table-wrap"><table>${head}<tbody>${list.map(row=>`<tr>${row.map(c=>`<td>${copy(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
        const limit=key==='products'?3:rows.length;
        table=renderTable(rows.slice(0,limit));
        if(rows.length>limit)table+=`<details class="event-flow-more"><summary>${safe('전체 내용 보기')}</summary>${renderTable(rows.slice(limit))}</details>`;
      }
      const rendered=section(info.title,table+(info.items?`<ul class="event-detail-list">${info.items.map(text=>`<li>${copy(text)}</li>`).join('')}</ul>`:'')+note(info.visitorNote??info.note));
      const offer=event?.offers?.find(offer=>offer.name===info.title);
      return key==='products'&&offer?.bookingEnd&&offer.bookingEnd<today?`<details class="event-flow-more event-offer-ended"><summary><span>${safe(info.title)}</span> · <span>${safe('예약 마감')}</span></summary>${rendered}</details>`:rendered;
    };
    for(const info of event?.sections||[]){
      const key=info.flowSection||flow.mapping[item.brand]?.[info.title]||'content';
      (groups[key==='admission'?'alerts':key]||groups.content).push(renderRich(info,key));
    }
    const summaryRows=[
      [event?.periodLabel||t[2],event?.periods||range,'period'],['장소',venue,'venue'],
      [t[13],event?.fee,'fee'],['입장 방식',event?.entry,'entry']
    ];
    if(event?.closed?.length)summaryRows.push(['휴점일',event.closed.map(d=>d.slice(5).replace('-','.')+' 휴점'),'closed']);
    groups.visit.unshift(`<dl class="event-flow-summary">${summaryRows.map(([label,text,kind])=>`<div><dt>${safe(label)}</dt><dd>${text==null?unknown:summaryLines(text,kind).map(line=>`<span class="event-summary-value">${safe(line)}</span>`).join('')}</dd></div>`).join('')}</dl>`);
    const closed=(event?.closed||[]).includes(visitDate);
    if(closed)groups.alerts.unshift(`<div class="event-closure" role="status"><time translate="no">${safe(date(visitDate))}</time> <span>${safe('휴점 · 이날은 방문할 수 없어요')}</span></div>`);
    if(!event?.start||!event?.end)groups.alerts.unshift(p('행사 일정과 지점 참여 여부를 확인해주세요.'));
    const hours=schedulePairs(event?.openingHours||event?.hours);
    groups.admission.push(`<dl class="event-hours-kv">${hours.map(row=>`<div><dt><span>${safe(row.label)}</span>${row.qualifier?` <span>${safe(row.qualifier)}</span>`:''}</dt><dd><span>${safe(row.time)}</span>${row.note?`<small class="event-hours-detail">${safe(row.note)}</small>`:''}</dd></div>`).join('')}</dl>`+note(event?.hoursNote));
    if(!groups.alerts.some(html=>html.includes(safe('예약하고 방문하기'))))groups.alerts.push(section(t[6],p(event?.entry||t[11])+note(event?.entryNote?.replace(/^2차 자료 기준[. ·]*/,''))));
    if(item.profile)groups.content.push(section('이 매장의 특징',`<strong>${safe(item.profile.headline)}</strong>${p(item.profile.description)}<ul class="event-detail-list">${(item.profile.features||[]).map(feature=>`<li>${safe(feature)}</li>`).join('')}</ul>${note(item.profile.eventNotice)}`));
    if(!groups.content.length)groups.content.push(p(event?.description||'행사 상세 정보를 준비하고 있어요. 현재는 등록된 매장 위치를 안내합니다.'));
    if(!groups.benefits.length&&event?.benefit)groups.benefits.push(p(event.benefit)+note(event.benefitNote));
    // Legacy payment prose is not evidence that both card and wallet payments work.
    const notApplicable=event?.payment?.startsWith('해당 없음')?event.payment:null;
    const visitor=[['외국인 이용·예약',event?.foreign],['해외 카드',event?.foreignCard??notApplicable],['간편 결제',event?.mobilePayment??notApplicable],['텍스 리펀',event?.taxFree],['여권 필요 여부',event?.passport]];
    groups.international.push(`<div class="event-table-wrap event-international-table"><table><thead><tr><th scope="col">항목</th><th scope="col">안내</th></tr></thead><tbody>${visitor.map(([label,text])=>`<tr><th scope="row">${safe(label)}</th><td>${value(text)}</td></tr>`).join('')}</tbody></table></div>`);
    if(event?.payment&&!notApplicable)groups.international.push(note(event.payment));
    const postalAddress=String(item.address||'').split(' · ')[0];
    groups.location.unshift(`<dl class="event-place-kv"><div><dt>행사장</dt><dd>${safe(venue)}</dd></div><div><dt>주소</dt><dd>${value(postalAddress||null)}</dd></div><div><dt>찾아가기</dt><dd>${value(event?.transit)}</dd></div></dl>${validCoordinates(item)?`<div id="eventVenueMap" class="event-venue-map" role="region" aria-label="${safe(item.name)} 위치 지도"></div>`:''}${note(event?.transitNote)}`);
    groups.trust.push(p(event?.notice||'해당 매장의 행사 일정과 이용 조건은 확인 전입니다.',true));
    if(event?.phone)groups.trust.push(`<dl class="event-flow-contact"><div><dt>문의</dt><dd><a class="event-contact" href="tel:${safe(event.phone.replace(/[^+\d-]/g,''))}">${safe(event.phone)} ↗</a></dd></div></dl>`);
    const official=webUrl(event?.source);
    const intro=event?.description||'행사 상세 정보를 준비하고 있어요. 현재는 등록된 매장 위치를 안내합니다.';
    groups.intro.push(`${image?`<div class="event-detail-banner"><img src="assets/banners/home-20261105/${safe(image)}" alt="${safe(item.brand)} 행사 일러스트" width="1000" height="1000"></div>`:''}<div class="event-flow-heading"><div class="event-detail-tags"><span>${safe(event?.type||brand?.cat||'매장')}</span>${window.BUSAN_EVENT_SOCIAL?.actions(item)||''}</div><h2 id="eventDetailTitle">${safe(title)}</h2><p class="event-detail-intro">${safe(intro)}</p></div>`);
    // Remove exact repeated prose only; tables and conditions with different wording remain intact.
    const normalize=text=>text.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
    const seen=new Set([intro,...summaryRows.flatMap(([,text,kind])=>[...summaryLines(text,kind),...(typeof text==='string'?[text]:[])])].filter(Boolean).map(text=>normalize(safe(text))));
    const dedupe=html=>html.replace(/<(p|small|li)([^>]*)>([\s\S]*?)<\/\1>/g,(all,tag,attrs,text)=>{
      const key=normalize(text);if(key.length<12)return all;
      if(seen.has(key))return '';seen.add(key);return all;
    }).replace(/<article class="event-flow-article"><h4>[^<]*<\/h4>\s*<\/article>/g,'');
    const addressCopy=`<button class="event-address-copy" data-event-copy-address="${safe(item.address)}">${t[12]} ⧉</button>`;
    const body=flow.sections.map(s=>{
      if(s.key==='intro')return `<header data-flow-section="intro">${groups.intro.join('')}</header>`;
      const content=dedupe(groups[s.key].join(''));
      return content.trim()?`<section class="event-info-section event-flow-section" data-flow-section="${s.key}">${s.key==='location'?`<div class="event-flow-section-heading"><h3>${safe(s.title)}</h3>${addressCopy}</div>`:`<h3>${safe(s.title)}</h3>`}${content}</section>`:'';
    }).join('');
    const directionsUrl=`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;
    return detailShell(body,`${validCoordinates(item)?`<a class="event-directions" href="${directionsUrl}" target="_blank" rel="noopener noreferrer">${t[10]} ↗</a>`:''}${official?`<a class="event-official" href="${official}" target="_blank" rel="noopener noreferrer">${safe(event?.action||'안내 출처')} ↗</a>`:''}`);
  };
  const detailShell=(body,actions)=>`<div class="event-detail-overlay"><section class="event-detail-dialog event-flow-v3" role="dialog" aria-modal="true" aria-labelledby="eventDetailTitle" tabindex="-1"><button class="event-detail-close" data-event-detail-close aria-label="닫기">×</button><div class="event-detail-scroll"><div class="event-detail-content">${body}</div></div><footer class="event-detail-actions">${actions}</footer><span class="event-detail-feedback" role="status"></span></section></div>`;
  const buildPlace=(raw,{selected=false}={})=>{
    const webUrl=value=>typeof value==='string'&&/^https?:\/\/[^\s]+$/i.test(value)?value:'';
    const place=window.BUSAN_TOURISM_I18N?.display(raw)||raw,food=place.kind==='food',kind=food?'맛집':'관광지',info=place.visitInfo||{};
    const value=text=>text?safe(text):'<span class="event-unknown">확인 전</span>';
    const rows=(values,cls='event-place-kv')=>`<dl class="${cls}">${values.map(([label,text])=>`<div><dt>${safe(label)}</dt><dd>${value(text)}</dd></div>`).join('')}</dl>`;
    const section=(key,title,content,action='')=>`<section class="event-info-section event-flow-section" data-flow-section="${key}">${action?`<div class="event-flow-section-heading"><h3>${title}</h3>${action}</div>`:`<h3>${title}</h3>`}${content}</section>`;
    const note=text=>`<small class="event-guidance-callout">${safe(String(text).replace(/([.!?])\s+/g,'$1\n'))}</small>`;
    const mapUrl='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(place.name+' '+(place.address||''));
    const website=webUrl(place.website),rating=Number.isFinite(place.rating)&&place.rating>0&&place.rating<=5?place.rating.toFixed(1)+' / 5':null;
    const distance=Number.isFinite(place.distance)?'직선 약 '+(place.distance>=1000?(place.distance/1000).toFixed(1)+'km':place.distance+'m'):null;
    const intro=`<header data-flow-section="intro">${webUrl(place.image)?`<div class="event-detail-banner"><img src="${safe(webUrl(place.image))}" alt="${safe(place.name)}"></div>`:''}<div class="event-flow-heading"><div class="event-detail-tags"><span>${kind}${place.category?' · '+safe(place.category):''}</span></div><h2 id="eventDetailTitle" translate="no">${safe(place.name)}</h2>${place.description?`<p class="event-detail-intro" translate="no">${safe(place.description)}</p>`:''}</div></header>`;
    const summary=section('visit','방문 요약',rows([['장소',place.name],['행사장 거리',distance],...(food?[['대표 메뉴',place.menu]]:[['이용 요금',info.admission],['추천 체류',place.visitDuration]]),['휴무일',info.restdate]],'event-flow-summary'));
    const alert=section('alerts','방문 전 꼭 확인',note(food?'영업 표시는 등록된 운영시간 기준입니다. 임시휴무·공휴일·메뉴와 가격은 방문 전 매장에 확인해주세요.':'운영시간·요금·입장 조건은 현장 사정에 따라 달라질 수 있습니다. 방문 전 최신 안내를 확인해주세요.'));
    const location=section('location','장소',rows([['장소명',place.name],['주소',place.address],['주차',info.parking]])+(validCoordinates(place)?`<div id="eventVenueMap" class="event-venue-map" role="region" aria-label="${safe(place.name)} 위치 지도"></div>`:'')+note('행사장과의 거리는 직선거리 기준입니다. 실제 이동 경로는 길찾기에서 확인해주세요.'),`<button class="event-address-copy" data-event-copy-address="${safe(place.address||'')}">주소 복사 ⧉</button>`);
    const normalized=place.hoursNormalized,weekly=normalized?.validationStatus==='auto_validated'&&Array.isArray(normalized.weekly)?normalized.weekly.map(day=>[day.dayName,day.state==='closed'?'정기휴무':day.state==='unknown'?'확인 전':day.intervals.map(slot=>`${slot.open}–${slot.endDayOffset?'익일 ':''}${slot.close}${slot.lastOrder?' · 주문 마감 '+slot.lastOrder:''}`).join(' / ')]):null;
    const hours=section('admission','운영 시간',rows(weekly||[['운영시간',food?place.hours:info.usetime]],'event-hours-kv')+(food&&place.businessStatus?.label?note('현재 기준 · '+place.businessStatus.label+'\n'+(place.businessStatus.notice||'')):''));
    const details=food?section('products','대표 메뉴',`<div class="event-table-wrap"><table><thead><tr><th scope="col">항목</th><th scope="col">안내</th></tr></thead><tbody><tr><th scope="row">대표 메뉴</th><td>${value(place.menu)}</td></tr></tbody></table></div>`+note('메뉴별 가격은 매장의 최신 안내를 확인해주세요.')):place.detailDescription?section('content','관광지 소개',`<p translate="no">${safe(place.detailDescription)}</p>`):'';
    const reviews=section('reviews','별점·리뷰',rows([['등록 별점',rating]])+`<a class="event-contact" href="${safe(mapUrl)}" target="_blank" rel="noopener noreferrer">최신 별점·리뷰 확인 ↗</a>`);
    const contact=place.phone||info.infocenter;
    const sourceLabels={ko:['자료 출처','Visit Busan · 비짓부산','한국관광공사 TourAPI'],en:['Data source','Visit Busan','Korea Tourism Organization · TourAPI'],ja:['資料提供元','Visit Busan','韓国観光公社 TourAPI'],zh:['资料来源','Visit Busan','韩国旅游发展局 TourAPI'],'zh-TW':['資料來源','Visit Busan','韓國觀光公社 TourAPI']};
    const attribution=sourceLabels[state.language]||sourceLabels.en;
    const sourceLink=food?'https://www.visitbusan.net/':'https://api.visitkorea.or.kr/';
    const sourceCredit=`<p class="event-place-source" translate="no">${safe(attribution[0])} · <a class="event-contact" href="${sourceLink}" target="_blank" rel="noopener noreferrer">${safe(attribution[food?1:2])} ↗</a></p>`;
    const trust=section('trust','기타 안내',rows([['문의',contact]])+(website?`<a class="event-contact" href="${safe(website)}" target="_blank" rel="noopener noreferrer">공식 홈페이지 ↗</a>`:'')+sourceCredit);
    const directions=validCoordinates(place)?'https://www.google.com/maps/dir/?api=1&destination='+place.lat+','+place.lng:mapUrl;
    return detailShell(intro+summary+alert+location+hours+details+reviews+trust,`<a class="event-directions" href="${safe(directions)}" target="_blank" rel="noopener noreferrer">길찾기 ↗</a><button type="button" class="event-official" data-place-plan-add ${selected?'disabled':''}>${selected?'✓ 플랜에 추가됨':'플랜에 추가하기'}</button>`);
  };
  const openDetail=(item,html)=>{
    close();previousFocus=document.activeElement;
    document.querySelector('#modal').innerHTML=html;
    document.querySelector('#phone').classList.add('event-detail-open');
    mountMap(item);
    document.querySelector('.event-detail-close')?.focus({preventScroll:true});
  };
  window.BUSAN_PLACE_DETAIL_HTML=buildPlace;
  window.BUSAN_OPEN_PLACE_DETAIL=(place,options={})=>{if(!place)return;openDetail(place,buildPlace(place,options));placePlanAction=options.onAdd||null;};
  window.BUSAN_EVENT_DETAIL_HTML=build;
  window.BUSAN_OPEN_EVENT_DETAIL=item=>{
    if(!item||window.BUSAN_EVENT_WINDOW?.locationExpired(item))return;
    openDetail(item,build(item));
  };
  document.addEventListener('click',async e=>{
    if(e.target.closest('[data-place-plan-add]')){
      if(placePlanAction?.()===true){close();return;}
      const feedback=document.querySelector('.event-detail-feedback');if(feedback)feedback.textContent='드롭 플랜의 주변 장소 선택 화면에서 추가해주세요.';return;
    }
    if(e.target.closest('[data-event-saved-list]')){close();nav('saved');return;}
    if(e.target.closest('[data-event-detail-close]')||e.target.classList?.contains('event-detail-overlay'))close();
    const copy=e.target.closest('[data-event-copy-address]');if(!copy)return;
    try{await navigator.clipboard.writeText(copy.dataset.eventCopyAddress);document.querySelector('.event-detail-feedback').textContent='주소를 복사했어요';}
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
