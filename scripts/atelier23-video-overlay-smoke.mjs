import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname} from "node:path";
import {chromium} from "playwright";
import assert from "node:assert/strict";
const root=resolve(process.cwd()),mime={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".mp4":"video/mp4"};
const server=createServer(async(req,res)=>{try{const rel=decodeURIComponent(new URL(req.url,"http://localhost").pathname).replace(/^\/+/,""),p=resolve(root,rel.endsWith("/")?rel+"index.html":rel);if(!p.startsWith(root+"/")){res.writeHead(403).end();return}res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream"}).end(await readFile(p))}catch{res.writeHead(404).end()}});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const url="http://127.0.0.1:"+server.address().port+"/atelier23/fashion-overlay/";
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
 // Real overlay geometry: video covers the entire stage and every primary action lies on it.
 const film=page.locator("#film"),stage=await film.boundingBox(),app=await page.locator(".app").boundingBox();
 assert.ok(stage&&app&&Math.abs(stage.height-app.height)<1&&Math.abs(stage.width-app.width)<1);
 const within=async loc=>{const b=await loc.boundingBox();assert.ok(b&&b.x>=stage.x-1&&b.y>=stage.y-1&&b.x+b.width<=stage.x+stage.width+1&&b.y+b.height<=stage.y+stage.height+1,"Not on video")};
 await within(page.getByRole("button",{name:"Выбрать повод"}));await within(page.getByRole("button",{name:"Нравится фильм"}));
 await page.getByRole("button",{name:"Нравится фильм"}).click();assert.equal(await page.getByRole("button",{name:"Нравится фильм"}).getAttribute("aria-pressed"),"true");await step(0);
 await page.getByRole("button",{name:"Сохранить фильм"}).click();assert.equal(await page.getByRole("button",{name:"Сохранить фильм"}).getAttribute("aria-pressed"),"true");await page.getByRole("button",{name:"Сохранить фильм"}).click();
 await page.evaluate(()=>{Object.defineProperty(navigator,"share",{configurable:true,value:undefined});document.querySelector("#film").dataset.sentinel="same"});
 await page.getByRole("button",{name:"Поделиться фильмом"}).click();await page.locator("#share-link").waitFor();assert.equal(new URL(await page.locator("#share-link").inputValue()).search,"");await page.getByRole("button",{name:"Закрыть",exact:true}).click();
 await page.getByRole("button",{name:"Включить звук"}).click();assert.equal(await film.evaluate(v=>v.muted),false);await page.getByRole("button",{name:"Выключить звук"}).click();
 await page.getByRole("button",{name:"Выбрать повод"}).click();
 assert.equal(await film.getAttribute("data-sentinel"),"same");await within(page.locator('[data-event="business"]'));
 await page.getByRole("button",{name:"Деловая встреча"}).click();assert.equal(await film.evaluate(v=>v.paused),true);await step(1);await viewport();
 await page.waitForFunction(()=>document.querySelector("[data-view-count=navy]")?.textContent.startsWith("1 просм."));await step(1);
 await page.getByRole("button",{name:"Нравится"}).click();await step(1);
 assert.match(await page.locator("[data-view-count=navy]").textContent(),/^1 просм\./);
 await page.getByRole("button",{name:"В избранное"}).click();
 assert.equal(await page.getByRole("button",{name:"В избранное"}).getAttribute("aria-pressed"),"true");
 await page.locator("#look-photo").evaluate(el=>{const t=(x,y)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});el.dispatchEvent(new TouchEvent("touchstart",{changedTouches:[t(130,400)],bubbles:true}));el.dispatchEvent(new TouchEvent("touchend",{changedTouches:[t(132,120)],bubbles:true}))});
 assert.equal(await page.locator("#screen h2").textContent(),"Современный характер");
 await page.locator("#look-photo").press("ArrowUp");
 assert.equal(await page.locator("#screen h2").textContent(),"Уверенная классика");
 await page.getByRole("button",{name:"Хочу этот образ",exact:true}).click();await step(2);await viewport();
 assert.equal(await page.locator("#book").getAttribute("href"),"https://atelier-23.ru/sign-up-for-a-fitting-room/");
 await page.getByRole("button",{name:"Уточнить дату и гардероб"}).click();
 await page.locator("#date").fill("2000-01-01");await page.getByRole("button",{name:"Готово",exact:true}).click();assert.match(await page.locator("#date-error").textContent(),/будущую/);
 await page.getByRole("button",{name:"Пока не знаю"}).click();await step(3);
 await page.locator('[data-own="shirt"]').check();await page.getByRole("button",{name:"Готово",exact:true}).click();await step(4);await viewport();
 await page.getByRole("button",{name:"Мой план",exact:true}).click();assert.equal(await page.locator(".plan-list .done").count(),4);
 await page.getByRole("button",{name:"Избранное · 1"}).click();assert.equal(await page.locator(".saved-item").count(),1);
 await page.reload();assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("bitos.atelier23.fashionOverlay.v1")).views.navy>=1));await page.getByRole("button",{name:"Продолжить",exact:true}).click();await page.locator('[data-event="business"]').click();await step(4);await viewport();
 // Independent profile: a save outweighs a like and only future cards move.
 await page.evaluate(()=>localStorage.removeItem("bitos.atelier23.fashionOverlay.v1"));
 await page.reload();await page.getByRole("button",{name:"Выбрать повод"}).click();
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
 await page.reload();await page.getByRole("button",{name:"Продолжить",exact:true}).click();await page.locator('[data-event="wardrobe"]').click();assert.equal(await title(),"Свободная элегантность");
 // Shared card entry must preserve the exact product, never choose it automatically.
 await page.goto(url+"?event=wedding&look=ivory");await page.locator("#look-photo").waitFor();
 assert.equal(await title(),"Светлый акцент");await step(1);await viewport();
 await page.evaluate(()=>{Object.defineProperty(navigator,"share",{configurable:true,value:undefined})});
 await page.getByRole("button",{name:"Поделиться образом"}).click();
 await page.locator("#share-link").waitFor();
 const shared=new URL(await page.locator("#share-link").inputValue());assert.equal(shared.searchParams.get("event"),"wedding");assert.ok(shared.pathname.endsWith("/share/ivory/"));
 const telegram=new URL(await page.locator("#share-telegram").getAttribute("href"));assert.equal(telegram.origin,"https://t.me");assert.equal(telegram.searchParams.get("url"),shared.href);
 const preview=await (await page.request.get(shared.href)).text();assert.match(preview,/og:title" content="ATELIER 23 · Светлый акцент"/);assert.match(preview,/og:image" content="https:\/\/atelier-23.ru\/wp-content\/uploads\/2025\/08\/Atelier23_26_09_16_-41-600x800.jpg"/);
 await page.getByRole("button",{name:"Закрыть",exact:true}).click();
 await page.goto(shared.href);await page.locator("#look-photo").waitFor();assert.equal(await title(),"Светлый акцент");await step(1);
 await page.goto(url+"share/ivory/?event=business");await page.locator("#look-photo").waitFor();assert.equal(await title(),"Светлый акцент");assert.equal(new URL(page.url()).searchParams.get("event"),"wedding");
 for(const id of ["navy","grey","black","ivory","travel-navy","travel-black"]){const response=await page.request.get(url+"share/"+id+"/");assert.ok(response.ok(),id+" preview missing");assert.match(await response.text(),/og:image/)}
 await page.goto(url+"?event=business&look=ivory");await page.locator(".app[data-mode=film]").waitFor();
 // Exercise scene boundaries deterministically, independent of browser codec support.
 await page.goto(url);await page.locator("#cue-cta").waitFor();
 const seek=async(t)=>page.evaluate(t=>{const v=document.querySelector("#film");Object.defineProperty(v,"currentTime",{configurable:true,value:t});v.dispatchEvent(new Event("seeked"))},t);
 for(const [t,id,intent] of [[0,"emotion","event"],[2.79,"emotion","event"],[2.8,"business","business"],[5.79,"business","business"],[5.8,"occasion","event"],[8.79,"occasion","event"],[8.8,"craft","tailoring"],[11.79,"craft","tailoring"],[11.8,"detail","event"],[14.99,"detail","event"],[15,"fitting","booking"],[17.64,"fitting","booking"],[0,"emotion","event"]]){
  await seek(t);assert.equal(await page.locator("#cue-cta").getAttribute("data-cue"),id);assert.equal(await page.locator("#cue-cta").getAttribute("data-intent"),intent);
  assert.equal(await page.locator("#cue-other").isVisible(),intent!=="event");await viewport();
 }
 await seek(2.8);await page.locator("#cue-cta").focus();await seek(8.8);assert.equal(await page.locator("#cue-cta").getAttribute("data-intent"),"business");await page.locator("#cue-cta").blur();await page.waitForFunction(()=>document.querySelector("#cue-cta").dataset.intent==="tailoring");
 await seek(15);await page.locator("#cue-other").click();await page.locator('[data-event="wedding"]').waitFor();await page.locator("#back").click();assert.equal(await page.locator("#cue-cta").getAttribute("data-intent"),"booking");
 await seek(2.8);await page.locator("#cue-cta").click();assert.equal(await page.locator(".app").getAttribute("data-mode"),"look");assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("bitos.atelier23.fashionOverlay.v1")).event),"business");
 // Isolated analytics, real interaction events and controlled playback-clock simulation.
 const analyticsKey="bitos.atelier23.fashionAnalytics.v1";
 await page.evaluate(key=>localStorage.removeItem(key),analyticsKey);
 await page.goto(url);
 await page.locator("#cue-cta").waitFor();
 const rows=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{"rows":[]}').rows,analyticsKey);
 assert.equal((await rows()).length,0);
 await page.getByRole("button",{name:"Нравится фильм"}).click();
 const wasLiked=await page.getByRole("button",{name:"Нравится фильм"}).getAttribute("aria-pressed");
 await page.getByRole("button",{name:"Нравится фильм"}).click();
 assert.deepEqual((await rows()).filter(r=>r.type==="reaction").map(r=>r.intent),wasLiked==="true"?["like_on","like_off"]:["like_off","like_on"]);
 await page.evaluate(()=>{const v=document.querySelector("#film");Object.defineProperty(v,"paused",{configurable:true,value:true});Object.defineProperty(v,"seeking",{configurable:true,value:false})});
 await seek(8.8);assert.equal((await rows()).filter(r=>r.type==="scene_view").length,0);
 // The simulated media clock exercises accounting, not physical video decoding.
 await page.evaluate(()=>{const v=document.querySelector("#film");Object.defineProperty(v,"paused",{configurable:true,value:false});v.dispatchEvent(new Event("seeking"))});
 for(const t of [0,.5,1,1.5,2,2.5,2.8,3.3,3.8,4.3,4.8])await page.evaluate(t=>{const v=document.querySelector("#film");Object.defineProperty(v,"currentTime",{configurable:true,value:t});v.dispatchEvent(new Event("timeupdate"))},t);
 const playback=await rows();assert.equal(playback.filter(r=>r.type==="film_view").length,1);
 assert.deepEqual(playback.filter(r=>r.type==="scene_view").map(r=>r.cue),["emotion","business"]);
 await page.evaluate(()=>{const v=document.querySelector("#film");v.dispatchEvent(new Event("seeking"));Object.defineProperty(v,"paused",{configurable:true,value:true})});
 await seek(15);assert.equal((await rows()).filter(r=>r.type==="scene_view"&&r.cue==="fitting").length,0);
 await context.route("https://atelier-23.ru/sign-up-for-a-fitting-room/",route=>route.fulfill({status:200,contentType:"text/html",body:"<h1>Mock booking destination</h1>"}));
 await Promise.all([page.waitForURL("https://atelier-23.ru/sign-up-for-a-fitting-room/"),page.locator("#cue-cta").click()]);
 await page.goto(url+"?event=wedding&look=ivory");
 await page.getByRole("button",{name:"Хочу этот образ",exact:true}).click();
 await Promise.all([page.waitForURL("https://atelier-23.ru/sign-up-for-a-fitting-room/"),page.locator("#book").click()]);
 await page.goto(url+"analytics/");await page.locator('[data-metric="booking"]').waitFor();
 assert.equal(await page.locator('[data-metric="booking"] b').textContent(),"2");
 assert.equal(await page.locator('[data-metric="filmViews"] b').textContent(),"1");
 assert.equal(await page.locator('[data-scene="fitting"] [data-count="clicks"]').textContent(),"1");
 assert.equal(await page.locator('[data-scene="fitting"] [data-count="views"]').textContent(),"0");
 assert.match(await page.locator("#sales").textContent(),/данных нет/);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const recorded=await rows();assert.equal(recorded.filter(r=>r.type==="booking_click").length,2);assert.ok(recorded.every(r=>!["sale","purchase","booking_confirmed"].includes(r.type)));
 // Demo is separate from the local log, even with actual booking clicks.
 const beforeDemo=await page.evaluate(key=>localStorage.getItem(key),analyticsKey);
 await page.locator("#demo-mode").click();
 assert.match(await page.locator("#mode-note").textContent(),/Все цифры условные/);
 assert.equal(await page.locator('[data-metric="sales"] b').textContent(),"12");
 assert.equal(await page.locator('[data-metric="booking"] b').textContent(),"72");
 assert.equal(await page.locator("#funnel .frow").count(),8);
 assert.equal(await page.locator("#funnel .fshape").count(),8);
 const funnelColors=await page.locator("#funnel .frow").evaluateAll(rows=>rows.map(r=>r.style.getPropertyValue("--light")));
 assert.equal(new Set(funnelColors).size,8);
 const exactRails=await page.locator("#funnel .track i").evaluateAll(els=>els.map(e=>parseFloat(e.style.width)));
 assert.deepEqual(exactRails.map(n=>Math.round(n*10)/10),[100,82,42,18,7.2,4,2.4,1.2],"actual scaled rails");
 assert.match(await page.locator("#funnel-summary").textContent(),/1,2\s*%/);
 assert.match(await page.locator("#funnel-summary").textContent(),/40\s*%/);
 assert.match(await page.locator("#funnel-loss").textContent(),/400/);
 assert.ok(await page.locator("#funnel").evaluate(el=>el.scrollWidth<=el.clientWidth+1),"Funnel overflow");
 await page.locator(".funnel-panel").screenshot({path:"artifacts/atelier23-funnel-"+width+".png"});

 assert.match(await page.locator("#retention").textContent(),/35\s*%/);
 assert.equal(await page.locator("#products .product").count(),6);
 assert.equal(await page.locator("#advisor .adv-card").count(),5);
 assert.match(await page.locator(".marketing").textContent(),/138/);
 assert.match(await page.locator(".product-advisor").textContent(),/40%/);
 assert.match(await page.locator(".style-advisor").textContent(),/Уверенная классика/);
 assert.match(await page.locator(".finance-advisor").textContent(),/210[\s\u00a0\u202f]000/);
 await page.locator('[data-model="attach"]').fill("100");
 assert.match(await page.locator(".finance-advisor").textContent(),/420[\s\u00a0\u202f]000/);
 assert.equal(await page.locator('[data-metric="sales"] b').textContent(),"12");
 await page.locator('[data-model="attach"]').fill("50");
 assert.equal(await page.locator(".loyalty-advisor .adv-journey-step").count(),4);
 assert.ok(await page.locator("#advisor").evaluate(el=>el.scrollWidth<=el.clientWidth+1),"Advisor overflow");
 await page.locator("#advisor").screenshot({path:"artifacts/atelier23-advisor-"+width+".png"});

 assert.equal(await page.evaluate(key=>localStorage.getItem(key),analyticsKey),beforeDemo);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Demo dashboard overflow");
 await page.reload();await page.locator('[data-metric="sales"] b').waitFor();assert.equal(await page.locator('[data-metric="sales"] b').textContent(),"12");
 await page.locator("#local-mode").click();
 assert.equal(await page.locator('[data-metric="sales"] b').textContent(),"—");
 assert.equal(await page.locator('[data-metric="booking"] b').textContent(),"2");
 assert.match(await page.locator("#retention").textContent(),/Пока нет измерения/);
 assert.match(await page.locator(".finance-advisor").textContent(),/не реальные данные/);
 assert.match(await page.locator(".marketing").textContent(),/Локально/);
 assert.equal(await page.locator('[data-metric="sales"] b').textContent(),"—");

 assert.equal(await page.locator("#funnel .frow").count(),4);
 assert.ok(!(await page.locator("#funnel-summary").textContent()).includes("покупку"));

 assert.equal(await page.evaluate(key=>localStorage.getItem(key),analyticsKey),beforeDemo);
 // Empty and corrupt storage must never present fabricated sales/engagement.
 await page.evaluate(key=>localStorage.removeItem(key),analyticsKey);await page.locator("#refresh").click();
 assert.match(await page.locator("#status").textContent(),/Пока нет/);assert.equal(await page.locator('[data-metric="booking"] b').textContent(),"0");
 await page.evaluate(key=>localStorage.setItem(key,"{broken"),analyticsKey);await page.locator("#refresh").click();
 assert.match(await page.locator("#status").textContent(),/недоступно или повреждено/);assert.equal(await page.locator('[data-metric="booking"] b').textContent(),"—");
 assert.deepEqual(errors,[]);console.log("PASS "+width+"px: full-bleed video, overlay actions, same-player transition, swipe, direct booking, plan and personalization");await context.close();
 }
}finally{await browser.close();server.close()}