/* Each primary tab has a reloadable URL; restore browser history without pushing a second entry. */
(() => {
 const routes={signup:'/busandrop/login',home:'/busandrop/home',stores:'/busandrop/stores',pass:'/busandrop/drop-plan',saved:'/busandrop/saved',profile:'/busandrop/my'};
 const screenForPath=path=>Object.keys(routes).find(screen=>routes[screen]===path.replace(/\/$/,''))||'signup';
 const pathForScreen=screen=>routes[screen]||(['intro','language'].includes(screen)?routes.signup:routes.home);
 const fields=['storeCategory','storeRegion','storeRefineOpen','mapLocal','realStoreId','banner','brand','deal','place','filter','query','sort','localFilter','area','savedStoresOnly','mapRegion'];
 const snapshot=()=>Object.fromEntries(fields.filter(key=>['string','number','boolean'].includes(typeof state[key])||state[key]===null).map(key=>[key,state[key]]));
 function restore(entry){
  const screen=screenForPath(window.location.pathname),saved=entry?.screen;
  state.screen=saved&&saved!=='browse'&&pathForScreen(saved)===routes[screen]&&['intro','language',...Object.keys(routes),'brands','busan','place','detail','brand'].includes(saved)?saved:screen;
  for(const key of fields){const value=entry?.busanView?.[key];if(value===null||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value)||typeof value==='string'&&value.length<=254)state[key]=value;}
 }
 const entry=()=>({screen:state.screen,busanView:snapshot(),scrollTop:document.querySelector('#viewport').scrollTop});
 let restoring=false;
 const originalRender=render;
 render=()=>{
  originalRender();
  const path=pathForScreen(state.screen);
  if(!restoring){if(window.location.pathname!==path)window.history.pushState(entry(),'',path);else window.history.replaceState(entry(),'',path+(window.location.search||''));}
 };
 window.addEventListener('popstate',event=>{
  restoring=true;
  try{
   restore(event?.state);
   if(state.screen==='signup')state.authMode='login';
   if(state.screen==='stores')state.mapShowBack=false;
   historyStack=[];
   document.querySelector('#modal').innerHTML='';
   render();
   document.querySelector('#viewport').scrollTop=0;
  }finally{restoring=false;}
 });
 restore(window.history.state);
 if(state.screen==='signup')state.authMode='login';
 if(state.screen==='stores')state.mapShowBack=false;
 const scrollTop=window.history.state?.scrollTop||0;
 window.history.replaceState(entry(),'',pathForScreen(state.screen)+(window.location.search||''));
 render();
 document.querySelector('#viewport').scrollTop=scrollTop;
 document.querySelector('#viewport').addEventListener?.('scroll',()=>{window.history.replaceState(entry(),'',window.location.pathname+(window.location.search||''));},{passive:true});
})();
