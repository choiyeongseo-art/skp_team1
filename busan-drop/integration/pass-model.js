(function(root){
 function status(event,day,item){
  if(event?.scheduleKind==='booking'&&event.offers?.length){
   const available=event.offers.filter(o=>day>=o.stayStart&&day<=o.stayEnd&&!o.excludedStayDates?.includes(day));
   if(!available.length)return {kind:'off',label:'상품 이용 기간 밖 또는 특가 제외일',blocked:true};
   return {kind:'check',label:available.every(o=>o.category==='로컬')?'객실 특가 제외 · 다이닝 예약 확인':'투숙·이용 사전 예약 확인',blocked:false};
  }
  if(!event?.start||!event?.end)return {kind:'check',label:'행사 일정 확인 필요',blocked:false};
  if(day<event.start)return {kind:'off',label:'행사 시작 전',blocked:true};
  if(day>event.end)return {kind:'off',label:'행사 종료',blocked:true};
  if(event.closed?.includes(day))return {kind:'off',label:'선택한 날 휴점',blocked:true};
  if((item?.eventParticipation||item?.profile?.eventParticipation)==='unconfirmed')return {kind:'check',label:'지점 행사 참여 확인 필요',blocked:false};
  return {kind:'open',label:'행사 기간 내 방문',blocked:false};
 }
 function build({saved=[],catalog=[],locations=[],events={},day,selection={}}){
  const candidates=saved.map(entry=>{
   const campaign=catalog.find(e=>e.id===entry.eventId);if(!campaign)return null;
   const branches=locations.filter(s=>s.brand===campaign.brand);
   const chosen=selection.branches?.[campaign.id]||entry.storeId;
   const item=branches.find(s=>s.id===chosen)||(branches.length===1?branches[0]:null);
   const event={...events[campaign.brand],...item?.eventOverrides};
   return {entry,campaign,branches,item,event,status:status(event,day,item),selected:!selection.excluded?.includes(campaign.id)};
  }).filter(Boolean);
  const order=selection.order||[];
  const route=candidates.filter(c=>c.selected&&c.item&&!c.status.blocked).sort((a,b)=>{const ai=order.indexOf(a.campaign.id),bi=order.indexOf(b.campaign.id);return (ai<0?999:ai)-(bi<0?999:bi);});
  return {candidates,route};
 }
 function firstVisit(event,start,end,item){
  const periods=event.scheduleKind==='booking'?(event.offers||[]).map(o=>({start:o.stayStart,end:o.stayEnd,closed:o.excludedStayDates||[]})):[{start:event.start,end:event.end,closed:event.closed||[]}];
  const days=periods.map(period=>{
   if(!period.start||!period.end)return null;
   let day=period.start>start?period.start:start;const last=period.end<end?period.end:end,closed=new Set([...(event.closed||[]),...period.closed]);
   while(day<=last&&closed.has(day)){const date=new Date(day+'T00:00:00Z');date.setUTCDate(date.getUTCDate()+1);day=date.toISOString().slice(0,10);}
   return day<=last&&!status(event,day,item).blocked?day:null;
  }).filter(Boolean).sort();return days[0]||null;
 }
 function trip({start,end,catalog=[],locations=[],events={},selection={}}){
  if(!start||!end||end<start)return {candidates:[],route:[]};
  const candidates=catalog.filter(c=>c.scheduleStatus==='confirmed'&&c.isActive!==false&&events[c.brand]?.isActive!==false).map(campaign=>{
   const base=events[campaign.brand]||campaign;
   const branches=locations.filter(item=>item.brand===campaign.brand&&Number.isFinite(item.lat)&&Number.isFinite(item.lng)&&((item.eventParticipation||item.profile?.eventParticipation)!=='unconfirmed'||item.planSelectable===true)&&firstVisit({...base,...item.eventOverrides},start,end,item));
   if(!branches.length)return null;
   const item=branches.find(item=>item.id===selection.branches?.[campaign.id])||(branches.length===1?branches[0]:null),event={...base,...item?.eventOverrides};
   const first=firstVisit(event,start,end,item)||branches.map(branch=>firstVisit({...base,...branch.eventOverrides},start,end,branch)).filter(Boolean).sort()[0],requested=selection.visitDates?.[campaign.id],visitDate=requested&&requested>=start&&requested<=end?requested:first;
   return {campaign,branches,item,event,visitDate,selected:(selection.selected||[]).includes(campaign.id),status:status(event,visitDate,item)};
  }).filter(Boolean).sort((a,b)=>a.visitDate.localeCompare(b.visitDate)||a.campaign.id.localeCompare(b.campaign.id));
  const order=selection.order||[],route=candidates.filter(c=>c.selected&&c.item&&!c.status.blocked).sort((a,b)=>{const ai=order.indexOf(a.campaign.id),bi=order.indexOf(b.campaign.id);return a.visitDate.localeCompare(b.visitDate)||(ai<0?999:ai)-(bi<0?999:bi);});
  return {candidates,route};
 }
 function directions(item,origin,mode='transit'){
  const url=new URL('https://www.google.com/maps/dir/');url.searchParams.set('api','1');url.searchParams.set('destination',`${item.lat},${item.lng}`);url.searchParams.set('travelmode',mode==='walking'?'walking':'transit');
  if(origin)url.searchParams.set('origin',`${origin.lat},${origin.lng}`);return url.href;
 }
 function coordinateGroups(route=[]){
  const grouped=new Map();route.forEach((entry,index)=>{const {lat,lng}=entry.item||{};if(!Number.isFinite(lat)||!Number.isFinite(lng))return;const key=`${lng},${lat}`;if(!grouped.has(key))grouped.set(key,{key,lat,lng,entries:[]});grouped.get(key).entries.push({entry,number:index+1});});return [...grouped.values()];
 }
 const api={status,build,directions,trip,firstVisit,coordinateGroups};if(typeof module==='object'&&module.exports)module.exports=api;else root.BUSAN_PASS_MODEL=api;
})(typeof window==='object'?window:this);
