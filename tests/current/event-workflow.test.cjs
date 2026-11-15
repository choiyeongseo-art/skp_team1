const {test}=require('node:test'),assert=require('node:assert/strict');
const {template,validate,contract,ordered}=require('../../scripts/event-workflow.cjs');
const {audit}=require('../../scripts/audit-event-content.cjs');
const draft=()=>template('sample-popup','popup','centum-b2');
const fact=(value,kind='official')=>({status:'confirmed',value,sources:[{url:'https://example.com/event',kind,checked_at:'2026-11-14'}]});
test('all seven categories create complete unknown drafts without inventing facts',()=>{
 assert.equal(Object.keys(contract.categories).length,7);
 for(const c of Object.keys(contract.categories))assert.deepEqual(validate(template('sample',c,'venue')).errors,[]);
 assert.equal(draft().sections.visit.admission.value,null);
});
test('unknown cannot silently become free or available',()=>{
 const d=draft();d.sections.visit.admission.value='free';assert.ok(validate(d).errors.some(e=>e.includes('value는 null')));
});
test('secondary evidence cannot be labelled confirmed',()=>{
 const d=draft();d.sections.intro.name=fact({ko:'행사'},'secondary');assert.ok(validate(d).errors.some(e=>e.includes('공식/현장')));
 d.sections.intro.name.status='reported';assert.deepEqual(validate(d).errors,[]);
});
test('source dates, calendar ranges and prices are validated',()=>{
 const d=draft();d.sections.visit.period=fact({start:'2026-02-30',end:'2026-03-01'});assert.ok(validate(d).errors.length);
 d.sections.visit.period=fact({start:'2026-11-14',end:'2026-11-15'});d.sections.visit.period.sources[0].checked_at='2026-02-30';assert.ok(validate(d).errors.length);
});
test('multiple sessions per day work; duplicate IDs fail',()=>{
 const d=draft();const row=id=>fact({id,name:{ko:'몬치치 등장'},date:'2026-11-14',starts_at:'12:00',ends_at:null,state:'scheduled',conditions:null});
 d.sections.content.sessions=fact([row('noon'),row('afternoon')]);d.sections.content.sessions.value[1].value.starts_at='15:00';assert.deepEqual(validate(d).errors,[]);
 d.sections.content.sessions.value[1].value.id='noon';assert.ok(validate(d).errors.some(e=>e.includes('ID 중복')));
});
test('price unit, currency and original price protect product input',()=>{
 const d=draft();const row={id:'keyring',name:{ko:'키링'},image_url:null,option:null,price:22000,original_price:21000,currency:null,unit:null,purchase_limit:2,stock_status:'unknown',conditions:null};
 d.sections.products.items=fact([fact(row)]);const errors=validate(d).errors.join('\n');assert.match(errors,/정가/);assert.match(errors,/통화/);assert.match(errors,/단위/);
 row.original_price=null;row.currency='KRW';row.unit='1개';assert.deepEqual(validate(d).errors,[]);
});
test('closed overnight is explicit and slot dates preserve validation',()=>{
 const d=draft();const row={weekday:6,opens_at:'22:00',closes_at:'01:00',closes_next_day:false,last_admission_at:null,registration_deadline_at:null,basis:'행사장'};
 d.sections.admission.opening_hours=fact([fact(row)]);assert.ok(validate(d).errors.some(e=>e.includes('익일')));row.closes_next_day=true;assert.deepEqual(validate(d).errors,[]);
});
test('intake never publishes and rejects unsupported categories, fields and absent facts',()=>{
 const d=draft();d.publication_status='published';d.category='art';d.sections.intro.secret='bad';delete d.sections.location.address_ko;assert.ok(validate(d).errors.length>=4);
});
test('secondary food profile must be filled explicitly; no automatic dietary claims',()=>{
 const d=draft();d.secondary_categories=['food'];assert.ok(validate(d).errors.some(e=>e.includes('allergens')));
});
test('ready requires identity and official reference but permits explicitly unknown schedules',()=>{
 const d=draft();assert.ok(validate(d,{ready:true}).errors.length);
 for(const[s,k,v]of [['intro','name',{ko:'행사'}],['intro','summary',{ko:'소개'}],['location','name',{ko:'지점'}],['location','address_ko','부산 해운대구'],['trust','official_url','https://example.com/event']])d.sections[s][k]=fact(v);
 assert.deepEqual(validate(d,{ready:true}).errors,[]);assert.ok(validate(d,{ready:true}).warnings.some(w=>w.includes('일정 미확정')));
});
test('normalization follows the canonical ten section order',()=>{
 const d=draft();d.sections=Object.fromEntries(Object.entries(d.sections).reverse());assert.deepEqual(Object.keys(ordered(d).sections),contract.sections.map(s=>s.key));
});
test('full audit includes expired events, all branch overrides and missing details',()=>{
 const a=audit('2026-11-14');assert.equal(a.events.length,20);assert.equal(a.branches.length,33);assert.equal(a.summary.visibleEvents,13);assert.equal(a.summary.visibleLocations,24);
 assert.equal(a.events.find(e=>e.brand==='티파니앤코').detailPresent,false);assert.ok(a.events.find(e=>e.brand==='몬치치').issues.some(s=>s.includes('충돌')));
 assert.ok(a.branches.find(b=>b.id==='uniqlo-4').overrides.includes('payment'));
});
test('CLI writes an ordered review bundle and refuses overwrite or unready input',()=>{
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'busandrop-intake-'));
 const cli=path.resolve(__dirname,'../../scripts/event-workflow.cjs');
 const run=args=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});
 try{
  const input=path.join(temp,'research.json'),out=path.join(temp,'review');
  assert.equal(run(['init','sample','popup','centum',input]).status,0);
  assert.ok(fs.existsSync(path.join(temp,'research.research.md')));
  assert.equal(run(['ingest',input,out]).status,1);assert.equal(fs.existsSync(out),false);
  const d=JSON.parse(fs.readFileSync(input));
  for(const[s,k,v]of [['intro','name',{ko:'검증용 행사'}],['intro','summary',{ko:'테스트 예시'}],['location','name',{ko:'테스트 지점'}],['location','address_ko','부산'],['trust','official_url','https://example.com/event']])d.sections[s][k]=fact(v);
  fs.writeFileSync(input,JSON.stringify(d));assert.equal(run(['ingest',input,out]).status,0);
  assert.deepEqual(fs.readdirSync(out).sort(),['draft.json','preview.md','validation.json']);
  assert.equal(run(['ingest',input,out]).status,1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(out,'draft.json'))).publication_status,'draft');
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
