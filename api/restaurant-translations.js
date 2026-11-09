const path=require('path');
module.exports=require('../lib/supabase-nearby.cjs').createNearbyHandler({dictionary:true,kind:'food',locationFile:path.join(__dirname,'../busan-drop/data/store-locations.js')});
