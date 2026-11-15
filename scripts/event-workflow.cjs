#!/usr/bin/env node
'use strict';
// Offline research intake. No network, database writes, or automatic publishing.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const contract=require('../internal/event-workflow/contract.json');
const unknown=()=>({status:'unknown',value:null,sources:[]});
const fail=m=>{throw new Error(m);};
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const url=v=>{try{return ['https:','http:'].includes(new URL(v).protocol);}catch{return false;}};
function write(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,typeof data==='string'?data:JSON.stringify(data,null,2)+'\n',{flag:'wx'});}
function template(id,category,venueId){
 if(!/^[a-z0-9][a-z0-9-]*$/.test(id))fail('id는 영문 소문자·숫자·하이픈으로 입력하세요.');
 if(!contract.categories[category])fail('카테고리: '+Object.keys(contract.categories).join(', '));
 if(!venueId)fail('지점별 초안이므로 venue-id가 필요합니다.');
 return {schema_version:3,id,venue_id:venueId,category,secondary_categories:[],publication_status:'draft',
  sections:Object.fromEntries(contract.sections.map(s=>[s.key,Object.fromEntries(s.fields.map(f=>[f.key,unknown()]))])),
  category_details:Object.fromEntries(Object.keys(contract.category_profiles[category]).map(k=>[k,unknown()]))};
}
function validate(d,{ready=false}={}){
 const errors=[],warnings=[];const err=(p,m)=>errors.push(`${p}: ${m}`);
 function value(v,type,p){
  if(v===null)return; // Row member explicitly unknown; never coerce to zero/false.
  if(type==='i18n'){
   if(!v||typeof v!=='object'||Array.isArray(v)||typeof v.ko!=='string'||!v.ko.trim())err(p,'비어 있지 않은 ko 번역 필요');
   else {for(const k of Object.keys(v))if(!contract.locales.includes(k)||typeof v[k]!=='string'||!v[k].trim())err(p,`잘못된 언어/번역 ${k}`);for(const k of contract.locales)if(!v[k])warnings.push(`${p}: ${k} 번역 미입력`);}
  } else if(type==='range'){
   if(!v||!date(v.start)||!date(v.end)||v.end<v.start)err(p,'유효한 start/end 날짜 범위 필요');
  } else if(type==='coordinates'){
   if(!v||!Number.isFinite(v.lat)||!Number.isFinite(v.lng)||Math.abs(v.lat)>90||Math.abs(v.lng)>180||!['building','entrance','venue','approximate'].includes(v.basis))err(p,'유효한 lat/lng 및 basis(building/entrance/venue/approximate) 필요');
  } else if(type.startsWith('rows:')){
   const schema=contract.rows[type.slice(5)];
   if(!Array.isArray(v))return err(p,'배열 필요');
   v.forEach((row,i)=>fact(row,'row',`${p}[${i}]`,schema));
   const ids=v.map(r=>r?.value?.id).filter(Boolean);if(new Set(ids).size!==ids.length)err(p,'행 ID 중복');
  } else if(type==='money'&&(!Number.isFinite(v)||v<0))err(p,'0 이상 숫자 필요');
  else if(type==='integer'&&(!Number.isInteger(v)||v<0))err(p,'0 이상 정수 필요');
  else if(type==='boolean'&&typeof v!=='boolean')err(p,'boolean 필요');
  else if(type==='date'&&!date(v))err(p,'실제 달력 날짜 YYYY-MM-DD 필요');
  else if(type==='time'&&(typeof v!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)))err(p,'HH:mm 필요');
  else if(type==='currency'&&(typeof v!=='string'||!(/^[A-Z]{3}$/).test(v)))err(p,'통화 코드 필요(KRW 등)');
  else if(type==='url'&&!url(v))err(p,'http(s) URL 필요');
  else if(type==='text'&&(typeof v!=='string'||!v.trim()))err(p,'비어 있지 않은 문자열 필요');
  else if(type==='object'&&(!v||typeof v!=='object'||Array.isArray(v)))err(p,'객체 필요');
 }
 function fact(f,type,p,rowSchema){
  if(!f||typeof f!=='object'||Array.isArray(f)||!contract.statuses.includes(f.status))return err(p,'status/value/sources 구조 필요');
  for(const k of Object.keys(f))if(!['status','value','sources','note'].includes(k))err(p,`정의되지 않은 키 ${k}`);
  if(!Array.isArray(f.sources))err(p,'sources 배열 필요');
  if(['unknown','not_applicable'].includes(f.status)){
   if(f.value!==null)err(p,'미확인/해당 없음의 value는 null이어야 함');
   if(f.status==='not_applicable'&&!(typeof f.note==='string'&&f.note.trim()))err(p,'해당 없음의 근거 note 필요');
   if(f.status==='unknown')warnings.push(`${p}: 미확인`);
   return;
  }
  if(f.value===null||f.value===undefined)return err(p,'확인된 값 필요');
  if(!f.sources?.length)err(p,'출처와 확인일 필요');
  for(const s of (Array.isArray(f.sources)?f.sources:[])){
   if(!s||!url(s.url)||!date(s.checked_at)||!['official','secondary','on_site'].includes(s.kind))err(p,'출처마다 url/kind/checked_at(YYYY-MM-DD) 필요');
  }
  if(f.status==='confirmed'&&!(Array.isArray(f.sources)&&f.sources.some(s=>s&&['official','on_site'].includes(s.kind))))err(p,'confirmed는 공식/현장 근거 필요; 2차 자료만 있으면 reported');
  if(rowSchema){
   if(typeof f.value!=='object'||Array.isArray(f.value))return err(p,'행 value는 객체여야 함');
   for(const [k,t]of Object.entries(rowSchema)){if(!(k in f.value))err(p,`행 필드 누락 ${k}`);else value(f.value[k],t,p+'.'+k);}
   for(const k of Object.keys(f.value))if(!(k in rowSchema))err(p,`정의되지 않은 행 필드 ${k}`);
   const r=f.value;
   if(r.original_price!=null&&r.price!=null&&r.original_price<r.price)err(p,'정가보다 판매가가 높음');
   if((r.purchase_limit!=null&&r.purchase_limit<1)||(r.quantity_limit!=null&&r.quantity_limit<1))err(p,'구매·수량 제한은 1 이상');
   if(r.weekday!=null&&r.weekday>6)err(p,'요일은 0~6');
   if(r.opens_at&&r.closes_at&&r.closes_at<=r.opens_at&&!r.closes_next_day)err(p,'종료시간/익일 종료 확인 필요');
   if(r.starts_at&&r.ends_at&&r.ends_at<=r.starts_at)err(p,'회차 종료는 시작 이후여야 함');
   if((r.amount!=null||r.price!=null||r.price_from!=null||r.min_purchase!=null)&&!r.currency)err(p,'금액의 통화 필요');
   if((r.amount!=null||r.price!=null||r.price_from!=null)&&!r.unit)err(p,'1인/1박/1개 등 가격 단위 필요');
  }else value(f.value,type,p);
 }
 if(!d||typeof d!=='object')return {errors:['JSON 객체 필요'],warnings};
 if(d.schema_version!==3)err('schema_version','3 필요');
 if(typeof d.id!=='string'||!/^[a-z0-9][a-z0-9-]*$/.test(d.id))err('id','안정적인 영문 ID 필요');
 if(typeof d.venue_id!=='string'||!d.venue_id.trim())err('venue_id','지점 ID 필요');
 if(!contract.categories[d.category])err('category','서비스 7개 카테고리만 허용');
 if(d.publication_status!=='draft')err('publication_status','입력 작업은 draft만 허용');
 if(!Array.isArray(d.secondary_categories)||d.secondary_categories.some(c=>!contract.categories[c]||c===d.category)||new Set(d.secondary_categories).size!==d.secondary_categories.length)err('secondary_categories','중복 없는 보조 카테고리 필요');
 for(const k of Object.keys(d))if(!['schema_version','id','venue_id','category','secondary_categories','publication_status','sections','category_details'].includes(k))err(k,'정의되지 않은 최상위 키');
 const expected=new Set(contract.sections.map(s=>s.key));
 for(const k of Object.keys(d.sections||{}))if(!expected.has(k))err(k,'정의되지 않은 영역');
 for(const s of contract.sections){
  const fields=d.sections?.[s.key];
  if(!fields){err(s.key,'영역 누락');continue;}
  for(const f of s.fields)fact(fields[f.key],f.type,`${s.key}.${f.key}`);
  for(const k of Object.keys(fields))if(!s.fields.some(f=>f.key===k))err(`${s.key}.${k}`,'정의되지 않은 필드');
 }
 const profiles=[d.category,...(Array.isArray(d.secondary_categories)?d.secondary_categories:[])];
 const extensions=Object.assign({},...profiles.map(c=>contract.category_profiles[c]||{}));
 for(const key of Object.keys(extensions))fact(d.category_details?.[key],'i18n','category_details.'+key);
 for(const key of Object.keys(d.category_details||{}))if(!(key in extensions))err('category_details.'+key,'정의되지 않은 카테고리 확장');
 const get=(s,k)=>d.sections?.[s]?.[k];
 const enums={admission:['free','paid','mixed','unknown','not_applicable'],booking:['required','optional','priority','not_required','unknown','not_applicable'],foreign_booking:['available','unavailable','conditional','unknown','not_applicable']};
 for(const[k,allowed]of Object.entries(enums))if(get('visit',k)?.value!=null&&!allowed.includes(get('visit',k).value))err('visit.'+k,'허용하지 않은 상태값');
 if(ready){
  for(const[s,k]of [['intro','name'],['intro','summary'],['location','name'],['location','address_ko'],['trust','official_url']])if(!['reported','confirmed'].includes(get(s,k)?.status))err(`${s}.${k}`,'검토 제출에 필요한 기본값 미입력');
  if(!['reported','confirmed'].includes(get('visit','period')?.status))warnings.push('일정 미확정 행사는 일반 행사 공개와 분리하여 매장 안내로 검토하세요.');
 }
 return {errors,warnings};
}
function ordered(d){return {...d,sections:Object.fromEntries(contract.sections.map(s=>[s.key,Object.fromEntries(s.fields.map(f=>[f.key,d.sections[s.key][f.key]]))]))};}
function preview(d){
 const lines=[`# ${d.id} · ${d.venue_id}`,`입력 초안 / ${contract.categories[d.category]} / 공개 전 검토 필요`,''];
 for(const s of contract.sections){lines.push(`## ${s.order}. ${s.title}`,s.question,'');for(const f of s.fields){const x=d.sections[s.key][f.key];lines.push(`- **${f.label}** (${x.status}): ${x.value===null?'미확인 또는 해당 없음':JSON.stringify(x.value)}`);}lines.push('');}
 lines.push('## 카테고리별 추가 정보',JSON.stringify(d.category_details,null,2),'','원본 출처를 열어 확인한 뒤 status를 입력하세요. 이 파일은 실제 팝업 렌더링/DB 등록 결과가 아닙니다.');return lines.join('\n')+'\n';
}
function researchBrief(d){return `# 행사 리서치·입력 작업 지시\n\n행사 ID: ${d.id}\n지점 ID: ${d.venue_id}\n카테고리: ${contract.categories[d.category]}\n\n1. contract.json의 10단계와 각 필드 순서로 조사한다. 행사와 지점, 상품과 입장료를 구분한다.\n2. 공식 원문을 실제로 열고 항목별 URL·출처 종류·확인일을 기록한다. 검색 요약/2차 자료만으로 confirmed를 부여하지 않는다.\n3. 확인하지 못한 사실은 status=unknown,value=null로 남긴다. 추측한 무료·예약 불필요·외국인 이용 가능·결제 가능을 넣지 않는다.\n4. 날짜별 복수 회차, 상품별 예약/이용 기간, 단위·통화·포함/제외·세금·취소 조건을 분리한다.\n5. 음식 알레르기·식이 정보는 출처가 있는 사실만 기록한다. 미확인을 안전/가능으로 바꾸지 않는다.\n6. i18n 값은 ko/en/ja/zh-CN/zh-TW를 사용한다. 번역이 없으면 키를 생략한다.\n7. 배열 행의 구조는 contract.rows를 따른다. 행도 {status,value,sources} 구조이며 미확인 행 멤버는 null로 둔다.\n8. 보조 카테고리를 추가하면 해당 category_profiles의 확장 필드도 category_details에 추가한다.\n9. validate → validate --ready → ingest 순서로 검토용 초안을 생성한다. DB 등록과 팝업 반영은 별도 연결 작업이다.\n\n`+contract.sections.map(s=>`## ${s.order}. ${s.title} — ${s.question}\n`+s.fields.map(f=>`- ${f.key}: ${f.label} (${f.type})`).join('\n')).join('\n\n')+'\n';}
function main(args){
 const [cmd,...rest]=args;
 if(cmd==='init'){
  const[id,category,venueId,out]=rest;if(!out)fail('init <id> <category> <venue-id> <output.json>');
  const d=template(id,category,venueId);write(out,d);write(out.replace(/\.json$/,'')+'.research.md',researchBrief(d));console.log(out);return;
 }
 if(cmd==='row'){
  const shape=contract.rows[rest[0]];if(!shape)fail('row <'+Object.keys(contract.rows).join('|')+'>');
  console.log(JSON.stringify({...unknown(),value:Object.fromEntries(Object.keys(shape).map(k=>[k,null]))},null,2));return;
 }
 if(cmd==='validate'||cmd==='ingest'){
  const file=rest[0];if(!file)fail(cmd+' <input.json>');const d=JSON.parse(fs.readFileSync(file,'utf8'));const result=validate(d,{ready:rest.includes('--ready')||cmd==='ingest'});console.log(JSON.stringify(result,null,2));if(result.errors.length){process.exitCode=1;return;}
  if(cmd==='ingest'){const out=rest[1];if(!out||out.startsWith('--'))fail('ingest <input.json> <새 출력 폴더>');if(fs.existsSync(out))fail('출력 폴더가 이미 있습니다. 새 경로를 사용하세요.');fs.mkdirSync(out,{recursive:true});const n=ordered(d);write(path.join(out,'draft.json'),n);write(path.join(out,'preview.md'),preview(n));write(path.join(out,'validation.json'),result);console.log('검토용 초안 저장 완료. DB/앱 공개는 수행하지 않았습니다.');}return;
 }
 fail('사용법: init / row / validate [--ready] / ingest. 상세: internal/event-workflow/README.md');
}
if(require.main===module){try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={contract,template,validate,ordered,preview,researchBrief};
