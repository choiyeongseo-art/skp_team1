/* Keep the welcome flow and the actual home at distinct, reloadable URLs. */
(() => {
  const loginPath='/busandrop/login',homePath='/busandrop/home';
  const welcomeScreens=new Set(['intro','language','signup']);
  let restoring=false;
  const originalRender=render;
  render=()=>{
    originalRender();
    const path=welcomeScreens.has(state.screen)?loginPath:homePath;
    if(!restoring&&window.location.pathname!==path){
      window.history.pushState({screen:state.screen},'',path);
    }
  };
  window.addEventListener('popstate',()=>{
    restoring=true;
    historyStack=[];
    state.screen=window.location.pathname===homePath?'home':'intro';
    document.querySelector('#modal').innerHTML='';
    render();
    document.querySelector('#viewport').scrollTop=0;
    restoring=false;
  });
  state.screen=window.location.pathname===homePath?'home':'intro';
  window.history.replaceState({screen:state.screen},'',(welcomeScreens.has(state.screen)?loginPath:homePath)+(window.location.search||''));
  render();
})();
