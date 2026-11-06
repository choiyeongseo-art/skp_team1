const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../../busan-drop/integration/page-routes.js'),'utf8');
function setup(initialPath){
 const calls=[],listeners={},elements={};
 const location={pathname:initialPath};
 const context={state:{screen:'intro'},historyStack:[],render(){calls.push('render');},document:{querySelector(s){return elements[s]??=( {innerHTML:'modal',scrollTop:50} );}},window:{location,history:{pushState(state,title,url){calls.push(['push',url]);location.pathname=url;},replaceState(state,title,url){calls.push(['replace',url]);location.pathname=url;}},addEventListener(name,fn){listeners[name]=fn;}}};
 vm.createContext(context);vm.runInContext(source,context);
 return {context,calls,listeners,location,elements};
}
test('login opens the welcome screen; language selection stays at login until home',()=>{
 const {context:c,calls,location}=setup('/busandrop/login');
 assert.equal(c.state.screen,'intro');
 c.state.screen='language';c.render();assert.equal(location.pathname,'/busandrop/login');
 c.state.screen='home';c.render();assert.equal(location.pathname,'/busandrop/home');
 c.render();assert.equal(calls.filter(x=>Array.isArray(x)&&x[0]==='push').length,1);
});
test('direct home access and reload start at home',()=>{
 const {context:c,location}=setup('/busandrop/home');
 assert.equal(c.state.screen,'home');assert.equal(location.pathname,'/busandrop/home');
 c.state.screen='stores';c.render();assert.equal(location.pathname,'/busandrop/home');
});
test('back and forward restore the matching screen without adding history',()=>{
 const {context:c,calls,listeners,location,elements}=setup('/busandrop/login');
 c.state.screen='home';c.render();const count=calls.length;
 location.pathname='/busandrop/login';listeners.popstate();assert.equal(c.state.screen,'intro');
 assert.equal(elements['#modal'].innerHTML,'');assert.equal(elements['#viewport'].scrollTop,0);
 location.pathname='/busandrop/home';listeners.popstate();assert.equal(c.state.screen,'home');
 assert.equal(calls.slice(count).filter(x=>Array.isArray(x)).length,0);
});
