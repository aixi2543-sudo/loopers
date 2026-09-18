import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(toolsDirectory);
const distDirectory = path.join(projectDirectory, 'dist');
const articlesDirectory = path.join(distDirectory, 'articles');
const siteConfig = JSON.parse(fs.readFileSync(path.join(projectDirectory, 'site.config.json'), 'utf8'));

const articles = [
  { slug: 'houniao-yuxiongshi', file: 'houniao-yuxiongshi.txt', title: '候鸟与雄狮', category: 'landscapes', meta: '北京 / 友人 / 夏日逃亡' },
  { slug: 'liulang-matit-ie', file: 'liulang-matit-ie.txt', title: '流浪的马蹄铁', category: 'landscapes', meta: '瑞金至南昌 / 背包客' },
  { slug: 'guaiwu-revised', file: 'guaiwu-revised.txt', title: '怪物的反义词', category: 'thoughts', meta: '电影 / 浑浊的善意' },
  { slug: 'tongsang-huaiju', file: 'tongsang-huaiju.txt', title: '桐桑怀橘', category: 'thoughts', meta: '幻想叙事 / 梦境' },
  { slug: 'kuangwu-zhongyuezhang', file: 'kuangwu-zhongyuezhang.txt', title: '狂舞终乐章', category: 'thoughts', meta: '《爱乐之城》影评' },
  { slug: 'xingmo-tanlang', file: 'xingmo-tanlang.txt', title: '星末贪狼', category: 'thoughts', meta: '角色 / 星辰 / 自我' },
  { slug: 'yongbu-duxing', file: 'yongbu-duxing.txt', title: '永不独行的独行者', category: 'thoughts', meta: '人与人 / 独行' },
  { slug: 'bizou-longshe', file: 'bizou-longshe.txt', title: '笔走龙蛇难留思念夭夭', category: 'thoughts', meta: '书写 / 记忆' },
  { slug: 'piaoran-yunshang', file: 'piaoran-yunshang.txt', title: '飘然云上', category: 'thoughts', meta: '时代 / 诗性' },
  { slug: 'gudu-nahan', file: 'gudu-nahan.txt', title: '孤独呐喊', category: 'thoughts', meta: '孤独 / 思想' },
  { slug: 'fengyu-caihong', file: 'fengyu-caihong.txt', title: '风与彩虹的见证者', category: 'thoughts', meta: '科技 / 旧日 / 理想' },
  { slug: 'sici-xingchen', file: 'sici-xingchen.txt', title: '似此星辰夜非夜', category: 'self', meta: '自省 / 告别' },
  { slug: 'lianyu-zhishe', file: 'lianyu-zhishe.txt', title: '炼狱之涉', category: 'self', meta: '成长 / 理想' },
];

const categories = {
  landscapes: { title: 'LANDSCAPES', label: '游记', description: '走过的地方，和同行的人。' },
  thoughts: { title: 'THOUGHTS', label: '想法', description: '随笔、影评、思想记录与幻想叙事。' },
  self: { title: 'SELF', label: '自述', description: '关于成长、自省与理想。' },
};

function trimSlash(value) {
  return value.replace(/\/+$/, '');
}

function inferredSiteUrl() {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return trimSlash(configured);
  const repository = process.env.GITHUB_REPOSITORY?.split('/');
  if (repository?.length === 2 && !siteConfig.customDomain) return `https://${repository[0]}.github.io/${repository[1]}`;
  return trimSlash(siteConfig.url || '');
}

const siteUrl = inferredSiteUrl();
const absoluteUrl = (route = '') => siteUrl ? `${siteUrl}/${route.replace(/^\//, '')}` : route || './';
const escapeHtml = (value = '') => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function articleDescription(article, text) {
  const compact = text.replace(/\s+/g, ' ').trim();
  return `${article.title}｜${compact.slice(0, 90)}${compact.length > 90 ? '…' : ''}`;
}

function head({ title, description, route, type = 'website', depth = 0, robots = 'index,follow' }) {
  const prefix = '../'.repeat(depth);
  const canonical = siteUrl ? absoluteUrl(route) : './';
  const image = siteUrl ? absoluteUrl('assets/character.png') : `${prefix}assets/character.png`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#e8dfcc">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="效原 · Archive">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="${prefix}style.css">
</head>`;
}

function navigation(depth, current = '') {
  const prefix = '../'.repeat(depth);
  const item = (href, label, key) => `<a${current === key ? ' aria-current="page"' : ''} href="${prefix}${href}">${label}</a>`;
  return `<nav class="site-nav" aria-label="网站导航">
        ${item('', '首页', 'home')}
        ${item('articles/', '文章', 'articles')}
        ${item('categories/', '分类', 'categories')}
        ${item('about/', 'About', 'about')}
      </nav>`;
}

function shell({ title, description, route, depth, current, content, type }) {
  const prefix = '../'.repeat(depth);
  return `${head({ title, description, route, depth, type })}
<body>
  <main class="static-page">
    <header class="static-header">
      <a class="static-header__brand" href="${prefix}">效原 · ARCHIVE</a>
      ${navigation(depth, current)}
    </header>
    ${content}
    <footer class="footer">
      <span>© 2026 XIAOYUAN</span>
      <a href="${prefix}">返回首页</a>
    </footer>
  </main>
</body>
</html>
`;
}

function articleCards(items, depth) {
  const prefix = '../'.repeat(depth);
  return `<div class="article-list">${items.map((article, index) => `
        <a class="article-card" href="${prefix}articles/${article.slug}/">
          <span class="article-card__no">${String(index + 1).padStart(2, '0')}</span>
          <span class="article-card__title">${escapeHtml(article.title)}</span>
          <span class="article-card__meta">${escapeHtml(categories[article.category].label)} / ${escapeHtml(article.meta)}</span>
          <span class="article-card__arrow">↗</span>
        </a>`).join('')}
      </div>`;
}

function prose(text) {
  return text.trim().split(/\r?\n\s*\r?\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, '<br>')}</p>`)
    .join('\n        ');
}

function write(relativePath, contents) {
  const target = path.join(distDirectory, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents, 'utf8');
}

const articleTexts = {};
for (const fileName of fs.readdirSync(articlesDirectory).filter((name) => name.endsWith('.txt')).sort()) {
  articleTexts[`articles/${fileName}`] = fs.readFileSync(path.join(articlesDirectory, fileName), 'utf8');
}
write('articles-data.js', `/* 此文件由 tools/build-site.mjs 自动生成，请勿手动编辑。 */\nwindow.ARTICLE_TEXTS = Object.freeze(${JSON.stringify(articleTexts, null, 2)});\n`);

write('articles/index.html', shell({
  title: '全部文章 · 效原 Archive',
  description: '效原 Archive 的全部文章，包含游记、想法与自述。',
  route: 'articles/', depth: 1, current: 'articles',
  content: `<section class="static-hero"><p class="eyebrow">ALL WRITING / 全部文章</p><h1>ARTICLES</h1><p class="static-hero__intro">风景、思想和关于自己的记录，共 ${articles.length} 篇。</p></section><section class="static-section">${articleCards(articles, 1)}</section>`,
}));

write('categories/index.html', shell({
  title: '分类 · 效原 Archive',
  description: '按游记、想法与自述浏览效原 Archive。',
  route: 'categories/', depth: 1, current: 'categories',
  content: `<section class="static-hero"><p class="eyebrow">INDEX / 分类</p><h1>CATEGORIES</h1></section><section class="static-section"><div class="category-grid">${Object.entries(categories).map(([slug, category]) => `<a class="category-card" href="${slug}/"><span>${articles.filter((article) => article.category === slug).length} ARTICLES</span><strong>${category.title}<br>${category.label}</strong></a>`).join('')}</div></section>`,
}));

for (const [slug, category] of Object.entries(categories)) {
  const items = articles.filter((article) => article.category === slug);
  write(`categories/${slug}/index.html`, shell({
    title: `${category.title} · 效原 Archive`,
    description: category.description,
    route: `categories/${slug}/`, depth: 2, current: 'categories',
    content: `<section class="static-hero"><p class="eyebrow">CATEGORY / ${category.label}</p><h1>${category.title}</h1><p class="static-hero__intro">${category.description}</p></section><section class="static-section">${articleCards(items, 2)}</section>`,
  }));
}

write('about/index.html', shell({
  title: 'About · 效原 Archive',
  description: '关于效原：像体育生的理科生有颗文科生的心。',
  route: 'about/', depth: 1, current: 'about',
  content: `<section class="static-hero"><p class="eyebrow">PROFILE / 关于</p><h1>效原</h1><p class="static-hero__intro">像体育生的理科生有颗文科生的心</p></section><section class="static-section"><h2>SELF</h2>${articleCards(articles.filter((article) => article.category === 'self'), 1)}</section>`,
}));

for (const article of articles) {
  const text = fs.readFileSync(path.join(articlesDirectory, article.file), 'utf8');
  const category = categories[article.category];
  write(`articles/${article.slug}/index.html`, shell({
    title: `${article.title} · 效原 Archive`,
    description: articleDescription(article, text),
    route: `articles/${article.slug}/`, depth: 2, current: 'articles', type: 'article',
    content: `<article class="article-page"><header class="static-hero"><p class="eyebrow">${category.title} / ${category.label}</p><h1>${escapeHtml(article.title)}</h1><p class="static-hero__intro">${escapeHtml(article.meta)}</p></header><div class="article-prose">${prose(text)}<a class="article-back" href="../../categories/${article.category}/">← 返回 ${category.title}</a></div></article>`,
  }));
}

const homeUrl = absoluteUrl('');
write('404.html', `${head({ title: '页面未找到 · 效原 Archive', description: '你访问的页面不存在。', route: '404.html', depth: 0, robots: 'noindex,follow' })}
<body><main class="static-page not-found"><p class="eyebrow">ERROR 404</p><section class="static-hero"><h1>走错了路。</h1><p class="static-hero__intro">这个地址不存在，或内容已经移动。</p><a class="article-back" href="${escapeHtml(homeUrl)}">← 返回首页</a></section></main></body></html>`);

const publicRoutes = ['', 'articles/', 'categories/', 'about/', ...Object.keys(categories).map((slug) => `categories/${slug}/`), ...articles.map((article) => `articles/${article.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicRoutes.map((route) => `  <url><loc>${escapeHtml(absoluteUrl(route))}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('sitemap.xml')}\n`);
write('.nojekyll', '');
if (siteConfig.customDomain) write('CNAME', `${siteConfig.customDomain}\n`);

let home = fs.readFileSync(path.join(distDirectory, 'index.html'), 'utf8');
const homeCanonical = siteUrl ? `${siteUrl}/` : './';
const homeImage = siteUrl ? `${siteUrl}/assets/character.png` : 'assets/character.png';
home = home
  .replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${homeCanonical}">`)
  .replace(/<meta property="og:url" content="[^"]+">/, `<meta property="og:url" content="${homeCanonical}">`)
  .replace(/<meta property="og:image" content="[^"]+">/, `<meta property="og:image" content="${homeImage}">`);
fs.writeFileSync(path.join(distDirectory, 'index.html'), home, 'utf8');

console.log(`V1 build complete: ${articles.length} articles, ${Object.keys(categories).length} categories${siteUrl ? `, base ${siteUrl}` : ', relative local metadata'}.`);
