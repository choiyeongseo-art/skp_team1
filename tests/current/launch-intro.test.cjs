const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/../../busan-drop/integration/launch-intro.js','utf8');
function setup({path='/busandrop/home',blocked=false,animated=false,reduced=false}={}){
 const events={},clicks={},windowEvents={},calls=[],timers=new Map();let timerId=0;
 const video={muted:false,currentTime:2,play(){calls.push('play');return blocked?Promise.reject(Error('blocked')):Promise.resolve();},pause(){calls.push('pause');},addEventListener(k,f){events[k]=f;}};
 const retry={hidden:true,addEventListener(k,f){clicks.play=f;}},skip={addEventListener(k,f){clicks.skip=f;}},app={inert:false},layer={hidden:false,querySelector:s=>s==='video'?video:s==='[data-launch-play]'?retry:skip};
 const animations=[];if(animated){const animate=(frames,options)=>{const result={frames,options,cancelled:false,cancel(){this.cancelled=true;}};animations.push(result);return result;};layer.animate=animate;app.animate=animate;}
 vm.runInNewContext(source,{window:{matchMedia:()=>({matches:reduced}),location:{pathname:path},addEventListener(k,f){windowEvents[k]=f;}},document:{querySelector:s=>s==='#appLaunchIntro'?layer:app},nav:s=>calls.push(s),setTimeout:f=>{timers.set(++timerId,f);return timerId;},clearTimeout:id=>timers.delete(id)});
 return {events,clicks,windowEvents,calls,video,layer,app,retry,timers,animations};
}
test('every fresh launch plays once then ends on home; duplicate completion is harmless',()=>{for(let i=0;i<2;i++){const h=setup();assert.equal(h.video.muted,true);assert.equal(h.video.currentTime,0);assert.equal(h.app.inert,true);h.events.ended();h.events.error();assert.equal(h.calls.filter(v=>v==='home').length,1);assert.equal(h.layer.hidden,true);assert.equal(h.app.inert,false);}});
test('autoplay rejection offers a play button while skip still opens home',async()=>{const h=setup({blocked:true});await Promise.resolve();assert.equal(h.retry.hidden,false);assert.equal(h.calls.includes('home'),false);h.clicks.skip();assert.equal(h.calls.includes('home'),true);});
test('media failure and loading timeout cannot trap the visitor',()=>{const a=setup();a.events.error();assert.equal(a.layer.hidden,true);const b=setup();[...b.timers.values()][0]();assert.equal(b.layer.hidden,true);});
test('playback cancels loading timeout and restored documents replay the intro',()=>{const h=setup();h.events.playing();assert.equal(h.timers.size,0);h.events.ended();h.windowEvents.pageshow({persisted:true});assert.equal(h.layer.hidden,false);assert.equal(h.app.inert,true);assert.equal(h.calls.filter(v=>v==='play').length,2);});
test('OAuth return is allowed to complete without launch navigation',()=>{const h=setup({path:'/busandrop/auth/callback'});assert.equal(h.layer.hidden,true);assert.equal(h.calls.length,0);});

test('last frame crossfades over the prepared home before interactions unlock',()=>{
 const h=setup({animated:true});h.events.playing();h.events.ended();
 assert.equal(h.calls.filter(v=>v==='home').length,1);assert.equal(h.layer.hidden,false);assert.equal(h.app.inert,true);assert.equal(h.animations.length,2);
 assert.equal(h.animations[0].frames[0].transform,'translateY(12px)');assert.equal(h.animations[1].options.duration,640);
 h.animations[1].onfinish();assert.equal(h.layer.hidden,true);assert.equal(h.app.inert,false);assert.equal(h.timers.size,0);
});
test('reduced motion bypasses the transition and stalled animations have a cleanup fallback',()=>{
 const h=setup({animated:true,reduced:true});h.events.ended();assert.equal(h.animations.length,0);assert.equal(h.layer.hidden,true);
 const b=setup({animated:true});b.events.ended();[...b.timers.values()][0]();assert.equal(b.layer.hidden,true);assert.equal(b.app.inert,false);
});
