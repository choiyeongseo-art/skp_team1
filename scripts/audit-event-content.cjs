#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const windowModel=require('../busan-drop/integration/event-window.js');
const notes={
 '올리브영':'온라인 혜택을 지점에 일괄 적용 금지. 3개 지점의 참여 확인·박스·쿠폰 조건 분리.',
 '유니클로':'제보 날짜를 방문 기간으로 사용 금지. 9개 지점의 영업시간·결제·면세 조건 개별 유지.',
 '자라':'할인 일정·할인율 미확정. 3개 지점 등록이 행사 참여 확정을 의미하지 않음.',
 '티파니앤코':'카탈로그는 있으나 상세 행사 데이터 없음. 일반 매장 안내와 실제 행사 구분.',
 '몬치치':'사은품·예약·등장 회차·상품 가격이 혼재. 2차 자료 가격/기간을 공식 확정으로 승격 금지. 지난 휴점 강조 해제.',
 '와키윌리':'종료 행사 보관. 상품별 정상가/할인가·할인 제외·구매 제한 구조화.',
 '참치학교':'팝업+푸드 교차 분류. 메뉴/중량/인분과 해체쇼 회차·식사/포장·알레르기 확인 항목 분리.',
 '원피스 무기와라 스토어':'예약/현장 대기와 방문 특전/구매 특전을 분리. 참고 상품가·구매 제한 별도.',
 '와이잭':'상품별 할인과 구매액별 추가 할인 분리. 제외 품목·중복 적용 확인.',
 '젤라또 피케':'종료 행사 보관. 모바일상품권·사은품·채널 추가·가챠의 조건을 각각 입력.',
 '리락쿠마·스미코구라시':'2027년 종료일 유지. 상품가·조건부 구매 특전·신상품 공지 구분.',
 '메이플스토리':'파크 입장료와 유료 체험/굿즈 비용 분리. 공연·포토타임 회차와 이용 제한 분리.',
 '시그니엘 부산':'4개 상품별 예약·투숙 기간·최저가 단위·인원·세금·포함/제외·취소 조건 분리. 마감 상품 개별 표시.',
 '웨스틴 조선 부산':'예약 마감 행사 보관. 숙박과 다이닝 오퍼 분리. 같은 제목의 섹션을 상품 ID로 구분.',
 '그랜드 조선 부산':'예약 마감 행사 보관. 객실/다이닝·제외일·포함 인원·추가 요금을 상품별로 관리.',
 '해리포터 마호도코로':'지점·층·행사 구역 확인. 현장 대기와 구매/방문 사은품을 구분. 온라인 상품과 현장 재고 혼동 금지.',
 '히나쿠우':'종료 행사 보관. 구매/후기 리워드·상품가·B1 실내 동선 분리. 결제 근거 재확인.',
 '달달더마켓':'종료 행사 보관. 부산 이벤트+디저트 교차 분류. 입점 브랜드와 실제 메뉴/가격·알레르기·보관 정보 구분.',
 '광안리 M 드론×레이저쇼':'하루 안의 여러 공연 회차·기상 취소·관람 구역·교통 통제·유료 좌석 여부를 항목별 확인.',
 'G-STAR':'2개 전시장 연결 유지. BTC/BTB/G-CON 이용 범위·요금·예매 마감·현장 판매 불가·연령 조건 분리.'
};
function audit(today){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(today)||Number.isNaN(Date.parse(today))||new Date(today).toISOString().slice(0,10)!==today)throw new Error('실제 달력 날짜 YYYY-MM-DD 필요');
 const sandbox={window:{}};vm.createContext(sandbox);
 for(const file of ['event-details','store-locations'])vm.runInContext(fs.readFileSync(path.join(root,'busan-drop/data',file+'.js'),'utf8'),sandbox,{timeout:2000});
 const catalog=require('../busan-drop/data/event-catalog.js');const details=sandbox.window.BUSAN_EVENT_DETAILS,locations=sandbox.window.BUSAN_STORE_LOCATIONS;
 const mapSource=fs.readFileSync(path.join(root,'busan-drop/integration/store-mapbox.js'),'utf8');
 const categoryObject=mapSource.match(/const brandCategories=(\{[\s\S]*?\n\});/);if(!categoryObject)throw new Error('카테고리 매핑을 찾지 못했습니다.');
 const categories=JSON.parse(categoryObject[1]);
 for(const match of mapSource.matchAll(/brandCategories\['([^']+)'\]=\[\.\.\.brandCategories\['[^']+'\],'([^']+)'\]/g))categories[match[1]].push(match[2]);
 const status=e=>windowModel.isExpired(e,today)?'종료/예약 마감':!e.start||!e.end?'일정 미확정':e.start>today?'예정':'진행/예약 중';
 const rows=catalog.map(e=>{
  const detail=details[e.brand];const unknown=['fee','foreign','payment','taxFree','passport'].filter(k=>detail?.[k]==null);
  const issues=[];if(!detail)issues.push('상세 데이터 없음');if(!detail?.checked)issues.push('상세 전체 확인일 없음');if(unknown.length)issues.push('기본 5항목 미입력: '+unknown.join(', '));
  if(e.scheduleStatus==='confirmed'&&/2차|대조 필요/.test(detail?.dateNote||''))issues.push('카탈로그 confirmed와 상세의 2차 출처 표현 충돌');
  const titles=detail?.sections?.map(s=>s.title)||[];if(new Set(titles).size<titles.length)issues.push('중복 섹션 제목');
  const offers=e.offers||[];const endedOffers=offers.filter(o=>o.bookingEnd&&o.bookingEnd<today).length;
  if(endedOffers&&endedOffers<offers.length)issues.push(`상품별 예약 마감 혼재 ${endedOffers}/${offers.length}`);
  return {id:e.id,brand:e.brand,categories:categories[e.brand]||[],status:status(e),start:e.start,end:e.end,locations:locations.filter(v=>v.brand===e.brand).length,detailPresent:!!detail,checked:detail?.checked||null,unknown,legacySectionOrder:titles,issues,review:notes[e.brand]||'추가 검토 필요',offers:offers.length,endedOffers};
 });
 const branches=locations.map(v=>{const e=catalog.find(e=>e.brand===v.brand),d={...details[v.brand],...v.eventOverrides};return {id:v.id,event_id:e?.id||null,brand:v.brand,name:v.name,address:v.address,coordinatesValid:Number.isFinite(v.lat)&&Number.isFinite(v.lng)&&Math.abs(v.lat)<=90&&Math.abs(v.lng)<=180,participation:v.eventParticipation||v.profile?.eventParticipation||'unknown',overrides:Object.keys(v.eventOverrides||{}),unknown:['fee','foreign','payment','taxFree','passport'].filter(k=>d[k]==null),visible:!!e&&!windowModel.isExpired(e,today)&&!windowModel.isExpired(v.eventOverrides,today)};});
 const categoryCounts=Object.fromEntries(['로컬','팝업','패션','뷰티','푸드','디저트','숙박'].map(c=>[c,{registered:rows.filter(r=>r.categories.includes(c)).length,visible:rows.filter(r=>r.categories.includes(c)&&r.status!=='종료/예약 마감').length}]));
 return {as_of:today,scope:'로컬 등록 데이터 구조·누락 검수. 공식 사이트 최신 사실 재확인/운영 DB 조회 아님.',source_root:root,summary:{events:rows.length,visibleEvents:rows.filter(r=>r.status!=='종료/예약 마감').length,locations:branches.length,visibleLocations:branches.filter(b=>b.visible).length,details:Object.keys(details).length,categoryCounts},events:rows,branches,legacySnapshot:{catalog,details,locations}};
}
function markdown(a){
 const esc=v=>String(v??'').replaceAll('|','\\|').replaceAll('\n',' ');
 return ['# BUSAN DROP 등록 행사 전수 검수',`기준일: ${a.as_of} (Asia/Seoul)`,a.scope,'',`등록 ${a.summary.events}개 / 종료 제외 ${a.summary.visibleEvents}개 / 지점 연결 ${a.summary.locations}개 / 종료 제외 ${a.summary.visibleLocations}개. 상세 데이터 ${a.summary.details}개. 카테고리 중복 집계 허용.`,
 '|행사|카테고리|상태|지점|문제·재입력 기준|','|---|---|---|---:|---|',...a.events.map(e=>`|${esc(e.brand)}|${e.categories.join('·')}|${e.status}|${e.locations}|${esc([...e.issues,e.review].join(' / '))}|`),'',
 '## 지점별 검수','|지점 ID|행사|참여 확인 표기|개별 덮어쓰기|미입력 항목|','|---|---|---|---|---|',...a.branches.map(b=>`|${b.id}|${b.brand}|${b.participation}|${b.overrides.join(', ')}|${b.unknown.join(', ')}|`),'',
 '## 해석 주의','- confirmed/reported 등은 기존 코드의 상태값이며 이번에 공식 확인했다는 뜻이 아니다.','- 위치 등록, 행사 참여, 외국인 예약 가능 여부는 서로 다른 사실이다.','- 식품·숙박·결제 정보는 카테고리/브랜드 이름만으로 추정하지 않는다.','- 원본 스냅샷은 audit.json의 legacySnapshot에 보관한다. 기존 행사 내용을 자동 승격·이관하지 않는다.',''].join('\n');
}
if(require.main===module){try{const today=process.argv[2],out=process.argv[3];if(!out)throw new Error('node scripts/audit-event-content.cjs YYYY-MM-DD <새 출력 폴더>');if(fs.existsSync(out))throw new Error('출력 폴더가 이미 존재합니다. 새 경로 필요');const a=audit(today);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(a,null,2)+'\n');fs.writeFileSync(path.join(out,'audit.md'),markdown(a));console.log(JSON.stringify(a.summary,null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={audit,markdown};
