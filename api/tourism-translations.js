const path=require('path');
module.exports=require('../lib/supabase-nearby.cjs').createNearbyHandler({dictionary:true,locationFile:path.join(__dirname,'../busan-drop/data/store-locations.js')});
