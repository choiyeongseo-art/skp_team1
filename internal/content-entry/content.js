(() => {
  'use strict';
  const sections=window.ContentEntryFields, form=document.querySelector('#entry'), status=document.querySelector('#status');
  const storageKey='busandrop.content-entry.v2.draft';
  let locale='ko', draft={schemaVersion:2,values:{},updatedAt:null}, dirty=false;
  try {const saved=JSON.parse(localStorage.getItem(storageKey));if(saved?.schemaVersion===2&&saved.values&&typeof saved.values==='object'&&!Array.isArray(saved.values))draft=saved;}catch {status.textContent='저장된 초안을 읽을 수 없습니다. 새 초안으로 시작합니다.';}
  const el=(tag,props={})=>Object.assign(document.createElement(tag),props);
  function message(){status.textContent=dirty?'저장하지 않은 변경사항 있음':draft.updatedAt?'이 브라우저 저장: '+new Date(draft.updatedAt).toLocaleString('ko-KR'):'새 초안 · 아직 저장하지 않음';}
  function change(){dirty=true;message();}
  function field(def,values){
    if(def.type==='rows'){
      const box=el('div',{className:'rows'}), heading=el('strong',{textContent:def.label});box.append(heading);
      const rows=Array.isArray(values[def.key])?values[def.key]:[];
      const list=el('div');box.append(list);
      rows.forEach((row,index)=>{const card=el('div',{className:'row'}),head=el('div',{className:'row-head'}),remove=el('button',{type:'button',className:'remove',textContent:'삭제'});head.append(el('strong',{textContent:def.label+' '+(index+1)}),remove);remove.onclick=()=>{if(!confirm('이 입력 항목을 초안에서 삭제할까요?'))return;rows.splice(index,1);values[def.key]=rows;change();render();};card.append(head,fields(def.fields,row));list.append(card);});
      if(!rows.length)list.append(el('p',{className:'empty',textContent:'입력 항목 없음 · 필요할 때 추가하세요.'}));
      const add=el('button',{type:'button',textContent:'+ '+def.label+' 추가'});add.onclick=()=>{rows.push({});values[def.key]=rows;change();render();};box.append(add);return box;
    }
    const label=el('label',{className:'field'+(['i18n','textarea'].includes(def.type)?' wide':'')}),title=el('span',{textContent:def.label});
    if(def.type==='i18n')title.append(el('small',{className:'locale-mark',textContent:locale}));label.append(title);
    let input;
    if(def.type==='select') {input=el('select');for(const option of def.options){const [value,...text]=option.split(':');input.append(el('option',{value,textContent:text.join(':')}));}input.value=values[def.key]??input.options[0].value;if(values[def.key]===undefined)values[def.key]=input.value;}
    else if(def.type==='i18n'||def.type==='textarea')input=el('textarea',{value:def.type==='i18n'?(values[def.key]?.[locale]||''):(values[def.key]||'')});
    else {input=el('input',{type:def.type,value:values[def.key]??''});if(def.type==='number'){input.step='any';}if(def.type==='checkbox')input.checked=!!values[def.key];}
    input.oninput=()=>{if(def.type==='i18n'){values[def.key]={...values[def.key],[locale]:input.value};}else values[def.key]=def.type==='checkbox'?input.checked:input.value;change();};
    label.append(input,el('code',{textContent:def.key}));return label;
  }
  function fields(defs,values){const grid=el('div',{className:'grid'});defs.forEach(def=>grid.append(field(def,values)));return grid;}
  function render(){form.replaceChildren();sections.forEach((section,index)=>{const box=el('section',{id:'step-'+index}),h=el('h2');h.append(el('small',{textContent:String(index+1).padStart(2,'0')}),document.createTextNode(section.title));box.append(h,el('p',{className:'hint',textContent:section.hint}),fields(section.fields,draft.values));form.append(box);});message();}
  sections.forEach((section,index)=>{const a=el('a',{href:'#step-'+index});a.append(el('b',{textContent:String(index+1).padStart(2,'0')}),document.createTextNode(section.title));document.querySelector('#steps').append(a);});
  document.querySelector('#locale').onchange=e=>{locale=e.target.value;render();};
  document.querySelector('#save').onclick=()=>{try{draft.updatedAt=new Date().toISOString();localStorage.setItem(storageKey,JSON.stringify(draft));dirty=false;message();}catch {status.textContent='브라우저에 저장하지 못했습니다. JSON으로 내보내 주세요.';}};
  document.querySelector('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({...draft,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}));const a=el('a',{href:url,download:'busandrop-content-draft-'+new Date().toISOString().slice(0,10)+'.json'});a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  form.onsubmit=e=>e.preventDefault();window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});render();
})();
