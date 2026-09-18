# 效原 · Personal Archive

一个可部署到 GitHub Pages 的原生 HTML / CSS / JavaScript 个人文章站。V1 包含首页、文章列表与独立详情页、分类、About、404、移动端适配、基础 SEO 和自动部署流程，不包含搜索、评论、账户、Newsletter 或 CMS。

## V1 页面

- `/`：保留原有开场动画、栏目切换、站内阅读器和 Daily Log。
- `/articles/`：全部文章列表；每篇文章都有可直接访问和刷新的独立详情页。
- `/categories/`：LANDSCAPES、THOUGHTS、SELF 三类内容。
- `/about/`：个人简介与自述文章入口。
- `/404.html`：GitHub Pages 的自定义未找到页面。
- `/robots.txt`、`/sitemap.xml`：搜索引擎抓取入口。

## 本地打开

直接双击 `dist/index.html` 即可查看。文章正文已嵌入 `articles-data.js`，因此本地打开和以后上线时都会使用站内阅读器，不会跳转到裸露的 `.txt` 页面。

独立文章页和 SEO 文件由构建工具生成。若本机安装了 Node.js 20 或更高版本，在项目根目录运行：

```text
npm run build
npm run check
```

项目没有第三方运行依赖，不需要执行 `npm install`。

## GitHub Pages 上线

1. 在 GitHub 新建一个仓库，把本项目根目录的全部文件推送到 `main` 分支。
2. 打开仓库的 **Settings → Pages**，在 **Build and deployment** 中将 Source 设为 **GitHub Actions**。
3. 打开 **Actions**。`Deploy to GitHub Pages` 流程会自动构建、检查并发布 `dist`。
4. 首次完成后，在 **Settings → Pages** 查看公开网址。项目站通常是 `https://用户名.github.io/仓库名/`。

构建流程会读取 GitHub Pages 返回的真实 base URL，因此仓库名形式的子路径可以正常工作，不需要手改 CSS、脚本或图片路径。

### 自定义域名与 HTTPS

确认默认的 `github.io` 地址正常后，再在 **Settings → Pages → Custom domain** 填写自己的域名，并按 GitHub 显示的记录修改 DNS。DNS 生效后勾选 **Enforce HTTPS**。

本项目已在 `site.config.json` 中把正式域名设为 `https://thephoenixraincey.top`，构建时会自动生成 `CNAME`，并让 canonical、Open Graph URL、robots.txt 和 sitemap 使用该域名。只有以后更换域名时才需要修改这个配置，或在仓库 **Settings → Secrets and variables → Actions → Variables** 新建覆盖变量：

```text
SITE_URL=https://新的域名
```

重新运行部署后，站点元数据会统一使用新域名。

## SEO 与路径说明

- 每个正式页面包含独立的 title、description、canonical 和 Open Graph 元数据。
- GitHub Actions 构建时会把 URL 写成完整的 Pages URL；本地构建则保留可移动的相对路径。
- 文章采用 `/articles/英文-slug/` 目录结构，刷新详情页不会依赖单页路由回退。
- 全部站内静态资源使用相对路径，不依赖盘符、localhost、本地 API 或秘密配置。

## 文件作用

- `dist/index.html`：页面内容与结构，包括昵称、简介、三个栏目、文章目录、Daily Log 和外部链接。
- `dist/style.css`：颜色、字体、排版、响应式规则，以及开始界面的下指、火花和淡出动画。
- `dist/script.js`：点击进入、栏目切换、文章阅读器、键盘操作和重播开始动画。
- `dist/articles/*.txt`：导入的 14 篇文章全文；文件名使用英文，避免部署时出现中文路径兼容问题。
- `dist/articles-data.js`：由全部 `.txt` 自动生成的正文数据，使直接双击主页时也能打开站内阅读器。
- `dist/assets/character-base.png`：移除手部后的静止人物底图。
- `dist/assets/character-hand.png`：按肉色色块提取的透明手部图层；只有这一层会旋转。
- `dist/assets/character.png`：原始卡通人物素材，保留作备份。
- `tools/build-articles.mjs`：重新生成 `articles-data.js` 的工具。
- `tools/build-site.mjs`：生成独立文章页、分类页、About、404、robots.txt、sitemap 和嵌入正文数据。
- `tools/check-site.mjs`：检查页面 SEO、站内链接与本地专用路径。
- `.github/workflows/deploy-pages.yml`：GitHub Pages 自动构建和发布配置。
- `package.json`：提供 `npm run build` 与 `npm run check`。
- `更新文章数据.cmd`：添加或修改文章后双击运行，用于刷新阅读器数据。
- `.openai/hosting.json`：Sites 托管配置；不影响本地运行。

## 常用修改位置

### 昵称

在 `dist/index.html` 搜索 `效原`。顶部中文昵称和 SELF 中各有一处；英文标题搜索 `XIAOYUAN`。

### 简介

在 `dist/index.html` 搜索：

`像体育生的理科生有颗文科生的心`

### 三个栏目及内容

在 `dist/index.html` 搜索 `LANDSCAPES 内容`、`THOUGHTS 内容`、`SELF 内容`。栏目按钮位于 `主页栏目` 注释下方。修改按钮的 `data-tab` 时，也要同步修改对应内容区的 `id`。

### 文章与分类

`LANDSCAPES` 当前放游记，`THOUGHTS` 放随笔与想法，`SELF` 中的两篇文章位于个人简介和外部链接之间。

以后新增文章按以下顺序操作：

1. 将文章保存为 UTF-8 编码的 `.txt` 文件，放进 `dist/articles`。文件名建议只用小写英文字母、数字和连字符，例如 `new-article.txt`。
2. 在 `dist/index.html` 找到要加入的栏目，复制一整行 `button class="article-card"`。
3. 修改 `data-title`、编号、页面显示标题、分类说明，以及 `data-file="articles/new-article.txt"`。
4. 同步在 `tools/build-site.mjs` 顶部的 `articles` 列表添加标题、文件名、分类和 slug。
5. 双击项目根目录的 `更新文章数据.cmd` 可刷新首页阅读器；正式发布前运行 `npm run build`，生成独立文章页与 SEO 数据。
6. 刷新 `dist/index.html`。点击文章时会在与主页同字体、同配色的阅读器中打开，`dist/articles/<slug>/index.html` 是对应的独立公开页面。

修改已有文章正文后同样需要再双击一次 `更新文章数据.cmd`。不要手动编辑 `articles-data.js`，因为它会被生成工具覆盖。

### Daily Log

Daily Log 默认只显示日期、预览标题和编号。点击预览旁的圆形 `＋` 按钮，正文会在当前日志下方向下展开；再次点击 `－` 收起。

新增日志的方法：

1. 将日志正文保存为 UTF-8 编码的 `.txt` 文件，放进 `dist/articles`，例如 `dailylog2.txt`。
2. 在 `dist/index.html` 搜索 `添加日志`，复制一整个 `article class="log-entry"` 区块。
3. 修改 `article` 上的 `data-file="articles/dailylog2.txt"`。
4. 修改日期、`log-entry__preview` 中的预览文字、编号，以及按钮和正文区域中不重复的编号 `003`。
5. 双击 `更新文章数据.cmd`，然后刷新网页。

预览文字直接写在 HTML 的 `log-entry__preview` 中，可以自由修改；完整正文写在对应的 `.txt` 文件中。只修改预览时不需要运行更新工具，修改或新增正文时需要运行。

### 外部链接

在 `dist/index.html` 搜索 `https://thephoenixraincey.top`。正文和页脚各有一处链接，建议一起修改。

### 颜色

在 `dist/style.css` 顶部的 `:root` 中修改：

- `--ink`：文字和主线条
- `--paper`：档案纸张
- `--canvas`：页面外部背景
- `--muted`：次要文字
- `--accent`：火花与强调色

开始界面也使用 `--paper` 米黄色；需要单独修改时搜索 `.entrance`。

### 字体

在 `dist/style.css` 顶部修改 `--display-font`（锋利、紧凑的大标题）、`--body-font`（界面正文）和 `--mono-font`（编号与元数据）。把自定义字体文件放进 `dist/assets` 后，可先用 `@font-face` 引入，再把变量改成对应字体名。

### 动画速度

在 `dist/style.css` 顶部修改：

- `--gesture-time`：手部绕手腕下指与火花节奏
- `--exit-time`：开始界面淡出速度

若明显改变 `--gesture-time`，还需要在 `dist/script.js` 顶部同步调整 `ENTER_SEQUENCE_MS`，让淡出发生在动作结束之后。

## 无障碍与响应式

栏目支持鼠标、触控以及左右方向键切换；页面会在 720px 以下切换为手机布局。系统开启“减少动态效果”时，动画会自动缩短。
