import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "playwright";

const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
const server=createServer(async(req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname)}catch(e){res.writeHead(400).end();return}
  const relative=pathname==="/"?"index.html":pathname.slice(1);
  const p=path.resolve(base,relative);
  if(p!==base&&!p.startsWith(base+path.sep)){res.writeHead(403).end();return}
  try{const data=await readFile(p);res.writeHead(200,{"content-type":mime[path.extname(p)]||"application/octet-stream"});res.end(data)}
  catch(e){res.writeHead(404).end("Not Found")}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const url="http://127.0.0.1:"+server.address().port+"/legacy.html";
const results=[],errors=[];
await mkdir(path.join(base,"artifacts"),{recursive:true});
try{
  for(const [name,type,width] of [["Chromium",chromium,390],["Firefox",firefox,1280],["WebKit",webkit,390]]){
    const browser=await type.launch({headless:true});
    try{
      const page=await browser.newPage({viewport:{width,height:844},reducedMotion:"reduce"});
      page.on("pageerror",err=>errors.push(name+": "+err.message));
      await page.goto(url,{waitUntil:"domcontentloaded"});
      await page.locator("#looks article").first().waitFor();
      assert.equal(await page.locator("#looks article").count(),4);

      // Demo catalog is a UI laboratory, not confirmed Merdo merchandise.
      assert.equal(await page.locator("#demoProducts .sampleCard").count(),8);
      await page.locator('[data-gender="man"].sampleFilter').click();
      assert.equal(await page.locator("#demoProducts .sampleCard").count(),4);
      await page.locator('select[name="sample-size-TEST-M-08"]').selectOption("42");
      assert.equal(await page.locator('select[name="sample-size-TEST-M-08"]').inputValue(),"42");
      await page.locator('[data-sample-action="toggle"][data-id="TEST-M-08"]').click();
      assert.match(await page.locator("#demoProducts .sampleLookTotal strong").innerText(),/2[.\s\u00a0]?950/);
      await page.locator('[data-gender="woman"].sampleFilter').click();
      assert.equal(await page.locator("#demoProducts .sampleCard").count(),4);
      await page.locator('[data-sample-action="toggle"][data-id="TEST-W-03"]').click();
      assert.equal(await page.locator("#demoProducts .sampleItems li").count(),1,"mixed-gender selection is reset for one coherent outfit");
      await page.locator("#sampleReset").click();
      await page.locator('[data-gender="all"].sampleFilter').click();


      // Real inventory may not be inferred from a website's brand list.
      assert.equal(await page.locator("#catalogStatus .catalogNumber b").innerText(),"0");
      await page.locator("#language").click();
      assert.equal(await page.locator("html").getAttribute("lang"),"ru");
      assert.match(await page.locator("#catalogStatus").innerText(),/не нашли проверяемую актуальную выгрузку/);
      await page.locator("#catalogAsk").click();
      assert.equal(await page.locator("#catalogRequest").isVisible(),true);
      assert.match(await page.locator("#catalogDraft").inputValue(),/артикулами, ценами, размерами/);
      await page.locator("#catalogClose").click();
      assert.equal(await page.locator("#catalogRequest").isVisible(),false);

      // A customer's photo must work in Chromium, Firefox and WebKit, remain private,
      // survive refresh, and be fully removable without deleting the garment.
      await page.locator('input[name="wardrobe-jacket"]').check();
      await page.locator('select[name="wardrobe-color-jacket"]').focus();
      await page.locator('select[name="wardrobe-color-jacket"]').selectOption("navy");
      assert.equal(await page.evaluate(()=>document.activeElement.name),"wardrobe-color-jacket","color select retains focus");
      await page.locator('select[name="wardrobe-cut-jacket"]').focus();
      await page.locator('select[name="wardrobe-cut-jacket"]').selectOption("structured");
      assert.equal(await page.evaluate(()=>document.activeElement.name),"wardrobe-cut-jacket","cut select retains focus");
      const pixel=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAF0lEQVR4nGNUdZ3IQAgwEVQxqmgAFAEAx40BEw18ATYAAAAASUVORK5CYII=","base64");
      await page.locator('input[name="wardrobe-photo-jacket"]').setInputFiles({name:"wardrobe-test.png",mimeType:"image/png",buffer:pixel});
      const saved=page.locator('[data-wardrobe-item="jacket"] .wardrobePhoto');
      await saved.waitFor({timeout:10000});
      assert.match(await saved.getAttribute("src"),/^data:image\/(?:jpeg|webp);base64,/);
      await page.reload({waitUntil:"domcontentloaded"});
      assert.equal(await page.locator('select[name="wardrobe-color-jacket"]').inputValue(),"navy");
      assert.equal(await page.locator('select[name="wardrobe-cut-jacket"]').inputValue(),"structured");
      assert.equal(await page.locator('[data-wardrobe-item="jacket"] .wardrobePhoto').count(),1);
      await page.locator('[data-photo-remove="jacket"]').click();
      assert.equal(await page.locator('[data-wardrobe-item="jacket"] .wardrobePhoto').count(),0);
      await page.locator("#wardrobeClear").click();
      assert.equal(await page.locator('input[name="wardrobe-jacket"]').isChecked(),false);
      // Language is persisted across reloads; verify both toggles without assuming reset.
      assert.equal(await page.locator("html").getAttribute("lang"),"ru");
      await page.locator("#language").click();
      assert.equal(await page.locator("html").getAttribute("lang"),"tr");
      await page.locator("#language").click();
      assert.equal(await page.locator("html").getAttribute("lang"),"ru");

      // Responsive navigation must exist on small screens, not hide all links.
      if(width<800){
        await page.locator("#navToggle").click();
        assert.equal(await page.locator("#navToggle").getAttribute("aria-expanded"),"true");
        assert.equal(await page.locator("#navCatalog").isVisible(),true);
        await page.locator("#navCatalog").click();
        assert.equal(await page.locator("#navToggle").getAttribute("aria-expanded"),"false");
      }else{
        assert.equal(await page.locator("#navCatalog").isVisible(),true);
      }

      // Unverified merchandise: no size is silently selected.
      await page.locator('[data-action="try"]').first().click();
      assert.equal(await page.locator("#size").inputValue(),"");
      assert.ok(!(await page.locator("#draft").innerText()).includes("размере ?"));
      assert.equal(await page.locator("#overlay").isVisible(),true);
      await page.keyboard.press("Shift+Tab");
      assert.equal(await page.evaluate(()=>document.activeElement.id),"closeModal2","dialog focus stays trapped");
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#overlay").isVisible(),false);

      // Keyboard navigation in editorial 3-stage story.
      await page.locator('[data-action="story"]').first().click();
      await page.keyboard.press("Shift+Tab");
      assert.equal(await page.evaluate(()=>document.activeElement.getAttribute("data-story")),"next");
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#lookStoryOverlay").isVisible(),false);

      await page.locator('[data-action="like"]').first().click();
      assert.equal(await page.evaluate(()=>document.activeElement.dataset.action),"like","reaction keeps keyboard focus");

      // Share a specific look, not merely the top of the feed.
      await page.goto(url+"#look3");
      await page.locator('[data-post="look3"].isShared').waitFor();
      const box=await page.locator('[data-post="look3"]').boundingBox();
      assert.ok(box&&box.width>0);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      assert.ok(overflow<=2,"horizontal overflow "+overflow+"px in "+name);

      // A failed third-party illustration cannot make the concept unusable.
      await page.locator('[data-post="look3"] .visual img').evaluate(el=>el.dispatchEvent(new Event("error")));
      await page.locator('[data-post="look3"] .visual.imageUnavailable').waitFor();
      assert.equal(await page.locator('[data-post="look3"] [data-action="compose"]').isEnabled(),true);

      assert.deepEqual(errors,[],"runtime JavaScript errors");
      await page.screenshot({path:path.join(base,"artifacts","audit-"+name.toLowerCase()+"-"+width+".png"),fullPage:true});
      results.push({browser:name,width,passed:true});
      await page.close();
    }finally{await browser.close()}
  }
  console.log(JSON.stringify({suite:"Merdo × BitOS product, UX and cross-browser audit",results}));
}finally{await new Promise(resolve=>server.close(resolve))}
