import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto("file:///workspace/.grok/og-card.html", { waitUntil: "load" });
const info = await page.evaluate(async () => {
  await document.fonts.ready;
  const main = document.getElementById("main");
  const rect = main.getBoundingClientRect();
  const faces = [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`);
  return {
    faces,
    mainWidth: Math.round(rect.width),
    mainHeight: Math.round(rect.height),
    mainLeft: Math.round(rect.left),
    mainTop: Math.round(rect.top),
  };
});
console.log(JSON.stringify(info, null, 2));
await page.screenshot({
  path: "/workspace/.grok/og-raw.png",
  type: "png",
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});

const icon = await browser.newPage({
  viewport: { width: 128, height: 128 },
  deviceScaleFactor: 2,
});
await icon.setContent(
  `<!doctype html><html><body style="margin:0;background:#fff">
   <img src="file:///workspace/public/favicon.svg" width="128" height="128"/>
   </body></html>`,
  { waitUntil: "load" },
);
await icon.screenshot({ path: "/workspace/.grok/favicon-128.png", type: "png" });

const tiny = await browser.newPage({
  viewport: { width: 32, height: 32 },
  deviceScaleFactor: 4,
});
await tiny.setContent(
  `<!doctype html><html><body style="margin:0;background:#ccc">
   <img src="file:///workspace/public/favicon.svg" width="32" height="32"/>
   </body></html>`,
  { waitUntil: "load" },
);
await tiny.screenshot({ path: "/workspace/.grok/favicon-32.png", type: "png" });

await browser.close();
