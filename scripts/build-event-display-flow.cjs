const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function generate(root=path.resolve(__dirname,'..')){
 const contract=require(path.join(root,'internal/event-workflow/contract.json'));
 const context={window:{}};vm.createContext(context);for(const name of ['event-details','store-locations'])vm.runInContext(fs.readFileSync(path.join(root,'busan-drop/data',name+'.js'),'utf8'),context);
 const placement={
 '몬치치':['benefits','admission','content','products'],'올리브영':['benefits','benefits','benefits'],'유니클로':['benefits','products','international'],'자라':['products','international','trust','international'],
 '와키윌리':['products','alerts'],'참치학교':['products','content'],'원피스 무기와라 스토어':['admission','benefits','products'],'와이잭':['products','benefits','admission'],'젤라또 피케':['products','benefits','benefits','benefits'],
 '리락쿠마·스미코구라시':['admission','benefits','products','content'],'메이플스토리':['content','content','admission','admission'],
 '시그니엘 부산':['products','products','products','products','admission'],'웨스틴 조선 부산':['products','products','products','products','products','benefits','admission'],'그랜드 조선 부산':['products','products','products','products','products','alerts','benefits','admission'],
 '해리포터 마호도코로':['benefits','admission','products'],'히나쿠우':['benefits','products','admission','location'],'달달더마켓':['content'],'광안리 M 드론×레이저쇼':['content'],'G-STAR':['admission','admission']};
 const mapping={};for(const[brand,event]of Object.entries(context.window.BUSAN_EVENT_DETAILS)){
  if((event.sections||[]).length!==(placement[brand]||[]).length)throw Error('행사 섹션 배치 재검토 필요: '+brand);
  mapping[brand]=Object.fromEntries((event.sections||[]).map((s,i)=>[s.title,placement[brand][i]]));
 }
 Object.assign(mapping['올리브영'],{'11월 7일 · 블프라이즈 박스':'benefits','이 매장 공지의 쿠폰 조건':'benefits'});
 mapping['유니클로']['이 매장은 면세 이용 불가']='international';
 for(const v of context.window.BUSAN_STORE_LOCATIONS)for(const s of v.eventOverrides?.sections||[])if(!mapping[v.brand]?.[s.title])throw Error('지점 섹션 배치 필요: '+v.id+' '+s.title);
 const value={version:contract.schema_version,sections:contract.sections.map(({key,order,title})=>({key,order,title})),mapping};
 fs.writeFileSync(path.join(root,'busan-drop/data/event-display-flow.js'),'/* Generated from the common research contract; rebuild with npm run build. */\nwindow.BUSAN_EVENT_DISPLAY_FLOW='+JSON.stringify(value)+';\n');return value;
}
if(require.main===module)generate();module.exports={generate};
