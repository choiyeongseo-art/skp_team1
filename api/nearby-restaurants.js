const path=require('node:path');
module.exports=require('../lib/supabase-nearby.cjs').createNearbyHandler({kind:'food',locationFile:path.join(__dirname,'../busan-drop/data/store-locations.js')});
