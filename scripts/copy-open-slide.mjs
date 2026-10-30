// 把 open-slide 的建置結果（open-slide/dist）複製到 output/open-slide，跟著 GitHub Pages 一起發布。
// GitHub Pages 沒有「所有網址都回 index.html」的設定，所以替每份簡報的網址各放一份 index.html，
// 直接打開 /open-slide/s/<簡報>/ 或重新整理時才不會 404。
// 用法：在 open-slide/ 以 OPEN_SLIDE_BASE=/<repo>/open-slide/ npm run build 之後執行 npm run copy:open-slide
import { cpSync, mkdirSync, readdirSync, rmSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(repo, 'open-slide', 'dist');
const dest = join(repo, 'output', 'open-slide');
const slidesDir = join(repo, 'open-slide', 'slides');

if (!existsSync(join(dist, 'index.html'))) {
  console.error('找不到 open-slide/dist/index.html，請先在 open-slide/ 執行 npm run build');
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
cpSync(dist, dest, { recursive: true });

const ids = readdirSync(slidesDir).filter((d) => statSync(join(slidesDir, d)).isDirectory());
for (const id of ids) {
  for (const route of [
    ['s', id],
    ['s', id, 'presenter'],
  ]) {
    const dir = join(dest, ...route);
    mkdirSync(dir, { recursive: true });
    cpSync(join(dest, 'index.html'), join(dir, 'index.html'));
  }
}
console.log(`open-slide → output/open-slide（${ids.length} 份簡報：${ids.join('、')}）`);
