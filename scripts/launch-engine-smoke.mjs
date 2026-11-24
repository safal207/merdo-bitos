import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {chromium} from "playwright";
const root=resolve("."),server=createServer(async(req,res)=>{
 try{const url=new URL(req.url,"http://localhost"),file=resolve(root,"."+url.pathname+(url.pathname.endsWith("/")?"index.html":""));
 if(!file.startsWith(root+sep)){res.writeHead(403).end();return}
 const data=await readFile(file);res.writeHead(200,{"Content-Type":extname(file)===".html"?"text/html; charset=utf-8":"text/javascript; charset=utf-8"}).end(data)}
 catch{res.writeHead(404).end()}
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});await mkdir("artifacts/launch-engine",{recursive:true});
 const base="http://127.0.0.1:"+server.address().port;
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route("**/*",r=>{const u=new URL(r.request().url());return u.origin===base||(u.origin==="https://esm.sh"&&r.request().resourceType()==="script")?r.continue():r.abort()});
  await page.goto(base+"/atelier23/launch/");await page.locator('[data-renderer="react"]').waitFor();
  assert.equal(await page.locator('[name="gate-open"]').isDisabled(),true);
  await page.locator("#launch-date").fill("2026-12-10");
  await page.locator('[name="gate-research"]').check();await page.locator('[name="gate-plc1"]').check();
  assert.equal(await page.locator('[name="gate-plc2"]').isEnabled(),true);
  await page.locator("#launch-date").fill("2026-12-11");assert.equal(await page.locator('[name="gate-research"]').isChecked(),false);
  await page.locator("#m-visits").fill("100");await page.locator("#m-leads").fill("101");assert.equal(await page.locator("#save").isDisabled(),true);
  await page.locator("#m-leads").fill("10");await page.locator("#m-orders").fill("2");await page.locator("#m-revenue").fill("3000");await page.locator("#m-variableCost").fill("1500");await page.locator("#m-campaignCost").fill("500");
  assert.match(await page.locator(".metric").last().innerText(),/200\.0%/);
  await page.locator("#save").click();await page.locator('[data-campaign="pilot"]').click();assert.equal(await page.locator("#m-revenue").inputValue(),"");
  await page.locator('[data-campaign="gift"]').click();assert.equal(await page.locator("#m-revenue").inputValue(),"3000");
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await page.screenshot({path:"artifacts/launch-engine/"+width+".png",fullPage:true});await page.locator("#reset").click();assert.equal(await page.locator("#m-revenue").inputValue(),"");
  assert.deepEqual(errors,[]);await page.close();console.log("PASS "+width+"px calendar, sequential gates, economics, isolation, reset, layout");
 }
}finally{if(browser)await browser.close();server.close()}
