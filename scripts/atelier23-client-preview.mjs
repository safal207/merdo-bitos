import assert from "node:assert/strict";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,join} from "node:path";
import {pathToFileURL} from "node:url";
import {chromium} from "playwright";
const src=resolve("atelier23/audit"),out=resolve("artifacts/client-preview");
await mkdir(out,{recursive:true});
let html=await readFile(join(src,"index.html"),"utf8");
const photos=["gentleman-hero.webp","chapter-01-desire.webp","chapter-02-search.webp","chapter-03-fitting.webp"];
for(const name of photos){
 const literal='src="'+name+'"';
 assert.ok(html.includes(literal),name);
 const data=(await readFile(join(src,name))).toString("base64");
 html=html.replaceAll(literal,'src="data:image/webp;base64,'+data+'"');
}
const path=join(out,"Atelier23-audit-preview.html");
await writeFile(path,html);
const browser=await chromium.launch({headless:true});
try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390,offline:true});
  const page=await context.newPage(),errors=[],outgoing=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/^https?:/i.test(r.url()))outgoing.push(r.url())});
  await page.goto(pathToFileURL(path).href);
  await page.locator(".hero .btn").click();
  await page.waitForURL(u=>u.hash==="#emotional-audit");
  const root=page.locator("#emotional-audit"),cards=root.locator("details[data-ea]");
  for(const photo of await root.locator(".ea-visual img").all()){
   await photo.scrollIntoViewIfNeeded();await photo.evaluate(i=>i.decode());
   assert.equal(await photo.evaluate(i=>i.naturalWidth),1199);
  }
  for(let i=0;i<3;i++){await cards.nth(i).locator("summary").click();assert.ok(await cards.nth(i).locator(".ea-metric").isVisible());}
  await page.waitForFunction(()=>document.getElementById("ea-progress").textContent==="Открыто доказательств: 3 из 3");
  await root.locator("#ea-proof-open").click();
  assert.ok(await page.locator("#proof-view").evaluate(d=>d.open));
  assert.equal(await page.locator("#proof-viewport img").getAttribute("src"),await page.locator("#search .proof img").first().getAttribute("src"));
  await page.locator("#proof-close").click();
  await root.locator('a[href="#guided-audit"]').click();
  await page.waitForURL(u=>u.hash==="#guided-audit");
  const guided=page.locator("#guided-audit");
  await guided.getByRole("button",{name:"Лиссабон",exact:true}).click();
  await guided.getByRole("button",{name:"Поиск и товары",exact:true}).click();
  assert.match(await guided.locator(".guided-number").innerText(),/21 результат.*0 карточек/);
  await guided.getByRole("button",{name:"Обсудить этот приоритет",exact:true}).click();
  await page.waitForURL(u=>u.hash==="#next-step");
  assert.ok(await page.locator('input[name="growth-market"][value="Лиссабон"]').isChecked());
  assert.ok(await page.locator("#growth-copy").isDisabled());
  await page.locator('input[name="growth-goal"][value="Технические исправления"]').check();
  assert.ok(await page.locator("#growth-copy").isEnabled());
  assert.match(await page.locator("#growth-brief").inputValue(),/Лиссабон.*Технические исправления/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);
  assert.deepEqual(outgoing,[],"offline preview made outbound requests");
  await page.locator("#next-step").screenshot({path:join(out,"pilot-"+width+".png")});
  await page.reload();
  assert.ok(await page.locator("#growth-copy").isDisabled());
  console.log("PASS Client Readiness "+width+"px: offline photos, 3 chapters, original proof, guided market and topic, pilot draft, reset, no outbound requests");
  await context.close();
 }
}finally{await browser.close();}
await writeFile(join(out,"README.txt"),"ATELIER 23 × BitOS — локальное превью 7.2\nОткройте Atelier23-audit-preview.html в браузере. Интернет не требуется для основной истории и доказательств. Внешние ссылки на исходные сайты и GitHub требуют интернет. Это локальное превью, не опубликованная страница. Данные аудита относятся к 24.11.2026. Ничего не отправляется автоматически.\n");
