import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(toolsDirectory);
const articlesDirectory = path.join(projectDirectory, 'dist', 'articles');
const outputFile = path.join(projectDirectory, 'dist', 'articles-data.js');

const articleFiles = fs.readdirSync(articlesDirectory)
  .filter((fileName) => fileName.toLowerCase().endsWith('.txt'))
  .sort((left, right) => left.localeCompare(right, 'zh-CN'));

const articleTexts = {};

for (const fileName of articleFiles) {
  const articlePath = path.join(articlesDirectory, fileName);
  articleTexts[`articles/${fileName}`] = fs.readFileSync(articlePath, 'utf8');
}

const generatedFile = [
  '/* 此文件由 tools/build-articles.mjs 自动生成，请勿手动编辑。 */',
  `window.ARTICLE_TEXTS = Object.freeze(${JSON.stringify(articleTexts, null, 2)});`,
  '',
].join('\n');

fs.writeFileSync(outputFile, generatedFile, 'utf8');
console.log(`已嵌入 ${articleFiles.length} 篇文章：dist/articles-data.js`);
