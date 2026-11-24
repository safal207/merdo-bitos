import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname} from "node:path";
import {chromium} from "playwright";
import assert from "node:assert/strict";
const root=resolve(process.cwd()),mime={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".mp4":"video/mp4"};
const server=createServer(async(req,res)=>{try{const rel=decodeURIComponent(new URL(req.url,"http://localhost").pathname).replace(/^\/+/,""),p=resolve(root,rel.endsWith("/")?rel+"index.html":rel);if(!p.startsWith(root+"/")){res.writeHead(403).end();return}res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream"}).end(await readFile(p))}catch{res.writeHead(404).end()}});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const url="http://127.0.0.1:"+server.address().port+"/atelier23/fashion-stories/";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:844},hasTouch:width===390,isMobile:width===390,reducedMotion:"reduce"});
 await context.route("https://atelier-23.ru/wp-content/**",route=>route.fulfill({status:200,contentType:"image/svg+xml",body:'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#bcbab0"/></svg>'}));
 const page=await context.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));
 const step=async(n)=>assert.equal(await page.locator(".progress").getAttribute("aria-valuenow"),String(n));
 const viewport=async()=>{assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.documentElement.scrollHeight<=innerHeight+1),"Document overflow");const c=page.locator("#screen .primary");if(await c.count()){const b=await c.boundingBox();assert.ok(b&&b.y>=0&&b.y+b.height<=844,"CTA outside viewport")}};
 await page.goto(url);await page.locator("#film").waitFor();await viewport();
 assert.equal(await page.locator(".atelier-mark").count(),1);assert.equal(await page.locator(".mark-overlay").evaluate(el=>getComputedStyle(el).pointerEvents),"none");
 assert.ok(await page.locator("#film").evaluate(v=>v.paused&&v.muted&&v.playsInline));
 assert.equal(await page.locator("#film source").getAttribute("src"),"../assets/atelier23-film.mp4");
 assert.match(await page.locator("[data-view-count=film]").textContent(),/^0 просм\./);
 await page.getByRole("button",{name:"Найти свой образ"}).click();
 await page.getByRole("button",{name:"Деловая встреча"}).click();await step(1);await viewport();
 await page.waitForFunction(()=>document.querySelector("[data-view-count=navy]")?.textContent.startsWith("1 просм."));await step(1);
 await page.getByRole("button",{name:"Нравится"}).click();await step(1);
 assert.match(await page.locator("[data-view-count=navy]").textContent(),/^1 просм\./);
 await page.getByRole("button",{name:"В избранное"}).click();
 assert.equal(await page.getByRole("button",{name:"В избранное"}).getAttribute("aria-pressed"),"true");
 await page.locator("#look-photo").evaluate(el=>{const t=(x,y)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});el.dispatchEvent(new TouchEvent("touchstart",{changedTouches:[t(130,400)],bubbles:true}));el.dispatchEvent(new TouchEvent("touchend",{changedTouches:[t(132,120)],bubbles:true}))});
 assert.equal(await page.locator("#screen h2").textContent(),"Современный характер");
 await page.locator("#look-photo").press("ArrowUp");
 assert.equal(await page.locator("#screen h2").textContent(),"Уверенная классика");
 await page.getByRole("button",{name:"Выбрать образ",exact:true}).click();await step(2);await viewport();
 assert.equal(await page.locator("#book").getAttribute("href"),"https://atelier-23.ru/sign-up-for-a-fitting-room/");
 await page.getByRole("button",{name:"Уточнить дату и гардероб"}).click();
 await page.locator("#date").fill("2000-01-01");await page.getByRole("button",{name:"Готово",exact:true}).click();assert.match(await page.locator("#date-error").textContent(),/будущую/);
 await page.getByRole("button",{name:"Пока не знаю"}).click();await step(3);
 await page.locator('[data-own="shirt"]').check();await page.getByRole("button",{name:"Готово",exact:true}).click();await step(4);await viewport();
 await page.getByRole("button",{name:"Мой план",exact:true}).click();assert.equal(await page.locator(".plan-list .done").count(),4);
 await page.getByRole("button",{name:"Избранное · 1"}).click();assert.equal(await page.locator(".saved-item").count(),1);
 await page.reload();assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("bitos.atelier23.fashionStories.v1")).views.navy>=1));await page.getByRole("button",{name:"Продолжить",exact:true}).click();await step(4);await viewport();
 // Independent profile: a save outweighs a like and only future cards move.
 await page.evaluate(()=>localStorage.removeItem("bitos.atelier23.fashionStories.v1"));
 await page.reload();await page.getByRole("button",{name:"Найти свой образ"}).click();
 await page.getByRole("button",{name:"Деловая встреча"}).click();
 const title=()=>page.locator("#screen h2").textContent();
 const forward=()=>page.getByRole("button",{name:"↓ Другой образ"}).click();
 const backward=()=>page.getByRole("button",{name:"↑ Назад",exact:true}).click();
 const like=()=>page.getByRole("button",{name:"Нравится",exact:true}).click();
 const save=()=>page.getByRole("button",{name:"В избранное",exact:true}).click();
 assert.equal(await title(),"Уверенная классика");await like();await forward();
 assert.equal(await title(),"Современный характер");await forward();
 assert.equal(await title(),"Свободная элегантность");await save();await step(1);
 await page.locator("#back").click();await page.locator('[data-event="wardrobe"]').click();
 assert.equal(await title(),"Свободная элегантность"); // save beats the earlier navy like
 await save(); // remove the preference while staying on the same card
 assert.equal(await title(),"Свободная элегантность");await forward();
 assert.equal(await title(),"Уверенная классика");
 await backward();assert.equal(await title(),"Свободная элегантность");await save();
 await forward();assert.equal(await title(),"Уверенная классика"); // visited prefix stable
 await forward();assert.equal(await title(),"Лаконичный гардероб"); // unseen tail responds
 const seen=new Set(["Свободная элегантность","Уверенная классика","Лаконичный гардероб"]);
 while(await page.getByRole("button",{name:"↓ Другой образ"}).isEnabled()){
  await forward();const t=await title();assert.ok(!seen.has(t),"Duplicate recommendation");seen.add(t);
 }
 assert.equal(seen.size,5);await step(1);await viewport();
 await page.locator("#back").click();await page.locator('[data-event="evening"]').click();
 assert.equal(await title(),"Вечерняя классика");await forward();assert.equal(await title(),"Светлый акцент");assert.ok(await page.getByRole("button",{name:"↓ Другой образ"}).isDisabled());
 await page.reload();await page.getByRole("button",{name:"Продолжить",exact:true}).click();await page.locator("#back").click();await page.locator('[data-event="wardrobe"]').click();assert.equal(await title(),"Свободная элегантность");
 // Shared card entry must preserve the exact product, never choose it automatically.
 await page.goto(url+"?event=wedding&look=ivory");await page.locator("#look-photo").waitFor();
 assert.equal(await title(),"Светлый акцент");await step(1);await viewport();
 await page.evaluate(()=>{Object.defineProperty(navigator,"share",{configurable:true,value:undefined})});
 await page.getByRole("button",{name:"Поделиться образом"}).click();
 await page.locator("#share-link").waitFor();
 const shared=new URL(await page.locator("#share-link").inputValue());assert.equal(shared.searchParams.get("event"),"wedding");assert.equal(shared.searchParams.get("look"),"ivory");
 await page.getByRole("button",{name:"Закрыть",exact:true}).click();
 await page.goto(url+"?event=business&look=ivory");await page.locator("#film").waitFor();
 assert.deepEqual(errors,[]);console.log("PASS "+width+"px: portrait CTA, swipe, direct booking path, optional plan, persistence, preference ranking and event isolation");await context.close();
 }
}finally{await browser.close();server.close()}