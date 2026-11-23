import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile,mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const types={".html":"text/html;charset=utf-8",".js":"application/javascript;charset=utf-8",".css":"text/css;charset=utf-8",".jpg":"image/jpeg",".webp":"image/webp"};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://local/").pathname);
  const p=path.resolve(base,pathname==="/"?"index.html":pathname.slice(1));
  if(!p.startsWith(base+path.sep)){res.writeHead(403).end();return}
  res.writeHead(200,{"content-type":types[path.extname(p)]||"application/octet-stream"}).end(await readFile(p));
 }catch(err){res.writeHead(404).end("Not Found")}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const url="http://127.0.0.1:"+server.address().port+"/";
await mkdir(path.join(base,"artifacts"),{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const width of [390,1280]){
  // Use fresh sessions: wardrobe choices must never bleed into unrelated customer samples.
  const context=await browser.newContext({viewport:{width,height:844},locale:"ru-RU",reducedMotion:"reduce"});
  const page=await context.newPage();
  const errors=[];page.on("pageerror",err=>errors.push(err.message));
  await page.goto(url+"legacy.html#myWardrobe",{waitUntil:"domcontentloaded"});
  await page.locator('input[name="wardrobe-jacket"]').check();
  await page.locator('select[name="wardrobe-color-jacket"]').selectOption("navy");
  await page.locator('input[name="wardrobe-trousers"]').check();
  await page.locator('select[name="wardrobe-cut-trousers"]').selectOption("relaxed");
  await page.locator('input[name="wardrobe-shoes"]').check();
  assert.equal(await page.locator(".bitosHandoff").count(),2);
  const p=page.locator('.bitosHandoff[data-bridge="wardrobe"]');
  assert.match(await p.innerText(),/фото|fotoğraf/i);
  await p.locator(".bitosBridgeGo").click();
  await page.locator("#grokStepTitle").waitFor({timeout:12000});
  const state=await page.evaluate(()=>window.BitOSGrok.getState());
  assert.equal(state.owned.jacket,true);
  assert.equal(state.owned.trousers,true);
  assert.equal(state.owned.shoes,true);
  assert.equal(state.colors.jacket,"navy");
  assert.equal(state.pants,"relaxed");
  assert.equal(state.shoe,"have");
  assert.equal(state.handoffType,"wardrobe");
  assert.equal((await page.evaluate(()=>window.BitOSGrok.getQuote())).amounts.jacket,0);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem("bitos:grok-handoff:v1")),null,"one-use payload consumed");
  assert.equal(new URL(page.url()).searchParams.has("handoff"),false,"transfer parameter removed");
  assert.match(await page.locator(".grok-bridgeNotice").innerText(),/Гардероб перенесён/);
  await page.reload({waitUntil:"domcontentloaded"});
  assert.equal((await page.evaluate(()=>window.BitOSGrok.getState())).colors.jacket,"navy","transfer persists without shared backend");
  assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(base,"artifacts","bridge-wardrobe-"+width+".png"),fullPage:true});
  await context.close();
  results.push({viewport:width,journey:"wardrobe → Grok",passed:true});

  const sampleContext=await browser.newContext({viewport:{width,height:844},locale:"ru-RU",reducedMotion:"reduce"});
  const samplePage=await sampleContext.newPage();
  const sampleErrors=[];samplePage.on("pageerror",err=>sampleErrors.push(err.message));
  await samplePage.goto(url+"legacy.html#demoProducts",{waitUntil:"domcontentloaded"});
  const expectedLang=width===390?"ru":"tr";
  if(await samplePage.locator("html").getAttribute("lang")!==expectedLang)await samplePage.locator("#language").click();
  assert.equal(await samplePage.locator("html").getAttribute("lang"),expectedLang);
  await samplePage.locator('select[name="sample-size-TEST-W-01"]').selectOption("M");
  await samplePage.locator('[data-sample-action="toggle"][data-id="TEST-W-01"]').click();
  await samplePage.locator('[data-sample-action="toggle"][data-id="TEST-W-02"]').click();
  assert.equal(await samplePage.locator(".sampleCount").innerText(),"2");
  await samplePage.locator('.bitosHandoff[data-bridge="samples"] .bitosBridgeGo').click();
  await samplePage.locator("#grokStepTitle").waitFor({timeout:12000});
  const imported=await samplePage.evaluate(()=>window.BitOSGrok.getState());
  assert.equal(imported.gender,"woman");
  assert.equal(imported.budget,6850);
  assert.equal(imported.samples.length,2);
  assert.deepEqual(imported.samples.map(x=>x.id),["TEST-W-01","TEST-W-02"]);
  assert.equal(imported.samples[0].size,"M");
  assert.equal(imported.handoffType,"samples");
  assert.equal(await samplePage.locator("html").getAttribute("lang"),expectedLang,"language crosses the page boundary");
  assert.equal(imported.owned.jacket,false,"sample items are NOT owned clothing");
  assert.match(await samplePage.locator(".grok-bridgeNotice").innerText(),expectedLang==="ru"?/Тестовые карточки перенесены/:/Örnek ürünler aktarıldı/);
  await samplePage.locator('[data-action="next"]').click();
  await samplePage.locator('[data-action="next"]').click();
  await samplePage.locator('[data-action="next"]').click();
  await samplePage.locator('[data-action="next"]').click();
  const summary=samplePage.locator(".grok-importedSamples");
  assert.equal(await summary.isVisible(),true);
  assert.equal(await summary.locator("li").count(),2);
  assert.match(await summary.innerText(),/6[\s\u00a0]?850/);
  assert.match(await summary.innerText(),/TEST-W-01/);
  assert.match(await summary.innerText(),expectedLang==="ru"?/вымышленные товары/:/kurgu ürünler/);
  assert.equal((await samplePage.evaluate(()=>window.BitOSGrok.getQuote())).toBuy<=6850,true);
  await samplePage.reload({waitUntil:"domcontentloaded"});
  assert.equal(await samplePage.locator(".grok-importedSamples li").count(),2,"selection persists across reload");
  await samplePage.screenshot({path:path.join(base,"artifacts","bridge-samples-"+width+".png"),fullPage:true});
  assert.deepEqual(sampleErrors,[]);
  await sampleContext.close();
  results.push({viewport:width,journey:"sample cards → Grok",passed:true});
 }
 console.log(JSON.stringify({suite:"Merdo v2 cross-page transfer",results},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
