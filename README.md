# AI_HTML_STORYMAKER

用 Claude Code 查資料、做成 HTML 簡報，並發布到 GitHub Pages。

## Skills
- `research-sources`：上網查資料 → `output/<主題>/research.md`（標題、來源、連結、摘要、立場）
- `html-storyslides`：做成 HTML 簡報 → `output/<主題>/slides.html`

```
幫我查一下「遠距工作是否提升生產力」，我認為有提升
用這份資料做簡報
```

## 發布
push 到 `main` 後，GitHub Actions 會把 `output/` 發布到 GitHub Pages，並自動產生簡報目錄首頁。

本機預覽首頁：`node scripts/build-index.mjs`，再打開 `output/index.html`。
