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
    assert.match(await page.locator("#journeyTitle").innerText(), /пиджак/i);
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

    assert.deepEqual(errors, [], "no uncaught JS exceptions");
    await page.screenshot({path:path.join(base,"artifacts","merdo-journey-"+width+".png"),fullPage:true});
    results.push({ viewport: width, checks: 19, status: "pass" });
    await page.close();
  }
  console.log(JSON.stringify({ suite: "Merdo × BitOS simplified fashion funnel", results }, null, 2));
} finally {
  await browser.close();
}
