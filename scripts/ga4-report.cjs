const {execFileSync}=require('node:child_process');

const campaignDimensions=['date','country','sessionSource','sessionMedium','sessionCampaignName','sessionManualAdContent'];
const productEvents=[
  'event_detail_viewed','event_like_added','plan_creation_started','plan_view_dates','plan_view_events',
  'plan_view_sights','plan_view_food','plan_view_review','plan_step_completed','plan_step_skipped',
  'plan_saved','plan_cloud_synced'
];
const reports={
  acquisition:{dimensions:campaignDimensions,metrics:['sessions']},
  campaignActions:{dimensions:[...campaignDimensions,'eventName'],metrics:['eventCount','totalUsers'],events:productEvents}
};

async function main(){
  const property=process.env.BUSANDROP_GA4_PROPERTY_ID;
  if(!/^\d+$/.test(property||''))throw Error('Set BUSANDROP_GA4_PROPERTY_ID to the BUSAN DROP numeric GA4 property ID.');
  const [startDate,endDate]=process.argv.slice(2);
  const isDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
  if(!isDate(startDate)||!isDate(endDate)||startDate>endDate)throw Error('Usage: node scripts/ga4-report.cjs YYYY-MM-DD YYYY-MM-DD');
  let token=process.env.BUSANDROP_GA4_ACCESS_TOKEN;
  if(!token){
    try{token=execFileSync('gcloud',['auth','application-default','print-access-token'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}
    catch{throw Error('Set a GA4 read-only OAuth access token or configure gcloud application default credentials.');}
  }
  async function runReport({dimensions,metrics,events}){
    const body={dateRanges:[{startDate,endDate}],dimensions:dimensions.map(name=>({name})),metrics:metrics.map(name=>({name})),limit:'10000'};
    if(events)body.dimensionFilter={filter:{fieldName:'eventName',inListFilter:{values:events,caseSensitive:true}}};
    const rows=[];
    let metadata;
    do{
      const response=await fetch('https://analyticsdata.googleapis.com/v1beta/properties/'+property+':runReport',{
        method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
        body:JSON.stringify({...body,offset:String(rows.length)}),signal:AbortSignal.timeout(30000),redirect:'error'
      });
      if(!response.ok)throw Error('GA4 Data API returned HTTP '+response.status);
      const data=await response.json();
      metadata=data.metadata;
      const page=data.rows||[];
      for(const row of page)rows.push(Object.fromEntries([
        ...dimensions.map((name,i)=>[name,row.dimensionValues[i].value]),
        ...metrics.map((name,i)=>[name,Number(row.metricValues[i].value)])
      ]));
      if(rows.length>=(data.rowCount||0))break;
      if(!page.length)throw Error('GA4 report pagination returned an incomplete result.');
    }while(true);
    return {rows,subjectToThresholding:metadata?.subjectToThresholding||false,dataLossFromOtherRow:metadata?.dataLossFromOtherRow||false};
  }
  const result={property,startDate,endDate};
  for(const [name,report] of Object.entries(reports))result[name]=await runReport(report);
  console.log(JSON.stringify(result,null,2));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
