---
name: html-storyslides
description: 把一個主題或使用者的看法做成單一 HTML 檔的簡報（瀏覽器直接開、鍵盤翻頁、可列印成 PDF），以「問題 → 背景 → 論點與證據 → 反方與回應 → 結論」的說故事結構呈現，最後一頁列出參考資料。當使用者說「做成簡報」「做一份 HTML 簡報」「我想說明 / 發表看法」「用這份資料做簡報」時使用。若有 research-sources 產出的 output/<主題>/research.md，優先使用其中的資料與編號。
---

# html-storyslides：用 HTML 簡報說明一個主題、表達觀點

## 流程

### 1. 收集素材
依序找：
1. `output/<主題>/research.md`（由 `research-sources` 產生）→ 直接使用其中的資料與 [編號]。
2. 沒有資料、而主題需要事實佐證時 → 先執行 `research-sources` 的流程再回來。
3. 使用者的看法：從對話中取得。沒有明確立場時，做成「中立說明型」簡報（把「我的看法」頁改成「重點整理」）。

### 2. 規劃故事線（先在腦中排好，不必問使用者）
預設 8–12 頁：

| # | 頁面 | 內容 |
|---|------|------|
| 1 | 封面 | 標題（一句話主張，不是只有名詞）、副標、作者 / 日期 |
| 2 | 為什麼要談這件事 | 一個問題、一個驚人數據或一個情境開場 |
| 3 | 背景 | 必要的前提知識，3 點以內 |
| 4–6 | 論點 1–3 | 每頁一個論點：大字主張 + 證據（數據 / 引用）+ 來源編號 |
| 7 | 另一種看法 | 公平陳述反方最強的論點 |
| 8 | 我的回應 | 針對反方逐點回應 |
| 9 | 我的結論 | 一句話結論 + 希望觀眾帶走 / 採取的行動 |
| 10 | 參考資料 | 編號、標題、來源、連結（可點） |

可依主題增減，但**一頁只講一件事**。

### 3. 寫作規則
- 每頁標題就是該頁的結論句（例：「遠距工作讓通勤時間省下 1 小時」而不是「通勤時間」）。
- 內文每頁最多 3–4 個重點、每點不超過 2 行；細節放進講者備註。
- 有數據就用 `.big-number` 做成大數字；有對比就用 `.compare` 兩欄。
- 所有事實後面加 `<sup class="cite">[n]</sup>`，對應參考資料頁的編號。
- 不捏造數據或來源；沒有出處的說法要寫成「我認為」。
- 預設繁體中文。

### 4. 產生檔案
1. 複製 `assets/template.html`（與本 SKILL.md 同目錄）作為基底，**保留其 CSS 與 JS**，只替換 `<main id="deck">` 內的 `<section class="slide">`，並改 `<title>`、`<meta name="description">`（一句話簡介）與 `<meta name="date">`（今天日期）——首頁目錄會讀這三個欄位。
2. 輸出到 `output/<主題>/slides.html`，與 research.md 放在同一個主題資料夾（目錄不存在就建立）。`<主題>` 用簡短的英文 kebab-case（會成為網址），與 research-sources 用的資料夾名稱一致。
3. 範本右下角有「目錄」與「參考資料」連結；該主題沒有 research.md 時，刪掉「參考資料」那個連結。
4. 每頁可加講者備註：`<aside class="notes">...</aside>`（按 `N` 顯示 / 隱藏）。

範本提供的版型 class：
- `slide cover`：封面
- `slide section`：章節過場（大字置中）
- `slide`：一般內容頁
- `.big-number` + `.big-label`：大數字
- `.compare` 內放兩個 `.col`：正反 / 前後對照
- `blockquote` + `<cite>`：引用
- `.refs`（`<ol>`）：參考資料清單

### 5. 檢查
- 用 Bash 確認檔案存在、`<section class="slide"` 數量符合預期。
- 確認每個 `[n]` 都能在參考資料頁找到。
- 告訴使用者：檔案位置、頁數、操作方式（← → / 空白鍵翻頁、`F` 全螢幕、`N` 備註、`Ctrl+P` 存成 PDF），並用 2–3 句說明故事線。

### 6. 發布（使用者同意後才做）
`output/` 會透過 `.github/workflows/pages.yml` 自動發布到 GitHub Pages，部署時 `scripts/build-site.mjs` 會自動產生首頁目錄 `output/index.html`，並把每個 `research.md` 轉成閱讀版的 `research.html`（兩者都不進 git）。本機預覽：`npm install`（第一次）→ `npm run build` → 開 `output/index.html`。

詢問使用者是否要發布；同意後：
1. `git add output/<主題>` 並 commit（訊息如 `新增簡報：<標題>`）。
2. `git push` 到 `main`，Actions 會自動部署。
3. 告訴使用者網址：`https://<GitHub 帳號>.github.io/<repo 名稱>/<主題>/slides.html`（帳號與 repo 名稱從 `git remote get-url origin` 取得）。
