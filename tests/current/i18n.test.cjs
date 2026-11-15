const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const base=__dirname+'/../../busan-drop/';
function translator(language){const context={window:{},state:{language},document:{addEventListener(){}},MutationObserver:class{},queueMicrotask,WeakMap,Map,Set};for(const file of ['data/i18n-translations.js','data/i18n-overrides.js','language.js','integration/i18n.js'])vm.runInNewContext(fs.readFileSync(base+file,'utf8'),context);return context.translateText;}
test('every collected application and event string has four nonempty foreign-language translations',()=>{const sources=JSON.parse(fs.readFileSync(base+'data/i18n-source.json')),dictionary=JSON.parse(fs.readFileSync(base+'data/i18n-translations.json'));for(const row of sources)for(const language of ['en','ja','zh-CN','zh-TW']){assert.ok(dictionary[row.text]?.[language]?.trim(),language+': '+row.text);assert.ok(!/\[\[ID_/.test(dictionary[row.text][language]));}});
test('five languages include Traditional Chinese with curated event and control wording',()=>{const t=translator('zh-TW');assert.equal(t('전체 보기 ↗'),'查看全部 ↗');assert.equal(t('원이 스타일 팝업'),'WONI 風格快閃店');assert.equal(t('올영 블랙프라이데이'),'OLIVE YOUNG 黑色星期五');assert.equal(t('드롭 플랜'),'日程計劃');assert.equal(translator('ko')('행사 고르기'),'행사 고르기');});
test('dynamic counts do not expose Korean suffixes or change numeric values',()=>{const en=translator('en');assert.equal(en('4단계 중 4단계'),'Step 4 of 4');assert.equal(en('추가'),'Add');assert.equal(en('146곳'),'146 places');assert.equal(en('행사 3곳 · 플레이스 2곳'),'3 events · 2 places');assert.equal(en('부산 드롭 플랜 01'),'Busan Drop Plan 01');assert.equal(translator('ja')('3개 지점에서 위치 확인'),'3店舗の所在地');});
test('all catalog event names have full translations and IDs/dates are preserved by the translator',()=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(base+'data/event-catalog.js','utf8'),context);for(const language of ['en','ja','zh','zh-TW']){const t=translator(language);for(const event of context.window.BUSAN_EVENT_CATALOG)assert.ok(!/[가-힣]/.test(t(event.title)),event.title);assert.equal(t('gelatopique-busan-202611'),'gelatopique-busan-202611');assert.equal(t('2026-11-07'),'2026-11-07');}});

test('new review, wishlist and food tools are translated in all four foreign languages',()=>{for(const lang of ['en','ja','zh','zh-TW']){const t=translator(lang);for(const source of ['전체 일정 확인','관심 저장','플랜 수정하기 ↗','맛집 검색','계정 및 설정','12 / 58곳 표시','현재 위치에서 길찾기 ↗','방문 완료 · 다음 장소 보기 ✓','어떻게 사용하나요?'])assert.ok(!/[가-힣]/.test(t(source)),lang+': '+source);}});

test('venue flow copy and dynamic counters cover all foreign languages without assigning dates',()=>{for(const lang of ['en','ja','zh','zh-TW']){const t=translator(lang);for(const text of ['행사마다 종료일이 달라요. 각 행사의 기간을 확인하고 방문해주세요.','행사장별 플랜 확인','첫 행사장 주변 둘러보기','음식점 추천받기','다음 행사장 둘러보기','행사장 2 / 3 · 맛집','행사장 1 / 2','2개 행사장','길찾기·방문 완료 사용하기'])assert.ok(!/[가-힣]/.test(t(text)),lang+': '+text);assert.match(t('행사장 2 / 3 · 맛집'),/2 \/ 3/);}});
test('account settings, login guidance and plan deletion copy are translated in all foreign languages',()=>{for(const lang of ['en','ja','zh','zh-TW']){const t=translator(lang);for(const source of ['로그인하고 플랜 만들기','5개 언어 지원','플랜 이용 방법과 저장 안내','저장한 플랜을 열어 확인하거나 수정·삭제하세요.','플랜을 삭제할까요?','선택한 플랜과 방문 완료 기록이 삭제돼요. 삭제 후에는 되돌릴 수 없어요.','플랜 삭제','현재 로그인은 체험용이며, 플랜은 이 브라우저에만 저장돼요.'])assert.ok(!/[가-힣]/.test(t(source)),lang+': '+source);}});

test('separate event, sight and restaurant totals retain counts in all five languages',()=>{
 const source='행사 3곳 · 관광지 2곳 · 맛집 4곳';
 assert.equal(translator('ko')(source),source);
 assert.equal(translator('en')(source),'3 events · 2 sights · 4 restaurants');
 for(const language of ['ja','zh','zh-TW']){const text=translator(language)(source);assert.doesNotMatch(text,/[가-힣]/);assert.deepEqual(text.match(/\d+/g),['3','2','4']);}
});
test('review trip labels and venue/sight/food schedule support all UI languages',()=>{
 for(const language of ['en','ja','zh','zh-TW']){const t=translator(language);for(const text of ['내 여행기간','방문 스케줄','행사장 2곳 · 관광지 5곳 · 맛집 4곳'])assert.doesNotMatch(t(text),/[가-힣]/);assert.deepEqual(t('행사장 2곳 · 관광지 5곳 · 맛집 4곳').match(/\d+/g),['2','5','4']);}
});

test('settings logout and guide next-stop labels translate as standalone text nodes',()=>{for(const language of ['en','ja','zh','zh-TW']){const t=translator(language);for(const label of ['설정','언어 설정','서비스 및 약관','서비스 안내','로그인','로그아웃','다음 목적지'])assert.doesNotMatch(t(label),/[가-힣]/);assert.doesNotMatch(t('로그아웃 ↗'),/[가-힣]/);}assert.equal(translator('en')('로그아웃'),'Log out');assert.equal(translator('en')('다음 목적지'),'Next stop');assert.equal(translator('ko')('로그아웃'),'로그아웃');});

test('banner names and fan terminology retain their intended meanings in each locale',()=>{const woni='이번 가을, 원이처럼 입어볼까?',fans='해덕들 주목! 마법 한 스푼을 일상에';for(const lang of ['en','ja','zh','zh-TW']){const t=translator(lang);assert.match(t(woni),/RESCENE/);assert.match(t(woni),lang==='ja'?/ウォニ/:/WONI/);assert.doesNotMatch(t(fans),/Haedeok|sea lovers|해덕/i);for(const s of ['저장을 취소할까요?','계속 저장','저장 취소','모든 부산 쇼핑 정보는 부산드랍에서.'])assert.doesNotMatch(t(s),/[가-힣]/);}assert.match(translator('en')(fans),/Potterheads/);assert.match(translator('ja')(fans),/ハリポタファン/);for(const lang of ['zh','zh-TW'])assert.match(translator(lang)(fans),/哈迷/);});

test('event branch selection and purchase gifts use complete, curated translations',()=>{
 const expected={en:['Choose a location to visit','Gift with purchase','Advertised gift'],ja:['訪問する店舗を選択','購入特典','案内されている特典'],zh:['选择到访门店','购物赠品','公布的赠品'],'zh-TW':['選擇到訪門店','購物贈品','公布的贈品']};
 for(const [lang,values] of Object.entries(expected)){
  const t=translator(lang);
  ['방문 지점 선택','구매 사은품','안내된 사은품'].forEach((source,i)=>assert.equal(t(source),values[i]));
  assert.doesNotMatch(t('국제게임전시회 지스타 2026 · 방문 지점 선택'),/[가-힣]/);
 }
});

test('every venue detail text node and accessible label translates in all five languages',()=>{
 const context={window:{},state:{language:'ko'},brands:[],esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),document:{activeElement:null,addEventListener(){}},MutationObserver:class{},queueMicrotask,WeakMap,Map,Set};
 vm.createContext(context);
 for(const file of ['data/i18n-translations.js','data/i18n-overrides.js','language.js','integration/i18n.js','data/event-details.js','data/store-locations.js','data/event-display-flow.js','integration/event-detail-popup.js'])vm.runInContext(fs.readFileSync(base+file,'utf8'),context);
 for(const lang of ['ko','en','ja','zh','zh-TW']){
  context.state.language=lang;
  for(const venue of context.window.BUSAN_STORE_LOCATIONS){
   const html=context.window.BUSAN_EVENT_DETAIL_HTML(venue).replace(/<span translate="no">[^<]*<\/span>/g,'');
   const decode=text=>text.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&lt;','<');
   const nodes=[...html.split(/<[^>]*>/g),...Array.from(html.matchAll(/(?:aria-label|alt|title)="([^"]*)"/g),match=>match[1])].map(decode).filter(text=>/[가-힣]/.test(text));
   for(const source of nodes){const result=context.translateText(source);if(lang==='ko')assert.equal(result,source);else assert.doesNotMatch(result,/[가-힣]/,lang+': '+venue.id+': '+source);}
   // Headers stay canonical until DOM translation, including Traditional Chinese.
   if(html.includes('event-contact'))assert.match(html,/<dt>문의<\/dt>/,venue.id);
  }
 }
});

 test('saved-plan navigation, route descriptions and dynamic progress translate in four locales',()=>{
 for(const language of ['en','ja','zh','zh-TW']){const t=translator(language);
 for(const source of ['전체 플랜 경로에서 행사장 선택','마이페이지','마지막 코스','전체 플랜 경로','모든 방문 장소를 전체 순서대로 연결했어요.','번호와 점선을 따라 동선을 확인하세요.','연결선은 방문 순서를 표시하는 직선이며, 실제 도로 경로와 다를 수 있어요.','관광지 자세히 보기','맛집 자세히 보기','이 장소를 정말 삭제할까요?','Google Maps에서 열려요. 위치 권한을 허용해주세요.','주변 관광지 · 맛집 변경하기']) assert.doesNotMatch(t(source),/[가-힣]/,language+': '+source);
 for(const source of ['선택한 7곳 중 2곳 방문했어요','선택한 7곳 중 2곳 방문 완료','2 / 7 방문 완료','관광지 3곳 · 맛집 4곳','행사장 2곳 · 전체 방문 장소 7곳','다음 코스까지 직선 1.6km','다음 장소까지 직선 702m']){const result=t(source);assert.doesNotMatch(result,/[가-힣]/,language+': '+source);assert.deepEqual(result.match(/[\d.]+/g)?.sort(),source.match(/[\d.]+/g)?.sort());}
 }
 assert.equal(translator('en')('선택한 7곳 중 2곳 방문했어요'),'2 of 7 selected stops visited');
 });

test('drop-plan milestones, cuisine filters and review guidance translate as complete text nodes',()=>{
 const dynamic=['총 2개 행사의 플랜을 만들고 있어요','행사장 2 / 2 · 와이잭 동부산점 팝업스토어','행사장 2 · 와이잭 동부산점 팝업스토어','7단계 · 플랜 확인·저장 / 전체 7단계','1단계 · 방문 일정','다음 · 행사 선택','다음 · 플랜 확인·저장','8개 행사'];
 const source=fs.readFileSync(base+'integration/shopping-pass.js','utf8');
 const literals=[...new Set([...source.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m=>m[1]).filter(t=>!/[<>${}]/.test(t)))].filter(t=>!['단계','개 행사장','다음 · '].includes(t));
 for(const lang of ['en','ja','zh','zh-TW']){const t=translator(lang);for(const text of [...dynamic,...literals])assert.doesNotMatch(t(text),/[가-힣]/,lang+': '+text);}
});

test('rendered milestone text and accessibility labels translate at preparation, each venue and review',()=>{
 const s=fs.readFileSync(base+'integration/shopping-pass.js','utf8');
 const c={esc:String,hasVisit:()=>true,currentStep:()=>c.step,selection:()=>c.selected,milestoneOpen:true};vm.createContext(c);vm.runInContext(s.slice(s.indexOf(' function milestoneState('),s.indexOf(" document.addEventListener('toggle'")),c);
 const route=Array.from({length:2},()=>({campaign:{title:'와이잭 동부산점 팝업스토어'}}));
 for(const lang of ['en','ja','zh','zh-TW']){const t=translator(lang);for(const [step,index,review,venues] of [[1,0,false,[]],[1,0,false,route],[3,0,false,route],[4,0,false,route],[3,1,false,route],[4,1,false,route],[4,1,true,route]]){c.step=step;c.selected={venueIndex:index,review};const html=c.milestone(venues);for(const text of [...html.split(/<[^>]*>/g),...Array.from(html.matchAll(/aria-(?:label|valuetext)="([^"]*)"/g),m=>m[1])].filter(t=>/[가-힣]/.test(t)))assert.doesNotMatch(t(text),/[가-힣]/,lang+': '+text);}}
});
