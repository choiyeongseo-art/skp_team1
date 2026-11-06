(function(root){
 function group(locations,catalog=[],events={}){
  const groups=new Map();for(const item of locations){let group=groups.get(item.brand);if(!group){const campaign=catalog.find(c=>c.brand===item.brand);group={brand:item.brand,campaign,event:events[item.brand]||null,items:[]};groups.set(item.brand,group);}group.items.push(item);}return [...groups.values()];
 }
 function status(event,today){if(!event?.start||!event?.end)return event?'일정 확인 중':'행사 안내 준비 중';if(event.end<today)return event.scheduleKind==='booking'?'예약 마감':'종료';return event.start>today?'진행 예정':event.scheduleKind==='booking'?'예약 접수 중':'진행 중';}
 const api={group,status};if(typeof module==='object'&&module.exports)module.exports=api;else root.BUSAN_STORE_EVENTS=api;
})(typeof window==='object'?window:this);
