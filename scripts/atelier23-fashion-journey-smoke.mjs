import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve,extname } from "node:path";
import { chromium } from "playwright";
import assert from "node:assert/strict";
const root=resolve(process.cwd());
const mime={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".mp4":"video/mp4"};
const server=createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,"http://localhost"),rel=decodeURIComponent(u.pathname).replace(/^\/+/,"");
  const path=resolve(root,rel.endsWith("/")?rel+"index.html":rel);
  if(!path.startsWith(root+"/")){res.writeHead(403).end();return}
  const data=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"}).end(data);
 }catch{res.writeHead(404).end()}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const url="http://127.0.0.1:"+server.address().port+"/atelier23/fashion-journey/";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:844},hasTouch:width===390,isMobile:width===390,reducedMotion:"reduce"});
  // Keep behaviour tests deterministic: external catalog photos are not a prerequisite.
  await context.route("https://atelier-23.ru/wp-content/**",route=>route.fulfill({status:200,contentType:"image/svg+xml",body:'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#d4d2ca"/></svg>'}));
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Horizontal overflow");
  const progress=async n=>assert.equal(await page.locator("#plan-progress").textContent(),n+" из 6 этапов");
  const nav=async name=>page.locator(".bottom").getByRole("button",{name,exact:true}).click();
  await page.goto(url);await page.locator("#events button").first().waitFor();
  assert.equal(await page.locator(".intro article").count(),3);
  assert.equal(await page.locator("#film source").getAttribute("src"),"../assets/atelier23-film.mp4");
  assert.ok(await page.locator("#film").evaluate(v=>v.paused&&v.muted&&v.playsInline));
  await noOverflow();
  await page.getByRole("button",{name:"Деловая встреча"}).click();
  assert.equal(await page.locator("#feed-title").textContent(),"Деловая встреча");
  assert.equal(await page.locator(".post-copy h2").textContent(),"Уверенная классика");
  await noOverflow();
  await page.getByRole("button",{name:"Нравится",exact:true}).click();
  assert.equal(await page.getByRole("button",{name:"Нравится",exact:true}).getAttribute("aria-pressed"),"true");
  await page.getByRole("button",{name:"Сохранить образ",exact:true}).click();
  assert.equal(await page.locator("#saved-count").textContent(),"1");
  assert.equal(await page.locator("#feed-progress-label").textContent(),"1 из 6 этапов");
  // Swipe and keyboard navigation between genuinely different products.
  await page.locator(".photo").evaluate(el=>{
   const touch=(x,y)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});
   el.dispatchEvent(new TouchEvent("touchstart",{changedTouches:[touch(280,120)],bubbles:true}));
   el.dispatchEvent(new TouchEvent("touchend",{changedTouches:[touch(80,122)],bubbles:true}));
  });
  assert.equal(await page.locator(".post-copy h2").textContent(),"Современный характер");
  await page.locator(".photo").press("ArrowLeft");
  assert.equal(await page.locator(".post-copy h2").textContent(),"Уверенная классика");
  await page.getByRole("button",{name:"Выбрать этот образ"}).click();
  await progress(2);await noOverflow();
  await page.locator("#event-date").fill("2000-01-01");await page.locator("#set-date").click();
  assert.match(await page.locator("#date-error").textContent(),/будущую/);await progress(2);
  await page.locator("#unknown-date").click();await progress(3);
  await page.locator('[data-own="shirt"]').check();
  assert.equal(await page.locator('[data-own="shirt"]').isChecked(),true);
  await page.locator("#confirm-wardrobe").click();await progress(4);
  assert.equal(await page.locator(".task.done").count(),4);
  assert.equal(await page.locator('.task[data-task="3"] .task-name').evaluate(el=>getComputedStyle(el).textDecorationLine),"line-through");
  await page.locator("#confirm-summary").click();await progress(5);
  assert.match(await page.locator(".summary").textContent(),/Галстук/);
  assert.equal(await page.locator("#book").getAttribute("href"),"https://atelier-23.ru/sign-up-for-a-fitting-room/");
  assert.equal(await page.locator("#visited").isChecked(),false);
  await page.locator("#visited").check();await progress(6);
  // Reopening preserves the chosen path; editing garment list invalidates downstream completion.
  await page.reload();await nav("Мой план");await progress(6);
  await page.locator('[data-own="suit"]').check();await progress(3);
  assert.match(await page.locator(".summary").textContent(),/0 ₽ за основное изделие/);
  assert.ok(await page.locator("#confirm-summary").isDisabled());
  await nav("Избранное");assert.equal(await page.locator(".saved-item").count(),1);
  await page.getByRole("button",{name:"В ленту"}).click();
  assert.equal(await page.getByRole("button",{name:"Нравится",exact:true}).getAttribute("aria-pressed"),"true");
  await page.getByRole("button",{name:"Дальше →"}).click();
  await page.getByRole("button",{name:"Выбрать этот образ"}).click();
  await progress(3);
  await nav("Главная");await page.getByRole("button",{name:"Свадьба",exact:true}).click();
  assert.equal(await page.locator("#feed-progress-label").textContent(),"1 из 6 этапов");
  await nav("Избранное");assert.equal(await page.locator(".saved-item").count(),1);
  await page.getByRole("button",{name:/Удалить .* из избранного/}).click();
  assert.equal(await page.locator("#saved-count").textContent(),"0");
  await noOverflow();assert.deepEqual(errors,[]);
  await context.close();console.log("PASS "+width+"px: preview, swipe, reactions, persistence, progress, booking guard, event isolation");
 }
}finally{await browser.close();server.close()}
