// 把每份簡報匯出成可下載的檔案（首頁簡報總覽的「PDF」「PPT」連結會指向它們）：
//   output/<主題>/slides.html → slides.pdf（文字可搜尋、公式為向量）
//                              → slides.pptx（每頁一張投影片截圖，附講者備註）
// 用法：npx playwright install chromium（第一次）→ npm run export
//       只匯出部分簡報：npm run export -- <主題資料夾> ...
import { readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import PptxGenJS from 'pptxgenjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'output');
const W = 1600;
const H = 900;

const only = process.argv.slice(2);
const dirs = readdirSync(root).filter(
  (d) => existsSync(join(root, d, 'slides.html')) && (!only.length || only.includes(d)),
);

const browser = await chromium.launch();
// 一律用淺色主題匯出，比較適合列印與投影
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1.5,
  colorScheme: 'light',
});

for (const dir of dirs) {
  const page = await context.newPage();
  await page.goto(pathToFileURL(join(root, dir, 'slides.html')).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500); // KaTeX 在 load 事件後排版

  // ---- PDF：套用簡報的 @media print，一頁一張投影片 ----
  await page.pdf({
    path: join(root, dir, 'slides.pdf'),
    width: `${W}px`,
    height: `${H}px`,
    printBackground: true,
  });

  // ---- PPTX：逐頁截圖 ----
  await page.addStyleTag({
    content:
      '* { transition: none !important } #hud, #progress, .edge-nav { display: none !important }',
  });
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = await page.title();

  const count = await page.locator('.slide').count();
  for (let k = 0; k < count; k++) {
    const { notes, heading } = await page.evaluate((k) => {
      const slides = [...document.querySelectorAll('.slide')];
      slides.forEach((s, j) => s.classList.toggle('active', j === k));
      slides[k].scrollTop = 0;
      const heading = slides[k].querySelector('h1, h2')?.textContent.trim() ?? '';
      const aside = slides[k].querySelector('.notes')?.cloneNode(true);
      if (!aside) return { notes: '', heading };
      // KaTeX 排版後的公式換回原本的 TeX，避免備註出現重複文字
      aside.querySelectorAll('.katex').forEach((m) => {
        m.replaceWith(m.querySelector('annotation')?.textContent ?? m.textContent);
      });
      return { notes: aside.textContent.replace(/\s+/g, ' ').trim(), heading };
    }, k);
    const png = await page.screenshot({ type: 'png' });
    const slide = pptx.addSlide();
    slide.addImage({
      data: `image/png;base64,${png.toString('base64')}`,
      x: 0,
      y: 0,
      w: 10,
      h: 5.625,
      altText: heading,
    });
    if (notes) slide.addNotes(notes);
  }
  await pptx.writeFile({ fileName: join(root, dir, 'slides.pptx') });
  await page.close();
  console.log(`${dir}: ${count} 頁 → slides.pdf、slides.pptx`);
}

await browser.close();
