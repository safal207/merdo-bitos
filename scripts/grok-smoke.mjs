import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const types={".html":"text/html;charset=utf-8",".js":"application/javascript;charset=utf-8",".css":"text/css;charset=utf-8",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml"};
const server=createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://local/").pathname);
  const abs=path.resolve(root,name==="/index.html"||name==="/"? "index.html":name.slice(1));
  if(!(abs===root||abs.startsWith(root+path.sep))){res.writeHead(403).end();return}
  const data=await readFile(abs);res.writeHead(200,{"content-type":types[path.extname(abs)]||"application/octet-stream"}).end(data);
 }catch(e){res.writeHead(404).end("Not found")}
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const base="http://127.0.0.1:"+server.address().port+"/";
const browser=await chromium.launch({headless:true});
const results=[];
await mkdir(path.join(root,"artifacts"),{recursive:true});
try{
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:"reduce",locale:"ru-RU"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(base,{waitUntil:"domcontentloaded"});
  await page.locator('[data-action="start"]').waitFor();
  assert.match(await page.locator("#grokTitle").innerText(),/Образ на модели/);
  assert.equal(await page.locator(".grok-introPhotos img").count(),2);
  assert.equal(await page.locator(".grok-introPhotos img").first().evaluate(i=>i.naturalWidth>0),true,"original Grok photo loads");
  await page.screenshot({path:path.join(root,"artifacts","grok-start-"+width+".png"),fullPage:true});
  // Woman, creative, loose fit, relaxed trousers, existing shoes,
  // budget 15000 TRY, 400 TRY alteration, own navy blazer.
  await page.locator('[data-action="start"]').click();
  await page.locator('[data-set="gender"][data-val="woman"]').click();
  await page.locator('[data-set="occasion"][data-val="creative"]').click();
  await page.locator('[data-action="next"]').click();
  await page.locator('[data-set="fit"][data-val="loose"]').click();
  await page.locator('[data-set="pants"][data-val="relaxed"]').click();
  await page.locator('[data-set="shoe"][data-val="have"]').click();
  await page.locator('[data-action="next"]').click();
  await page.locator('#grokBudget').fill("15000");
  await page.locator("#grokBudget").dispatchEvent("change");
  await page.locator('[data-action="next"]').click();
  await page.locator('[data-tailor="hem"]').click();
  await page.locator('[data-owned="jacket"]').click();
  await page.locator('[data-color="jacket"][data-val="navy"]').click();
  await page.locator('[data-action="next"]').click();
  const quote=await page.evaluate(()=>window.BitOSGrok.getQuote());
  assert.equal(quote.toBuy,7650);assert.equal(quote.reserve,7350);assert.equal(quote.tailor,400);
  assert.equal(quote.amounts.jacket,0);assert.equal(quote.amounts.shoes,0);assert.equal(quote.amounts.details,1200);
  assert.equal(await page.locator(".grok-resultPhoto img").count(),1);
  assert.equal(await page.locator(".grok-resultPhoto img").getAttribute("src"),"./looks/woman-creative.jpg");
  assert.equal(await page.locator(".grok-resultPhoto img").evaluate(i=>i.naturalWidth>0),true,"woman creative original photo loads");
  assert.match(await page.locator(".grok-pricebox").first().innerText(),/7[\s\u00a0]?650/);
  assert.match(await page.locator(".grok-pricebox").first().innerText(),/7[\s\u00a0]?350/);
  assert.match(await page.locator(".grok-pricebox").first().innerText(),/400/);
  assert.match(await page.locator(".grok-shortParts").innerText(),/Уже есть/);
  await page.screenshot({path:path.join(root,"artifacts","grok-final-"+width+".png"),fullPage:true});
  await page.locator('[data-action="details"]').click();
  assert.match(await page.locator("#grokDetails").innerText(),/На примерке/);
  assert.match(await page.locator("#grokDraft").inputValue(),/свободнее/i);
  assert.match(await page.locator("#grokDraft").inputValue(),/свободные/i);
  assert.match(await page.locator("#grokDraft").inputValue(),/тёмно-синий/i);
  await page.reload({waitUntil:"domcontentloaded"});
  assert.equal(await page.locator(".grok-resultPhoto img").getAttribute("src"),"./looks/woman-creative.jpg");
  assert.equal((await page.evaluate(()=>window.BitOSGrok.getQuote())).toBuy,7650);
  await page.locator('[data-lang="tr"]').click();
  assert.equal(await page.locator("html").getAttribute("lang"),"tr");
  assert.match(await page.locator(".grok-resultName").innerText(),/smart casual|Yaratıcı/i);
  await page.locator('[data-lang="ru"]').click();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=2,"horizontal overflow "+overflow+"px at "+width);
  assert.equal(await page.locator('.grok-legacyLinks a[href="./legacy.html#myWardrobe"]').count(),1);
  assert.deepEqual(errors,[],"no uncaught JS errors");
  results.push({viewport:width,scenario:"woman-creative-exact-quote",passed:true});
  await page.close();
 }
 console.log(JSON.stringify({suite:"Grok handoff acceptance",results}));
}finally{await browser.close();await new Promise(r=>server.close(r))}
