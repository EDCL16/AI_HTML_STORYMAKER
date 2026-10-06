// 掃描 output/<主題>/slides.html，產生簡報目錄首頁 output/index.html
// 用法：node scripts/build-index.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'output');

const escape = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const meta = (html, name) =>
  html.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i'))?.[1] ?? '';

const decks = readdirSync(root)
  .filter(dir => existsSync(join(root, dir, 'slides.html')))
  .map(dir => {
    const file = join(root, dir, 'slides.html');
    const html = readFileSync(file, 'utf8');
    return {
      dir,
      title: html.match(/<title>([^<]*)<\/title>/i)?.[1].trim() || dir,
      description: meta(html, 'description'),
      date: meta(html, 'date') || statSync(file).mtime.toISOString().slice(0, 10),
      hasResearch: existsSync(join(root, dir, 'research.md')),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

const cards = decks.map(d => `
    <li class="card">
      <a class="main" href="${encodeURI(d.dir)}/slides.html">
        <span class="date">${escape(d.date)}</span>
        <h2>${escape(d.title)}</h2>
        ${d.description ? `<p>${escape(d.description)}</p>` : ''}
      </a>
      ${d.hasResearch ? `<a class="refs" href="${encodeURI(d.dir)}/research.md">參考資料</a>` : ''}
    </li>`).join('');

const page = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>我的簡報</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  :root { --bg:#faf8f4; --fg:#1f1d1a; --muted:#6b665e; --accent:#c2410c; --card:#fff; --line:#e6e1d8; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --bg:#17161a; --fg:#f1eee8; --muted:#a39e94; --accent:#fb923c; --card:#211f24; --line:#34313a; }
  }
  :root[data-theme="dark"] { --bg:#17161a; --fg:#f1eee8; --muted:#a39e94; --accent:#fb923c; --card:#211f24; --line:#34313a; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--bg); color:var(--fg); font-family:"Noto Sans TC",system-ui,sans-serif; line-height:1.6; }
  main { max-width:880px; margin:0 auto; padding:64px 16px; }
  h1 { font-size:clamp(32px,6vw,52px); font-weight:900; }
  .sub { color:var(--muted); margin:.4em 0 2.5em; }
  ul { list-style:none; display:grid; gap:16px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:16px; position:relative; transition:border-color .2s; }
  .card:hover { border-color:var(--accent); }
  .main { display:block; padding:24px; color:inherit; text-decoration:none; }
  .date { font-size:14px; color:var(--muted); }
  h2 { font-size:22px; margin:.2em 0; }
  .card p { color:var(--muted); }
  .refs { position:absolute; top:24px; right:24px; font-size:14px; color:var(--accent); }
  .empty { color:var(--muted); }
</style>
</head>
<body>
<main>
  <h1>我的簡報</h1>
  <p class="sub">共 ${decks.length} 份</p>
  ${decks.length ? `<ul>${cards}\n  </ul>` : '<p class="empty">還沒有簡報。</p>'}
</main>
</body>
</html>
`;

writeFileSync(join(root, 'index.html'), page);
console.log(`已產生 output/index.html（${decks.length} 份簡報）`);
