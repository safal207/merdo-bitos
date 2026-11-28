import {readFile} from "node:fs/promises";
import assert from "node:assert/strict";
import {chromium} from "playwright";
const root=new URL("../atelier23/fashion-overlay/",import.meta.url);
const [source,html,module]=await Promise.all(["overlay.js","index.html","photos.js"].map(p=>readFile(new URL(p,root),"utf8")));
const {photoCandidates}=await import("data:text/javascript;base64,"+Buffer.from(module).toString("base64"));
const photos=[...new Set([...source.matchAll(/image:"([^"]+-300x400\.jpg)"/g)].map(m=>m[1]))];
assert.equal(photos.length,6,"Expected six distinct official product photos");
const social=html.match(/<meta name="twitter:image" content="([^"]+)">/)?.[1];
assert.ok(social,"Missing static X image");
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 const page=await browser.newPage();
 await page.goto("about:blank");
 const groups=[...photos.map(path=>({id:path,urls:photoCandidates(path)})),{id:"X Card",urls:[social]}];
 const report=await page.evaluate(async groups=>{
  async function probe(url){
   return await new Promise(resolve=>{
    const img=new Image();img.referrerPolicy="no-referrer";
    let finished=false;const complete=(ok,reason)=>{if(finished)return;finished=true;clearTimeout(timer);img.onload=null;img.onerror=null;resolve({url,ok,reason,width:img.naturalWidth,height:img.naturalHeight});if(!ok)img.removeAttribute("src")};
    const timer=setTimeout(()=>complete(false,"timeout"),8000);
    img.onload=()=>complete(img.naturalWidth>0&&img.naturalHeight>0,"decode");
    img.onerror=()=>complete(false,"load error");img.src=url;
   });
  }
  return await Promise.all(groups.map(async group=>{
   const attempts=[];
   for(const url of group.urls){const r=await probe(url);attempts.push(r);if(r.ok)break}
   return {id:group.id,ok:attempts.some(r=>r.ok),attempts};
  }));
 },groups);
 console.log(JSON.stringify(report,null,2));
 assert.ok(report.every(r=>r.ok),"Live image availability failed: "+report.filter(r=>!r.ok).map(r=>r.id).join(", "));
 console.log("PASS: live original product images and X card");
}finally{await browser.close()}
