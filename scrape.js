// A2 + A3 scraper - captures rendered DOM and extracts D7460N JSON.
//
// Output:
//   aoa-raw.html              - full rendered HTML (for debugging)
//   data/aoa/{slug}.json      - one file per top-level extracted key
//
// Filenames are produced by slugify(key). No hardcoded mappings.

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { slugify } from './utils.js';
import { extract } from './mapper.js';

const URL = 'https://aoavirginia.com';
const SITE_SLUG = 'aoa';
const RAW_HTML_PATH = 'aoa-raw.html';
const DATA_DIR = `data/${SITE_SLUG}`;
const TIMEOUT_MS = 30000;

const browser = await chromium.launch();
const context = await browser.newContext({
	userAgent: 'Mozilla/5.0 (D7460N-scraper; +https://github.com/D7460N/scraper)'
});
const page = await context.newPage();

console.log(`Loading ${URL}...`);
await page.goto(URL, { waitUntil: 'networkidle', timeout: TIMEOUT_MS });

// Save raw HTML for debugging / re-mapping without re-fetching
const html = await page.content();
console.log(`Captured ${html.length} bytes of rendered HTML`);
await writeFile(RAW_HTML_PATH, html, 'utf8');
console.log(`Wrote ${RAW_HTML_PATH}`);

// Extract structured JSON
const extracted = await extract(page);

// Write one JSON file per top-level key, using slugify for filename
await mkdir(DATA_DIR, { recursive: true });
for (const [key, content] of Object.entries(extracted)) {
	const filename = `${slugify(key)}.json`;
	const path = `${DATA_DIR}/${filename}`;
	await writeFile(path, JSON.stringify(content, null, 2), 'utf8');
	console.log(`Wrote ${path}`);
}

await browser.close();
console.log('Done.');
