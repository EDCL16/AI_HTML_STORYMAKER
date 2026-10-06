// 產生 GitHub Pages 網站內容：
//   output/<主題>/research.md → output/<主題>/research.html（閱讀版參考資料）
//   output/index.html（所有簡報的目錄）
// 用法：npm run build
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'output');

const escape = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const meta = (html, name) =>
  html.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i'))?.[1] ?? '';

// ---- 共用外觀：淺色 / 深色 + 切換按鈕（記住選擇） ----
const themeCss = `
  :root { --bg:#faf8f4; --fg:#1f1d1a; --muted:#6b665e; --accent:#c2410c; --accent-soft:#fde9dc;
          --card:#fff; --line:#e6e1d8; --pro:#15803d; --pro-soft:#dcfce7; --con:#b91c1c; --con-soft:#fee2e2; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --bg:#17161a; --fg:#ece8e1; --muted:#a39e94; --accent:#fb923c; --accent-soft:#3a2518;
      --card:#211f24; --line:#34313a; --pro:#4ade80; --pro-soft:#14301f; --con:#f87171; --con-soft:#3b1717; }
  }
  :root[data-theme="dark"] { --bg:#17161a; --fg:#ece8e1; --muted:#a39e94; --accent:#fb923c; --accent-soft:#3a2518;
    --card:#211f24; --line:#34313a; --pro:#4ade80; --pro-soft:#14301f; --con:#f87171; --con-soft:#3b1717; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--bg); color:var(--fg); font-family:"Noto Sans TC",system-ui,sans-serif; line-height:1.6;
         transition:background .2s,color .2s; }
  .topbar { position:sticky; top:0; z-index:10; display:flex; justify-content:space-between; align-items:center;
            gap:12px; padding:10px 16px; background:var(--bg); border-bottom:1px solid var(--line); font-size:15px; }
  .topbar a { color:var(--accent); text-decoration:none; }
  #theme { background:var(--card); color:var(--fg); border:1px solid var(--line); border-radius:999px;
           padding:6px 14px; cursor:pointer; font:inherit; font-size:14px; }
  #theme:hover { border-color:var(--accent); }`;

const themeScript = `
<script>
(() => {
  const root = document.documentElement, btn = document.getElementById('theme');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const label = () => { btn.textContent = isDark() ? '☀ 白天' : '☾ 夜晚'; };
  btn.onclick = () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
    label();
  };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', label);
  label();
})();
</script>`;

const page = ({ title, description = '', css, body, back }) => `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
${description ? `<meta name="description" content="${escape(description)}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>${themeCss}${css}</style>
<script>try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch {}</script>
</head>
<body>
<nav class="topbar">
  <span>${back ?? ''}</span>
  <button id="theme" type="button">☾ 夜晚</button>
</nav>
${body}
${themeScript}
</body>
</html>
`;

// ---- research.md → research.html ----
const researchCss = `
  article { max-width:72ch; margin:0 auto; padding:40px 16px 96px; font-size:18px; line-height:1.85; }
  article h1 { font-size:clamp(28px,5vw,40px); font-weight:900; line-height:1.3; margin-bottom:.4em; }
  article h2 { font-size:24px; margin:2.2em 0 .8em; padding-bottom:.3em; border-bottom:2px solid var(--line); }
  article h3 { font-size:20px; line-height:1.5; margin:0 0 .6em; }
  article p, article ul, article ol { margin:0 0 1em; }
  article ul, article ol { padding-left:1.4em; }
  article li { margin:.3em 0; }
  article li::marker { color:var(--accent); }
  article a { color:var(--accent); text-underline-offset:3px; overflow-wrap:anywhere; }
  article strong { font-weight:700; }
  article blockquote { color:var(--muted); border-left:4px solid var(--line); padding:.2em 0 .2em 1em; margin:0 0 1.5em; font-size:16px; }
  article code { font-size:.9em; background:var(--card); border:1px solid var(--line); border-radius:4px; padding:0 .3em; }
  article hr { border:none; border-top:1px solid var(--line); margin:2em 0; }
  .source { background:var(--card); border:1px solid var(--line); border-radius:14px;
            padding:20px 22px 6px; margin:0 0 20px; scroll-margin-top:72px; }
  .source:target { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
  .source ul { list-style:none; padding:0; font-size:16px; }
  .source li strong { color:var(--muted); font-weight:500; margin-right:.2em; }
  .num { display:inline-block; min-width:2em; padding:0 .4em; margin-right:.4em; border-radius:6px; text-align:center;
         background:var(--accent-soft); color:var(--accent); font-size:.85em; }
  a.cite { text-decoration:none; font-size:.8em; font-weight:700; vertical-align:super; line-height:0; }
  .badge { display:inline-block; padding:0 .6em; border-radius:999px; font-size:14px; font-weight:700;
           background:var(--line); color:var(--fg); }
  .badge.pro { background:var(--pro-soft); color:var(--pro); }
  .badge.con { background:var(--con-soft); color:var(--con); }
  @media print { .topbar { display:none; } .source { break-inside:avoid; } }`;

function renderResearch(md) {
  let html = marked.parse(md);

  // 每一筆來源：<h3>[n] 標題</h3> + 後面的清單 → 卡片，並加上可連結的 id
  html = html.replace(
    /<h3>\[(\d+)\]\s*([\s\S]*?)<\/h3>\s*(<ul>[\s\S]*?<\/ul>)?/g,
    (_, n, title, list = '') =>
      `<section class="source" id="ref-${n}"><h3><span class="num">${n}</span>${title}</h3>${list}</section>`
  );

  // 內文中的 [n] → 跳到對應來源的連結（不動標籤內的文字）
  html = html.replace(/(<[^>]+>)|\[(\d+)\]/g, (m, tag, n) => tag ?? `<a class="cite" href="#ref-${n}">[${n}]</a>`);

  // 立場標籤
  html = html.replace(/(<strong>立場<\/strong>：)\s*(支持|反對|中立[^<]*)/g, (_, label, s) =>
    `${label}<span class="badge ${s === '支持' ? 'pro' : s === '反對' ? 'con' : ''}">${s}</span>`);

  // 外部連結開新分頁
  html = html.replace(/<a href="(https?:)/g, '<a target="_blank" rel="noopener" href="$1');
  return html;
}

const dirs = readdirSync(root).filter(d => statSync(join(root, d)).isDirectory());

for (const dir of dirs) {
  const mdFile = join(root, dir, 'research.md');
  if (!existsSync(mdFile)) continue;
  const md = readFileSync(mdFile, 'utf8');
  const title = md.match(/^#\s+(.+)$/m)?.[1].trim() || `參考資料：${dir}`;
  const hasSlides = existsSync(join(root, dir, 'slides.html'));
  writeFileSync(join(root, dir, 'research.html'), page({
    title,
    css: researchCss,
    back: `<a href="../">← 所有簡報</a>${hasSlides ? ` ・ <a href="slides.html">看簡報</a>` : ''}`,
    body: `<article>${renderResearch(md)}</article>`,
  }));
  console.log(`已產生 output/${dir}/research.html`);
}

// ---- 首頁目錄 ----
const decks = dirs
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

const indexCss = `
  main { max-width:880px; margin:0 auto; padding:48px 16px 96px; }
  h1 { font-size:clamp(32px,6vw,52px); font-weight:900; }
  .sub { color:var(--muted); margin:.4em 0 2.5em; }
  ul { list-style:none; display:grid; gap:16px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:16px; transition:border-color .2s; }
  .card:hover { border-color:var(--accent); }
  .main { display:block; padding:24px 24px 12px; color:inherit; text-decoration:none; }
  .date { font-size:14px; color:var(--muted); }
  h2 { font-size:22px; margin:.2em 0; }
  .card p { color:var(--muted); }
  .links { display:flex; gap:16px; padding:0 24px 20px; font-size:15px; }
  .links a { color:var(--accent); }
  .empty { color:var(--muted); }`;

const cards = decks.map(d => `
    <li class="card">
      <a class="main" href="${encodeURI(d.dir)}/slides.html">
        <span class="date">${escape(d.date)}</span>
        <h2>${escape(d.title)}</h2>
        ${d.description ? `<p>${escape(d.description)}</p>` : ''}
      </a>
      <div class="links">
        <a href="${encodeURI(d.dir)}/slides.html">看簡報</a>
        ${d.hasResearch ? `<a href="${encodeURI(d.dir)}/research.html">參考資料</a>` : ''}
      </div>
    </li>`).join('');

writeFileSync(join(root, 'index.html'), page({
  title: '我的簡報',
  css: indexCss,
  body: `<main>
  <h1>我的簡報</h1>
  <p class="sub">共 ${decks.length} 份</p>
  ${decks.length ? `<ul>${cards}\n  </ul>` : '<p class="empty">還沒有簡報。</p>'}
</main>`,
}));
console.log(`已產生 output/index.html（${decks.length} 份簡報）`);
