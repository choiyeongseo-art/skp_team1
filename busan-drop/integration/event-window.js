/* Date-only campaign filtering uses Korea's calendar, independent of trip settings. */
(function(root){
 const iso=d=>d.toISOString().slice(0,10);
 function koreaToday(now=new Date()){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const value=type=>parts.find(p=>p.type===type).value;return `${value('year')}-${value('month')}-${value('day')}`;
 }
 function valid(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&iso(new Date(value))===value;}
 function monthWindow(today=koreaToday()){
  if(!valid(today))throw new Error('Invalid calendar date');
  const [y,m,d]=today.split('-').map(Number),lastDay=new Date(Date.UTC(y,m+1,0)).getUTCDate();
  return {start:today,end:iso(new Date(Date.UTC(y,m,Math.min(d,lastDay))))};
 }
 const districts={서면:'부산진구',남포동:'중구',광안리:'수영구',해운대:'해운대구'};
 function matchesRegion(item,region){
  if(region==='BUSAN')return true;
  const district=districts[region];if(!district)return false;
  // Registered postal addresses take precedence over older shopping-area tags.
  const address=String(item.address||'').trim();
  if(address)return /^(?:부산광역시|부산시|부산)\s/.test(address)&&address.split(/\s+/)[1]===district;
  return item.district?item.district===district:item.region===region;
 }
 function select({locations=[],events={},catalog=null,categories={},category='전체',region='BUSAN',today=koreaToday()}){
  const range=monthWindow(today);
  const schedules=catalog?new Map(catalog.map(event=>[event.brand,event])):null;
  const items=locations.filter(item=>{
   const base=events[item.brand];if(!base)return false;
   const event={...base,...item.eventOverrides};
   const schedule=schedules?schedules.get(item.brand):event;
   if(!schedule||(schedules&&schedule.scheduleStatus!=='confirmed'))return false;
   if(schedule.isActive===false||schedule.is_active===false||!valid(schedule.start)||!valid(schedule.end)||schedule.start>schedule.end)return false;
   if(schedule.end<range.start||schedule.start>range.end)return false;
   if((item.eventParticipation||item.profile?.eventParticipation)==='unconfirmed')return false;
   if(!Number.isFinite(item.lat)||!Number.isFinite(item.lng)||Math.abs(item.lat)>90||Math.abs(item.lng)>180)return false;
   if(!matchesRegion(item,region))return false;
   const tags=categories[item.brand]||[event.category||event.type];
   return category==='전체'||tags.includes(category);
  });
  return {...range,items};
 }
 function groupLocations(items){
  const groups=new Map();
  for(const item of items){
   const address=String(item.address||'').split(/[·,]/)[0].trim();
   const key=address||`${item.lat},${item.lng}`;
   if(!groups.has(key))groups.set(key,{lat:item.lat,lng:item.lng,items:[]});
   groups.get(key).items.push(item);
  }
  return [...groups.values()];
 }
 const api={koreaToday,monthWindow,select,matchesRegion,groupLocations};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.BUSAN_EVENT_WINDOW=api;
})(typeof window==='object'?window:this);
