import {chromium,firefox,webkit} from "playwright";
import assert from "node:assert/strict";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
import {mkdir} from "node:fs/promises";
await mkdir("artifacts/audit-mobile",{recursive:true});
const engine=process.env.AUDIT_BROWSER||"chromium";
const browser=await ({chromium,firefox,webkit}[engine]).launch({headless:true});
try{
for(const width of [320,360,390,430,768,1280]){
const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<=430});
const errors=[];page.on("pageerror",e=>errors.push(e.message));
await page.goto(pathToFileURL(resolve("atelier23/audit/index.html")).href);
const root=page.locator("#emotional-audit"),cards=root.locator("details[data-ea]");
assert.equal(await cards.count(),3);
const photos=root.locator(".ea-visual img");
assert.equal(await photos.count(),3);
const sources=[];
for(const photo of await photos.all()){
 await photo.evaluate(img=>img.scrollIntoView({block:"center",behavior:"instant"}));
 const src=await photo.getAttribute("src");
 await page.waitForFunction(src=>{const img=[...document.querySelectorAll("#emotional-audit .ea-visual img")].find(x=>x.getAttribute("src")===src);return img&&img.complete&&img.naturalWidth>0&&img.naturalHeight>0},src,{timeout:15000});
 const info=await photo.evaluate(img=>({src:img.getAttribute("src"),w:img.naturalWidth,h:img.naturalHeight,fit:getComputedStyle(img).objectFit}));
 assert.ok(info.w===1199&&info.h===675,"scene image dimensions");
 assert.equal(info.fit,"cover");sources.push(info.src);
}
assert.deepEqual(sources,["chapter-01-desire.webp","chapter-02-search.webp","chapter-03-fitting.webp"]);
assert.equal(await page.locator(".hero .btn").getAttribute("href"),"#emotional-audit");
if(width===390||width===1280)await root.screenshot({path:`artifacts/audit-mobile/${engine}-${width}-emotional-closed.png`});

assert.equal(await root.locator("#ea-progress").innerText(),"Открыто доказательств: 0 из 3");
for(let i=0;i<3;i++){
const card=cards.nth(i),summary=card.locator("summary");
assert.equal(await card.evaluate(d=>d.open),false);
const b=await summary.boundingBox();assert.ok(b&&b.height>=44&&b.width>=44);
await summary.click();
await page.waitForFunction(n=>document.getElementById("ea-progress").textContent==="Открыто доказательств: "+n+" из 3",i+1);
assert.ok(await card.locator(".ea-metric").isVisible());
assert.ok(await summary.locator(".ea-open").isVisible());
assert.equal(await summary.locator(".ea-closed").isVisible(),false);
for(const a of await card.locator("a").all()){const href=await a.getAttribute("href");assert.equal(await page.locator(href).count(),1);}
}
const source=await page.locator("#search .proof img").first().getAttribute("src");
assert.equal(await root.locator("#ea-search-frame img").getAttribute("src"),source);
const zoom=root.locator("#ea-proof-open");
assert.ok(await zoom.isVisible());
if(width===390||width===1280)await root.locator(".ea-card").nth(1).screenshot({path:`artifacts/audit-mobile/${engine}-${width}-emotional-search.png`});
await zoom.click();
const dialog=page.locator("#proof-view");
assert.equal(await dialog.evaluate(d=>d.open),true);
assert.equal(await dialog.locator("#proof-viewport img").getAttribute("src"),source);
assert.equal(await dialog.locator("#proof-scale").innerText(),width<=430?"200%":"100%");
if(width===390)await page.screenshot({path:`artifacts/audit-mobile/${engine}-390-emotional-proof.png`});
await dialog.locator("#proof-close").click();
await page.waitForFunction(()=>!document.getElementById("proof-view").open&&document.activeElement.id==="ea-proof-open");
assert.equal(await cards.filter({has:page.locator(".ea-open:visible")}).count(),3);

assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
await cards.nth(1).locator("summary").click();
await page.waitForFunction(()=>document.getElementById("ea-progress").textContent==="Открыто доказательств: 2 из 3");
await root.locator("#ea-reset").click();
assert.equal(await root.locator("details[open]").count(),0);
assert.equal(await root.locator("#ea-progress").innerText(),"Открыто доказательств: 0 из 3");
assert.ok(await cards.nth(1).locator(".ea-closed").isVisible());
await cards.first().locator("summary").focus();await page.keyboard.press("Enter");
assert.ok(await cards.first().evaluate(d=>d.open));
await page.reload();assert.equal(await root.locator("details[open]").count(),0);
assert.deepEqual(errors,[]);
console.log(`PASS Director Cut ${engine} ${width}px: photo load, labels, proof dialog, focus, reset, no overflow`);
await page.close();
}
console.log("Emotional audit: "+engine+" 320/360/390/430/768/1280 PASS");
}finally{await browser.close();}
