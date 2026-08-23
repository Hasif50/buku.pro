import { chromium } from "playwright";

const browser = await chromium.launch();
for (const w of [390, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 } });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("http://127.0.0.1:4173/index.html");
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({
    hOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    navToggleVisible: getComputedStyle(document.getElementById("navToggle")).display !== "none",
    navLinksHidden: getComputedStyle(document.getElementById("navLinks")).display === "none",
    heroH1: (document.querySelector("h1")?.textContent || "").trim().slice(0, 40),
    constellation: !!document.querySelector(".constellation"),
    ledger: !!document.querySelector(".ledger"),
    ticker: !!document.querySelector(".ticker"),
  }));
  console.log(JSON.stringify({ width: w, ...r, errors }));
  await page.close();
}
await browser.close();
