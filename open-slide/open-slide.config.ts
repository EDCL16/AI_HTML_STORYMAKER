import type { OpenSlideConfig } from '@open-slide/core';

const openSlideConfig: OpenSlideConfig = {
  // 部署到 GitHub Pages 時由 workflow 設定（例：/AI_HTML_STORYMAKER/open-slide/），本機開發維持 /
  base: process.env.OPEN_SLIDE_BASE ?? '/',
};

export default openSlideConfig;
