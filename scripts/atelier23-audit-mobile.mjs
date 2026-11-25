import assert from "node:assert/strict";
import {chromium,firefox,webkit} from "playwright";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
import {mkdir} from "node:fs/promises";
const engines={chromium,firefox,webkit};
await mkdir("artifacts/audit-mobile",{recursive:true});
for(const [engine,type] of Object.entries(engines)){
 const browser=await type.launch({headless:true,...(engine==="chromium"?{args:["--no-sandbox"]}:{})});
 try {
 for (const width of [320,360,390,430,1440]) {
  const context=await browser.newContext({viewport:{width,height:850},hasTouch:width<700,...(engine==="firefox"?{}:{isMobile:width<700}),reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(pathToFileURL(resolve("atelier23/audit/index.html")).href);
  await page.locator(".album-photo img").first().waitFor({state:"attached"});
  const guided=page.locator("#guided-audit");
  await guided.getByRole("button",{name:"Москва",exact:true}).click();
  assert.equal(await guided.getByRole("button",{name:"Поиск и товары"}).count(),0);
  await guided.getByRole("button",{name:"Скорость на телефоне"}).click();
  assert.match(await guided.locator(".guided-number").innerText(),/6,35/);
  await guided.getByRole("button",{name:"Посмотреть другое направление"}).click();
  await guided.locator("#guided-back").click();
  await guided.getByRole("button",{name:"Лиссабон",exact:true}).click();
  await guided.getByRole("button",{name:"Скорость на телефоне"}).click();
  assert.match(await guided.locator(".guided-number").innerText(),/5,34/);
  await guided.getByRole("button",{name:"Посмотреть другое направление"}).click();
  await guided.getByRole("button",{name:"Поиск и товары"}).click();
  assert.match(await guided.locator(".guided-number").innerText(),/21 результат.*0 карточек/);
  assert.equal(await guided.locator('a[href="#tc-01"]').count(),1);
  assert.equal(await guided.locator('a[href="#tc-02"]').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,"guided overflow");
  await guided.getByRole("button",{name:"Обсудить этот приоритет"}).click();
  assert.equal(await page.locator('input[name="growth-market"][value="Лиссабон"]').isChecked(),true);
  assert.equal(await page.locator("#growth-copy").isDisabled(),true);
  await guided.locator("#guided-reset").click();
  assert.equal(await guided.locator("#guided-progress").innerText(),"Шаг 1 из 3");
  await guided.getByRole("button",{name:"Оба рынка",exact:true}).click();
  await guided.getByRole("button",{name:"Ссылки в соцсетях"}).click();
  assert.equal(await guided.locator(".guided-number").innerText(),"5 из 10");
  await guided.locator("#guided-reset").click();

  assert.equal(await page.locator(".album-photo img").count(),6);
  assert.equal(await page.locator("[data-tc]").count(),11);
  assert.equal(await page.locator('meta[property="og:image"]').count(),1);
  assert.equal(await page.locator('meta[property="og:title"]').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,"page overflow at "+width);
  for (let i=0;i<6;i++){
   await page.locator('[data-album-index="'+i+'"]').click();
   await page.waitForFunction(n=>{
    const t=document.getElementById("album-track"),s=t.querySelectorAll(".album-slide")[n],d=document.querySelector(".album-dots");
    return document.getElementById("album-counter").textContent===(n+1)+" / 6"&&Math.abs(t.getBoundingClientRect().height-s.getBoundingClientRect().height)<=2&&d.getBoundingClientRect().top-s.getBoundingClientRect().bottom<=32;
   },i);
  }
  await page.locator('[data-album-index="0"]').click();
  await page.waitForFunction(()=>document.getElementById("album-counter").textContent==="1 / 6");
  await page.locator("#album-next").click();
  await page.waitForFunction(()=>document.getElementById("album-counter").textContent==="2 / 6");
  await page.locator('[data-album-index="5"]').click();
  await page.waitForFunction(()=>document.getElementById("album-counter").textContent==="6 / 6");
  assert.equal(await page.locator("#album-next").isDisabled(),true);
  await page.locator('[data-album-index="0"]').click();
  await page.waitForFunction(()=>document.getElementById("album-counter").textContent==="1 / 6");
  await page.locator(".album-photo").first().getByRole("button",{name:"Увеличить доказательство"}).click();
  await page.locator("#proof-view").waitFor();
    assert.equal(await page.locator("#proof-original").getAttribute("aria-pressed"),"true");
  assert.equal(await page.locator("#proof-scale").innerText(),width<700?"200%":"100%");
  assert.equal(await page.locator(".proof-crop").count(),6);
  if(width<700){
   const bounds=await page.locator("#proof-view").boundingBox();assert.ok(bounds.width>=width-2,"mobile fullscreen");
   assert.equal(await page.locator(".proof-crop img").first().evaluate(e=>getComputedStyle(e).objectFit),"cover");
   assert.equal(await page.locator("#proof-viewport").evaluate(e=>e.scrollWidth>e.clientWidth),true);
   for(const name of ["proof-original","proof-enhance","proof-fit","proof-minus","proof-plus","proof-close"]){const b=await page.locator("#"+name).boundingBox();assert.ok(b.width>=43&&b.height>=43,"touch target "+name);}
  }
  assert.equal(await page.evaluate(()=>document.querySelector("#proof-viewport img").src===document.querySelectorAll("#search img")[2].src),true);
  await page.locator("#proof-enhance").click();
  assert.equal(await page.locator("#proof-viewport img").evaluate(e=>e.classList.contains("enhanced")),true);
  for(let i=0;i<6&&await page.locator("#proof-plus").isEnabled();i++)await page.locator("#proof-plus").click();
  assert.equal(await page.locator("#proof-scale").innerText(),"400%");
  assert.equal(await page.locator("#proof-plus").isDisabled(),true);
  assert.equal(await page.locator("#proof-viewport").evaluate(e=>e.scrollWidth>e.clientWidth),true);
  await page.locator("#proof-original").click();
  assert.equal(await page.locator("#proof-viewport img").evaluate(e=>e.classList.contains("enhanced")),false);
  await page.locator("#proof-fit").click();
  assert.equal(await page.locator("#proof-scale").innerText(),"100%");
  assert.equal(await page.locator("#proof-viewport").evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
  assert.equal(await page.locator("#proof-viewport img").evaluate(e=>getComputedStyle(e).objectFit),"contain");
  if(width===390&&engine==="chromium"){
   const v=page.locator("#proof-viewport");const box=await v.boundingBox();const client=await context.newCDPSession(page);const x=box.x+box.width/2,y=box.y+Math.min(120,box.height/2);
   await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:x-35,y,id:1},{x:x+35,y,id:2}]});
   for(let i=1;i<=8;i++){const d=35+7*i;await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x-d,y,id:1},{x:x+d,y,id:2}]});}
   await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
   await page.waitForFunction(()=>parseInt(document.getElementById("proof-scale").textContent)>100);
   await client.detach();
  }
  await page.screenshot({path:"artifacts/audit-mobile/"+engine+"-"+width+"-proof.png"});
  await page.locator("#proof-close").click();
  assert.equal(await page.locator("#proof-view").evaluate(e=>e.open),false);
  await page.locator("#album-track").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(()=>document.getElementById("album-counter").textContent==="2 / 6");
  await page.locator('[data-album-index="0"]').click();
  await page.waitForFunction(()=>document.getElementById("album-counter").textContent==="1 / 6");
  if(width===390&&engine==="chromium"){
   const track=page.locator("#album-track");await track.scrollIntoViewIfNeeded();
   const box=await track.boundingBox(),client=await context.newCDPSession(page);
   const x=box.x+box.width*.8,y=Math.max(80,Math.min(500,box.y+100));
   await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});
   for(let i=1;i<=12;i++){await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x-box.width*.65*i/12,y}]});await page.waitForTimeout(16)}
   await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
   await page.waitForFunction(()=>document.getElementById("album-counter").textContent!=="1 / 6");
   await client.detach();
  }
  await page.locator(".gentleman-portrait img").waitFor();
  await page.waitForFunction(()=>document.querySelector(".gentleman-portrait img").naturalWidth>0);
  assert.equal(await page.locator("#growth-copy").isDisabled(),true);
  await page.locator('input[name="growth-market"][value="Лиссабон"]').check();
  assert.equal(await page.locator("#growth-copy").isDisabled(),true);
  await page.locator('input[name="growth-goal"][value="Индивидуальный пошив"]').check();
  assert.equal(await page.locator("#growth-copy").isEnabled(),true);
  assert.match(await page.locator("#growth-brief").inputValue(),/Лиссабон.*Индивидуальный пошив/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,"CTA page overflow at "+width);
  const cover=await page.locator('meta[property="og:image"]').getAttribute("content");
  assert.equal(cover,"https://raw.githubusercontent.com/safal207/merdo-bitos/41f353c3efb9a13d876c48d6a1887ac96e6e91ae/atelier23/audit/gentleman-share.jpg");
  assert.equal(await page.locator('meta[property="og:image:type"]').getAttribute("content"),"image/jpeg");
  assert.equal(await page.locator(".trust-grid article").count(),3);
  assert.equal(await page.locator(".trust-faq details").count(),4);
  await page.locator(".trust-faq summary").nth(1).click();
  assert.equal(await page.locator(".trust-faq details").nth(1).evaluate(e=>e.open),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,"FAQ overflow at "+width);
  await page.locator(".trust-faq summary").nth(1).click();
  await page.locator("#next-step").screenshot({path:"artifacts/audit-mobile/"+engine+"-"+width+"-cta.png"});
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:"artifacts/audit-mobile/"+engine+"-"+width+"-hero.png"});
  assert.deepEqual(errors,[]);
  await context.close();console.log("PASS "+engine+" "+width+" px: album, original proof, 400% zoom, metadata, no overflow");
 }
} finally {await browser.close()}
}
