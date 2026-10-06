// 產生 GitHub Pages 網站內容：
//   output/<主題>/research.md → output/<主題>/research.html（閱讀版參考資料）
//   output/index.html（所有簡報的目錄）
// 用法：npm run build
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'output');

const escape = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
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
  // 其他頁面（例如首頁或預覽中的簡報）切換主題時同步
  addEventListener('storage', (e) => { if (e.key === 'theme' && e.newValue) { root.dataset.theme = e.newValue; label(); } });
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
      `<section class="source" id="ref-${n}"><h3><span class="num">${n}</span>${title}</h3>${list}</section>`,
  );

  // 內文中的 [n] → 跳到對應來源的連結（不動標籤內的文字）
  html = html.replace(
    /(<[^>]+>)|\[(\d+)\]/g,
    (m, tag, n) => tag ?? `<a class="cite" href="#ref-${n}">[${n}]</a>`,
  );

  // 立場標籤
  html = html.replace(
    /(<strong>立場<\/strong>：)\s*(支持|反對|中立[^<]*)/g,
    (_, label, s) =>
      `${label}<span class="badge ${s === '支持' ? 'pro' : s === '反對' ? 'con' : ''}">${s}</span>`,
  );

  // 外部連結開新分頁
  html = html.replace(/<a href="(https?:)/g, '<a target="_blank" rel="noopener" href="$1');
  return html;
}

const dirs = readdirSync(root).filter((d) => statSync(join(root, d)).isDirectory());

for (const dir of dirs) {
  const mdFile = join(root, dir, 'research.md');
  if (!existsSync(mdFile)) continue;
  const md = readFileSync(mdFile, 'utf8');
  const title = md.match(/^#\s+(.+)$/m)?.[1].trim() || `參考資料：${dir}`;
  const hasSlides = existsSync(join(root, dir, 'slides.html'));
  writeFileSync(
    join(root, dir, 'research.html'),
    page({
      title,
      css: researchCss,
      back: `<a href="../" target="_top">← 所有簡報</a>${hasSlides ? ` ・ <a href="slides.html">看簡報</a>` : ''}`,
      body: `<article>${renderResearch(md)}</article>`,
    }),
  );
  console.log(`已產生 output/${dir}/research.html`);
}

// ---- 首頁：左側分類清單 + 右側簡報預覽 ----
const UNCATEGORIZED = '未分類';
const decks = dirs
  .filter((dir) => existsSync(join(root, dir, 'slides.html')))
  .map((dir) => {
    const file = join(root, dir, 'slides.html');
    const html = readFileSync(file, 'utf8');
    return {
      dir,
      title: html.match(/<title>([^<]*)<\/title>/i)?.[1].trim() || dir,
      description: meta(html, 'description'),
      category: meta(html, 'category') || UNCATEGORIZED,
      date: meta(html, 'date') || statSync(file).mtime.toISOString().slice(0, 10),
      slides: (html.match(/<section class="slide/g) || []).length,
      hasResearch: existsSync(join(root, dir, 'research.md')),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

const indexCss = `
  body { height:100vh; display:flex; flex-direction:column; overflow:hidden; }
  .brand { font-weight:900; font-size:17px; color:var(--fg); }
  .layout { flex:1; min-height:0; display:grid; grid-template-columns:minmax(280px, 340px) 1fr; }
  .sidebar { border-right:1px solid var(--line); display:flex; flex-direction:column; min-height:0; }
  .tools { padding:16px 16px 8px; display:grid; gap:12px; }
  #search { width:100%; font:inherit; font-size:15px; padding:8px 12px; border-radius:8px;
            border:1px solid var(--line); background:var(--card); color:var(--fg); }
  #search:focus-visible, .chip:focus-visible, .item:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
  .chips { display:flex; flex-wrap:wrap; gap:6px; }
  .chip { font:inherit; font-size:14px; padding:3px 12px; border-radius:999px; cursor:pointer;
          border:1px solid var(--line); background:var(--card); color:var(--fg); }
  .chip[aria-pressed="true"] { background:var(--accent); border-color:var(--accent); color:var(--bg); }
  .chip .n { opacity:.7; margin-left:.3em; }
  .list { flex:1; overflow-y:auto; padding:0 8px 24px; }
  .group { font-size:13px; font-weight:700; color:var(--muted); padding:14px 8px 6px; }
  .item { display:block; width:100%; text-align:left; font:inherit; color:inherit; cursor:pointer;
          background:none; border:1px solid transparent; border-radius:10px; padding:10px 12px; margin-bottom:4px; }
  .item:hover { background:var(--card); border-color:var(--line); }
  .item[aria-current="true"] { background:var(--card); border-color:var(--accent); }
  .item .t { font-weight:700; line-height:1.4; }
  .item .m { font-size:13px; color:var(--muted); }
  .item .d { font-size:14px; color:var(--muted); display:-webkit-box; -webkit-line-clamp:2;
             -webkit-box-orient:vertical; overflow:hidden; }
  .empty { color:var(--muted); padding:16px 8px; }
  .viewer { display:flex; flex-direction:column; min-width:0; min-height:0; }
  .viewer-head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px;
                 padding:14px 20px; border-bottom:1px solid var(--line); }
  .viewer-head h1 { font-size:20px; line-height:1.4; }
  .viewer-head p { font-size:14px; color:var(--muted); }
  .actions { display:flex; gap:8px; flex-shrink:0; }
  .actions a { font-size:14px; padding:6px 12px; border-radius:8px; border:1px solid var(--line);
               background:var(--card); color:var(--fg); text-decoration:none; white-space:nowrap; }
  .actions a:hover { border-color:var(--accent); }
  .frame-wrap { flex:1; min-height:0; padding:16px 20px 20px; }
  #frame { width:100%; height:100%; border:1px solid var(--line); border-radius:12px; background:var(--bg); }
  .placeholder { margin:auto; color:var(--muted); }
  #viewer-body { display:contents; }
  #viewer-body[hidden], .actions a[hidden] { display:none; }
  @media (max-width: 860px) {
    body { height:auto; overflow:auto; }
    .layout { display:block; }
    .sidebar { border-right:none; }
    .list { overflow:visible; }
    .viewer { display:none; }
  }`;

const json = JSON.stringify(decks).replace(/</g, '\\u003c');
const indexScript = `
<script>
(() => {
  const decks = ${json};
  const ALL = '全部';
  const $ = (id) => document.getElementById(id);
  const mobile = matchMedia('(max-width: 860px)');
  const frame = $('frame');
  let cat = ALL, current = null;

  const categories = [...new Set(decks.map((d) => d.category))].sort((a, b) =>
    a === '${UNCATEGORIZED}' ? 1 : b === '${UNCATEGORIZED}' ? -1 : a.localeCompare(b, 'zh-Hant'));
  const query = () => $('search').value.trim().toLowerCase();
  const matches = (d, q) => !q || [d.title, d.description, d.category].join(' ').toLowerCase().includes(q);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function renderChips() {
    const q = query();
    const count = (c) => decks.filter((d) => (c === ALL || d.category === c) && matches(d, q)).length;
    $('chips').innerHTML = [ALL, ...categories]
      .map((c) => \`<button type="button" class="chip" data-cat="\${esc(c)}" aria-pressed="\${c === cat}">\${esc(c)}<span class="n">\${count(c)}</span></button>\`)
      .join('');
  }

  function renderList() {
    const q = query();
    const shown = decks.filter((d) => (cat === ALL || d.category === cat) && matches(d, q));
    if (!shown.length) {
      $('list').innerHTML = \`<p class="empty">\${q ? \`沒有符合「\${esc(q)}」的簡報。\` : '這個分類還沒有簡報。'}</p>\`;
      return;
    }
    const groups = cat === ALL ? categories : [cat];
    $('list').innerHTML = groups
      .map((g) => {
        const items = shown.filter((d) => d.category === g);
        if (!items.length) return '';
        return (cat === ALL ? \`<div class="group">\${esc(g)}</div>\` : '') + items.map((d) => \`
          <button type="button" class="item" data-dir="\${esc(d.dir)}" aria-current="\${d.dir === current}">
            <div class="t">\${esc(d.title)}</div>
            <div class="m">\${esc(d.date)} ・ \${d.slides} 頁</div>
            \${d.description ? \`<div class="d">\${esc(d.description)}</div>\` : ''}
          </button>\`).join('');
      })
      .join('');
  }

  function saveHash() {
    const p = new URLSearchParams();
    if (current) p.set('deck', current);
    if (cat !== ALL) p.set('cat', cat);
    history.replaceState(null, '', p.toString() ? '#' + p : location.pathname);
  }

  function select(dir) {
    const d = decks.find((x) => x.dir === dir);
    if (!d) return;
    current = dir;
    const url = encodeURIComponent(dir) + '/slides.html';
    $('v-title').textContent = d.title;
    $('v-desc').textContent = [d.category, d.date, d.description].filter(Boolean).join(' ・ ');
    $('v-open').href = url;
    $('v-refs').hidden = !d.hasResearch;
    $('v-refs').href = encodeURIComponent(dir) + '/research.html';
    $('viewer-body').hidden = false;
    $('placeholder').hidden = true;
    if (frame.getAttribute('src') !== url) frame.src = url;
    document.querySelectorAll('.item').forEach((el) => el.setAttribute('aria-current', el.dataset.dir === dir));
    saveHash();
  }

  $('chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    cat = b.dataset.cat;
    renderChips();
    renderList();
    saveHash();
  });
  $('list').addEventListener('click', (e) => {
    const b = e.target.closest('.item');
    if (!b) return;
    if (mobile.matches) location.href = encodeURIComponent(b.dataset.dir) + '/slides.html';
    else select(b.dataset.dir);
  });
  $('search').addEventListener('input', () => {
    renderChips();
    renderList();
  });

  // 焦點在首頁時，← → 也能翻右側的簡報
  document.addEventListener('keydown', (e) => {
    if (e.target.closest?.('input, textarea, select')) return;
    if (!['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(e.key) || !frame.contentWindow) return;
    e.preventDefault();
    const w = frame.contentWindow;
    w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: e.key, bubbles: true }));
  });

  // 從網址還原：#deck=<資料夾>&cat=<分類>
  const p = new URLSearchParams(location.hash.slice(1));
  if (categories.includes(p.get('cat'))) cat = p.get('cat');
  renderChips();
  renderList();
  const first = decks.find((d) => cat === ALL || d.category === cat);
  const start = decks.some((d) => d.dir === p.get('deck')) ? p.get('deck') : first?.dir;
  if (start && !mobile.matches) select(start);
})();
</script>`;

writeFileSync(
  join(root, 'index.html'),
  page({
    title: '我的簡報',
    css: indexCss,
    back: `<span class="brand">我的簡報</span>`,
    body: `<div class="layout">
  <aside class="sidebar">
    <div class="tools">
      <input id="search" type="search" placeholder="搜尋標題、說明或分類" aria-label="搜尋簡報">
      <div class="chips" id="chips" role="group" aria-label="分類"></div>
    </div>
    <nav class="list" id="list" aria-label="簡報清單"></nav>
  </aside>
  <section class="viewer" aria-label="簡報預覽">
    <p class="placeholder" id="placeholder">${decks.length ? '從左側選一份簡報' : '還沒有簡報。'}</p>
    <div id="viewer-body" hidden>
      <header class="viewer-head">
        <div><h1 id="v-title"></h1><p id="v-desc"></p></div>
        <div class="actions">
          <a id="v-open" target="_blank" rel="noopener">開新分頁</a>
          <a id="v-refs" target="_blank" rel="noopener">參考資料</a>
        </div>
      </header>
      <div class="frame-wrap"><iframe id="frame" title="簡報預覽"></iframe></div>
    </div>
  </section>
</div>
${indexScript}`,
  }),
);
console.log(
  `已產生 output/index.html（${decks.length} 份簡報，${new Set(decks.map((d) => d.category)).size} 個分類）`,
);
