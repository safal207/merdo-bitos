import assert from "node:assert/strict";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = pathToFileURL(path.join(base, "index.html")).href;
const browser = await chromium.launch({ headless: true });
const results = [];
await mkdir(path.join(base, "artifacts"), {recursive: true});
try {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({
      viewport: { width, height: 844 },
      reducedMotion: "reduce"
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.locator("#looks article").first().waitFor();
    assert.equal(await page.locator("#looks article").count(), 4, "four concept fashion looks render");

    await page.locator("#language").click();
    assert.equal(await page.locator("html").getAttribute("lang"), "ru", "RU switch works");
    assert.match(await page.locator("#startStyle").innerText(), /4 шага/);

    // Sample product cards: explicit mock prices, illustrative vectors, gender, sizes and look builder.
    assert.equal(await page.locator("#demoProducts .sampleCard").count(),8,"all eight fictional products render");
    assert.equal(await page.locator('#demoProducts .sampleArt svg').count(),8,"editable schematic garment art renders");
    assert.match(await page.locator("#demoProducts .sampleWarning").innerText(),/ЦЕНЫ И РАЗМЕРЫ УСЛОВНЫЕ/);
    await page.locator('[data-gender="woman"].sampleFilter').click();
    assert.equal(await page.locator("#demoProducts .sampleCard").count(),4,"women filter");
    await page.locator('select[name="sample-size-TEST-W-01"]').selectOption("M");
    assert.equal(await page.locator('select[name="sample-size-TEST-W-01"]').inputValue(),"M");
    await page.locator('[data-sample-action="toggle"][data-id="TEST-W-01"]').click();
    await page.locator('[data-sample-action="toggle"][data-id="TEST-W-02"]').click();
    assert.equal(await page.locator("#demoProducts .sampleCount").innerText(),"2");
    assert.match(await page.locator("#demoProducts .sampleLookTotal strong").innerText(),/6[\s\u00a0]?850/);
    assert.equal(await page.locator("#demoProducts .sampleItems li").count(),2);
    await page.locator('[data-sample-action="details"][data-id="TEST-W-01"]').click();
    assert.match(await page.locator('[data-sample-id="TEST-W-01"] .sampleDetails').innerText(),/не подтверждены/);
    await page.screenshot({path:path.join(base,"artifacts","merdo-product-cards-"+width+".png"),fullPage:true});
    await page.locator("#sampleToStylist").click();
    assert.match(await page.locator("#journeyTitle").innerText(),/Для чего подбираем/);
    assert.equal(await page.locator('.journeyChip[data-gender="woman"]').getAttribute("aria-pressed"),"true");
    assert.match(await page.locator(".journeySource").innerText(),/6[\s\u00a0]?850/);
    await page.locator("#sampleReset").click();
    assert.equal(await page.locator("#demoProducts .sampleCount").innerText(),"0");
    await page.locator('[data-gender="all"].sampleFilter').click();


    // Lamoda-informed editorial exploration: same illustration, no SKU or false product prices.
    await page.locator('[data-action="story"]').first().click();
    assert.equal(await page.locator("#lookStoryOverlay").isVisible(), true, "three frame story opens");
    assert.match(await page.locator("#lookStoryTitle").innerText(), /Посмотри на образ/);
    const editorialImage = await page.locator(".lookStoryPicture img").getAttribute("src");
    await page.locator('[data-story="next"]').click();
    assert.match(await page.locator("#lookStoryTitle").innerText(), /детали/);
    assert.equal(await page.locator(".lookStoryPicture img").getAttribute("src"), editorialImage, "same illustrative photo zoomed, no fake product photography");
    await page.locator('[data-story="next"]').click();
    assert.match(await page.locator("#lookStoryTitle").innerText(), /Из чего складывается/);
    assert.equal(await page.locator(".lookStoryPart").count(), 4, "four generic outfit categories, no fake SKU");
    await page.locator('[data-story="compose"]').click();
    assert.equal(await page.locator("#lookStoryOverlay").isVisible(), false, "modal closes before entering funnel");
    assert.match(await page.locator("#journeyTitle").innerText(), /Для чего подбираем/);

    // Feed-to-funnel handoff: the original look sets the gender.
    await page.locator('[data-action="compose"]').first().click();
    assert.match(await page.locator("#journeyTitle").innerText(), /Для чего подбираем/);
    assert.match(await page.locator(".journeySource").innerText(), /Образ|фотолент/i);
    assert.equal(await page.locator('.journeyChip[data-gender="woman"]').getAttribute("aria-pressed"), "true");
    await page.locator('.journeyChip[data-gender="man"]').click();
    assert.equal(await page.locator('.journeyChip[data-gender="man"]').getAttribute("aria-pressed"), "true");

    // Micro-lesson style: one choice moves to the next screen, with an honest progress indicator.
    await page.locator('[data-option="formal"]').click();
    assert.match(await page.locator("#journeyTitle").innerText(), /в плечах/i);
    await page.locator(".journeyBack").click();
    assert.match(await page.locator("#journeyTitle").innerText(), /Для чего подбираем/);
    await page.locator('[data-option="formal"]').click();
    await page.locator('[data-option="normal"]').click();
    assert.match(await page.locator("#journeyTitle").innerText(), /Сколько планируем/);
    await page.locator('[data-budget="15000"]').click();
    assert.match(await page.locator("#journeyTitle").innerText(), /подгонка/i);

    // Optional order-bump-like tailoring: no fake checkout or invented Merdo stock.
    assert.equal(await page.locator('input[name="journey-sleeve"]').isChecked(), false);
    await page.locator('input[name="journey-sleeve"]').check();
    assert.match(await page.locator(".journeyEstimate").innerText(), /650/);
    await page.locator('[data-action="finish"]').click();
    assert.match(await page.locator("#journeyTitle").innerText(), /Образ собран/);
    assert.match(await page.locator(".journeyReceipt").innerText(), /15\s?000/);
    assert.match(await page.locator(".journeyReceipt").innerText(), /650/);

    await page.locator('[data-action="reveal"]').click();
    assert.equal(await page.locator("#stylist").isVisible(), true, "full look preview opens");
    assert.equal(await page.locator(".styleForm").isVisible(), false, "advanced form hidden by default");
    assert.match(await page.locator("#styleDynamic").innerText(), /15\s?650/, "apparel plus separate tailoring estimate");
    assert.ok((await page.locator("#styleDraft").textContent()).length > 60);

    await page.locator("#toggleAdvanced").click();
    assert.equal(await page.locator(".styleForm").isVisible(), true, "advanced controls opt-in");
    assert.equal(await page.locator("#styleBudget").inputValue(), "15000");
    assert.equal(await page.locator('input[name="sleeve"]').isChecked(), true);
    await page.locator("#resetStyle").click();
    assert.equal(await page.locator('input[name="sleeve"]').isChecked(), false, "reset clears tailoring");

    // My Wardrobe: only categories, locally saved; recommend missing items, never invent SKUs.
    await page.locator('input[name="wardrobe-jacket"]').check();
    await page.locator('input[name="wardrobe-shoes"]').check();
    // Item attributes are user-declared, not guessed from photos.
    await page.locator('select[name="wardrobe-color-jacket"]').selectOption("navy");
    await page.locator('select[name="wardrobe-cut-jacket"]').selectOption("structured");
    assert.equal(await page.locator('select[name="wardrobe-color-jacket"]').inputValue(),"navy");
    assert.equal(await page.locator('select[name="wardrobe-cut-jacket"]').inputValue(),"structured");
    // Upload a small known-good PNG; browser converts and stores only a downscaled photo.
    const photo=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAF0lEQVR4nGNUdZ3IQAgwEVQxqmgAFAEAx40BEw18ATYAAAAASUVORK5CYII=","base64");
    await page.locator('input[name="wardrobe-photo-jacket"]').setInputFiles({name:"mine.png",mimeType:"image/png",buffer:photo});
    await page.locator('[data-wardrobe-item="jacket"] .wardrobePhoto').waitFor();
    assert.match(await page.locator('[data-wardrobe-item="jacket"] .wardrobePhoto').getAttribute("src"),/^data:image\/(?:webp|jpeg);base64,/);
    assert.match(await page.locator(".wardrobeStatus").innerText(), /2\s*\/\s*5/);
    await page.locator("#wardrobeProceed").click();
    assert.match(await page.locator("#journeyTitle").innerText(), /Для чего подбираем/);
    await page.locator('[data-option="formal"]').click();
    await page.locator('[data-option="normal"]').click();
    await page.locator('[data-budget="15000"]').click();
    await page.locator('[data-action="finish"]').click();
    assert.match(await page.locator(".journeyOwnedNote").innerText(), /2 из 5/);
    await page.locator('[data-action="reveal"]').click();
    assert.equal(await page.locator("#stylist .stylePiece.isOwned").count(),2,
      "do not offer already owned jacket and shoes as missing purchases");
    assert.match(await page.locator("#styleDynamic").innerText(), /План на недостающие вещи/);
    assert.match(await page.locator("#styleDraft").innerText(), /У меня уже есть/);
    assert.match(await page.locator("#styleDynamic").innerText(), /тёмно-синий/i);
    assert.match(await page.locator("#styleDynamic").innerText(), /структурный/i);
    assert.match(await page.locator("#styleDynamic").innerText(), /Цветовая идея:/);
    assert.ok(!(await page.locator("#styleDraft").innerText()).includes("data:image/"),"private photograph never added to outbound message");
    await page.locator('input[name="wardrobe-shirt"]').check();
    await page.locator('input[name="wardrobe-trousers"]').check();
    await page.locator('input[name="wardrobe-details"]').check();
    assert.equal(await page.locator("#stylist .stylePiece.isOwned").count(), 5);
    assert.match(await page.locator("#styleDynamic").innerText(), /возможно, ничего докупать не требуется/i);
    assert.match(await page.locator("#styleDraft").innerText(), /покупать ничего не нужно/i);

    // Persistence is device-local, language independent, and can be cleared.
    await page.reload();
    await page.locator("#myWardrobe").waitFor();
    assert.equal(await page.locator('input[name^="wardrobe-"]:checked').count(), 5);
    assert.equal(await page.locator('select[name="wardrobe-color-jacket"]').inputValue(), "navy");
    assert.equal(await page.locator('select[name="wardrobe-cut-jacket"]').inputValue(), "structured");
    assert.equal(await page.locator('[data-wardrobe-item="jacket"] .wardrobePhoto').count(),1,"saved image survives reload");
    await page.locator('[data-photo-remove="jacket"]').click();
    assert.equal(await page.locator('[data-wardrobe-item="jacket"] .wardrobePhoto').count(),0,"photo can be removed separately");
    // Casual intent is available alongside premium business consultation.
    await page.locator("#wardrobeProceed").click();
    await page.locator('[data-option="casual"]').click();
    await page.locator('[data-option="normal"]').click();
    await page.locator('[data-budget="5000"]').click();
    await page.locator('[data-action="skip"]').click();
    await page.locator('[data-action="reveal"]').click();
    assert.match(await page.locator("#styleDynamic").innerText(), /Городской выходной/);
    await page.locator("#wardrobeClear").click();
    assert.equal(await page.locator('input[name^="wardrobe-"]:checked').count(), 0);
    await page.reload();
    assert.equal(await page.locator('input[name^="wardrobe-"]:checked').count(), 0);
    assert.deepEqual(errors, [], "no uncaught JS exceptions");
    await page.screenshot({path:path.join(base,"artifacts","merdo-journey-"+width+".png"),fullPage:true});
    results.push({ viewport: width, checks: 56, status: "pass" });
    await page.close();
  }
  console.log(JSON.stringify({ suite: "Merdo × BitOS simplified fashion funnel", results }, null, 2));
} finally {
  await browser.close();
}
