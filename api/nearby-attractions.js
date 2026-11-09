const path=require('node:path');
module.exports=require('../lib/supabase-nearby.cjs').createNearbyHandler({locationFile:path.join(__dirname,'../busan-drop/data/store-locations.js')});
