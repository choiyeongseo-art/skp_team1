/* A fresh document launch always plays the intro; tab navigation does not. */
(()=>{
 const layer=document.querySelector('#appLaunchIntro'),video=layer?.querySelector('video');
 if(!layer||!video)return;
 const app=document.querySelector('.studio'),retry=layer.querySelector('[data-launch-play]'),skip=layer.querySelector('[data-launch-skip]');
 let finished=false,homeReady=false,watchdog,transitionTimer,exitAnimation,homeAnimation;
 function stopTimer(){clearTimeout(watchdog);}
 function prepareHome(){if(homeReady)return;homeReady=true;nav('home');}
 function revealHome(){clearTimeout(transitionTimer);layer.hidden=true;exitAnimation?.cancel();homeAnimation?.cancel();exitAnimation=null;homeAnimation=null;if(app)app.inert=false;}
 function finish(animated=true){
  if(finished)return;finished=true;stopTimer();video.pause();prepareHome();
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(!animated||reduced||typeof layer.animate!=='function'){revealHome();return;}
  // Keep the final video frame while the already-rendered home is revealed.
  retry.hidden=true;skip.hidden=true;
  const viewport=document.querySelector('#viewport');
  homeAnimation=viewport?.animate?.([{opacity:.65,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:640,easing:'cubic-bezier(.22,1,.36,1)'});
  exitAnimation=layer.animate([{opacity:1},{opacity:0}],{duration:640,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  exitAnimation.onfinish=revealHome;
  transitionTimer=setTimeout(revealHome,800);
 }
 function loadingGuard(){stopTimer();watchdog=setTimeout(finish,15000);}
 function start(){
  if((window.BUSAN_LAUNCH_PATH||window.location.pathname)==='/busandrop/auth/callback'){layer.hidden=true;if(app)app.inert=false;return;}
  clearTimeout(transitionTimer);exitAnimation?.cancel();homeAnimation?.cancel();finished=false;homeReady=false;skip.hidden=false;layer.hidden=false;if(app)app.inert=true;retry.hidden=true;video.muted=true;video.currentTime=0;loadingGuard();
  const playing=video.play();playing?.catch(()=>{stopTimer();retry.hidden=false;});
 }
 video.addEventListener('ended',()=>finish());
 video.addEventListener('error',()=>finish(false));
 video.addEventListener('playing',()=>{stopTimer();prepareHome();});
 video.addEventListener('waiting',loadingGuard);
 video.addEventListener('stalled',loadingGuard);
 skip.addEventListener('click',()=>finish());
 retry.addEventListener('click',()=>{retry.hidden=true;loadingGuard();video.play()?.catch(()=>{stopTimer();retry.hidden=false;});});
 window.addEventListener('pageshow',event=>{if(event.persisted)start();});
 start();
})();
