/* Recheck KST expiry when an open tab crosses midnight or resumes from sleep. */
(() => {
 let lastDay=window.BUSAN_EVENT_WINDOW.koreaToday();
 function refresh(){
  const day=window.BUSAN_EVENT_WINDOW.koreaToday();
  if(day===lastDay)return;
  lastDay=day;
  window.dispatchEvent(new Event('busan-event-date-changed'));
  render();
 }
 window.addEventListener('focus',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 setInterval(refresh,30000);
})();
