# 參考資料：Fick's Law Algorithm（FLA，菲克定律演算法）

> 查詢日期：2026-10-06 ｜ 關鍵字：Fick's Law Algorithm Hashim 2023、FLA MATLAB code、mealpy FLA、improved Fick's law algorithm、Fick's Law Algorithm nonlinear model predictive control、metaheuristic metaphor criticism、Fick's laws of diffusion

## 重點整理

- FLA 是 2023 年發表於 _Knowledge-Based Systems_ 的物理型元啟發式演算法，靈感來自菲克第一定律：分子由高濃度往低濃度擴散 [1][6]。
- 族群被平分成兩個「區域」，用轉移函數 TF = sinh(t/T)^C1 決定目前處於哪個階段：擴散（探索）→ 平衡（過渡）→ 穩態（開發）[3][4]。
- 以 C1 = 0.5 推算（推論）：前約 74% 的迭代是擴散階段、約 14% 是平衡階段、最後約 12% 是穩態階段 [3]。
- 原作者在 20 個經典測試函數、30 個 CEC2017 函數與 5 個工程問題上，與 12 個演算法比較，宣稱收斂良好且探索／開發平衡 [1]。
- 後續研究與實作者指出：容易陷入局部最佳、高維度時精度下降、參數多、除以適應值可能溢位 [3][4]；更廣泛地，學界也批評「隱喻型」新演算法常只是既有方法換個名字 [7]。

- （我的實驗，非文獻）依 [3] 移植成 JS、N = 20、T = 60、各跑 20 次：最佳解在原點的 Sphere 誤差中位數約 10⁻²²，最佳解移到 (2.5, −1.5) 後約 1.7×10⁻³。推論是穩態更新可化簡為對最佳解做縮放，因此偏好原點；評估效能時應使用位移過的測試函數。

## 參考資料

### [1] Fick's Law Algorithm: A physical law-based algorithm for numerical optimization

- **來源**：Hashim, F. A., Mostafa, R. R., Hussien, A. G., Mirjalili, S., & Sallam, K. M.／_Knowledge-Based Systems_, 260, 110146（摘要取自坎培拉大學研究檔案頁）
- **連結**：https://doi.org/10.1016/j.knosys.2022.110146
- **日期**：2023-01-25
- **類型**：研究（原始論文）
- **立場**：中立陳述
- **摘要**：提出以菲克第一定律為基礎的物理型元啟發式演算法 FLA。以 20 個經典測試函數、30 個 CEC2017 函數及 5 個真實工程問題測試，並與 12 個演算法比較、使用 Wilcoxon 秩和檢定。結論是 FLA 結果具競爭力、收斂曲線良好，並在探索與開發之間取得平衡。
- **可引用句**："According to Fick's law of diffusion, molecules tend to diffuse from higher to lower concentration areas."

### [2] Fick's Law Algorithm (FLA) — MATLAB Central File Exchange

- **來源**：Abdelazim Hussien（原論文共同作者）／MathWorks
- **連結**：https://www.mathworks.com/matlabcentral/fileexchange/121033-fick-s-law-algorithm-fla
- **日期**：2022-11-22（v1.0.0）
- **類型**：官方（作者釋出的原始碼）
- **立場**：中立陳述
- **摘要**：原作者之一釋出的 MATLAB 實作（12.1 KB），可在任何 MATLAB 版本執行。頁面本身沒有演算法說明，是對照論文公式時的第一手程式碼來源。

### [3] mealpy — `mealpy/physics_based/FLA.py`（OriginalFLA）

- **來源**：Nguyen Van Thieu／mealpy（Python 元啟發式演算法函式庫，GitHub）
- **連結**：https://github.com/thieu1995/mealpy/blob/master/mealpy/physics_based/FLA.py
- **日期**：2023-03-14（檔案建立）
- **類型**：官方（開源實作，註明參照 [1][2]）
- **立場**：中立陳述
- **摘要**：完整的 Python 實作。預設參數 C1 = 0.5、C2 = 2、C3 = 0.1、C4 = 0.2、C5 = 2、D = 0.01；TF = sinh(t/T)^C1，TF < 0.9 為擴散、0.9 ≤ TF ≤ 1 為平衡、TF > 1 為穩態。每代以貪婪法選擇：新解較好才取代舊解。實作者在註解中指出：參數多且部分可能不必要、可能陷入局部最佳、除以適應值可能溢位。
- **可引用句**："Despite the complexity of the algorithms, they may not perform optimally and could potentially become trapped in local optima."

### [4] Multi-Strategy Boosted Fick's Law Algorithm for Engineering Optimization Problems and Parameter Estimation

- **來源**：Jialing Yan, Gang Hu, Jiulong Zhang／_Biomimetics_ 9(4):205（PMC 全文）
- **連結**：https://pmc.ncbi.nlm.nih.gov/articles/PMC11048509/
- **日期**：2024
- **類型**：研究
- **立場**：中立陳述（含對 FLA 的批評）
- **摘要**：詳細重述了原始 FLA 的公式（初始化、TF、三階段更新、NT12 轉移數量等）。作者指出 FLA 容易局部收斂，且面對高維、高複雜度問題時精度下降，因此加入差分變異、高斯局部變異、交織式綜合學習與海鷗更新四種策略，提出 FLAS。在 23 個測試函數、CEC2020、7 個工程問題與太陽能 PV 參數估計上驗證。
- **可引用句**："FLA suffers from local convergence as well as degradation of convergence accuracy when faced with high-dimensional, high-complexity problems."

### [5] Fick's Law Algorithm Based-Nonlinear Model Predictive Control of Twin Rotor MIMO System

- **來源**：ResearchGate（全文頁面拒絕存取，以下依搜尋摘要）
- **連結**：https://www.researchgate.net/publication/381292767_Fick's_Law_Algorithm_Based-Nonlinear_Model_Predictive_Control_of_Twin_Rotor_MIMO_System
- **日期**：未標示（約 2024）
- **類型**：研究（應用）
- **立場**：中立陳述
- **摘要**：把 FLA 用在雙旋翼 MIMO 系統的非線性模型預測控制（NMPC）上：以 FLA 離線尋找最佳的 NMPC 參數，包括權重矩陣、時間步長與預測時域，目標是最小化作者提出的「robust integral square error」懲罰函數。

### [6] Fick's laws of diffusion

- **來源**：Wikipedia
- **連結**：https://en.wikipedia.org/wiki/Fick%27s_laws_of_diffusion
- **日期**：未標示（持續更新）
- **類型**：參考資料
- **立場**：中立陳述
- **摘要**：Adolf Fick 於 1855 年提出。第一定律 J = −D·dφ/dx：通量由高濃度流向低濃度，大小與濃度梯度成正比；D 是擴散係數（m²/s）。第二定律 ∂φ/∂t = D·∂²φ/∂x² 描述濃度分布如何隨時間演變。
- **可引用句**："the flux goes from regions of high concentration to regions of low concentration, with a magnitude that is proportional to the concentration gradient"

### [7] Metaheuristics — the metaphor exposed

- **來源**：Kenneth Sörensen／_International Transactions in Operational Research_ 22(1)
- **連結**：https://www.cs.ubc.ca/~hutter/EARG.shtml/stack/2013_Sorensen_MetaheuristicsTheMetaphorExposed.pdf
- **日期**：2015
- **類型**：評論
- **立場**：反對（針對「隱喻型」新演算法這類研究整體，非專門針對 FLA）
- **摘要**：批評大量以昆蟲、水流、音樂家等隱喻包裝的「新」元啟發式演算法，認為許多只是既有方法換了術語（例如 Harmony Search 被證明是演化策略的特例），隱喻反而掩蓋了演算法的實際機制、妨礙科學檢驗。

### [8] A novel hybrid Fick's law algorithm–quasi oppositional-based learning algorithm for solving constrained mechanical design problems

- **來源**：Bursa Uludağ University 研究資料庫（AVESİS）
- **連結**：https://avesis.uludag.edu.tr/yayin/3f320eaa-f5ea-4c07-8b47-06f71c9dc763/a-novel-hybrid-ficks-law-algorithm-quasi-oppositional-based-learning-algorithm-for-solving-constrained-mechanical-design-problems
- **日期**：未標示
- **類型**：研究（改良）
- **立場**：中立陳述
- **摘要**：依題名與搜尋摘要：將 FLA 與準對立學習（quasi-oppositional based learning）結合，用來加強搜尋、平衡探索與開發，並應用在有約束的機械設計問題。全文未讀。

## 不同觀點

- **支持方主要論點**：FLA 在大量測試函數與工程問題上結果具競爭力、收斂好 [1]；已有控制、工程設計等應用 [5][8]，也有開源實作可直接使用 [2][3]。
- **反對方主要論點**：容易局部收斂、高維時精度下降 [4]；參數多、實作複雜、除以適應值可能溢位 [3]；隱喻型演算法的新穎性普遍受質疑 [7]。

## 資料缺口

- 原始論文 [1] 全文在付費牆後，公式細節以 [4] 的重述與 [3] 的實作為準。兩者有小差異：[4] 把 TF 寫成 sinh(t/T)/c1，[3] 的程式碼是 sinh(t/T)^C1。實作時建議以作者的 MATLAB 程式 [2] 最終確認。
- [3] 的穩態階段中，第一區與第二區的公式不完全對稱（第一區用該區最佳解、第二區用全域最佳解）。這是否與原 MATLAB 程式一致，需要對照 [2]。
- [5] 只取得搜尋摘要，作者與發表處未確認。
