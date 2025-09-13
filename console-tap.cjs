const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const url = process.argv[2] || 'http://localhost:5174';
  const logStream = fs.createWriteStream('browser.log', { flags: 'a' });
  const stamp = () => new Date().toISOString();
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', (msg) => {
    const line = `[${stamp()}] [${msg.type()}] ${msg.text()}`;
    console.log(line); 
    logStream.write(line + '\n');
  });
  
  page.on('pageerror', (err) => {
    const line = `[${stamp()}] [pageerror] ${err.message}`;
    console.error(line); 
    logStream.write(line + '\n');
  });
  
  page.on('requestfailed', (req) => {
    const failure = req.failure()?.errorText || 'unknown';
    const line = `[${stamp()}] [requestfailed] ${req.method()} ${req.url()} – ${failure}`;
    console.warn(line); 
    logStream.write(line + '\n');
  });
  
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  console.log(`[${stamp()}] Attached to ${url} → logging to browser.log`);
})();