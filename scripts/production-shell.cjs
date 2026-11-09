/* Production presentation only; local studio controls remain available to developers. */
const fs=require('node:fs'),path=require('node:path');
function prepareProduction(target){
 const index=path.join(target,'index.html');let html=fs.readFileSync(index,'utf8');
 html=html.replace('<html lang="ko">','<html lang="ko" data-production="true">').replace('width=device-width,initial-scale=1','width=device-width,initial-scale=1,viewport-fit=cover').replace('<title>BUSAN DROP — Prototype Studio</title>','<title>BUSAN DROP</title>').replace('</head>','<link rel="stylesheet" href="integration/production-shell.css?v=20261109-viewport-check6"><script defer src="integration/production-viewport.js?v=20261109-viewport-check6"></script></head>').replace('app.js?v=20261108-venue-groups1','app.js?v=20261109-viewport-check6');
 fs.writeFileSync(index,html);
 const app=path.join(target,'app.js');fs.writeFileSync(app,fs.readFileSync(app,'utf8').replace("theme:stored.theme||'color'","theme:'color'"));
 fs.writeFileSync(path.join(target,'integration/production-viewport.js'),`/* Follow available device dimensions without scaling the application. */
(()=>{const root=document.documentElement;let queued=false,diagnostic=null;
function sync(){queued=false;const viewport=window.visualViewport,width=viewport?.width||root.clientWidth||window.innerWidth,height=viewport?.height||window.innerHeight;root.style.setProperty('--app-window-width',width+'px');root.style.setProperty('--app-window-height',height+'px');root.style.setProperty('--app-window-top',(viewport?.offsetTop||0)+'px');root.style.setProperty('--app-window-left',(viewport?.offsetLeft||0)+'px');if(diagnostic){const frame=document.querySelector('#phone')?.getBoundingClientRect(),nav=document.querySelector('#bottomNav')?.getBoundingClientRect(),round=n=>Math.round((n||0)*10)/10;diagnostic.textContent=['BUSAN DROP · 높이 점검','버전 viewport-check6','브라우저 inner: '+window.innerWidth+' × '+window.innerHeight,'문서 client: '+root.clientWidth+' × '+root.clientHeight,'표시 visual: '+round(viewport?.width)+' × '+round(viewport?.height),'확대 배율: '+(viewport?.scale||1)+' / 위쪽 이동: '+round(viewport?.offsetTop),'앱: '+round(frame?.width)+' × '+round(frame?.height)+' / 위: '+round(frame?.top),'탭바 아래: '+round(nav?.bottom)+' / 표시 아래: '+round(height+(viewport?.offsetTop||0))].join('\\n');}}

function schedule(){if(!queued){queued=true;requestAnimationFrame(sync);}}
for(const event of ['resize','orientationchange','pageshow'])window.addEventListener(event,schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);if(window.location?.search?.includes('layout_debug=1')){diagnostic=document.createElement('pre');diagnostic.setAttribute('aria-label','화면 높이 점검');diagnostic.style.cssText='position:fixed;left:8px;top:8px;z-index:2147483647;max-width:calc(100vw - 16px);margin:0;padding:10px;background:#111;color:#fff;font:12px/1.5 monospace;white-space:pre-wrap;pointer-events:none;border:1px solid #ffd628';document.body.appendChild(diagnostic);}sync();})();
`);
 fs.writeFileSync(path.join(target,'integration/production-shell.css'),`/* App-only deployment: no studio sidebar or simulated device chrome. */
html[data-production],html[data-production] body{margin:0;width:100%;height:100%;overflow:hidden;background:#fff}
html[data-production] .studio{display:block;width:100%;max-width:none;height:var(--app-window-height,100dvh);min-height:0;margin:0;padding:0}
html[data-production] .tools,html[data-production] .inspector,html[data-production] .stage-head,html[data-production] .stage-foot,html[data-production] #phone>.status,html[data-production] #phone>.home-indicator{display:none!important}
html[data-production] .stage{display:block;position:absolute;top:var(--app-window-top,0px);left:var(--app-window-left,0px);width:var(--app-window-width,100%);height:var(--app-window-height,100dvh);min-height:0;margin:0;padding:0;overflow:hidden}
html[data-production] #phone{--status-height:env(safe-area-inset-top,0px);--safe-bottom:env(safe-area-inset-bottom,0px);--nav-height:64px;display:flex;flex-direction:column;padding-top:var(--status-height);padding-bottom:var(--safe-bottom);position:relative;left:0;top:0;width:100%;min-width:0;max-width:430px;height:100%;min-height:0;max-height:none;margin:0 auto;border:0;border-radius:0;box-shadow:none;transform:none;background:#fff}
html[data-production] #phone .viewport{position:relative;inset:auto;width:100%;height:auto;flex:1 1 0;min-width:0;min-height:0;max-height:none;overscroll-behavior:contain}
html[data-production] #phone #detailActions{position:relative;inset:auto;flex:0 0 auto}
html[data-production] #phone #bottomNav{position:relative;inset:auto;flex:0 0 var(--nav-height);width:100%;height:var(--nav-height);min-height:var(--nav-height)}
html[data-production] #phone #bottomNav{padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px)}
html[data-production] #phone #modal .overlay{padding-top:env(safe-area-inset-top,0px)}
`);
}
module.exports={prepareProduction};
