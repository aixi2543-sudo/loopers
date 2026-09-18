import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(projectDirectory, 'dist');
const errors = [];
const htmlFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith('.html')) htmlFiles.push(fullPath);
  }
}

walk(dist);

for (const file of htmlFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(dist, file);
  for (const required of ['<title>', 'name="description"', 'rel="canonical"', 'property="og:title"', 'property="og:description"']) {
    if (!source.includes(required)) errors.push(`${relative}: missing ${required}`);
  }
  if (/localhost|file:\/\/|[A-Z]:\\/.test(source)) errors.push(`${relative}: local-only reference found`);

  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|data:|#|mailto:)/.test(reference) || reference === '') continue;
    const clean = reference.split(/[?#]/)[0];
    let target = path.resolve(path.dirname(file), clean);
    if (clean.endsWith('/')) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) errors.push(`${relative}: broken reference ${reference}`);
  }
}

for (const file of ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '.nojekyll', 'CNAME']) {
  if (!fs.existsSync(path.join(dist, file))) errors.push(`missing dist/${file}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Site check passed: ${htmlFiles.length} HTML pages, no missing required metadata or local-only references.`);
