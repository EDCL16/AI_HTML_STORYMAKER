# 參考資料：Reciprocal Latent Fields（RLF）

> 查詢日期：2026-10-19 ｜ 主要來源：原論文全文（arXiv:2602.06937v2）；其餘為論文引用的原始文獻
> 延伸清單：[`../dsp-game-papers/research.md`](../dsp-game-papers/research.md)（15 篇 2024 年後 DSP 論文）

## 重點整理

- 遊戲界的 wave coding 先離線做波動模擬，再把每條脈衝響應壓成幾個聲學參數；但資料量和「音源數 × 聽者數」成正比，WAL 地圖需要 182 GB [1][2]
- RLF 改成每個 3D 位置只存一個 16 維潛在向量，用對稱的距離函數解碼，保證聲學互易性；WAL 只需 14 MB [1]
- 參數萃取是標準 DSP：FDTD 模擬、時間窗能量、Schroeder 反向積分求衰減時間；渲染用增益、卷積殘響與 VBAP [1][3][4][5]
- 28 位遊戲音訊從業者的聽測中，RLF（61.8 分）與原始模擬（62.6 分）沒有顯著差異（p = 0.41）[1]

## 參考資料

| # | 標題 | 來源 | 日期 | 類型 | 立場 | 摘要 |
|---|---|---|---|---|---|---|
| 1 | [Reciprocal Latent Fields for Precomputed Sound Propagation](https://arxiv.org/abs/2602.06937) | Seuté（Ubisoft La Forge）、Vasudev、Richan、Buffoni（Audiokinetic）；SIGGRAPH Conference Papers 2026，DOI 10.1145/3799902.3811214 | 2026-02-06（v2：2026-06-19） | 研究 | 中立陳述 | 用可訓練的 3D 潛在向量網格加對稱解碼器（歐氏、黎曼度量、MLP）預測路徑距離、音量與衰減時間。WAL 地圖記憶體從 182 GB 降到 14 MB；G_DIAG 模型單執行緒查 100 組約 46 μs；聽測與真值無顯著差異。限制：只支援靜態場景、未做空間壓縮 |
| 2 | [Parametric Wave Field Coding for Precomputed Sound Propagation](https://doi.org/10.1145/2601097.2601184) | Nikunj Raghuvanshi、John Snyder；ACM TOG 33(4) | 2014-07 | 研究 | 中立陳述 | wave coding 原始論文：離線波動模擬後，把脈衝響應編碼成直達聲音量、反射能量、衰減時間、方向等參數，執行時用參數驅動濾波器。RLF 沿用其參數定義並改良儲存方式 |
| 3 | [New Method of Measuring Reverberation Time](https://doi.org/10.1121/1.1909343) | M. R. Schroeder；JASA 37(3) | 1965-03 | 研究 | 中立陳述 | 提出把脈衝響應平方後從尾端反向積分，得到平滑的能量衰減曲線，用來量測殘響時間。RLF 用它求早期 / 晚期衰減時間 |
| 4 | Virtual Sound Source Positioning Using Vector Base Amplitude Panning | Ville Pulkki；JAES 45(6), 456–466 | 1997 | 研究 | 中立陳述 | VBAP：用相鄰喇叭方向向量的線性組合求增益，把聲音定位到任意方向。RLF 用它依到達方向擺放直達聲 |
| 5 | [PFFDTD Software](https://github.com/bsxfun/pffdtd) | Brian Hamilton | 2021 | 開源軟體 | 中立陳述 | Pretty Fast FDTD 聲學波動模擬器，RLF 用它產生訓練資料（f_max = 500 Hz、每波長 5 點、Courant 數 1/√3） |
| 6 | [Riemannian metric learning: Closer to you than you imagine](https://arxiv.org/abs/2503.05321) | Samuel Gruffaz、Josua Sassen | 2025 | 研究（綜述） | 中立陳述 | 黎曼度量學習綜述；RLF 用其「在潛在空間學一個隨位置變化的度量張量」的想法，並引用其偽度量性質 |
| 7 | [Introducing The Wwise Audio Lab (WAL)](https://www.audiokinetic.com/en/learning/videos/twnpk0nrcs4/) | Simon Ashby（Audiokinetic） | 2018 | 官方 | 中立陳述 | Audiokinetic 的示範遊戲地圖，RLF 的第二個測試場景（208 × 10 × 185 m） |

## 補充說明

- **[1] 圖片**：簡報中的圖 1–7 擷取自原論文 PDF，授權為 CC BY-NC-ND 4.0，僅做裁切、未修改內容。
- **[1] 14 MB 的由來（我的推導）**：WAL 網格 173 × 8 × 154 = 213,136 格，每格 16 維 float32，213,136 × 16 × 4 B ≈ 13.6 MB，與論文的 14 MB 相符；Audio Gym 59 × 8 × 59 × 16 × 4 B ≈ 1.8 MB 也相符。
- **[1] 文字不一致**：晚期殘響音量 L_LR 的描述（讓 ER 視窗最後 25 ms 與 LR 視窗前 25 ms 能量相等，但 LR 視窗寫成 [t_DS + 415 ms, t_DS + 1015 ms]）兩個視窗並不相鄰，簡報照原文呈現並標註。

## 不同觀點

- **支持**：記憶體降 3–4 個數量級、推論只要數十微秒、聽感與真值相同 [1]
- **保留**：wave coding 本身也能靠差分壓縮大幅縮小，論文比較的是未壓縮大小 [1][2]；只支援靜態幾何，門開關或破壞場景還無法處理 [1]

## 資料缺口

- 論文沒有公開程式碼；Wwise / Godot 內的整合細節未說明
- 模擬只到 500 Hz，高頻部分如何由參數推估，論文沒有討論
