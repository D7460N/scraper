// A2 scraper - captures fully-rendered DOM from a JS-heavy site.
// Output: aoa-raw.html in repo root.
//
// Why Playwright over fetch():
//   Wix renders content via JS after page load. A plain HTTP fetch returns
//   the empty shell. Playwright runs a real headless Chromium that executes
//   the JS, waits for the network to settle, then we grab the resulting DOM.
//
// What this does NOT do yet:
//   - Parse the HTML
//   - Extract content into JSON
//   - Follow links / scrape multiple pages
//   - Respect robots.txt (added in A4)
//
// All of that comes in later phases. A2 is just: can we get the DOM at all?

import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';

const URL = 'https://aoavirginia.com';
const OUTPUT = 'aoa-raw.html';
const TIMEOUT_MS = 30000;

const browser = await chromium.launch();
const context = await browser.newContext({
	userAgent: 'Mozilla/5.0 (D7460N-scraper; +https://github.com/D7460N/scraper)'
});
const page = await context.newPage();

console.log(`Loading ${URL}...`);
await page.goto(URL, { waitUntil: 'networkidle', timeout: TIMEOUT_MS });

const html = await page.content();
console.log(`Captured ${html.length} bytes of rendered HTML`);

await writeFile(OUTPUT, html, 'utf8');
console.log(`Wrote ${OUTPUT}`);

await browser.close();
