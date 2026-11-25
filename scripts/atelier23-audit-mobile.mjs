import assert from "node:assert/strict";
import {chromium,firefox,webkit,devices} from "playwright";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
import {mkdir,writeFile} from "node:fs/promises";
const allEngines={chromium,firefox,webkit};
const apple=process.env.AUDIT_APPLE==="1";
const selected=apple?"webkit":process.env.AUDIT_BROWSER;
if(selected&&!allEngines[selected])throw Error("Unknown browser: "+selected);
const engines=selected?{[selected]:allEngines[selected]}:allEngines;
const appleProfiles=[["Mac-1280","Desktop Safari",{width:1280,height:800}],["Mac-1440","Desktop Safari",{width:1440,height:900}],["iPhone-SE","iPhone SE"],["iPhone-13","iPhone 13"],["iPhone-14-Pro-Max","iPhone 14 Pro Max"]];
await mkdir("artifacts/audit-mobile",{recursive:true});
for(const [engine,type] of Object.entries(engines)){
 const browser=await type.launch({headless:true,...(engine==="chromium"?{args:["--no-sandbox"]}:{})});
 try {
 const profiles=apple?appleProfiles.map(([label,device,viewport])=>{if(!devices[device])throw Error("Unknown device: "+device);const {defaultBrowserType,...profile}=devices[device];return {label,opts:{...profile,...(viewport?{viewport}:{})}}}):[320,360,390,430,1440].map(width=>({label:String(width),opts:{viewport:{width,height:850},hasTouch:width<700,...(engine==="firefox"?{}:{isMobile:width<700})}}));
 for (const {label,opts} of profiles) {
  const width=opts.viewport.width;
  console.log("START "+engine+" "+label+" "+width+" px on "+process.platform);
  const context=await browser.newContext({...opts,reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try {
  await page.goto(pathToFileURL(resolve("atelier23/audit/index.html")).href);
  await page.locator(".album-photo img").first().waitFor({state:"attached"});
  const guided=page.locator("#guided-audit"),brief=page.locator("#growth-brief"),copy=page.locator("#growth-copy");
  const choose=label=>guided.getByRole("button",{name:label,exact:true}).click();
  const reset=()=>guided.locator("#guided-reset").click(),back=()=>guided.locator("#guided-back").click();
  const step=async n=>assert.equal(await guided.locator("#guided-progress").innerText(),"Шаг "+n+" из 8");
  const emptyPilot=async()=>{assert.equal(await page.locator('input[name="growth-market"]:checked,input[name="growth-goal"]:checked').count(),0);assert.equal(await copy.isDisabled(),true);assert.equal(await brief.inputValue(),"Выберите рынок и направление.")};
  const needs=[
   ["Клиенты регулярно обращаются за пошивом и примерками","Больше подтверждённых записей"],
   ["Поступают запросы на одежду для особых событий","Больше целевых обращений"],
   ["Покупатели снова ищут подходящие товары","Помочь покупателю найти товар"],
   ["Существующие клиенты возвращаются за новыми заказами","Больше повторных заказов"],
   ["Клиенты регулярно узнают о нас через ссылки и рекомендации","Больше целевых переходов"],
   ["Пока хочу понять, какие потребности важны","Сначала разобраться без конкретной цели"]
  ];
  const markets=["Москва","Лиссабон","Оба рынка"];
  for(const market of markets){
   for(const [need,goal] of needs){
    await reset();await step(1);await emptyPilot();
    await choose(market);await step(2);
    await choose(need);await step(3);
    await choose(need===needs[5][0]?"Пока не знаем периодичность":"Раз в несколько месяцев");await step(4);
    await choose(goal);await step(5);
    assert.equal(await guided.locator("h3").evaluate(e=>e===document.activeElement),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,"guided overflow");
    if(need===needs[2][0])assert.equal(await guided.locator('a[href="#tc-01"]').count(),market==="Москва"?0:1);
    await guided.locator("details summary").click();assert.ok((await guided.locator("details").innerText()).includes("Маржинальный LTV за 12 месяцев"));
    await choose("Как это относится к вашей задаче?");await step(6);
    await choose("Сейчас это не приоритет");await step(7);
    assert.equal(await guided.getByRole("button",{name:"Обсудить небольшой пилот",exact:true}).count(),0);
    await choose("Пока остановиться");await step(8);
    const summary=await guided.locator("#guided-summary").innerText();
    for(const value of [market,need,goal,"Пока остановиться","Периодичность:","LTV: пока нет данных"])assert.ok(summary.includes(value),"summary "+value);
    assert.equal(await guided.getByRole("button",{name:"Открыть отдельную форму пилота",exact:true}).count(),0);
    await back();await step(7);assert.equal(await guided.locator("#guided-summary").count(),0);
   }
  }
  async function toAssessment(market,need,goal){await reset();await choose(market);await choose(need);await choose(need===needs[5][0]?"Пока не знаем периодичность":"Раз в несколько месяцев");await choose(goal);await choose("Как это относится к вашей задаче?")}
  await toAssessment("Лиссабон",...needs[2]);await choose("Хочу проверить самостоятельно");
  assert.equal(await guided.getByRole("button",{name:"Обсудить небольшой пилот",exact:true}).count(),0);
  await choose("Посмотреть доказательства и повторить тест");await step(8);
  await guided.locator('#guided-content a[href="#tc-01"]').click();
  await page.waitForURL(u=>u.hash==="#tc-01");await page.waitForFunction(()=>document.getElementById("tc-01").open);
  await page.goBack();assert.ok((await guided.locator("#guided-summary").innerText()).includes("Лиссабон"));
  await toAssessment("Москва",...needs[5]);await choose("Это актуально для нашего бизнеса");
  assert.equal(await guided.getByRole("button",{name:"Обсудить небольшой пилот",exact:true}).count(),0);
  await choose("Оценить коммерческий эффект по данным");await step(8);
  await toAssessment("Москва",...needs[0]);await choose("Нужны дополнительные данные");
  assert.equal(await guided.getByRole("button",{name:"Обсудить небольшой пилот",exact:true}).count(),0);
  await choose("Оценить коммерческий эффект по данным");await step(8);
  await toAssessment("Москва",...needs[0]);await choose("Это актуально для нашего бизнеса");await choose("Обсудить небольшой пилот");await step(8);
  await guided.screenshot({path:"artifacts/audit-mobile/"+engine+"-"+label+"-guided.png"});
  await choose("Открыть отдельную форму пилота");await page.waitForURL(u=>u.hash==="#next-step");
  assert.equal(await page.locator('input[name="growth-market"][value="Москва"]').isChecked(),true);
  assert.equal(await copy.isDisabled(),true);
  await page.locator('input[name="growth-goal"][value="Свадебные заказы"]').check();
  await page.goBack();await page.waitForURL(u=>u.hash==="#guided-audit");
  await page.waitForFunction(()=>document.getElementById("growth-copy").disabled);await emptyPilot();
  await page.goForward();await page.waitForURL(u=>u.hash==="#next-step");await emptyPilot();
  await reset();await emptyPilot();await step(1);
  await choose("Лиссабон");await choose(needs[2][0]);await back();await choose(needs[3][0]);await choose("Сезонно или ежегодно");await choose(needs[3][1]);await choose("Как это относится к вашей задаче?");await choose("Это актуально для нашего бизнеса");await choose("Обсудить небольшой пилот");
  assert.ok(!(await guided.locator("#guided-summary").innerText()).includes(needs[2][0]));
  await page.reload();await step(1);await emptyPilot();assert.equal(await guided.locator("#guided-summary").count(),0);
  console.log("PASS Customer Need Loop 8.2 "+engine+" "+label+": 18 market/need paths, consent guards, summary, back/forward, reload");
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
  await page.screenshot({path:"artifacts/audit-mobile/"+engine+"-"+label+"-proof.png"});
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
  // Explicit radio boundaries: native Linux WebKit previously rendered unchecked controls near-black.
  const pilotRadios=page.locator('#next-step input[type="radio"]');
  assert.equal(await pilotRadios.count(),8);
  for(const radio of await pilotRadios.all()){
   const visual=await radio.evaluate(e=>{const s=getComputedStyle(e),b=e.getBoundingClientRect(),label=e.closest("label").getBoundingClientRect();return {appearance:s.appearance,border:s.borderTopColor,borderWidth:parseFloat(s.borderTopWidth),width:b.width,height:b.height,labelHeight:label.height}});
   assert.equal(visual.appearance,"none");assert.equal(visual.border,"rgb(232, 182, 109)");
   assert.ok(visual.borderWidth>=2&&visual.width>=20&&visual.height>=20&&visual.labelHeight>=48,"visible radio boundary and full-size label");
  }
  await page.locator('#next-step label').filter({has:page.locator('input[name="growth-market"][value="Москва"]')}).click();
  assert.equal(await page.locator('input[name="growth-market"][value="Москва"]').isChecked(),true,"label remains clickable");
  assert.ok((await page.locator('input[name="growth-market"][value="Москва"]').evaluate(e=>getComputedStyle(e).backgroundImage)).includes("radial-gradient"),"selected indicator");
  console.log("PASS pilot radio visual contract "+engine+" "+label);
  assert.equal(await page.locator("#growth-copy").isDisabled(),true);
  await page.locator('input[name="growth-market"][value="Лиссабон"]').check();
  assert.equal(await page.locator("#growth-copy").isDisabled(),true);
  await page.locator('input[name="growth-goal"][value="Индивидуальный пошив"]').check();
  assert.equal(await page.locator("#growth-copy").isEnabled(),true);
  assert.match(await page.locator("#growth-brief").inputValue(),/Лиссабон.*Индивидуальный пошив/);
  assert.equal(await brief.evaluate(e=>e.scrollHeight<=e.clientHeight+1),true,"full commercial draft visible");
  for(const field of await page.locator('input[name="growth-goal"]').all()){
   await field.check();assert.equal(await brief.evaluate(e=>e.scrollHeight<=e.clientHeight+1),true,"no hidden draft text for "+await field.getAttribute("value"));
  }
  await page.locator('input[name="growth-goal"][value="Индивидуальный пошив"]').check();
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
  await page.locator("#next-step").screenshot({path:"artifacts/audit-mobile/"+engine+"-"+label+"-cta.png"});
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:"artifacts/audit-mobile/"+engine+"-"+label+"-hero.png"});
  assert.deepEqual(errors,[]);
  console.log("PASS "+engine+" "+width+" px: album, original proof, 400% zoom, metadata, no overflow");
  } catch(error){
   const prefix="artifacts/audit-mobile/"+engine+"-"+label+"-failure";
   await page.screenshot({path:prefix+".png"}).catch(()=>{});
   await writeFile(prefix+".json",JSON.stringify({url:page.url(),errors,message:String(error)},null,2));
   throw error;
  } finally {await context.close()}
 }
} finally {await browser.close()}
}
