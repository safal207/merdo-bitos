import {chromium,firefox,webkit} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const engine=process.env.QA_BROWSER||'chromium';
const browser=await ({chromium,firefox,webkit}[engine]).launch();
const out='instant-evidence/'+engine;
await fs.mkdir(out,{recursive:true});
const rows=[];
let failures=0;
try{
for(const variant of ['a','b'])for(const width of [320,390,768,1440])for(const js of [true,false]){
 const ctx=await browser.newContext({viewport:{width,height:844},javaScriptEnabled:js});
 const page=await ctx.newPage();
 const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8080/'))external.push(r.url())});
 const row={variant,width,js,engine};
 try{
  const url='http://127.0.0.1:8080/atelier23/instant-commerce/'+variant+'/';
  const start=Date.now();
  const r=await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
  const cta=page.locator('#booking');
  await cta.waitFor({state:'visible'});
  row.ctaObservedMs=Date.now()-start;
  assert.equal(r.status(),200);
  assert.equal(await cta.getAttribute('href'),'https://atelier-23.ru/sign-up-for-a-fitting-room/');
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex,nofollow');
  const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  assert.ok(dims.scroll<=dims.width,'horizontal overflow');
  const box=await cta.boundingBox();assert.ok(box&&box.height>=44&&box.y+box.height<=844,'CTA below first viewport or small');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'booking');
  await page.locator('summary').first().click();
  assert.equal(await page.locator('details').first().getAttribute('open'),'');
  if(js&&width===390)await page.screenshot({path:out+'/'+variant+'-390.png',fullPage:true});
  assert.deepEqual(external,[]);
  assert.deepEqual(errors,[]);
  row.status='pass';
 }catch(e){row.status='fail';row.error=e.message;failures++}
 finally{rows.push(row);await ctx.close()}
}
if(engine==='chromium')for(const variant of ['a','b']){
 const ctx=await browser.newContext({viewport:{width:390,height:844}});
 const page=await ctx.newPage();const row={variant,width:390,engine,scenario:'slow-network'};
 try{
 const cdp=await ctx.newCDPSession(page);
 await cdp.send('Network.enable');
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:400,downloadThroughput:50000,uploadThroughput:25000});
 const t=Date.now();
 await page.goto('http://127.0.0.1:8080/atelier23/instant-commerce/'+variant+'/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('#booking').waitFor({state:'visible'});
 row.ctaObservedMs=Date.now()-t;
 assert.ok(await page.locator('#booking').isEnabled());
 row.status='pass';
 }catch(e){row.status='fail';row.error=e.message;failures++}
 finally{rows.push(row);await ctx.close()}
}
}finally{await browser.close();await fs.writeFile(out+'/results.json',JSON.stringify(rows,null,2));console.log(JSON.stringify({engine,checks:rows.length,failures,rows}));if(failures)process.exitCode=1}
