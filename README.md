# 50_汇报：研究汇报平台

本文件夹是 GitHub Pages 仓库 `NCR7777/NCR7777.github.io` 的本地工作副本，网址 https://ncr7777.github.io/ 。
2026-10-09 从 `00..小论文/Path Planing and Scheduling/paper03/导师汇报` 拆出，改成多份汇报共用一套引擎。

- **推送即公开。**推送前逐项核对：不含卫星影像或其截图、不含真实船厂地图 JSON 及从中截取的路网几何、不含密钥与本机绝对路径；未发表的内容（博士论文汇报等）是否公开由作者决定。
- 汇报只读取研究仓库的结果，不改研究仓库。

## 结构

```
index.html          入口：选择汇报（卡片来自 decks.js）
decks.js            汇报登记表：live 的卡片可打开，planned 的显示为"规划中"
shared/
  lang.js           <head> 中加载，首帧前定语言（各页共用 localStorage 键 deck-lang2）
  deck.css          设计系统与幻灯片外壳（配色、排版、卡片、图表、动效、手机阅读模式）
  favicon.svg       网站图标（根目录另有 favicon.ico 供只认 ICO 的浏览器）
  deck-core.js      引擎：生成顶栏、舞台、讲稿、页脚、目录与术语抽屉；翻页、语言、主题、全屏、PDF、布局
thesis/             博士论文汇报（占路运输）
fleet/              船厂分段运输车选型（MY-B）
tools/make_pdf.py   把一份汇报打印成三种语言的 PDF
```

## 本地查看

```bash
python -m http.server 8000      # 在本文件夹运行
# 浏览器打开 http://127.0.0.1:8000/
```

## 新增一份汇报

1. 新建文件夹，例如 `ch3/`，放 `index.html`、`deck.js`，需要时加 `data.js`、`make_data.py`、`assets/`、`<名>.css`。
2. 在 `decks.js` 加一条（`status: 'live'`，`href: 'ch3/'`）。
3. 运行 `python tools/make_pdf.py ch3` 生成 `ch3/pdf/<data-pdf>_<lang>.pdf`。

### `index.html` 的约定

```html
<!doctype html>
<meta charset="utf-8">
<title>Short Title</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="../shared/favicon.svg" type="image/svg+xml">
<script src="../shared/lang.js"></script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">   <!-- 与现有汇报相同 -->
<link rel="stylesheet" href="../shared/deck.css">

<main id="deck" data-pdf="Short_Title" data-home="../">              <!-- data-pdf 可省（无 PDF 按钮） -->
<div class="brand-src" hidden><b>SHORT TITLE</b><span lang="zh">…</span><span lang="en">…</span><span lang="ko">…</span></div>

<section class="slide cover" data-sec="cover">…</section>
<section class="slide" data-sec="bg">
  <header class="eb"></header>                                         <!-- 引擎填入章节名与页码 -->
  <h2 class="ttl d"><span lang="zh">…</span><span lang="en">…</span><span lang="ko">…</span></h2>
  <div class="content">…</div>
  <p class="src">来源…</p>
  <aside class="notes"><p lang="zh">…</p><p lang="en">…</p><p lang="ko">…</p></aside>
</section>
…
</main>

<dl id="glossary" hidden><dt>…</dt><dd>…</dd></dl>                    <!-- 可省（无术语按钮） -->

<script src="data.js"></script>                                        <!-- 可省 -->
<script src="../shared/deck-core.js"></script>
<script src="deck.js"></script>
```

- 每段文字写三种语言：`<span lang="zh|en|ko">`，只显示当前语言。
- `data-sec` 把页面分成章节：进度条、目录、页眉都按它分组；章节名在 `deck.js` 的 `sections` 中给出。
- 任何带 `data-go="<章节>"` 的元素点击后跳到该章节第一页；其中的 `.pg` 显示页码。

### `deck.js` 的约定

```js
(() => {
const { $, el, frame, fitH, anim, hover, swatches, yTitle, lin, fmt, LI } = Deck;
const T = { title: ['中文标题', 'English Title', '한국어 제목'], … };   // [zh, en, ko]
const t = k => T[k][LI[Deck.lang]];
function drawX() { const s = frame('cX', 640, 360, t('xLabel')); … }    // 每次换语言、字体就绪、版式切换时重画
Deck.start({
  strings: T,                                 // 必须有 title
  sections: { bg: ['背景', 'Background', '배경'], … },
  draw: [drawX],
  init() { /* 绑定本汇报自己的控件；只画一次的静态图 */ },
});
})();
```

`Deck` 提供：`t`、`lang`、`LANGS`、`LI`、`$`、`tri`、`fmt`、`el`、`frame`、`fitH`、`anim`、`spread`、`lin`、`yTitle`、`swatches`、`hover`、`safe`、`go`。共用符号 `#blk`（分段）、`#trL`、`#trS`（长、短平板车）、`#hatch`（斜线填充）可在 SVG 中直接 `<use href="#blk">`。

### 数据

图表的数字由各汇报的 `make_data.py` 从研究仓库的结果文件生成 `data.js`，不手抄；脚本写明读取的仓库、提交与文件。
