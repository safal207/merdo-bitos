import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
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
    process.stdout.write("PASS "+width+"px: episode, video source, reduced motion, fallback, primary CTA route\n");
    process.stdout.write("PASS "+width+"px: wizard, guardrails, overflow, links\n");
  }
} catch(e) {failures.push(e.stack||String(e));}
finally {await browser.close();server.close();}
if(failures.length){console.error(failures.join("\n"));process.exitCode=1;}
