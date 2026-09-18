/* ================================================================
   交互设置
   入场动作的速度主要在 style.css 顶部：
   --gesture-time 控制下指动作，--exit-time 控制淡出。
   如果修改了 --gesture-time，请同步调整下面的 ENTER_SEQUENCE_MS。
   ================================================================ */
const ENTER_SEQUENCE_MS = 900;

const entrance = document.querySelector('#entrance');
const enterButton = document.querySelector('#enterButton');
const archive = document.querySelector('#archive');
const replayButton = document.querySelector('#replayButton');
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const articleCards = [...document.querySelectorAll('.article-card')];
const logEntries = [...document.querySelectorAll('.log-entry[data-file]')];
const reader = document.querySelector('#reader');
const readerClose = document.querySelector('#readerClose');
const readerTitle = document.querySelector('#readerTitle');
const readerCategory = document.querySelector('#readerCategory');
const readerBody = document.querySelector('#readerBody');

let isEntering = false;

async function readTextFile(file) {
  const embeddedText = window.ARTICLE_TEXTS?.[file];
  if (typeof embeddedText === 'string') return embeddedText;

  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    return null;
  }
}

function enterSite() {
  if (isEntering) return;
  isEntering = true;
  entrance.classList.add('is-animating');

  window.setTimeout(() => {
    entrance.classList.add('is-leaving');
    archive.classList.add('is-visible');
    archive.setAttribute('aria-hidden', 'false');
    document.body.classList.remove('is-locked');
  }, ENTER_SEQUENCE_MS);

  window.setTimeout(() => {
    entrance.setAttribute('aria-hidden', 'true');
    isEntering = false;
  }, ENTER_SEQUENCE_MS + 600);
}

function replayIntro() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  entrance.classList.remove('is-leaving', 'is-animating');
  entrance.removeAttribute('aria-hidden');
  archive.classList.remove('is-visible');
  archive.setAttribute('aria-hidden', 'true');
  document.body.classList.add('is-locked');
  enterButton.focus({ preventScroll: true });
}

function activateTab(nextTab, moveFocus = false) {
  const panelId = `panel-${nextTab.dataset.tab}`;

  tabs.forEach((tab) => {
    const isCurrent = tab === nextTab;
    tab.classList.toggle('is-active', isCurrent);
    tab.setAttribute('aria-selected', String(isCurrent));
    tab.tabIndex = isCurrent ? 0 : -1;
  });

  panels.forEach((panel) => {
    const isCurrent = panel.id === panelId;
    panel.hidden = !isCurrent;
    panel.classList.toggle('is-active', isCurrent);
  });

  if (moveFocus) nextTab.focus();
}

async function openArticle(card) {
  const file = card.dataset.file;
  const title = card.dataset.title;
  const panelId = card.closest('[role="tabpanel"]')?.id;

  readerTitle.textContent = title;
  readerCategory.textContent = panelId === 'panel-landscapes'
    ? 'LANDSCAPES / 游记'
    : panelId === 'panel-self'
      ? 'SELF / 自述'
      : 'THOUGHTS / 想法';
  readerBody.textContent = 'READING FROM ARCHIVE…';
  readerBody.classList.add('is-loading');
  reader.showModal();
  document.body.classList.add('is-reading');

  const text = await readTextFile(file);
  readerBody.textContent = text ?? '文章尚未嵌入阅读器。添加或修改文章后，请运行“更新文章数据.cmd”，再刷新页面。';
  readerBody.classList.remove('is-loading');
}

async function toggleLogEntry(entry) {
  const button = entry.querySelector('.log-entry__toggle');
  const drawer = entry.querySelector('.log-entry__drawer');
  const body = entry.querySelector('.log-entry__body');
  const number = entry.querySelector('.log-entry__no')?.textContent.trim() || '';
  const isOpening = !entry.classList.contains('is-expanded');

  if (isOpening && !entry.dataset.loaded) {
    body.textContent = 'READING FROM ARCHIVE…';
    body.classList.add('is-loading');
    const text = await readTextFile(entry.dataset.file);
    body.textContent = text ?? '日志正文尚未嵌入。请运行“更新文章数据.cmd”后刷新页面。';
    body.classList.remove('is-loading');
    entry.dataset.loaded = 'true';
  }

  entry.classList.toggle('is-expanded', isOpening);
  button.setAttribute('aria-expanded', String(isOpening));
  button.setAttribute('aria-label', `${isOpening ? '收起' : '展开'}第 ${number} 条日志正文`);
  button.querySelector('[aria-hidden="true"]').textContent = isOpening ? '－' : '＋';
  drawer.setAttribute('aria-hidden', String(!isOpening));
}

function closeReader() {
  reader.close();
  document.body.classList.remove('is-reading');
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    activateTab(tabs[nextIndex], true);
  });
});

enterButton.addEventListener('click', enterSite);
replayButton.addEventListener('click', replayIntro);
articleCards.forEach((card) => card.addEventListener('click', () => openArticle(card)));
logEntries.forEach((entry) => {
  entry.querySelector('.log-entry__toggle')?.addEventListener('click', () => toggleLogEntry(entry));
});
readerClose.addEventListener('click', closeReader);
reader.addEventListener('click', (event) => {
  if (event.target === reader) closeReader();
});
reader.addEventListener('close', () => document.body.classList.remove('is-reading'));

activateTab(tabs[0]);
