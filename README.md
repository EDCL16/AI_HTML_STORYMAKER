# AI_HTML_STORYMAKER

用 Claude Code 查資料、做成 HTML 簡報，並發布到 GitHub Pages。

## Skills

- `research-sources`：上網查資料 → `output/<主題>/research.md`（標題、來源、連結、摘要、立場）
- `html-storyslides`：做成 HTML 簡報 → `output/<主題>/slides.html`
- `frontend-design`、`theme-factory`：前端設計指引與配色主題，取自 [anthropics/skills](https://github.com/anthropics/skills)（Apache 2.0，保持原樣）

```
幫我查一下「遠距工作是否提升生產力」，我認為有提升
用這份資料做簡報
```

## 發布

push 到 `main` 後，GitHub Actions 會執行 `npm run build`，然後把 `output/` 發布到 GitHub Pages：

- 產生簡報目錄首頁 `output/index.html`
- 把每個 `research.md` 轉成閱讀版 `research.html`（可切換白天 / 夜晚模式，引用編號可點擊跳到來源）

網址：https://edcl16.github.io/AI_HTML_STORYMAKER/

本機預覽：`npm install` → `npm run build` → 打開 `output/index.html`。

## 格式化

使用 [Prettier](https://prettier.io/) 格式化 HTML / CSS / JS / Markdown / YAML，設定見 `.prettierrc.json`、`.editorconfig`。

- `npm run format`：格式化整個專案
- `npm run format:check`：只檢查不修改
