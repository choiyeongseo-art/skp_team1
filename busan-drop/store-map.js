/* Deliberately fictional store data; replace with verified records for launch. */
const demoStoreAreas=[
  {area:'서면',x:49,y:57,days:'월–일',hours:'10:30 – 22:00',closed:'연중무휴 (시연)'},
  {area:'센텀',x:70,y:49,days:'월–일',hours:'10:30 – 20:00',closed:'월 1회 휴무 (시연)'},
  {area:'남포',x:42,y:74,days:'월–토',hours:'11:00 – 21:00',closed:'일요일 (시연)'},
  {area:'기장',x:81,y:29,days:'월–일',hours:'10:00 – 21:00',closed:'연중무휴 (시연)'},
  {area:'해운대',x:77,y:55,days:'월–일',hours:'10:30 – 21:00',closed:'연중무휴 (시연)'},
  {area:'송도',x:34,y:82,days:'월–일',hours:'11:00 – 20:00',closed:'연중무휴 (시연)'}
];
const mapDestinations=[{name:'해운대',x:77,y:55},{name:'서면',x:49,y:57},{name:'남포동',x:42,y:74},{name:'송도',x:34,y:82},{name:'기장',x:81,y:29}];
let mapFocusRequested=null;
function selectMapRegion(name){if(state.mapRegion===name){resetMapCamera();state.store=null;render();return}const region=mapDestinations.find(r=>r.name===name);if(!region)return;state.mapRegion=name;state.store=null;mapFocusRequested=region;render()}
function storePinArt(){
 if(state.mapLocal)return '<path data-pin-art="local" d="M8 8h8v7H8zM10 8V6h4v2" fill="none" stroke="#171717" stroke-width="1.5"/>';
 if(state.brand===1)return '<g data-pin-art="beauty" fill="none" stroke="#171717" stroke-width="1.25" stroke-linejoin="round"><path d="M6.8 9.2h4.3v6H6.8zM7.5 9.2V6.4L10.3 5v4.2M13 8h4.2v7.2H13zM13.8 8V5.8h2.6V8M13.2 12.8h3.8"/></g>';
 return `<g data-pin-art="fashion" transform="translate(5 3.5) scale(.22)" fill="none" stroke="#383932" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="${tshirtPath()}"/><path d="M25 13Q32 22 39 13M21 49h22"/></g>`;
}

function validStoreKey(key){return typeof key==='string'&&/^(topten|oliveyoung|uniqlo|zara|local):[0-5]$/.test(key)}
function storeSaveKey(index){return (state.mapLocal?'local':['topten','oliveyoung','uniqlo','zara'][state.brand])+':'+index}
function isStoreSaved(index){return state.savedStores.has(storeSaveKey(index))}
function visibleMapStores(){return demoStoreAreas.map((store,index)=>({...store,index})).filter(store=>!state.savedStoresOnly||isStoreSaved(store.index))}
function toggleStoreSave(index){if(!Number.isInteger(index)||!demoStoreAreas[index])return;const key=storeSaveKey(index),adding=!state.savedStores.has(key);adding?state.savedStores.add(key):state.savedStores.delete(key);if(!adding&&state.savedStoresOnly)state.store=null;persist();render()}

function storeMap(){
  const selected=state.store??null,list=visibleMapStores(),savedCount=demoStoreAreas.filter((_,i)=>isStoreSaved(i)).length,b=state.mapLocal?{name:'부산 로컬'}:brands[state.brand],store=list.some(s=>s.index===selected)?demoStoreAreas[selected]:null;
  return `<section class="store-map-screen"><div class="map-topbar">${state.mapShowBack?`<button class="map-icon-button" data-action="back" aria-label="뒤로">${icon('back')}</button>`:''}</div><nav class="map-brand-tabs" aria-label="지도 브랜드관 선택"><button data-map-local="true" class="${state.mapLocal?'active':''}" aria-pressed="${!!state.mapLocal}">BUSAN</button>${brands.map((brand,i)=>`<button data-map-brand="${i}" class="${!state.mapLocal&&i===state.brand?'active':''}" aria-pressed="${!state.mapLocal&&i===state.brand}">${brand.name}</button>`).join('')}</nav><nav class="map-region-tabs" style="animation-delay:-${Math.min(4000,Math.max(0,Date.now()-mapEntryAt))}ms" aria-label="부산 여행 지역 선택">${mapDestinations.map(r=>`<button data-map-region="${r.name}" class="${state.mapRegion===r.name?'active':''}" aria-pressed="${state.mapRegion===r.name}">${r.name}</button>`).join('')}</nav><section class="store-map immersive-map" id="storeCanvas" aria-label="부산 전역 시연용 약도. 드래그하여 이동, 스크롤이나 두 손가락으로 확대 및 축소"><div class="map-world"><svg viewBox="0 0 600 1000" preserveAspectRatio="xMidYMid meet" role="img" aria-label="텍스트 없는 부산 시연용 약도. 실제 지형과 위치는 다릅니다.">
  <rect width="600" height="1000" fill="#101010"/>
  <path d="M0 0H600V168C563 207 583 255 549 310S531 392 496 448 487 494 451 537 423 568 410 617 364 658 346 704 318 739 285 773 254 816 232 851 190 884 168 939L0 966Z" fill="#191919"/>
  <path d="M204-20C183 92 219 160 177 253S133 382 146 467 113 620 99 712 86 869 54 1020" fill="none" stroke="#0c0c0c" stroke-width="21"/>
  <path d="M303 776C325 765 348 790 357 817S348 872 323 884L284 857 276 815Z" fill="#191919"/>
  <g fill="none" stroke="#252525" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M-20 97C83 119 115 60 184 75S291 111 346 56 487 68 615 12M-20 168C53 149 101 205 175 163S300 176 381 131 522 174 620 124M-20 250C72 216 99 274 164 244S277 219 337 249 462 205 573 238M-20 334C66 296 110 350 173 318S282 325 357 289 461 320 550 292M-20 406C75 370 126 412 181 395S279 365 359 391 435 350 524 382M-20 491C84 460 122 513 198 472S314 503 388 457 472 460 508 432M-20 581C68 540 115 578 184 550S286 577 347 542 417 550 463 520M-20 658C64 621 102 663 169 635S284 666 332 625 390 621 419 589M-20 741C66 701 101 758 161 718S253 735 305 700 352 687 375 664M-20 825C43 789 89 825 131 803S219 799 265 773 302 763 330 739M-20 917C44 876 81 912 116 888S194 878 230 841"/>
  <path d="M40-20C69 72 27 146 56 223S38 341 65 425 36 535 61 631 34 756 58 839 35 924 47 1010M112-20C143 64 99 139 124 218S100 334 126 416 105 521 127 613 101 724 122 812 97 899 110 982M269-20C241 78 275 141 254 214S283 324 252 404 280 514 249 588 263 694 234 767 238 854 207 913M346-20C324 79 357 142 329 217S359 323 327 407 345 510 315 580 322 657 295 727M424-20C395 70 430 142 403 211S424 313 394 391 411 473 379 547 389 614 358 677M510-20C476 74 518 154 486 225S498 329 468 400 473 469 443 524"/>
  <path d="M37 103L122 163 56 223 164 244 126 318 252 365 181 395 249 472 184 550 249 588 169 635 234 718 131 803M269 75L346 131 254 214 337 249 327 318 394 365 327 407 388 457 315 503 347 542 315 625M424 56L486 131 403 176 486 225 403 289 468 334 394 391 443 432"/>
  </g>
  <g fill="none" stroke="#353535" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M-30 704C63 666 117 644 173 613S246 591 294 570 349 529 420 490 474 431 490 369 513 292 538 236 577 145 618 103"/>
  <path d="M289-20C278 90 300 161 283 241S311 389 291 465 308 536 294 570 283 658 268 708 247 775 218 849 185 920 174 1020"/>
  <path d="M-20 378C68 393 126 367 176 390S252 432 291 465 368 473 420 490 450 531 438 579"/>
  <path d="M96-20C93 82 152 147 177 253S223 349 251 404 280 470 294 570 340 629 346 704"/>
  <path d="M-20 895C72 858 124 817 173 778S237 741 268 708 315 684 346 704M337 39C405 66 456 87 512 128S563 172 600 168"/>
  </g></svg></div><div class="map-pin-layer">
  ${list.map(s=>{const i=s.index;return `<button class="store-pin ${selected===i?'selected':''}" style="left:${s.x}%;top:${s.y}%" data-store="${i}" aria-label="${b.name} ${s.area} 시연점 정보${isStoreSaved(i)?' · 저장한 매장':''}" aria-pressed="${selected===i}"><span class="pin-glyph"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22S3 15 3 9a9 9 0 1 1 18 0c0 6-9 13-9 13Z" fill="currentColor" class="store-pin-shape"/>${storePinArt()}</svg></span></button>`}).join('')}</div></section>
  ${state.savedStoresOnly&&list.length===0?`<div class="map-saved-empty" role="status">${icon('heart')}<strong>${b.name}에 저장한 매장이 없어요</strong><p>매장 핀을 누르고 하트로 저장해보세요.</p><button data-saved-stores-only="true">전체 매장 보기</button></div>`:''}
  <div class="map-zoom" aria-label="지도 확대와 축소"><button class="map-icon-button" data-map-zoom="in" aria-label="지도 확대">+</button><button class="map-icon-button" data-map-zoom="out" aria-label="지도 축소">−</button><button class="map-icon-button map-saved-toggle ${state.savedStoresOnly?'active':''}" data-saved-stores-only="true" aria-label="저장한 매장만 보기" title="${b.name} 저장한 매장 ${savedCount}곳" aria-pressed="${state.savedStoresOnly}">${icon('heart')}</button></div><small class="map-demo-note sr-only">부산 · 시연용 약도</small>
  ${store?`<article class="map-store-peek" aria-live="polite"><div><span class="map-store-demo">시연 매장</span><h3>${b.name} ${store.area} 시연점</h3><p><span class="sr-only">운영 요일 </span>${store.days} · <span class="sr-only">운영 시간 </span>${store.hours}</p><small>${store.closed}</small></div><div class="map-store-actions"><button class="store-save-action ${isStoreSaved(selected)?'saved':''}" data-store-save="${selected}" aria-label="${isStoreSaved(selected)?'매장 저장 해제':'매장 저장'}" aria-pressed="${isStoreSaved(selected)}">${icon('heart')}</button><button class="map-icon-button" data-map-dismiss="true" aria-label="매장 정보 닫기">×</button></div></article>`:''}</section>`;
}

let mapEntryAt=0;
let mapCamera={zoom:1.25,x:0,y:0};
function resetMapCamera(){mapCamera={zoom:1.25,x:0,y:0};mapFocusRequested=null;state.mapRegion=null}
function clampMapCamera(width,height,worldWidth=width,worldHeight=height){
  mapCamera.zoom=Math.max(1,Math.min(4,mapCamera.zoom));
  const maxX=Math.max(0,(worldWidth*mapCamera.zoom-width)/2),maxY=Math.max(0,(worldHeight*mapCamera.zoom-height)/2);
  mapCamera.x=Math.max(-maxX,Math.min(maxX,mapCamera.x));
  mapCamera.y=Math.max(-maxY,Math.min(maxY,mapCamera.y));
  if(mapCamera.zoom===1){mapCamera.x=0;mapCamera.y=0}
}
function bindStoreMap(){
  if(state.screen!=='stores')return;
  const canvas=document.querySelector('#storeCanvas'),world=canvas?.querySelector('.map-world');
  if(!world)return;
  const controls=document.querySelector('.map-zoom');
  function paint(){
    const worldWidth=Math.max(canvas.clientWidth,canvas.clientHeight*.6),worldHeight=worldWidth/.6;
    world.style.width=canvas.clientWidth+'px';world.style.height=canvas.clientHeight+'px';
    clampMapCamera(canvas.clientWidth,canvas.clientHeight,worldWidth,worldHeight);
    // Change SVG viewBox rather than scaling a browser-composited texture.
    const svg=world.querySelector('svg'),scale=worldWidth/600*mapCamera.zoom;
    const viewWidth=canvas.clientWidth/scale,viewHeight=canvas.clientHeight/scale;
    svg.setAttribute('viewBox',`${300-viewWidth/2-mapCamera.x/scale} ${500-viewHeight/2-mapCamera.y/scale} ${viewWidth} ${viewHeight}`);
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    world.style.transform='none';
    canvas.querySelectorAll('.store-pin').forEach(pin=>{
      const point=demoStoreAreas[Number(pin.dataset.store)];
      // Keep the larger entry-size marker fixed at every map zoom.
      const size=50;
      pin.style.width=(size+12)+'px';pin.style.height=(size*1.1875+12)+'px';
      const glyph=pin.querySelector('.pin-glyph'),marker=pin.querySelector('svg');
      glyph.style.width=size+'px';glyph.style.height=(size*1.1875)+'px';
      marker.style.width=size+'px';marker.style.height=(size*1.1875)+'px';
      pin.style.left=(canvas.clientWidth/2+mapCamera.x+(point.x/100-.5)*worldWidth*mapCamera.zoom)+'px';
      pin.style.top=(canvas.clientHeight/2+mapCamera.y+(point.y/100-.5)*worldHeight*mapCamera.zoom)+'px';
    });
    controls.querySelector('[data-map-zoom="out"]').disabled=mapCamera.zoom<=1;
    controls.querySelector('[data-map-zoom="in"]').disabled=mapCamera.zoom>=4;
  }
  function zoomTo(next,px=canvas.clientWidth/2,py=canvas.clientHeight/2){
    const old=mapCamera.zoom,z=Math.max(1,Math.min(4,next)),ax=px-canvas.clientWidth/2,ay=py-canvas.clientHeight/2;
    mapCamera.x=ax-(ax-mapCamera.x)*z/old;mapCamera.y=ay-(ay-mapCamera.y)*z/old;mapCamera.zoom=z;paint();
  }
  controls.querySelectorAll('[data-map-zoom]').forEach(button=>button.addEventListener('click',()=>zoomTo(mapCamera.zoom*(button.dataset.mapZoom==='in'?1.4:1/1.4))));
  canvas.addEventListener('wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();zoomTo(mapCamera.zoom*Math.exp(-e.deltaY*.002),e.clientX-r.left,e.clientY-r.top)},{passive:false});
  const pointers=new Map();let gesture=null,dragged=false;
  const distance=()=>{const [a,b]=[...pointers.values()];return Math.hypot(a.x-b.x,a.y-b.y)};
  function baseline(){const a=[...pointers.values()][0];gesture=a?{x:a.x,y:a.y,camX:mapCamera.x,camY:mapCamera.y,zoom:mapCamera.zoom,distance:pointers.size>1?distance():0}:null}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});dragged=false;baseline();if(!e.target.closest('button'))canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId)||!gesture)return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size>1){dragged=true;const r=canvas.getBoundingClientRect(),p=[...pointers.values()];zoomTo(gesture.zoom*distance()/Math.max(1,gesture.distance),(p[0].x+p[1].x)/2-r.left,(p[0].y+p[1].y)/2-r.top)}
    else{const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(Math.abs(dx)+Math.abs(dy)>5)dragged=true;mapCamera.x=gesture.camX+dx;mapCamera.y=gesture.camY+dy;paint()}
  });
  function finish(e){pointers.delete(e.pointerId);baseline()}
  canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
  canvas.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopPropagation();dragged=false}},true);
  canvas.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;e.preventDefault();const r=canvas.getBoundingClientRect();zoomTo(mapCamera.zoom<4?mapCamera.zoom*1.5:1,e.clientX-r.left,e.clientY-r.top)});
  if(mapFocusRequested){const r=mapFocusRequested,w=Math.max(canvas.clientWidth,canvas.clientHeight*.6),h=w/.6;mapCamera.zoom=2;mapCamera.x=(.5-r.x/100)*w*2;mapCamera.y=(.5-r.y/100)*h*2+45;mapFocusRequested=null}
  paint();
}
