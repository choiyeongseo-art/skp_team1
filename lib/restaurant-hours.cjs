/* Deterministic parsing: unsupported/ambiguous text never produces an open claim. */
const VERSION='1.0.0',DAYS=['일','월','화','수','목','금','토'],ALL=[0,1,2,3,4,5,6];
const TIME='(?:[01]?\\d|2[0-4]):[0-5]\\d',RANGE=new RegExp(`(${TIME})\\s*[-~]\\s*(${TIME})`,'g');
const minute=s=>{const [h,m]=s.split(':').map(Number);return h*60+m;};
const clock=n=>`${String(Math.floor(n%1440/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
function daysOf(text){const clean=text.replace(/요일/g,'').replace(/\s/g,'');if(clean==='평일')return [1,2,3,4,5];if(clean==='주말')return [6,0];if(clean==='매일')return ALL.slice();const range=clean.match(/^([일월화수목금토])[-~]([일월화수목금토])$/);if(range){const start=DAYS.indexOf(range[1]),end=DAYS.indexOf(range[2]),out=[start];while(out.at(-1)!==end&&out.length<7)out.push((out.at(-1)+1)%7);return out;}if(/^[일월화수목금토](?:,[일월화수목금토])*$/.test(clean))return [...new Set(clean.split(',').map(s=>DAYS.indexOf(s)))];return null;}
function ranges(text){const found=[...text.matchAll(RANGE)];return {slots:found.map(m=>{const start=minute(m[1]),end=minute(m[2]);return {start,end:end<=start?end+1440:end};}),rest:text.replace(RANGE,'')};}
function normalizeHours(raw){const original=String(raw||''),issues=[],weekly=ALL.map(()=>null),closed=new Set();let scope=ALL.slice(),hasSchedule=false;
 const addIssue=reason=>{if(!issues.includes(reason))issues.push(reason);};
 let text=original.normalize('NFKC').replace(/[–—−]/g,'-').replace(/[〜～]/g,'~').replace(/\r/g,'').replace(/[|ㅣᅵ│]/g,'\n').replace(/\s+I\s+/g,'\n').replace(/(\d{1,2}:\d{2})\s*[-~]\s*\n\s*(\d{1,2}:\d{2})/g,'$1-$2');
 if(!text.trim())addIssue('운영시간 없음');
 if(/소진|전후|유동|변동|문의|예약|부제|[12]부|층|휴업|하절기|동절기|\d+\s*월|공휴일|격주|째|번째|주\s*[일월화수목금토]요일/i.test(text))addIssue('시즌·휴일·예약·변동 운영 등 별도 검수 필요');
 if(/\b(?:am|pm|a\.m\.|p\.m\.)/i.test(text))addIssue('오전·오후 표기 별도 검수 필요');
 function applyBreak(days,breakSlots){for(const day of days){if(!weekly[day]){addIssue('영업 구간 없는 브레이크타임');continue;}for(const b of breakSlots){const index=weekly[day].findIndex(s=>b.start>s.start&&b.end<s.end);if(index<0){addIssue('브레이크타임이 영업 구간 밖에 있음');continue;}const slot=weekly[day][index];weekly[day].splice(index,1,{start:slot.start,end:b.start},{start:b.end,end:slot.end});}}}
 function applyLast(days,value){const times=[...value.matchAll(new RegExp(TIME,'g'))].map(m=>minute(m[0]));if(!times.length){addIssue('라스트오더 시간 불명확');return;}const rest=value.replace(new RegExp(TIME,'g'),'').replace(/라스트\s*오더|last\s*order|마지막\s*주문/gi,'').replace(/[\s(),.*]/g,'');if(rest)addIssue('라스트오더 부가 조건 검수 필요');for(const day of days){if(!weekly[day]){addIssue('영업 구간 없는 라스트오더');continue;}for(let n of times){let index=weekly[day].findIndex(s=>n>=s.start&&n<=s.end);if(index<0&&n<1440){n+=1440;index=weekly[day].findIndex(s=>n>=s.start&&n<=s.end);}if(index<0){addIssue('라스트오더가 영업 구간 밖에 있음');continue;}weekly[day][index].lastOrder=n;}}}
 for(let line of text.split('\n').map(s=>s.trim()).filter(Boolean)){
  line=line.replace(/^\*\s*/,'');
  if(/휴무/.test(line)){const dayText=line.replace(/정기\s*휴무|휴무|매주|[\s()*]/g,'');const ds=daysOf(dayText);if(!ds)addIssue('휴무 규칙 검수 필요');else ds.forEach(d=>closed.add(d));continue;}
  const prefix=line.match(/^((?:평일|주말|매일)|(?:[일월화수목금토](?:요일)?\s*(?:[-~,]\s*[일월화수목금토](?:요일)?)*))\s*:?\s*(?=\d|영업)/);
  if(prefix){scope=daysOf(prefix[1]);line=line.slice(prefix[0].length);if(!scope){scope=ALL.slice();addIssue('요일 해석 불가');}}
  const isBreak=/브레이크\s*타임|break\s*time/i.test(line),isLast=/라스트\s*오더|last\s*order|마지막\s*주문/i.test(line);
  const parens=[...line.matchAll(/\(([^()]*)\)/g)].map(m=>m[1]);let main=line.replace(/\([^()]*\)/g,'').trim();
  const deferred=[];for(const part of parens){if(/브레이크\s*타임|break\s*time/i.test(part))deferred.push(['break',part]);else if(/라스트\s*오더|last\s*order|마지막\s*주문/i.test(part))deferred.push(['last',part]);else if(!/^(?:익일|24시간\s*영업|24시간)$/.test(part.trim()))addIssue('괄호 조건 검수 필요');}
  // A whole line may describe only break/last-order, with or without parentheses.
  if(isBreak&&!deferred.length){const parsed=ranges(main.replace(/브레이크\s*타임|break\s*time/gi,''));if(parsed.rest.replace(/[\s()*]/g,''))addIssue('브레이크타임 조건 검수 필요');if(!parsed.slots.length)addIssue('브레이크타임 해석 불가');else applyBreak(scope,parsed.slots);continue;}
  if(isLast&&!deferred.length){applyLast(scope,main);continue;}
  if(main){if(/^24시간(?:\s*영업)?$/.test(main))scope.forEach(d=>weekly[d]=[{start:0,end:1440}]);else{const parsed=ranges(main),rest=parsed.rest.replace(/영업\s*시간|영업|익일/gi,'').replace(/[\s/:,*]/g,'');if(rest||!parsed.slots.length)addIssue('지원하지 않는 시간 표현');else{scope.forEach(d=>weekly[d]=parsed.slots.map(slot=>({...slot})));hasSchedule=true;}}if(/^24시간/.test(main))hasSchedule=true;}
  for(const [type,part] of deferred){if(type==='break'){const parsed=ranges(part.replace(/브레이크\s*타임|break\s*time/gi,''));if(parsed.rest.replace(/[\s,*]/g,'')||!parsed.slots.length)addIssue('브레이크타임 조건 검수 필요');else applyBreak(scope,parsed.slots);}else applyLast(scope,part);}
 }
 for(const day of closed)weekly[day]=[];
 for(const slots of weekly){if(!slots)continue;slots.sort((a,b)=>a.start-b.start);for(let i=0;i<slots.length;i++){const s=slots[i];if(s.start>=1440||s.end>2880||s.end-s.start>1440||s.end<=s.start||(i&&s.start<slots[i-1].end))addIssue('영업 구간 범위 또는 중복 오류');}}
 if(!hasSchedule)addIssue('해석 가능한 영업 구간 없음');
 const unknownDays=weekly.flatMap((s,i)=>s===null?[DAYS[i]]:[]);if(unknownDays.length)addIssue('미기재 요일: '+unknownDays.join(', '));
 return {version:VERSION,timezone:'Asia/Seoul',raw:original,validationStatus:issues.length?'needs_review':'auto_validated',issues,weekly:weekly.map((slots,day)=>({day,dayName:DAYS[day],state:slots===null?'unknown':slots.length?'scheduled':'closed',intervals:(slots||[]).map(s=>({open:clock(s.start),close:clock(s.end),endDayOffset:Math.floor(s.end/1440),openMinute:s.start,closeMinute:s.end,lastOrder:s.lastOrder==null?null:clock(s.lastOrder),lastOrderMinute:s.lastOrder??null}))})),holidayPolicy:'unknown',verifiedAt:null};
}
function businessStatus(hours,now=new Date()){
 const base={basis:'registered_schedule',timezone:'Asia/Seoul',checkedAt:now.toISOString(),notice:'등록된 정규 운영시간 기준 · 임시휴무·공휴일 변동은 매장에 확인해주세요.'};
 if(hours.validationStatus!=='auto_validated')return {...base,state:'unknown',label:'운영시간 확인 필요'};
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now),get=t=>parts.find(p=>p.type===t)?.value,day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday')),minuteNow=Number(get('hour'))*60+Number(get('minute')),today=hours.weekly[day],previous=hours.weekly[(day+6)%7];
 const active=[...previous.intervals.filter(s=>s.closeMinute>1440).map(s=>({...s,openMinute:s.openMinute-1440,closeMinute:s.closeMinute-1440,lastOrderMinute:s.lastOrderMinute==null?null:s.lastOrderMinute-1440})),...today.intervals].find(s=>minuteNow>=s.openMinute&&minuteNow<s.closeMinute);
 if(active)return active.lastOrderMinute!=null&&minuteNow>=active.lastOrderMinute?{...base,state:'last_order_passed',label:'등록시간상 주문 마감'}:{...base,state:'open',label:'등록시간상 영업 중'};
 if(today.state==='closed')return {...base,state:'closed_day',label:'정기휴무'};
 const slots=today.intervals;if(slots.length>1&&minuteNow>=slots[0].closeMinute&&minuteNow<slots.at(-1).openMinute)return {...base,state:'break',label:'등록시간상 브레이크타임'};
 return {...base,state:'closed',label:'등록시간상 영업시간 외'};
}
module.exports={normalizeHours,businessStatus,VERSION};
