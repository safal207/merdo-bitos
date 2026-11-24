import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";
import { createHash } from "node:crypto";

const root = resolve(process.cwd());
const localFilm = await readFile(join(root,"atelier23/assets/atelier23-film.mp4"));
const digest = createHash("sha256").update(localFilm).digest("hex");
if(localFilm.length !== 3503909 || digest !== "e4a47584c6309e6baac87949fe6726108eccf337f356c0bee7c3328651d261c5") throw new Error("Atelier 23 local MP4 checksum mismatch");
console.log("PASS MP4 asset integrity: "+localFilm.length+" bytes; SHA256 "+digest.slice(0,12));
const mime = {".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".jpg":"image/jpeg",".webp":"image/webp"};
const server = createServer(async (req,res) => {
  try {
    const u = new URL(req.url,"http://localhost");
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/,"");
    const requested = resolve(root, rel.endsWith("/") ? rel+"index.html" : rel);
    if (!requested.startsWith(root+"/")) {res.writeHead(403).end();return;}
    const buf = await readFile(requested);
    res.writeHead(200,{"content-type":mime[extname(requested)]||"application/octet-stream","cache-control":"no-store"});
    res.end(buf);
  } catch {res.writeHead(404).end("Not found");}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const port=server.address().port;
const base="http://127.0.0.1:"+port+"/atelier23/";
let failures=[];
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try {
  for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:850},reducedMotion:"reduce"});
    page.on("pageerror",e=>failures.push(width+" JS: "+e.message));
    page.on("console",msg=>{if(msg.type()==="error" && !/net::ERR|favicon|atelier-reel|film-looks/i.test(msg.text()))failures.push(width+" console: "+msg.text());});
    await page.goto(base,{waitUntil:"domcontentloaded"});
    await page.locator("#journey .quiz-body").waitFor({timeout:40000});
    const horizontallyScrollable=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    if(horizontallyScrollable) failures.push(width+" horizontal scroll");
    await page.getByRole("button",{name:/Деловые встречи/}).click();
    await page.getByRole("button",{name:/Продолжить/}).click();
    await page.getByRole("button",{name:/Продолжить/}).click();
    await page.getByRole("button",{name:/Современная классика/}).click();
    await page.getByRole("button",{name:/Продолжить/}).click();
    await page.getByRole("button",{name:/150–250 тыс/}).click();
    await page.getByRole("button",{name:/Получить рекомендацию/}).click();
    await page.getByText("Костюм, подходящий вашему ритму").waitFor({timeout:2000});
    const book=await page.locator(".result-actions a").first().getAttribute("href");
    if(book!=="https://atelier-23.ru/sign-up-for-a-fitting-room/")failures.push(width+" booking href mismatch");
    await page.getByRole("button",{name:/Начать заново/}).click();
    await page.getByRole("button",{name:/Свадьба/}).click();
    await page.getByRole("button",{name:/Продолжить/}).click();
    const eventDate=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
    await page.locator("#eventDate").fill(eventDate);
    await page.getByRole("button",{name:/Продолжить/}).click();
    await page.getByRole("button",{name:/Современная классика/}).click();
    await page.getByRole("button",{name:/Продолжить/}).click();
    await page.getByRole("button",{name:/До 150 000 ₽/}).click();
    await page.getByRole("button",{name:/Получить рекомендацию/}).click();
    await page.getByText("К важной дате — без неоправданных обещаний").waitFor({timeout:2000});
    const collection=await page.locator(".result-actions a").nth(1).getAttribute("href");
    if(collection!=="https://atelier-23.ru/collection/costumes/")failures.push(width+" urgent route mismatch");
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    if(overflow)failures.push(width+" horizontal scroll after result");
    await page.close();
    const episode=await browser.newPage({viewport:{width,height:850},reducedMotion:"reduce"});
    episode.on("pageerror",e=>failures.push(width+" episode JS: "+e.message));
    await episode.goto(base+"series/01/",{waitUntil:"domcontentloaded"});
    const primary=episode.locator("#choose-occasion");
    const href=await primary.getAttribute("href");
    if(href!=="../../#journey") failures.push(width+" episode CTA route mismatch");
    const video=episode.locator("#film");
    if(await video.locator("source").getAttribute("src")!=="https://scarlet-eagle-sapphire-breeze.grok.me/atelier-reel.mp4") failures.push(width+" episode source mismatch");
    if(!await video.evaluate(v=>v.paused && v.muted && v.playsInline)) failures.push(width+" reduced motion/muted media check");
    if(await episode.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)) failures.push(width+" episode overflow");
    const bounds=await primary.boundingBox();
    if(!bounds || bounds.y+bounds.height>850) failures.push(width+" episode CTA outside first viewport");
    await video.locator("source").dispatchEvent("error");
    if(!await episode.locator("#fallback").isVisible()) failures.push(width+" episode fallback not visible after simulated source failure");
    await primary.click();
    await episode.locator("#journey .quiz-body").waitFor({timeout:40000});
    if(new URL(episode.url()).hash!=="#journey") failures.push(width+" episode destination not reached");
    await episode.close();
    await mkdir(join(root,"artifacts","atelier23-signature"),{recursive:true});
    const signatureContext=await browser.newContext({viewport:{width,height:850},reducedMotion:"reduce"});
    const signature=await signatureContext.newPage();
    signature.on("pageerror",e=>failures.push(width+" Signature JS: "+e.message));
    const external=[];
    await signature.route("**/*",route=>{
      const url=new URL(route.request().url());
      if(url.origin===new URL(base).origin)return route.continue();
      // Match the pinned React import map used by the existing Atelier app.
      if(url.origin==="https://esm.sh"&&/^\/(?:react(?:-dom)?|scheduler)@/.test(url.pathname)&&route.request().resourceType()==="script")return route.continue();
      external.push(url.href);return route.abort();
    });
    await signature.addInitScript(()=>{Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("test fallback")}}})});
    await signature.goto(base+"signature/",{waitUntil:"domcontentloaded"});
    const next=signature.locator("#next"),prev=signature.locator("#prev");
    await signature.getByRole("heading",{name:"Сначала — характер."}).waitFor();
    if(await signature.locator('main[data-renderer="react"]').count()!==1||await signature.locator("#signature-fallback").count()!==0)failures.push(width+" Signature React root not mounted");
    if(!await prev.isDisabled())failures.push(width+" Signature back enabled on initial step");
    const motionToggle=signature.locator("#motion-toggle"),replayScene=signature.locator("#replay-scene");
    const frame=signature.locator(".sig .film-frame");
    const animationName=()=>frame.evaluate(el=>getComputedStyle(el).animationName);
    if(await animationName()!=="none"||!await motionToggle.isDisabled()||!await replayScene.isDisabled())failures.push(width+" Signature reduced-motion guard");
    await signature.emulateMedia({reducedMotion:"no-preference"});
    await signature.waitForFunction(()=>document.querySelector(".sig")?.dataset.motion==="on");
    if(await animationName()!=="sig-film-forward"||await motionToggle.isDisabled()||await replayScene.isDisabled())failures.push(width+" Signature cinematic activation");
    await signature.getByLabel("Комфорт в движении").check();
    await next.click();
    if(await animationName()!=="sig-film-forward")failures.push(width+" Signature forward transition");
    await prev.click();
    if(await animationName()!=="sig-film-back"||!await signature.getByLabel("Комфорт в движении").isChecked())failures.push(width+" Signature reverse transition/state");
    const previousFrame=await frame.elementHandle();
    await replayScene.click();
    if(previousFrame&&await previousFrame.evaluate(el=>el.isConnected))failures.push(width+" Signature replay did not remount frame");
    if(!await signature.getByLabel("Комфорт в движении").isChecked()||await signature.locator("#progress").textContent()!=="Глава 1 из 6")failures.push(width+" Signature replay changed choices or progress");
    await motionToggle.click();
    if(await animationName()!=="none"||!await replayScene.isDisabled())failures.push(width+" Signature manual motion off");
    await motionToggle.click();
    await signature.emulateMedia({reducedMotion:"reduce"});
    await signature.waitForFunction(()=>document.querySelector(".sig")?.dataset.motion==="off");
    if(await animationName()!=="none"||!await motionToggle.isDisabled())failures.push(width+" Signature live system reduced motion");

    for(let i=0;i<6;i++){
      if(await signature.locator("#progress").textContent()!=="Глава "+(i+1)+" из 6")failures.push(width+" Signature wrong chapter "+i);
      if(await signature.locator("#chapters button[aria-current=step]").count()!==1)failures.push(width+" Signature current step indicator");
      if(await signature.locator("#illustration svg").count()!==1)failures.push(width+" Signature missing drawing "+i);
      const plateId=["concept","fabric","measure","pattern","making","fitting"][i];
      const plate=signature.locator(".sig .plate");
      const svg=signature.locator("#illustration svg");
      if(await plate.getAttribute("data-chapter")!==plateId||await svg.getAttribute("data-plate")!==plateId||!await svg.getAttribute("aria-label"))failures.push(width+" Signature visual identity "+i);
      if(await signature.locator(".progress-line progress").getAttribute("value")!==String(i+1))failures.push(width+" Signature visual progress "+i);
      if(i===2&&await svg.locator(".measuring-tape").count()!==1)failures.push(width+" Signature measuring tape");
      if(i===3&&await svg.locator(".blueprint-sheet").count()!==1)failures.push(width+" Signature blueprint");
      if(i===4&&await svg.locator(".thread-line").count()!==1)failures.push(width+" Signature thread detail");
      if(!/Не фотография производства/.test(await plate.locator("figcaption").textContent()||"")||!await plate.locator("figcaption").isVisible())failures.push(width+" Signature illustration disclosure");
      await signature.screenshot({path:join(root,"artifacts","atelier23-signature",width+"-"+plateId+".png"),fullPage:true,animations:"disabled"});
      if(await signature.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push(width+" Signature horizontal overflow chapter "+i);
      for(const control of [next,prev]){
        const rect=await control.boundingBox();if(!rect||rect.height<44)failures.push(width+" Signature touch target chapter "+i);
      }
      if(i===0)await signature.getByLabel("Комфорт в движении").check();
      if(i===1)await signature.getByLabel("Выраженная фактура").check();
      if(i===2){await signature.getByLabel("Свобода плеч").check();await prev.click();if(!await signature.getByLabel("Выраженная фактура").isChecked())failures.push(width+" Signature back lost selection");await next.click()}
      if(i===4)await signature.getByLabel("Подкладка и отделка").check();
      await next.click();
    }
    await signature.locator("#brief").waitFor();
    await signature.screenshot({path:join(root,"artifacts","atelier23-signature",width+"-brief.png"),fullPage:true,animations:"disabled"});
    if(!await signature.locator("#brief-items").getByText("Свобода плеч",{exact:true}).isVisible())failures.push(width+" Signature summary missing selection");
    if(await signature.locator("#advisor").getAttribute("href")!=="../#journey")failures.push(width+" Signature advisor handoff");
    if(await signature.locator("#journey").getAttribute("href")!=="../fashion-journey/")failures.push(width+" Signature journey handoff");
    const extras=signature.locator(".extra-card");
    const trousers=extras.filter({hasText:"Вторая пара брюк"}).locator("input");
    const shirt=extras.filter({hasText:"Сорочка к костюму"}).locator("input");
    const accessories=extras.filter({hasText:"Акцентные аксессуары"}).locator("input");
    if(await extras.count()!==3||await signature.locator(".extra-card input:checked").count()!==0||!await signature.locator("#clear-extras").isDisabled())failures.push(width+" Signature extras opt-in default");
    if(await extras.first().getAttribute("data-extra")!=="trousers")failures.push(width+" Signature priority from comfort preference");
    for(const card of await extras.all()){const bounds=await card.boundingBox();if(!bounds||bounds.height<44)failures.push(width+" Signature extras touch target")}
    await trousers.check();await shirt.check();
    if(await signature.locator("#extra-count").textContent()!=="Дополнений для обсуждения: 2")failures.push(width+" Signature extras count");
    await shirt.uncheck();await accessories.check();
    if(await signature.locator(".extra-card input:checked").count()!==2||await shirt.isChecked())failures.push(width+" Signature extras change");
    await signature.locator("#clear-extras").click();
    if(await signature.locator(".extra-card input:checked").count()!==0||!await signature.locator("#clear-extras").isDisabled())failures.push(width+" Signature downsell clear");
    await trousers.check();await accessories.check();
    await signature.screenshot({path:join(root,"artifacts","atelier23-signature",width+"-commerce.png"),fullPage:true,animations:"disabled"});
    await signature.locator("#copy-brief").click();
    await signature.locator("#copy-fallback").waitFor();
    const copied=await signature.locator("#copy-fallback").inputValue();
    if(!copied.includes("Свобода плеч")||!copied.includes("Индивидуальный костюм")||!copied.includes("Вторая пара брюк")||!copied.includes("Акцентные аксессуары")||copied.includes("Сорочка к костюму"))failures.push(width+" Signature commerce copy fallback");
    // Test the real React handler without leaving the isolated page.
    await signature.evaluate(()=>document.addEventListener("click",e=>e.preventDefault(),{once:true}));
    await signature.locator("#advisor").click();
    const logBeforeReload=await signature.evaluate(()=>JSON.parse(localStorage.getItem("bitos.atelier23.fashionAnalytics.v1")||"null"));
    const events=logBeforeReload?.rows||[],sigRows=events.filter(r=>r.type.startsWith("signature_"));
    for(const type of ["signature_open","signature_chapter","signature_choice","signature_extra","signature_brief","signature_handoff","signature_replay"]){
      if(!sigRows.some(r=>r.type===type))failures.push(width+" Signature analytics missing "+type);
    }
    if(new Set(sigRows.filter(r=>r.type==="signature_chapter").map(r=>r.chapter)).size!==6)failures.push(width+" Signature analytics chapter coverage");
    if(!sigRows.some(r=>r.type==="signature_choice"&&r.chapter==="fabric"&&r.choice==="Выраженная фактура"))failures.push(width+" Signature analytics fabric choice");
    if(!sigRows.some(r=>r.type==="signature_handoff"&&r.destination==="advisor"))failures.push(width+" Signature analytics handoff");
    if(sigRows.some(r=>Object.keys(r).some(k=>!["type","visit","ts","chapter","choice","extra","action","destination"].includes(k))))failures.push(width+" Signature analytics unexpected data");
    await signature.reload({waitUntil:"domcontentloaded"});
    await signature.locator("#brief").waitFor();
    if(!await signature.locator("#brief-items").getByText("Подкладка и отделка",{exact:true}).isVisible())failures.push(width+" Signature reload lost notes");
    if(!await trousers.isChecked()||!await accessories.isChecked()||await shirt.isChecked())failures.push(width+" Signature reload extras");
    if(await signature.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push(width+" Signature summary overflow");
    await signature.locator("#reset").click();
    if(!await signature.locator("#brief").isHidden()||await signature.getByLabel("Комфорт в движении").isChecked()||await signature.locator(".extra-card input:checked").count()!==0)failures.push(width+" Signature reset");
    await signature.evaluate(()=>sessionStorage.setItem("bitos.atelier23.signature.v1",'{"step":99,"complete":true,"choices":{"concept":"invalid"}}'));
    await signature.reload({waitUntil:"domcontentloaded"});
    await signature.getByRole("heading",{name:"Сначала — характер."}).waitFor();
    if(await signature.locator("#progress").textContent()!=="Глава 1 из 6"||!await signature.locator("#brief").isHidden()||await signature.locator('input:checked').count()!==0)failures.push(width+" Signature corrupt-state guard");
    await signature.evaluate(()=>sessionStorage.setItem("bitos.atelier23.signature.v1",JSON.stringify({step:5,complete:true,extras:["shirt","shirt","unknown",null,42]})));
    await signature.reload({waitUntil:"domcontentloaded"});
    await signature.locator("#brief").waitFor();
    if(await signature.locator(".extra-card input:checked").count()!==1||!await shirt.isChecked())failures.push(width+" Signature extras sanitization");
    await signature.evaluate(()=>sessionStorage.setItem("bitos.atelier23.signature.v1","not json"));
    await signature.reload({waitUntil:"domcontentloaded"});
    await signature.getByRole("heading",{name:"Сначала — характер."}).waitFor();
    if(external.length)failures.push(width+" Signature unexpected non-runtime network: "+external.join(", "));
    const dashboard=await signatureContext.newPage();
    dashboard.on("pageerror",e=>failures.push(width+" Signature dashboard JS: "+e.message));
    await dashboard.route("**/*",route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
    await dashboard.goto(base+"fashion-overlay/analytics/",{waitUntil:"domcontentloaded"});
    await dashboard.locator('[data-metric="sigStarts"] b').waitFor();
    if(Number(await dashboard.locator('[data-metric="sigStarts"] b').textContent())<1)failures.push(width+" Signature dashboard missing local visits");
    if(await dashboard.locator('[data-metric="sigHandoffs"] b').textContent()!=="1")failures.push(width+" Signature dashboard handoff count");
    await dashboard.locator("#demo-mode").click();
    if(await dashboard.locator('[data-metric="sigStarts"] b').textContent()!=="—")failures.push(width+" Signature dashboard mixed synthetic/local data");
    await dashboard.locator("#local-mode").click();
    await dashboard.locator("#signature-section").screenshot({path:join(root,"artifacts","atelier23-signature",width+"-analytics.png"),animations:"disabled"});
    await dashboard.close();
    await signatureContext.close();
    const offline=await browser.newPage({viewport:{width,height:850}});
    await offline.route("https://esm.sh/**",route=>route.abort());
    await offline.goto(base+"signature/",{waitUntil:"load"});
    if(!await offline.locator("#signature-fallback").isVisible()||await offline.locator("#signature-fallback a.btn").getAttribute("href")!=="../#journey")failures.push(width+" Signature unavailable runtime fallback");
    await offline.close();
    const social=await browser.newPage({viewport:{width,height:850}});
    social.on("pageerror",e=>failures.push(width+" Social JS: "+e.message));
    await social.route("**/*",route=>{const u=new URL(route.request().url());return u.origin===new URL(base).origin||(u.origin==="https://esm.sh"&&/^\/(?:react(?:-dom)?|scheduler)@/.test(u.pathname)&&route.request().resourceType()==="script")?route.continue():route.abort()});
    await social.goto(base+"social/?utm_source=instagram&utm_content=gift",{waitUntil:"domcontentloaded"});
    await social.getByRole("heading",{name:"Ofereça uma experiência pessoal."}).waitFor();
    for(const topic of ["craft","wedding","wardrobe","gift"]){
      await social.locator('[data-topic="'+topic+'"]').click();
      if(await social.locator('[data-topic="'+topic+'"]').getAttribute("aria-pressed")!=="true")failures.push(width+" Social topic selection "+topic);
      if(await social.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push(width+" Social overflow "+topic);
    }
    if(!(await social.locator("#social-whatsapp").getAttribute("href")).startsWith("https://wa.me/351912204778?text="))failures.push(width+" Social wrong Lisbon contact");
    if(await social.locator("#social-site").getAttribute("href")!=="https://atelier23.store/pt")failures.push(width+" Social wrong market");
    await social.evaluate(()=>document.addEventListener("click",e=>e.preventDefault(),{once:true}));
    await social.locator("#social-whatsapp").click();
    const socialRows=await social.evaluate(()=>JSON.parse(localStorage.getItem("bitos.atelier23.fashionAnalytics.v1")||'{"rows":[]}').rows);
    if(!socialRows.some(r=>r.type==="social_landing"&&r.source==="instagram"&&r.topic==="gift")||!socialRows.some(r=>r.type==="social_handoff"&&r.destination==="whatsapp"&&r.topic==="gift"))failures.push(width+" Social attribution missing");
    await social.screenshot({path:join(root,"artifacts","atelier23-signature",width+"-social.png"),fullPage:true,animations:"disabled"});
    await social.close();
    console.log("PASS "+width+"px: Lisbon social campaign routing, topic selection, local attribution and overflow");

    process.stdout.write("PASS "+width+"px: Signature React mount, cinematic transitions, reduced motion, chapters, touch targets, selections, notes, reload, reset, optional commerce, shared analytics, runtime fallback and network guard\n");
    process.stdout.write("PASS "+width+"px: episode, video source, reduced motion, fallback, primary CTA route\n");
    process.stdout.write("PASS "+width+"px: wizard, guardrails, overflow, links\n");
  }
} catch(e) {failures.push(e.stack||String(e));}
finally {await browser.close();server.close();}
if(failures.length){console.error(failures.join("\n"));process.exitCode=1;}
