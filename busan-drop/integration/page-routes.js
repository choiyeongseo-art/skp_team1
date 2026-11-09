/* Each primary tab has a reloadable URL; restore browser history without pushing a second entry. */
(() => {
 const routes={signup:'/busandrop/login',home:'/busandrop/home',stores:'/busandrop/stores',pass:'/busandrop/drop-plan',saved:'/busandrop/saved',profile:'/busandrop/my'};
 const screenForPath=path=>Object.keys(routes).find(screen=>routes[screen]===path.replace(/\/$/,''))||'signup';
 const pathForScreen=screen=>routes[screen]||(['intro','language'].includes(screen)?routes.signup:routes.home);
 let restoring=false;
 const originalRender=render;
 render=()=>{
  originalRender();
  const path=pathForScreen(state.screen);
  if(!restoring&&window.location.pathname!==path)window.history.pushState({screen:state.screen},'',path);
 };
 window.addEventListener('popstate',event=>{
  restoring=true;
  try{
   const screen=screenForPath(window.location.pathname),saved=event?.state?.screen;
   state.screen=saved&&pathForScreen(saved)===routes[screen]?saved:screen;
   if(state.screen==='signup')state.authMode='login';
   if(state.screen==='stores')state.mapShowBack=false;
   historyStack=[];
   document.querySelector('#modal').innerHTML='';
   render();
   document.querySelector('#viewport').scrollTop=0;
  }finally{restoring=false;}
 });
 state.screen=screenForPath(window.location.pathname);
 if(state.screen==='signup')state.authMode='login';
 if(state.screen==='stores')state.mapShowBack=false;
 window.history.replaceState({screen:state.screen},'',pathForScreen(state.screen)+(window.location.search||''));
 render();
})();
