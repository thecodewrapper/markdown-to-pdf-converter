const DEFAULT_MARKDOWN = `# Welcome to Markdown to PDF

Write in Markdown on the left and see a live preview on the right.

## A calm writing space

Use the toolbar to open and save \`.md\` files, then export a polished **A4 PDF** when you are ready.

> Good documents start with a clear idea and a little whitespace.

\`\`\`javascript
const ready = true;
console.log('Export when ready:', ready);
\`\`\`

- Headings, lists, links, tables, and code blocks
- Keyboard shortcuts for common actions
- Local files only — your content stays on your computer
`;

const editor = document.querySelector('#editor');
const preview = document.querySelector('#preview');
const documentName = document.querySelector('#document-name');
const wordCount = document.querySelector('#word-count');
const status = document.querySelector('#status');
const saveButton = document.querySelector('#save-button');
const openButton = document.querySelector('#open-button');
const exportButton = document.querySelector('#export-button');
const themeButton = document.querySelector('#theme-button');
const templateButton = document.querySelector('#template-button');
const pageBreakSections = document.querySelector('#page-break-sections');
const previewLoading = document.querySelector('#preview-loading');

let currentFilePath = null;
let saveTimer = null;
let renderedHtml = '';

async function render() {
  renderedHtml = marked.parse(editor.value);
  await paginatePreview(renderedHtml);
  const words = editor.value.trim() ? editor.value.trim().split(/\s+/).length : 0;
  wordCount.textContent = `${words.toLocaleString()} words`;
  status.textContent = 'Unsaved changes';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    status.textContent = 'Ready to export';
  }, 1200);
}

async function paginatePreview(html) {
  const source = document.createElement('div');
  source.innerHTML = html;
  const blocks = Array.from(source.children);

  preview.replaceChildren();
  preview.classList.toggle('page-break-sections', pageBreakSections.checked);

  let page = createPreviewPage();
  preview.append(page);

  for (const [index, block] of blocks.entries()) {
    const currentPageContent = page.querySelector('.paper-content');
    const startsSection = pageBreakSections.checked && block.tagName === 'H1' && currentPageContent.children.length > 0;
    if (startsSection) {
      page = createPreviewPage();
      preview.append(page);
    }

    const currentContent = page.querySelector('.paper-content');
    currentContent.append(block);
    if (currentContent.scrollHeight > currentContent.clientHeight && currentContent.children.length > 1) {
      currentContent.removeChild(block);
      page = createPreviewPage();
      preview.append(page);
      page.querySelector('.paper-content').append(block);
    }
    if (index % 8 === 0) await waitForPaint();
  }
}

function createPreviewPage() {
  const page = document.createElement('article');
  page.className = 'paper-page';
  page.innerHTML = '<div class="paper-content"></div>';
  return page;
}

async function openFile() {
  setPreviewLoading(true);
  await waitForPaint();
  try {
    const result = await window.desktop.openFile();
    if (!result) return;
    editor.value = result.content;
    currentFilePath = result.filePath;
    documentName.textContent = fileName(result.filePath);
    await render();
    status.textContent = 'Opened successfully';
  } catch (error) {
    status.textContent = `Open failed: ${error.message}`;
  } finally {
    setPreviewLoading(false);
  }
}

function setPreviewLoading(isLoading) {
  previewLoading.hidden = !isLoading;
  preview.setAttribute('aria-busy', String(isLoading));
}

function waitForPaint() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

async function saveFile() {
  const filePath = await window.desktop.saveFile({ filePath: currentFilePath, content: editor.value });
  if (!filePath) return;
  currentFilePath = filePath;
  documentName.textContent = fileName(filePath);
  status.textContent = 'Saved just now';
}

async function exportPdf() {
  exportButton.disabled = true;
  status.textContent = 'Preparing PDF…';
  try {
    const path = await window.desktop.exportPdf({
      html: renderedHtml,
      title: documentName.textContent.replace(/\.[^.]+$/, ''),
      pageBreakSections: pageBreakSections.checked
    });
    if (path) status.textContent = 'PDF exported successfully';
  } catch (error) {
    status.textContent = `Export failed: ${error.message}`;
  } finally {
    exportButton.disabled = false;
  }
}

function fileName(filePath) {
  return filePath.split(/[\\/]/).pop() || 'Untitled.md';
}

editor.addEventListener('input', () => {
  void render();
});
pageBreakSections.addEventListener('change', async () => {
  setPreviewLoading(true);
  pageBreakSections.disabled = true;
  await waitForPaint();
  try {
    await paginatePreview(renderedHtml);
  } finally {
    pageBreakSections.disabled = false;
    setPreviewLoading(false);
  }
});
openButton.addEventListener('click', openFile);
saveButton.addEventListener('click', saveFile);
exportButton.addEventListener('click', exportPdf);
themeButton.addEventListener('click', () => document.body.classList.toggle('dark'));
templateButton.addEventListener('click', () => {
  editor.value = DEFAULT_MARKDOWN;
  currentFilePath = null;
  documentName.textContent = 'Untitled.md';
  void render();
});

window.desktop.onMenuAction((action) => {
  if (action === 'open') openFile();
  if (action === 'save') saveFile();
  if (action === 'export') exportPdf();
});

window.desktop.onExportComplete(() => {
  status.textContent = 'PDF exported successfully';
});

editor.value = DEFAULT_MARKDOWN;
void render();
