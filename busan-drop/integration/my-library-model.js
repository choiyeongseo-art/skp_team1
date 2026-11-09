(function(root){
 const clone=value=>JSON.parse(JSON.stringify(value));
 function normalizeDates(start,end,today){const valid=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;const nextStart=valid(start)&&start>=today?start:today,nextEnd=valid(end)&&end>=nextStart?end:nextStart;return {start:nextStart,end:nextEnd,changed:start!==nextStart||end!==nextEnd};}
 function savePlan(library,entry){if(!entry.id||!entry.stops?.length)throw new Error('invalid_plan');const next=clone(library);next.plans=next.plans||[];next.places=next.places||[];const previous=next.plans.find(p=>p.id===entry.id),saved=clone(entry);saved.progress=clone(previous?.progress||saved.progress||{done:[]});const rows=saved.itinerary||itinerary(saved.routeSnapshot||[],saved.places||[],saved.selection?.itineraryOrder,saved.selection?.placeDates,saved.start||'');const valid=new Set(rows.map(visitKey));saved.progress.done=(saved.progress.done||[]).filter(key=>valid.has(key));next.plans=[saved,...next.plans.filter(p=>p.id!==entry.id)];return next;}
 function deletePlan(library,id){if(!library.plans?.some(plan=>plan.id===id))throw new Error('missing_plan');const next=clone(library);next.plans=next.plans.filter(plan=>plan.id!==id);return next;}
 function togglePlace(library,place){const next=clone(library);next.places=next.places||[];next.plans=next.plans||[];next.places=next.places.some(p=>p.id===place.id)?next.places.filter(p=>p.id!==place.id):[clone(place),...next.places];return next;}

 function itinerary(route,places,order=[],dates={},start=''){
  const rows=route.flatMap(c=>[{id:'event:'+c.campaign.id,kind:'event',name:c.event.title||c.item.name,address:c.item.address,lat:c.item.lat,lng:c.item.lng,date:c.visitDate||start},...places.filter(p=>p.nearStoreId===c.item.id).map(p=>({...clone(p),id:'place:'+p.id,placeId:p.id,date:dates[p.id]||c.visitDate||start}))]);
  for(const p of places)if(!rows.some(r=>r.placeId===p.id))rows.push({...clone(p),id:'place:'+p.id,placeId:p.id,date:dates[p.id]||start});
  const unique=rows.filter((r,i)=>rows.findIndex(x=>x.id===r.id)===i);return unique.sort((a,b)=>a.date.localeCompare(b.date)||(order.includes(a.id)?order.indexOf(a.id):999)-(order.includes(b.id)?order.indexOf(b.id):999));
 }
 // Venue groups are travel options, not assignments to calendar days.
 function venueGroups(route=[],places=[]){return route.map(c=>({id:c.campaign.id,campaign:c.campaign,event:c.event,item:c.item,places:places.filter(p=>p.eventId?p.eventId===c.campaign.id:p.nearStoreId===c.item.id)}));}
 function venueItinerary(route=[],places=[],orders={}){return venueGroups(route,places).flatMap(group=>{
  const rows=[{id:'event:'+group.id,eventId:group.id,kind:'event',name:group.event.title||group.campaign.title,image:group.campaign.image?'assets/banners/home-20261105/'+group.campaign.image:'',address:group.item.address,hours:group.event.hours||'',hoursNote:group.event.hoursNote||'',lat:group.item.lat,lng:group.item.lng,date:'',unavailableDates:group.event.closed||[],availableStart:group.campaign.start,availableEnd:group.campaign.end},
  ...['sights','food'].flatMap(kind=>group.places.filter(p=>p.kind===kind).map(p=>({...clone(p),id:'place:'+group.id+':'+p.id,placeId:p.id,eventId:group.id,date:'',unavailableDates:group.event.closed||[],availableStart:group.campaign.start,availableEnd:group.campaign.end})))];
  const ids=[...new Set(Array.isArray(orders?.[group.id])?orders[group.id]:[])],rank=new Map(ids.map((id,i)=>[id,i]));return rows.sort((a,b)=>(rank.get(a.id)??Infinity)-(rank.get(b.id)??Infinity));
 });}
 function moveVenueStop(route,places,orders,eventId,stopId,direction){const next=clone(orders||{});if(!['up','down'].includes(direction))return next;const rows=venueItinerary(route,places,next).filter(row=>row.eventId===eventId),index=rows.findIndex(row=>row.id===stopId),target=index+(direction==='up'?-1:1);if(index<0||target<0||target>=rows.length)return next;[rows[index],rows[target]]=[rows[target],rows[index]];next[eventId]=rows.map(row=>row.id);return next;}
 function removeSavedStop(entry,stopId){
  const next=clone(entry),row=groupedRows(next).find(stop=>stop.id===stopId);if(!row)return next;
  const s=next.selection||(next.selection={});
  if(row.kind==='event'){
   next.routeSnapshot=(next.routeSnapshot||[]).filter(venue=>venue.campaign.id!==row.eventId);next.stops=(next.stops||[]).filter(stop=>stop.id!==row.eventId);next.places=(next.places||[]).filter(place=>place.eventId?place.eventId!==row.eventId:place.nearStoreId!==entry.routeSnapshot.find(venue=>venue.campaign.id===row.eventId)?.item.id);
   for(const field of ['selected','order','done'])if(Array.isArray(s[field]))s[field]=s[field].filter(id=>id!==row.eventId);
   for(const field of ['venueChoices','venueOrders','branches'])if(s[field])delete s[field][row.eventId];
  }else{
   next.places=(next.places||[]).filter(place=>!(place.id===row.placeId&&(place.eventId?place.eventId===row.eventId:true)));
   const choice=s.venueChoices?.[row.eventId];if(choice)for(const [kind,field] of [['sights','sightPlaces'],['food','foodPlaces']]){if(choice[kind])choice[kind]=choice[kind].filter(id=>id!==row.placeId);if(choice[field])choice[field]=choice[field].filter(place=>place.id!==row.placeId);}
   if(s.venueOrders?.[row.eventId])s.venueOrders[row.eventId]=s.venueOrders[row.eventId].filter(id=>id!==stopId);
  }
  for(const [kind,field] of [['sights','sightPlaces'],['food','foodPlaces']]){s[field]=(next.places||[]).filter(place=>place.kind===kind);s[kind]=[...new Set(s[field].map(place=>place.id))];}
  next.itinerary=groupedRows(next);const valid=new Set(next.itinerary.map(visitKey));if(next.progress)next.progress.done=(next.progress.done||[]).filter(key=>valid.has(key));return next;
 }
 function reorderSavedPlan(entry,{eventId,stopId,direction}){
  const next=clone(entry);if(!['up','down'].includes(direction))return next;
  const route=next.routeSnapshot||[];next.selection={...next.selection};
  if(stopId){next.selection.venueOrders=moveVenueStop(route,next.places||[],next.selection.venueOrders,eventId,stopId,direction);}
  else {const index=route.findIndex(venue=>venue.campaign.id===eventId),target=index+(direction==='up'?-1:1);if(index<0||target<0||target>=route.length)return next;[route[index],route[target]]=[route[target],route[index]];next.selection.order=route.map(venue=>venue.campaign.id);if(next.stops){const rank=new Map(next.selection.order.map((id,i)=>[id,i]));next.stops.sort((a,b)=>(rank.get(a.id)??Infinity)-(rank.get(b.id)??Infinity));}}
  next.itinerary=groupedRows(next);return next;
 }
 function groupedRows(entry){const rows=venueItinerary(entry.routeSnapshot||[],entry.places||[],entry.selection?.venueOrders);if(entry.flow==='venue-groups')return rows;return rows.map(row=>{const previous=(entry.itinerary||itinerary(entry.routeSnapshot||[],entry.places||[],entry.selection?.itineraryOrder,entry.selection?.placeDates,entry.start||'')).find(old=>row.kind==='event'?old.id===row.id:old.placeId===row.placeId);return previous?{...row,id:previous.id,date:previous.date}:row;});}
 function venueJourney(entry,rows,today){const done=new Set(entry.progress?.done||[]),available=rows.filter(row=>(!row.availableStart||row.availableStart<=today)&&(!row.availableEnd||row.availableEnd>=today)&&!row.unavailableDates?.includes(today));return {stops:available,next:available.find(row=>!done.has(visitKey(row))),done:available.filter(row=>done.has(visitKey(row))),complete:available.length>0&&available.every(row=>done.has(visitKey(row)))};}
 function foodGroup(p){if(['japanese','chinese'].includes(p.cuisine))return p.cuisine;if(['korean','seafood','busan_local','noodle','fusion','other'].includes(p.cuisine))return 'other';const t=[p.name,p.menu].join(' ');return /커피|카페|케이크|베이커|제과|디저트/.test(t)?'cafe':/초밥|스시|오마카세|우동|돈카츠|라멘|야키토리/.test(t)?'japanese':(p.cuisine==='western'||/파스타|피자|버거|스테이크/.test(t))?'western':/중식|짜장|짬뽕|마라|우육|딤섬/.test(t)?'chinese':'other';}
 function filterFood(places,query='',group='all',selected=[]){const q=query.trim().toLocaleLowerCase();return places.filter(p=>(!q||[p.name,p.menu,p.address,...['titleI18n','menuI18n','addressI18n'].flatMap(field=>Object.values(p[field]||{}))].join(' ').toLocaleLowerCase().includes(q))&&(group==='all'||group==='selected'&&selected.includes(p.id)||foodGroup(p)===group));}
 function visitHours(place,date){const h=place.hoursNormalized;if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||h?.validationStatus!=='auto_validated')return {state:'unknown',intervals:[]};const day=new Date(date+'T12:00:00+09:00').getUTCDay(),row=h.weekly.find(d=>d.day===day);return row?clone(row):{state:'unknown',intervals:[]};}

 function visitKey(stop){return JSON.stringify([stop.date,stop.id]);}
 function journey(entry,rows,date){const dates=[...new Set(rows.map(row=>row.date))].sort(),selectedDate=dates.includes(date)?date:dates[0],stops=rows.filter(row=>row.date===selectedDate),done=new Set(entry.progress?.done||[]),next=stops.find(stop=>!done.has(visitKey(stop)));return {dates,date:selectedDate,stops,next,done:stops.filter(stop=>done.has(visitKey(stop))).map(stop=>stop.id),complete:stops.length>0&&!next};}
 function updateVisit(library,planId,stopId,date,completed){const next=clone(library),entry=next.plans.find(plan=>plan.id===planId);if(!entry)throw new Error('missing_plan');const rows=groupedRows(entry),stop=rows.find(row=>row.id===stopId&&row.date===date);if(!stop)throw new Error('missing_stop');const key=visitKey(stop),done=new Set(entry.progress?.done||[]);if(completed)done.add(key);else done.delete(key);entry.progress={...entry.progress,done:[...done],activeDate:date};return next;}
 function liveDirections(stop){const destination=Number.isFinite(stop.lat)&&Number.isFinite(stop.lng)?stop.lat+','+stop.lng:stop.address||stop.name;return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(destination)+'&travelmode=transit&dir_action=navigate';}
 const api={removeSavedStop,reorderSavedPlan,venueGroups,venueItinerary,moveVenueStop,groupedRows,venueJourney,normalizeDates,savePlan,deletePlan,togglePlace,itinerary,filterFood,visitHours,visitKey,journey,updateVisit,liveDirections};if(typeof module==='object'&&module.exports)module.exports=api;else root.BUSAN_MY_LIBRARY_MODEL=api;
})(typeof window==='object'?window:this);
