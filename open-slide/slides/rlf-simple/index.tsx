import { type DesignSystem, type Page, type SlideMeta, Step, Steps } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import fig1 from './assets/ref1-fig1.png';
import fig2 from './assets/ref1-fig2.png';
import { convFig, decayFig, distFig, levelFig } from './dsp-figs';

// 配色與 HTML 精簡版相同：灰綠底、青綠主色；DSP 用琥珀色，音源紅、聽者藍（與原論文圖一致）
export const design: DesignSystem = {
  palette: { bg: '#f3f5f4', text: '#13201e', accent: '#0e7c74' },
  fonts: {
    display: '"Noto Sans TC", "Microsoft JhengHei", "PingFang TC", system-ui, sans-serif',
    body: '"Noto Sans TC", "Microsoft JhengHei", "PingFang TC", system-ui, sans-serif',
  },
  typeScale: { hero: 110, body: 34 },
  radius: 16,
};

const c = {
  muted: '#5b6967',
  soft: '#dcefec',
  card: '#ffffff',
  line: '#d9e2e0',
  src: '#d6452f',
  rcv: '#2c55c9',
  dsp: '#b7791f',
  dspSoft: '#f6ead6',
};

const PAD_X = 140;

const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  boxSizing: 'border-box',
};

// ---------- 共用元件 ----------

const Cite = ({ n }: { n: string }) => (
  <sup style={{ fontSize: '0.55em', color: 'var(--osd-accent)', fontWeight: 700, marginLeft: 4 }}>
    {n}
  </sup>
);

// ch 是頁面所屬章節（只用來分組，不顯示）；tight：內容多的公式頁，標題上下留白縮小
const Frame = ({ title, tight, children }: { ch: number; title: string; tight?: boolean; children: ReactNode }) => (
  <div style={{ ...fill, padding: `${tight ? 80 : 110}px ${PAD_X}px ${tight ? 60 : 100}px` }}>
    <div style={{ width: 72, height: 8, borderRadius: 4, background: 'var(--osd-accent)', marginBottom: 20 }} />
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 64,
        fontWeight: 900,
        lineHeight: 1.2,
        margin: tight ? '0 0 22px' : '0 0 48px',
      }}
    >
      {title}
    </h2>
    {children}
  </div>
);

const SectionPage = ({ title }: { ch: number; title: string }) => (
  <div style={{ ...fill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-hero)',
        fontWeight: 900,
        color: 'var(--osd-accent)',
        margin: 0,
      }}
    >
      {title}
    </h1>
  </div>
);

const Callout = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      marginTop: 40,
      border: '3px solid var(--osd-accent)',
      background: c.soft,
      borderRadius: 'var(--osd-radius)',
      padding: '22px 36px',
      fontSize: 32,
      lineHeight: 1.5,
    }}
  >
    {children}
  </div>
);

type Kind = 'plain' | 'dsp' | 'ml';
const kindStyle = (k: Kind): CSSProperties =>
  k === 'dsp'
    ? { border: `3px solid ${c.dsp}`, background: c.dspSoft }
    : k === 'ml'
      ? { border: '3px solid var(--osd-accent)', background: c.soft }
      : { border: `2px solid ${c.line}`, background: c.card };

const Tag = ({ kind }: { kind: Kind }) => (
  <span
    style={{
      display: 'inline-block',
      fontSize: 24,
      fontWeight: 700,
      color: '#fff',
      background: kind === 'dsp' ? c.dsp : 'var(--osd-accent)',
      borderRadius: 999,
      padding: '2px 18px',
      marginBottom: 14,
    }}
  >
    {kind === 'dsp' ? 'DSP' : '機器學習'}
  </span>
);

const Card = ({
  title,
  children,
  kind = 'plain',
  tag = false,
  arrow = false,
  num,
}: {
  title: string;
  children: ReactNode;
  kind?: Kind;
  tag?: boolean;
  arrow?: boolean;
  num?: number;
}) => (
  <div
    style={{
      ...kindStyle(kind),
      position: 'relative',
      height: '100%',
      boxSizing: 'border-box',
      borderRadius: 'var(--osd-radius)',
      padding: '32px 32px',
    }}
  >
    {arrow && (
      <div style={{ position: 'absolute', left: -62, top: '50%', marginTop: -36, fontSize: 52, color: c.muted }}>
        →
      </div>
    )}
    {tag && <Tag kind={kind} />}
    {num !== undefined && (
      <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--osd-accent)', marginBottom: 6 }}>{num}</div>
    )}
    <div
      style={{
        fontSize: 40,
        fontWeight: 800,
        lineHeight: 1.3,
        color: kind === 'dsp' ? c.dsp : 'var(--osd-accent)',
        marginBottom: 14,
      }}
    >
      {title}
    </div>
    <div style={{ fontSize: 30, lineHeight: 1.5 }}>{children}</div>
  </div>
);

const Row3 = ({ children, gap = 32 }: { children: ReactNode; gap?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap }}>{children}</div>
);

const Bullets = ({ children, size = 34 }: { children: ReactNode; size?: number }) => (
  <ul style={{ fontSize: size, lineHeight: 1.5, margin: 0, paddingLeft: 44, display: 'grid', gap: 18, listStyleType: 'disc' }}>
    {children}
  </ul>
);

const TwoCol = ({ children, cols = '1fr 1fr' }: { children: ReactNode; cols?: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 64, alignItems: 'center' }}>{children}</div>
);

const Stat = ({ value, label, sub }: { value: string; label: string; sub: string }) => (
  <div
    style={{
      background: c.card,
      border: `2px solid ${c.line}`,
      borderRadius: 'var(--osd-radius)',
      padding: '40px 28px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: 110, fontWeight: 900, lineHeight: 1, color: 'var(--osd-accent)' }}>{value}</div>
    <div style={{ fontSize: 30, marginTop: 24 }}>{label}</div>
    <div style={{ fontSize: 26, marginTop: 10, color: c.muted }}>{sub}</div>
  </div>
);

const StepRow = ({ n, label, children }: { n: number; label: string; children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '64px 330px 1fr', alignItems: 'baseline', fontSize: 32, lineHeight: 1.5, padding: '10px 0' }}>
    <span style={{ fontWeight: 900, color: c.dsp }}>{n}</span>
    <span style={{ fontWeight: 800, color: c.dsp }}>{label}</span>
    <span>{children}</span>
  </div>
);

const Caption = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 24, color: c.muted, marginTop: 12, textAlign: 'center' }}>{children}</div>
);

// ---------- 公式（不加套件，用 HTML 排版） ----------

const mathFont = '"Cambria Math", "Times New Roman", "STIX Two Math", serif';

const FormulaBox = ({ children, note }: { children: ReactNode; note?: string }) => (
  <div
    style={{
      position: 'relative',
      background: c.card,
      border: `2px solid ${c.line}`,
      borderLeft: `8px solid ${c.dsp}`,
      borderRadius: 12,
      padding: '22px 40px',
      marginBottom: 36,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 80,
      fontFamily: mathFont,
      fontSize: 44,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
    {note && (
      <span style={{ position: 'absolute', right: 20, bottom: 10, fontFamily: 'var(--osd-font-body)', fontSize: 22, color: c.muted }}>
        {note}
      </span>
    )}
  </div>
);

const M = ({ children }: { children: ReactNode }) => (
  <span style={{ fontFamily: mathFont, fontStyle: 'italic' }}>{children}</span>
);

// 上下限疊在符號右側，例如積分與總和
const BigOp = ({ op, lo, hi }: { op: string; lo?: ReactNode; hi?: ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', margin: '0 6px' }}>
    <span style={{ fontSize: '1.6em', lineHeight: 1 }}>{op}</span>
    <span style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.5em', height: '2.6em', marginLeft: 2 }}>
      <span>{hi}</span>
      <span>{lo}</span>
    </span>
  </span>
);

const Frac = ({ top, bottom }: { top: ReactNode; bottom: ReactNode }) => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 6px' }}>
    <span style={{ padding: '0 8px', borderBottom: '2px solid currentColor' }}>{top}</span>
    <span style={{ padding: '0 8px' }}>{bottom}</span>
  </span>
);

const svgText: CSSProperties = { fill: 'var(--osd-text)', fontSize: 22, fontWeight: 700 };
const svgSmall: CSSProperties = { fill: 'var(--osd-text)', fontSize: 19, fontWeight: 500 };

// ---------- 頁面 ----------

const Cover: Page = () => (
  <div
    style={{
      ...fill,
      padding: `0 ${PAD_X}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: `radial-gradient(circle at 85% 72%, ${c.soft} 0 16%, transparent 16.2%), radial-gradient(circle at 85% 72%, transparent 0 24%, ${c.soft} 24.2% 25%, transparent 25.2%), radial-gradient(circle at 85% 72%, transparent 0 33%, ${c.soft} 33.2% 34%, transparent 34.2%), var(--osd-bg)`,
    }}
  >
    <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--osd-accent)', letterSpacing: '0.08em' }}>
      SIGGRAPH 2026 論文報告
    </div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-hero)',
        fontWeight: 900,
        lineHeight: 1.1,
        margin: '28px 0 16px',
      }}
    >
      Reciprocal Latent Fields
    </h1>
    <div style={{ fontSize: 34, fontWeight: 700, color: 'var(--osd-accent)', letterSpacing: '0.06em', marginBottom: 36 }}>RLF｜互易潛在場</div>
    <p style={{ fontSize: 46, margin: 0, color: c.muted }}>預先計算聲音傳播的資料壓縮</p>
    <p style={{ fontSize: 26, marginTop: 80, color: c.muted, lineHeight: 1.6 }}>
      Seuté、Vasudev、Richan、Buffoni（Ubisoft La Forge、Audiokinetic）
      <Cite n="[1]" />
      <br />
      報告日期 2026-10-30
    </p>
  </div>
);

const Topic: Page = () => (
  <Frame ch={0} title="研究主題">
    <Row3 gap={72}>
      <Steps>
        <Step>
          <Card title="真實的遊戲聲音">聲音會被牆擋住、繞過牆角、在房間裡迴盪</Card>
        </Step>
        <Step>
          <Card title="資料太大" arrow>
            舊方法 wave coding 先把聲音算好存起來，一張地圖要 182 GB
            <Cite n="[1]" />
          </Card>
        </Step>
        <Step>
          <Card title="RLF 的做法" kind="ml" arrow>
            同一張地圖只要 14 MB，聽起來分不出差別
            <Cite n="[1]" />
          </Card>
        </Step>
      </Steps>
    </Row3>
    <Callout>RLF 讓遊戲用很少的記憶體，就能播出照物理算出來的回音和遮擋效果</Callout>
  </Frame>
);

const Agenda: Page = () => (
  <Frame ch={0} title="報告架構">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }}>
      <Card num={1} title="基本觀念">聲音怎麼傳、脈衝響應、聲學參數</Card>
      <Card num={2} title="研究動機">舊方法為什麼存不下</Card>
      <Card num={3} title="DSP 的應用" kind="dsp">聲音變數字，數字變回聲音</Card>
      <Card num={4} title="RLF 方法" kind="ml">數字怎麼存得小</Card>
      <Card num={5} title="結果與意義">省多少、準不準、有什麼用</Card>
    </div>
    <div style={{ marginTop: 48 }}>
      <Bullets size={32}>
        <li>順序是先懂名詞、再看問題、最後看解法，每段都用到前一段</li>
        <li>第 3 段是 DSP，第 4 段是論文的新方法，兩者分開講</li>
        <li>每頁上方的進度列標示目前講到第幾段</li>
      </Bullets>
    </div>
  </Frame>
);

const S1: Page = () => <SectionPage ch={1} title="基本觀念" />;

const Paths: Page = () => (
  <Frame ch={1} title="聲音的傳播路徑">
    <TwoCol cols="1.1fr 1fr">
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }} role="img" aria-label="音源經直達、反射、繞射三條路徑到聽者">
        <rect x="10" y="10" width="580" height="320" rx="8" fill={c.card} stroke={c.line} strokeWidth="2" />
        <rect x="280" y="150" width="24" height="180" fill={c.muted} />
        <path d="M90 250 L500 250" fill="none" stroke={c.muted} strokeWidth="4" strokeDasharray="10 8" />
        <path d="M90 250 L300 22 L500 250" fill="none" stroke={c.rcv} strokeWidth="4" />
        <path d="M90 250 Q 292 110 304 150 Q 330 200 500 250" fill="none" stroke="var(--osd-accent)" strokeWidth="4" />
        <circle cx="90" cy="250" r="16" fill={c.src} />
        <circle cx="500" cy="250" r="16" fill={c.rcv} />
        <text x="58" y="300" style={svgText}>音源 a</text>
        <text x="466" y="300" style={svgText}>聽者 b</text>
        <text x="315" y="285" style={svgSmall}>① 直達（被牆擋）</text>
        <text x="310" y="60" style={svgSmall}>② 反射</text>
        <text x="320" y="135" style={svgSmall}>③ 繞射</text>
        <text x="250" y="320" style={svgSmall}>牆</text>
      </svg>
      <Bullets size={32}>
        <li>直達聲：走直線，被牆擋就變小</li>
        <li>反射：撞牆彈回來，晚一點到</li>
        <li>繞射：聲音會彎過牆角</li>
        <li>很多次反射疊起來就是殘響</li>
      </Bullets>
    </TwoCol>
    <Callout>遊戲要算出每條路帶來多少聲音、多晚到、從哪個方向來</Callout>
  </Frame>
);

// 脈衝響應示意圖：直達聲 1 根、早期反射 5 根、晚期殘響逐漸變小
const ER = [
  [90, 115],
  [112, 88],
  [128, 99],
  [151, 69],
  [168, 63],
];
const LR = Array.from({ length: 65 }, (_, k) => {
  const x = 185 + k * 6;
  const h = 40 * Math.exp(-k / 22) * (0.65 + 0.35 * Math.abs(Math.sin(k * 2.3)));
  return [x, h];
});

const IrChart = () => (
  <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }} role="img" aria-label="脈衝響應示意：直達聲、早期反射、晚期殘響">
    <line x1="50" y1="250" x2="570" y2="250" stroke="var(--osd-text)" strokeWidth="2" />
    <line x1="60" y1="250" x2="60" y2="40" stroke={c.src} strokeWidth="5" />
    {ER.map(([x, h]) => (
      <line key={x} x1={x} y1="250" x2={x} y2={250 - h} stroke="var(--osd-accent)" strokeWidth="4" />
    ))}
    {LR.map(([x, h]) => (
      <line key={x} x1={x} y1="250" x2={x} y2={250 - h} stroke={c.rcv} strokeWidth="2" />
    ))}
    <text x="50" y="28" style={svgSmall}>① 直達聲</text>
    <text x="110" y="125" style={svgSmall}>② 早期反射</text>
    <text x="290" y="190" style={svgSmall}>③ 晚期殘響（越來越小）</text>
    <text x="50" y="282" style={svgSmall}>0</text>
    <text x="500" y="282" style={svgSmall}>時間 →</text>
  </svg>
);

const Ir: Page = () => (
  <Frame ch={1} title="脈衝響應">
    <TwoCol cols="1.1fr 1fr">
      <IrChart />
      <Bullets size={32}>
        <li>在 a 拍一下手，b 錄到的整段聲音</li>
        <li>英文 Impulse Response，簡稱 IR</li>
        <li>可以想成這條路徑的聲音指紋</li>
        <li>換個位置，指紋就不同</li>
      </Bullets>
    </TwoCol>
    <Callout>紅色是直達聲，綠色是早期反射，藍色是越來越小的晚期殘響</Callout>
  </Frame>
);

const ParamRow = ({ name, meaning, example }: { name: string; meaning: string; example: string }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '330px 1fr 560px',
      fontSize: 30,
      lineHeight: 1.5,
      padding: '14px 12px',
      borderBottom: `2px solid ${c.line}`,
    }}
  >
    <span style={{ fontWeight: 800, color: 'var(--osd-accent)' }}>{name}</span>
    <span>{meaning}</span>
    <span>{example}</span>
  </div>
);

const Params: Page = () => (
  <Frame ch={1} title="聲學參數">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '330px 1fr 560px',
        fontSize: 26,
        color: c.muted,
        padding: '0 12px 10px',
        borderBottom: `2px solid ${c.line}`,
      }}
    >
      <span>參數</span>
      <span>意思</span>
      <span>例子</span>
    </div>
    <ParamRow name="路徑距離" meaning="聲音實際走多遠，含繞路" example="直線 8 m，繞牆要走 10 m" />
    <ParamRow name="音量（dB）" meaning="直達聲、早期反射各多大聲" example="隔一道牆，直達聲變小" />
    <ParamRow name="衰減時間" meaning="回音多久消失，分早期和晚期" example="大廳比小房間久" />
    <ParamRow name="到達方向（DOA）" meaning="聲音從哪個方向進耳朵" example="躲在牆後，聲音從牆角來" />
    <div style={{ fontSize: 24, color: c.muted, marginTop: 14 }}>
      dB = decibel（分貝）；DOA = Direction of Arrival；例子欄的數字是示意
    </div>
    <Callout>
      整段 IR 太大，遊戲只存從 IR 算出的這幾個數字
      <Cite n="[1][2]" />
    </Callout>
  </Frame>
);

const S2: Page = () => <SectionPage ch={2} title="研究動機" />;

const Memory: Page = () => (
  <Frame ch={2} title="Wave coding 的記憶體問題">
    <TwoCol cols="1fr 1fr">
      <Bullets size={32}>
        <li>
          即時模擬太慢，所以先算好再查表
          <Cite n="[1][2]" />
        </li>
        <li>要查的是「每一點到每一點」的表格</li>
        <li>像城市距離表：城市多 10 倍，表格大 100 倍</li>
      </Bullets>
      <Stat value="182 GB" label="wave coding 在 WAL 地圖存一組參數" sub="WAL：208 × 10 × 185 m 的 Wwise 示範地圖 [1][7]" />
    </TwoCol>
    <Callout>wave coding 算得準，但地圖一大，表格就存不下</Callout>
  </Frame>
);

const S3: Page = () => <SectionPage ch={3} title="DSP 的應用" />;

const Pipeline: Page = () => (
  <Frame ch={3} title="系統架構與 DSP 位置">
    <Row3 gap={72}>
      <Steps>
        <Step>
          <Card title="開發時：聲音變數字" kind="dsp" tag>
            模擬每一點的 IR，算出聲學參數
          </Card>
        </Step>
        <Step>
          <Card title="儲存：RLF" kind="ml" tag arrow>
            參數壓進 14 MB 的網格，這是論文的新方法
          </Card>
        </Step>
        <Step>
          <Card title="遊戲時：數字變聲音" kind="dsp" tag arrow>
            查出參數，調音量、套回音、擺方向
          </Card>
        </Step>
      </Steps>
    </Row3>
    <Callout>
      DSP 用在頭尾兩端，RLF 改的只有中間的儲存方式
      <Cite n="[1]" />
    </Callout>
  </Frame>
);

// ---------- 公式頁共用：輸入 → 公式 → 得到 → 遊戲中 ----------

const IoBox = ({ label, kind = 'plain', wide, children }: { label: string; kind?: 'plain' | 'formula' | 'use'; wide?: boolean; children: ReactNode }) => (
  <div
    style={{
      background: kind === 'use' ? c.soft : c.card,
      border: `2px solid ${kind === 'formula' ? c.dsp : kind === 'use' ? 'var(--osd-accent)' : c.line}`,
      borderRadius: 12,
      padding: '14px 20px',
      fontSize: wide ? 34 : 27,
      lineHeight: 1.45,
      fontFamily: wide ? mathFont : undefined,
      whiteSpace: wide ? 'nowrap' : undefined,
    }}
  >
    <div style={{ fontFamily: 'var(--osd-font-body)', fontSize: 20, fontWeight: 700, color: c.muted, letterSpacing: 2, marginBottom: 6 }}>{label}</div>
    {children}
  </div>
);

const IoArrow = () => <div style={{ alignSelf: 'center', fontSize: 40, color: c.muted }}>→</div>;

const IoRow = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1.75fr auto 1fr auto 1.1fr', gap: 14, alignItems: 'stretch', marginBottom: 30 }}>
    {children}
  </div>
);

const ExSteps = ({ children }: { children: ReactNode }) => (
  <ol style={{ fontSize: 30, lineHeight: 1.5, margin: 0, paddingLeft: 48, display: 'grid', gap: 10, listStyleType: 'decimal' }}>{children}</ol>
);

// 符號說明：公式裡每個符號代表什麼
const Syms = ({ cols, items }: { cols: number; items: [ReactNode, string][] }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, auto)`,
      justifyContent: 'start',
      gap: '2px 40px',
      margin: '-12px 0 18px',
      padding: '8px 20px',
      borderLeft: `5px solid ${c.dsp}`,
      background: c.card,
      borderRadius: '0 10px 10px 0',
      fontSize: 22,
      lineHeight: 1.45,
    }}
  >
    {items.map(([sym, text], i) => (
      <span key={i}>
        <span style={{ fontFamily: mathFont, fontStyle: 'italic', color: c.dsp, marginRight: 10 }}>{sym}</span>
        {text}
      </span>
    ))}
  </div>
);

// 公式頁下半部：左邊波形圖、右邊計算步驟
const FigSteps = ({ svg, h, children }: { svg: string; h: number; children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 40, alignItems: 'center' }}>
    <div
      style={{ background: c.card, border: `2px solid ${c.line}`, borderRadius: 12, padding: '10px 14px', fontFamily: 'var(--osd-font-body)', ['--fig-h' as string]: `${h}px` }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
    {children}
  </div>
);

const Lane = ({ title, kind, children }: { title: string; kind: 'dsp' | 'ml'; children: ReactNode }) => (
  <div
    style={{
      border: `3px solid ${kind === 'dsp' ? c.dsp : 'var(--osd-accent)'}`,
      borderRadius: 'var(--osd-radius)',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
    }}
  >
    <div style={{ fontSize: 34, fontWeight: 800, color: kind === 'dsp' ? c.dsp : 'var(--osd-accent)', marginBottom: 6 }}>{title}</div>
    {children}
  </div>
);

const Chip = ({ children }: { children: ReactNode }) => (
  <div style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center', background: c.card, border: `2px solid ${c.line}`, borderRadius: 10, padding: '8px 12px', fontSize: 28, lineHeight: 1.4 }}>
    {children}
  </div>
);

const Down = ({ children }: { children?: ReactNode }) => <div style={{ fontSize: 24, color: c.muted }}>↓ {children}</div>;

const QRow = ({ q, where, out }: { q: string; where: string; out: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 190px', fontSize: 28, lineHeight: 1.45, padding: '13px 12px', borderBottom: `2px solid ${c.line}` }}>
    <span style={{ fontWeight: 800, color: 'var(--osd-accent)' }}>{q}</span>
    <span>{where}</span>
    <span>{out}</span>
  </div>
);

// ---------- DSP 章節 ----------

const StartIr: Page = () => (
  <Frame ch={3} title="計算的起點：脈衝響應">
    <TwoCol cols="0.9fr 1.1fr">
      <IrChart />
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 190px', fontSize: 24, color: c.muted, padding: '0 12px 10px', borderBottom: `2px solid ${c.line}` }}>
          <span>遊戲想知道</span>
          <span>看 IR 的哪裡</span>
          <span>得到</span>
        </div>
        <QRow q="聲音走多遠" where="第一個聲音何時到" out="距離 π" />
        <QRow q="從哪個方向來" where="旁邊幾格的 π 怎麼變" out="方向 δ" />
        <QRow q="聽起來多大聲" where="前 15 ms 有多少能量" out="音量 L" />
        <QRow q="回音多久消失" where="能量掉得多快" out="衰減時間 τ" />
      </div>
    </TwoCol>
    <div style={{ marginTop: 30, border: `3px dashed ${c.line}`, borderRadius: 12, padding: '14px 24px', fontSize: 28 }}>
      <b style={{ color: c.dsp, marginRight: 20 }}>接下來的例子</b>
      音源 a 在牆後，聽者 b 站在牆角附近，直線 8 m。一條 IR 從頭算到底（數字是示意）
    </div>
    <Callout>四個參數都從同一條 IR 算出來；方向比較特別，是拿算好的距離再推一次</Callout>
  </Frame>
);

const DistDir: Page = () => (
  <Frame ch={3} title="距離與方向的計算" tight>
    <IoRow>
      <IoBox label="輸入">
        IR 裡直達聲到達的時刻 <M>t</M>
        <sub>DS</sub>
      </IoBox>
      <IoArrow />
      <IoBox label="公式" kind="formula" wide>
        <M>π</M> = <M>c</M> (<M>t</M>
        <sub>DS</sub> − <M>t</M>
        <sub>0</sub>)
        <br />
        <M>δ</M> = −
        <Frac top={<>∇<M>π</M></>} bottom={<>‖∇<M>π</M>‖</>} />
      </IoBox>
      <IoArrow />
      <IoBox label="得到">距離 π、方向 δ</IoBox>
      <IoArrow />
      <IoBox label="遊戲中" kind="use">
        δ 交給 VBAP，決定哪個喇叭比較大聲
      </IoBox>
    </IoRow>
    <Syms
      cols={3}
      items={[
        [<>π</>, 'a 到 b 聲音實際走的路（m）'],
        [<>c</>, '聲速 343 m/s'],
        [<>t<sub>0</sub></>, 'a 發出聲音的時刻'],
        [<>t<sub>DS</sub></>, '直達聲（第一個到的聲音）到 b 的時刻'],
        [<>δ</>, '聲音從哪個方向來（長度 1 的箭頭）'],
        [<>∇π</>, 'π 變大最快的方向（梯度）'],
        [<>−</>, '負號：反過來，指向 π 變小的那邊'],
        [<>‖∇π‖</>, '箭頭的長度；除掉它，只留方向'],
      ]}
    />
    <FigSteps svg={distFig} h={250}>
    <ExSteps>
      <li>
        直達聲晚 0.029 s 到 → π = 343 × 0.029 ≈ 10 m，比直線多 2 m，多出來的是繞牆
        <Cite n="[1]" />
      </li>
      <li>b 左邊一格 π = 9.86 m，右邊一格 10.14 m → 往左走距離變短</li>
      <li>
        δ 指向左邊 → 聲音從牆角那側傳來，VBAP 調大左喇叭
        <Cite n="[1][4]" />
      </li>
    </ExSteps>
    </FigSteps>
    <Callout>白話：看直達聲晚多久到，就知道走了多遠；比一比旁邊幾格哪邊比較近，就知道聲音從哪來</Callout>
  </Frame>
);

const LevelCalc: Page = () => (
  <Frame ch={3} title="音量的計算" tight>
    <IoRow>
      <IoBox label="輸入">直達聲之後 15 ms 內的能量 e(t)</IoBox>
      <IoArrow />
      <IoBox label="公式" kind="formula" wide>
        <M>L</M>
        <sub>DS</sub> = 10 log<sub>10</sub>
        <BigOp op="∫" lo={<><M>t</M><sub>DS</sub></>} hi={<><M>t</M><sub>DS</sub>+15 ms</>} />
        <M>e</M>(<M>t</M>) <M>dt</M>
      </IoBox>
      <IoArrow />
      <IoBox label="得到">直達聲音量 L（dB）</IoBox>
      <IoArrow />
      <IoBox label="遊戲中" kind="use">
        換成倍數 A = 10<sup>L/20</sup>，乘在音效上（增益）
      </IoBox>
    </IoRow>
    <Syms
      cols={3}
      items={[
        [<>L<sub>DS</sub></>, '直達聲音量（dB）'],
        [<>e(t)</>, '時刻 t 的能量 = 振幅 h(t) 的平方'],
        [<>t<sub>DS</sub></>, '直達聲到達的時刻，從這裡開始加'],
        [<>∫ … dt</>, '把這 15 ms 的能量全部加起來'],
        [<>10 log<sub>10</sub></>, '把能量換成 dB'],
        [<>A</>, '音效振幅的倍數（振幅用 20，能量用 10）'],
      ]}
    />
    <FigSteps svg={levelFig} h={280}>
    <ExSteps>
      <li>
        能量是振幅的平方；把這 15 ms 內每個取樣的能量加起來 = 0.25
        <Cite n="[1]" />
      </li>
      <li>取 log 換成 dB：L = 10 log₁₀ 0.25 ≈ −6 dB</li>
      <li>
        遊戲播放時：A = 10<sup>−6/20</sup> ≈ 0.5，音效振幅乘 0.5，聽起來被牆擋小聲了
        <Cite n="[1]" />
      </li>
    </ExSteps>
    </FigSteps>
    <Callout>白話：把直達聲那一小段的能量加總，就知道多大聲；遊戲再把 dB 換回倍數，調整音效音量</Callout>
  </Frame>
);

const DecayCalc: Page = () => (
  <Frame ch={3} title="衰減時間的計算" tight>
    <IoRow>
      <IoBox label="輸入">
        整條 IR 的能量 <M>h</M>
        <sup>2</sup>
      </IoBox>
      <IoArrow />
      <IoBox label="公式" kind="formula" wide>
        <M>S</M>(<M>t</M>) =
        <BigOp op="∫" lo={<M>t</M>} hi="∞" />
        <M>h</M>
        <sup>2</sup>(<M>u</M>) <M>du</M>,&nbsp;&nbsp;<M>τ</M> = −
        <Frac top="60" bottom={<M>s</M>} />
      </IoBox>
      <IoArrow />
      <IoBox label="得到">衰減時間 τ（秒）</IoBox>
      <IoArrow />
      <IoBox label="遊戲中" kind="use">
        決定小、中、大三種房間回音的混合比例
      </IoBox>
    </IoRow>
    <Syms
      cols={3}
      items={[
        [<>h(u)</>, 'IR 在時刻 u 的振幅，平方就是能量'],
        [<>S(t)</>, '從 t 到最後還剩多少能量'],
        [<>u</>, '加總用的時間，從 t 一路到 IR 結束'],
        [<>s</>, 'S 換成 dB 後的斜率（dB/s，是負數）'],
        [<>60</>, '掉 60 dB，能量只剩百萬分之一'],
        [<>τ</>, '衰減時間（s）：回音多久消失'],
      ]}
    />
    <FigSteps svg={decayFig} h={330}>
      <ExSteps>
        <li>
          從最後一段往前加，得到 S
          <Cite n="[3]" />
        </li>
        <li>每 75 ms 掉 3 dB → 斜率 s = −40 dB/s</li>
        <li>
          τ = 60 / 40 = 1.5 s：回音要 1.5 秒才降 60 dB
          <Cite n="[1]" />
        </li>
      </ExSteps>
    </FigSteps>
    <Callout>白話：從 IR 尾巴往前累加能量，量曲線掉多快，就知道回音多久消失</Callout>
  </Frame>
);

const ConvCalc: Page = () => (
  <Frame ch={3} title="卷積的計算" tight>
    <IoRow>
      <IoBox label="輸入">音效 x，加上依 τ 混好的房間 IR h</IoBox>
      <IoArrow />
      <IoBox label="公式" kind="formula" wide>
        <M>y</M>[<M>n</M>] =
        <BigOp op="Σ" lo={<M>k</M>} />
        <M>x</M>[<M>k</M>] <M>h</M>[<M>n</M> − <M>k</M>]
      </IoBox>
      <IoArrow />
      <IoBox label="得到">帶回音的聲音 y</IoBox>
      <IoArrow />
      <IoBox label="遊戲中" kind="use">
        和直達聲一起送到喇叭播放
      </IoBox>
    </IoRow>
    <Syms
      cols={3}
      items={[
        [<>x[k]</>, '音效的第 k 個取樣'],
        [<>h[m]</>, '房間 IR 第 m 個取樣：晚 m 格的回音多大'],
        [<>n</>, '現在算的是輸出的第幾個取樣'],
        [<>n − k</>, '第 k 個取樣發出後，過了幾格'],
        [<>Σ<sub>k</sub></>, '把每個取樣帶出的回音都加起來'],
        [<>y[n]</>, '輸出的第 n 個取樣'],
      ]}
    />
    <FigSteps svg={convFig} h={350}>
      <ExSteps>
        <li>音效 x = [1, 0.5]，房間 IR h = [1, 0.6, 0.3]</li>
        <li>每個取樣都帶出一串變小的回音，錯開疊加</li>
        <li>
          2 個取樣變成 4 個，多出來的尾巴就是回音
          <Cite n="[1]" />
        </li>
      </ExSteps>
    </FigSteps>
    <Callout>白話：卷積就是把每個聲音都複製成一串回音，再全部加起來</Callout>
  </Frame>
);

const DspSummary: Page = () => (
  <Frame ch={3} title="DSP 在論文中的工作">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 24, alignItems: 'stretch' }}>
      <Lane title="開發時（DSP）" kind="dsp">
        <Chip>地圖幾何</Chip>
        <Down>FDTD 波動模擬</Down>
        <Chip>每對位置的 IR</Chip>
        <Down>前三頁的公式</Down>
        <Chip>π、δ、L、τ</Chip>
      </Lane>
      <IoArrow />
      <Lane title="儲存（RLF）" kind="ml">
        <Chip>每對位置一組參數 182 GB</Chip>
        <Down>學成每格 16 個數字</Down>
        <Chip>潛在向量網格 14 MB</Chip>
        <Down>三線性內插、算距離</Down>
        <Chip>查出 π、δ、L、τ</Chip>
      </Lane>
      <IoArrow />
      <Lane title="遊戲時（DSP）" kind="dsp">
        <Chip>L → 乘倍數（增益）</Chip>
        <Chip>τ → 卷積套回音</Chip>
        <Chip>δ → VBAP 分配喇叭</Chip>
        <Down />
        <Chip>玩家聽到的聲音</Chip>
      </Lane>
    </div>
    <Callout>
      DSP 負責把聲音變成數字、再把數字變回聲音；RLF 負責把中間的數字存小
      <Cite n="[1]" />
    </Callout>
  </Frame>
);

const S4: Page = () => <SectionPage ch={4} title="RLF 方法" />;

const Latent: Page = () => (
  <Frame ch={4} title="潛在向量與距離">
    <TwoCol cols="1fr 1fr">
      <Bullets size={30}>
        <li>每個位置只存 16 個數字（潛在向量）</li>
        <li>可以想成這個位置的聲音座標</li>
        <li>兩點座標的距離 ≈ 聲音要走的距離</li>
        <li>隔著牆的 A、B，在右圖被拉開</li>
      </Bullets>
      <div style={{ textAlign: 'center' }}>
        <img
          src={fig2}
          alt="原論文圖 2：2D 地圖與學到的 2D 潛在空間"
          style={{ display: 'block', margin: '0 auto', height: 420, background: '#fff', borderRadius: 12, border: `2px solid ${c.line}`, padding: 8 }}
        />
        <Caption>
          原論文 Figure 2：左為地圖（黃色是牆），右為學到的潛在空間
          <Cite n="[1]" />
        </Caption>
      </div>
    </TwoCol>
    <Callout>
      從存「每一對位置」變成存「每一個位置」：N × N 降到 N × 16
      <Cite n="[1]" />
    </Callout>
  </Frame>
);

const Reciprocity: Page = () => (
  <Frame ch={4} title="聲學互易性">
    <TwoCol cols="1fr 1fr">
      <svg viewBox="0 0 600 260" style={{ width: '100%', height: 'auto' }} role="img" aria-label="a 傳到 b 與 b 傳到 a 結果相同">
        <defs>
          <marker id="rlf-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10z" fill="#0e7c74" />
          </marker>
          <marker id="rlf-ah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10z" fill={c.dsp} />
          </marker>
        </defs>
        <rect x="10" y="10" width="580" height="240" rx="8" fill={c.card} stroke={c.line} strokeWidth="2" />
        <circle cx="110" cy="130" r="18" fill={c.src} />
        <circle cx="490" cy="130" r="18" fill={c.rcv} />
        <text x="102" y="190" style={svgText}>a</text>
        <text x="482" y="190" style={svgText}>b</text>
        <path d="M140 105 Q 300 40 460 105" fill="none" stroke="#0e7c74" strokeWidth="4" markerEnd="url(#rlf-ah)" />
        <path d="M460 155 Q 300 220 140 155" fill="none" stroke={c.dsp} strokeWidth="4" markerEnd="url(#rlf-ah2)" />
        <text x="245" y="55" style={svgSmall}>a 喊、b 聽</text>
        <text x="245" y="232" style={svgSmall}>b 喊、a 聽</text>
      </svg>
      <Bullets size={30}>
        <li>
          音源、聽者對調，IR 相同
          <Cite n="[1]" />
        </li>
        <li>方向例外，另外從梯度推算</li>
        <li>RLF 用兩點向量的距離當答案</li>
        <li>a、b 對調結果不變，不必靠資料去學</li>
      </Bullets>
    </TwoCol>
    <div style={{ marginTop: 28 }}>
      <FormulaBox note="論文式 (8)">
        <span>
          <M>π̂</M>(<M>a</M>, <M>b</M>) = ‖<M>f</M>(<M>a</M>) − <M>f</M>(<M>b</M>)‖ = ‖<M>f</M>(<M>b</M>) − <M>f</M>(<M>a</M>)‖ = <M>π̂</M>(<M>b</M>, <M>a</M>)
        </span>
      </FormulaBox>
    </div>
    <Callout>論文名稱裡的 Reciprocal（互易）就是指這個性質</Callout>
  </Frame>
);

const Arch: Page = () => (
  <Frame ch={4} title="RLF 架構">
    <div style={{ textAlign: 'center', marginTop: -16 }}>
      <img
        src={fig1}
        alt="原論文圖 1：RLF 推論流程與重建的六種聲學參數"
        style={{ display: 'block', margin: '0 auto', width: 1240, background: '#fff', borderRadius: 12, border: `2px solid ${c.line}`, padding: 8 }}
      />
      <Caption>
        原論文 Figure 1：(a) 推論流程 (b) 一個音源對整張地圖算出的六種參數
        <Cite n="[1]" />
      </Caption>
    </div>
    <div style={{ marginTop: 16 }}>
      <StepRow n={1} label="網格">
        地圖鋪一層 3D 網格，每個格點存一組潛在向量
        <Cite n="[1]" />
      </StepRow>
      <StepRow n={2} label="內插（DSP）">
        音源 <b style={{ color: c.src }}>a</b>、聽者 <b style={{ color: c.rcv }}>b</b> 從周圍 8 個格點估出自己的向量
      </StepRow>
      <StepRow n={3} label="距離函數">
        兩組向量送進 h，得到這對位置的聲學參數
        <Cite n="[1]" />
      </StepRow>
    </div>
  </Frame>
);

const S5: Page = () => <SectionPage ch={5} title="實驗結果與意義" />;

const Results: Page = () => (
  <Frame ch={5} title="實驗結果">
    <Row3>
      <Stat value="14 MB" label="WAL 地圖一組參數的記憶體" sub="wave coding 要 182 GB" />
      <Stat value="46 μs" label="查 100 組參數的時間" sub="單一 CPU 核心" />
      <Stat value="61.8" label="聽測真實感分數（0–100）" sub="原始模擬 62.6 分" />
    </Row3>
    <Callout>
      記憶體小了一萬多倍；28 位遊戲音訊從業者評分只差 0.8 分，統計上沒有顯著差異（p = 0.41）
      <Cite n="[1]" />
    </Callout>
  </Frame>
);

const Meaning: Page = () => (
  <Frame ch={5} title="研究意義">
    <Row3>
      <Card title="大地圖也能用">
        資料從 GB 降到 MB，照物理模擬的聲音有機會用在大型開放地圖
        <Cite n="[1]" />
      </Card>
      <Card title="物理規則寫進架構">
        互易性由公式保證，模型不會學出違反物理的結果
        <Cite n="[1]" />
      </Card>
      <Card title="貼近實際產品">
        作者來自 Ubisoft 和 Audiokinetic，測試場景是 Wwise 的示範地圖
        <Cite n="[1][7]" />
      </Card>
    </Row3>
    <Callout>這篇研究把準確但太大的 wave coding，縮小到遊戲放得下的程度</Callout>
  </Frame>
);

const ListCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div
    style={{
      background: c.card,
      border: `2px solid ${c.line}`,
      borderRadius: 'var(--osd-radius)',
      padding: '32px 36px',
      height: '100%',
      boxSizing: 'border-box',
    }}
  >
    <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--osd-accent)', marginBottom: 18 }}>{title}</div>
    <Bullets size={30}>{children}</Bullets>
  </div>
);

const Limits: Page = () => (
  <Frame ch={5} title="研究限制">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
      <ListCard title="限制">
        <li>
          只支援靜態場景，門開關還不行
          <Cite n="[1]" />
        </li>
        <li>
          比較的都是未壓縮的大小
          <Cite n="[1]" />
        </li>
        <li>只模擬到 500 Hz（我的觀察）</li>
      </ListCard>
      <ListCard title="未來方向">
        <li>
          延伸到會變動的場景
          <Cite n="[1]" />
        </li>
        <li>
          存 AI 尋路距離等對稱的量
          <Cite n="[1]" />
        </li>
      </ListCard>
    </div>
  </Frame>
);

const Conclusion: Page = () => (
  <Frame ch={5} title="結論">
    <Bullets size={38}>
      <li>
        問題：wave coding 算得準，但一張地圖要 182 GB
        <Cite n="[1]" />
      </li>
      <li>DSP：開發時把聲音變成參數，遊戲時把參數變回聲音</li>
      <li>
        RLF：每個位置存一組座標，14 MB 就夠，聽起來一樣
        <Cite n="[1]" />
      </li>
    </Bullets>
  </Frame>
);

const Ref = ({ children }: { children: ReactNode }) => <li style={{ wordBreak: 'break-all' }}>{children}</li>;

const References: Page = () => (
  <Frame ch={5} title="參考資料">
    <ol style={{ fontSize: 22, lineHeight: 1.45, margin: 0, paddingLeft: 40, display: 'grid', gap: 10, listStyleType: 'decimal' }}>
      <Ref>
        Seuté, Vasudev, Richan, Buffoni. Reciprocal Latent Fields for Precomputed Sound Propagation. SIGGRAPH
        Conference Papers ’26（圖片出自本文，CC BY-NC-ND 4.0）https://arxiv.org/abs/2602.06937
      </Ref>
      <Ref>
        Raghuvanshi, Snyder. Parametric Wave Field Coding for Precomputed Sound Propagation. ACM TOG 33(4), 2014
        https://doi.org/10.1145/2601097.2601184
      </Ref>
      <Ref>
        Schroeder. New Method of Measuring Reverberation Time. JASA 37(3), 1965 https://doi.org/10.1121/1.1909343
      </Ref>
      <Ref>Pulkki. Virtual Sound Source Positioning Using Vector Base Amplitude Panning. JAES 45(6), 456–466, 1997</Ref>
      <Ref>Hamilton. PFFDTD Software, 2021 https://github.com/bsxfun/pffdtd</Ref>
      <Ref>
        Gruffaz, Sassen. Riemannian metric learning: Closer to you than you imagine. arXiv, 2025
        https://arxiv.org/abs/2503.05321
      </Ref>
      <Ref>
        Ashby. Introducing The Wwise Audio Lab (WAL). Audiokinetic, 2018
        https://www.audiokinetic.com/en/learning/videos/twnpk0nrcs4/
      </Ref>
    </ol>
  </Frame>
);

export const meta: SlideMeta = {
  title: 'RLF 論文報告（精簡版）',
  createdAt: '2026-10-30T02:03:49.950Z',
};

export default [
  Cover,
  Topic,
  Agenda,
  S1,
  Paths,
  Ir,
  Params,
  S2,
  Memory,
  S3,
  Pipeline,
  StartIr,
  DistDir,
  LevelCalc,
  DecayCalc,
  ConvCalc,
  DspSummary,
  S4,
  Latent,
  Reciprocity,
  Arch,
  S5,
  Results,
  Meaning,
  Limits,
  Conclusion,
  References,
] satisfies Page[];

export const notes: (string | undefined)[] = [
  '這篇論文處理遊戲裡「聲音怎麼繞過牆、在房間裡迴盪」的問題。作者來自 Ubisoft，以及開發 Wwise 音效引擎的 Audiokinetic。論文全名有點長，後面簡稱 RLF。',
  '先講整份報告的主線。遊戲想要真實的聲音，業界有一種很準的方法叫 wave coding，問題是資料量太大。這篇論文提出 RLF，把資料縮小一萬多倍，聽起來卻一樣。按右鍵一次出現一格。',
  '這份報告有五段。第一段的三個名詞會一路用到最後，所以先講。第二段說舊方法卡在哪。第三段是 DSP，負責把聲音和數字互相轉換。第四段才是論文的貢獻：怎麼把這些數字存得很小。最後看結果和意義。',
  undefined,
  '光的波長很短，被牆擋住就看不到；聲音的波長從幾公分到十幾公尺，100 Hz 大約 3.4 公尺，會繞過障礙物。所以只用射線直線追蹤，算不出繞射。這也是後面要用波動模擬的原因。',
  '在大教堂拍手，會聽到「啪」之後一長串嗡嗡聲慢慢消失；在小房間拍手，回音很短。這段錄音就是 IR，它同時記錄了距離、遮擋和房間大小。左圖是示意圖，不是真實資料。',
  '這四個數字就是後面一直講的聲學參數。wave coding 的做法，就是把每條 IR 壓成這幾個數字。例子欄的數字是我舉的例子，不是論文的資料。',
  undefined,
  'wave coding 的資料量跟「音源位置數 × 聽者位置數」成正比。比較小的測試地圖 Audio Gym 也要 3.1 GB。方法夠準，只是存不下，RLF 改的就是儲存這一段。',
  undefined,
  '這頁回答「DSP 用在哪裡」。左邊開發時，用 DSP 把物理模擬的結果變成參數；右邊遊戲執行時，用 DSP 把參數變回聲音。中間怎麼存，是 RLF 的貢獻。接下來先講左邊開發時怎麼算，再講右邊怎麼播，最後回到一張完整的流程圖。',
  '前面講過，IR 就是在 a 拍一下手、在 b 錄到的整段聲音。開發時用 FDTD 波動模擬，在電腦裡把每一對位置的 IR 都算出來：空間切成 0.137 m 的格子、時間每步約 0.23 ms，算 2 秒。接下來三頁照這張表的順序，一個問題一頁，每頁都講四件事：輸入是什麼、套什麼公式、得到什麼、遊戲裡拿來做什麼。例子全部用同一個場景，數字會一路接下去。',
  'c 是聲速 343 m/s，t0 是發聲時間。距離乘出來是 10 m，比直線的 8 m 多，因為聲音要繞過牆。方向的公式看起來複雜，意思很簡單：∇π 是距離增加最快的方向，前面加負號就是距離減少最快的方向，也就是聲音來的方向；除以長度只是把它變成單位向量。電腦裡用左右兩格的差去算，跟山上找最陡的坡一樣。這一頁的數字是我編的示意。',
  'dB 是用 log 表示大小，因為耳朵對音量的感覺本來就接近 log。能量用 10 log，振幅用 20 log，所以換回振幅時是除以 20。早期反射的音量算法一樣，只是時間窗換成直達聲之後的 100 ms。0.25 這個數字是示意。',
  '直接看 IR 的話，聲音忽大忽小，很難量斜率。Schroeder 1965 年的做法是從尾巴往前加，曲線就變得平滑、只會往下。斜率 s 的單位是每秒掉幾 dB，τ 就是掉 60 dB 要花幾秒。論文分早期、晚期兩段各量一次。得到的 τ 在遊戲裡決定三種房間回音怎麼混，下一頁看混好的回音怎麼套到音效上。表裡的數字是示意。',
  '前面三頁是開發時把 IR 變成數字，這一頁是遊戲時把數字變回聲音。論文的式 (3) 準備了小、中、大三種房間的 IR，依衰減時間 τ 決定三者的比例，再和音效做卷積。直達聲不做卷積，只乘上一頁算出的倍數 A，再由 VBAP 依方向 δ 分給喇叭。表裡的數字是我舉的小例子，用程式驗算過。',
  '被問到「DSP 在這篇論文做什麼」，就用這一頁回答。左邊在開發時：模擬出 IR，用前面三頁的公式算出四個參數。中間是問題所在：每一對位置都要存一組，WAL 地圖要 182 GB，RLF 把它學成每格 16 個數字，只要 14 MB。右邊在遊戲時：查出參數後，音量拿去乘倍數，衰減時間拿去決定回音、做卷積，方向交給 VBAP。論文自己的新東西只有中間那一欄，左右兩欄都是既有的 DSP 方法。',
  undefined,
  '舊方法存「a 到 b 的答案」，RLF 只存「a 的座標」和「b 的座標」，要用時再算距離。右圖是論文用 2 維示範：牆兩側的 A、B，在學出來的空間裡被放到洞的兩側，直線距離剛好等於繞路的距離。實際用的是 16 維。',
  'a 喊 b 聽，和 b 喊 a 聽，路徑距離、音量、衰減都一樣。作者選了一定對稱的距離函數，把這條物理規則直接寫進公式，模型就不可能違反。方向是例外：a 往 b 的方向和 b 往 a 的方向不一定剛好相反，所以方向是從距離的梯度推出來的。',
  '左邊灰色是要學的網格，紅色是音源、藍色是聽者。位置通常落在格點之間，所以用周圍 8 個格點加權平均，這叫三線性內插，是 DSP 常用的技巧。右邊 6 張彩色地圖是同一個音源對整張地圖算出的結果：路徑距離、方向、直達聲音量、早期反射音量、早期和晚期衰減。',
  undefined,
  '46 μs 是論文裡對角黎曼版本的速度。以每秒 60 格畫面算，一格約 16,667 μs，46 μs 不到 0.3%，這是我自己的換算。聽測裡另有一個故意做差的版本只拿 27.7 分，用來確認評分者有認真聽。p = 0.41 表示 0.8 分的差距很可能只是隨機波動。',
  '第二點：作者沒有讓模型自己去學互易性，直接把它寫進公式。第三點：Audiokinetic 就是開發 Wwise 的公司，很多遊戲在用 Wwise，所以這個方法離實際使用不遠。不過論文沒有說會放進哪個產品。',
  '最大的限制是靜態場景，地形改變就要重新訓練。另外作者比較的是未壓縮的大小，wave coding 本身也能壓縮，所以「一萬多倍」是上限，實際差距會小一些。論文也沒有公開程式碼。',
  '三句話收尾。如果被問 DSP 在哪裡，就回到「系統架構與 DSP 位置」那一頁：DSP 在頭尾，RLF 改的是中間的儲存方式。',
];
