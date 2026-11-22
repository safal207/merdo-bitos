import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = pathToFileURL(path.join(base, "index.html")).href;
const browser = await chromium.launch({ headless: true });
const results = [];

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
    assert.equal(await page.locator("#looks article").count(), 4, "four concept fashion looks must render");
    await page.locator("#language").click();
    assert.equal(await page.locator("html").getAttribute("lang"), "ru", "RU switch works");

    await page.locator('[data-action="compose"]').first().click();
    assert.equal(await page.locator("#stylist").count(), 1, "stylist view exists");
    assert.equal(await page.locator("#lookSource").isVisible(), true, "feed item transfers to stylist");

    await page.locator('#styleBudget').fill("15000");
    await page.locator('#styleBudget').dispatchEvent("change");
    assert.match(await page.locator("#styleDynamic").innerText(), /15\s?000/, "budget estimate shown");

    await page.locator('input[name="sleeve"]').check();
    assert.equal(await page.locator('input[name="sleeve"]').isChecked(), true);
    assert.match(await page.locator(".tailorRow").filter({ has: page.locator('input[name="sleeve"]') }).innerText(), /650/, "individual tailoring price shown");
    assert.match(await page.locator("#styleDynamic").innerText(), /1\\s?050/, "separate total tailoring estimate shown");
    assert.ok((await page.locator("#styleDraft").textContent()).length > 60, "outreach message drafted");

    await page.locator('input[name="occasion"][value="creative"]').check();
    assert.match(await page.locator("#styleDynamic").innerText(), /smart casual|креатив|выразител/i, "occasion changes outfit");

    await page.locator("#resetStyle").click();
    assert.equal(await page.locator('input[name="sleeve"]').isChecked(), false, "reset clears tailoring");

    assert.deepEqual(errors, [], "no uncaught JS exceptions");
    results.push({ viewport: width, checks: 9, status: "pass" });
    await page.close();
  }
  console.log(JSON.stringify({ suite: "Merdo × BitOS pilot", results }, null, 2));
} finally {
  await browser.close();
}
