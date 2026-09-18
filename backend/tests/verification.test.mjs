import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verifyPlayer} from '../controllers/g2bulk.controller.js';

test('verification accepts real response shape, caches, separates zones, and rejects upstream errors', async () => {
 const original = global.fetch;
 process.env.G2BULK_API_KEY = 'test-only';
 let calls = 0;
 let response = () => new Response(JSON.stringify({valid:'valid',name:'Test Player'}), {status:200});
 global.fetch = async () => {calls++; return response();};
 async function check(uid, zoneId='1000') {
   let body, status=200;
   await verifyPlayer({body:{uid,zoneId,game:'mlbb-diamond-recharge-india'},ip:'test'}, {set(){},status(value){status=value;return this;},json(value){body=value;return this;}});
   return {status,body};
 }
 try {
   assert.equal((await check('123456789')).body.data.username,'Test Player');
   assert.equal((await check('123456789')).body.data.cached,true);
   assert.equal(calls,1);
   await check('123456789','2000'); assert.equal(calls,2);
   response=()=>new Response(JSON.stringify({valid:'invalid',name:''}),{status:400});
   assert.equal((await check('123456780')).body.data.verified,false);
   response=()=>new Response(JSON.stringify({error:'unknown endpoint'}),{status:404});
   assert.equal((await check('123456781')).status,503);
   response=()=>new Response('<html>Unavailable</html>',{status:503});
   assert.equal((await check('123456782')).status,503);
   response=()=>new Response('<html>Unauthorized</html>',{status:401});
   const before=calls; assert.equal((await check('123456783')).status,503);
   await check('123456784'); assert.equal(calls,before+1);
 } finally {global.fetch=original;}
});
