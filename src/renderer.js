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

let currentFilePath = null;
let saveTimer = null;

function render() {
  preview.innerHTML = marked.parse(editor.value);
  preview.classList.toggle('page-break-sections', pageBreakSections.checked);
  const words = editor.value.trim() ? editor.value.trim().split(/\s+/).length : 0;
  wordCount.textContent = `${words.toLocaleString()} words`;
  status.textContent = 'Unsaved changes';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    status.textContent = 'Ready to export';
  }, 1200);
}

async function openFile() {
  try {
    const result = await window.desktop.openFile();
    if (!result) return;
    editor.value = result.content;
    currentFilePath = result.filePath;
    documentName.textContent = fileName(result.filePath);
    render();
    status.textContent = 'Opened successfully';
  } catch (error) {
    status.textContent = `Open failed: ${error.message}`;
  }
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
      html: preview.innerHTML,
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

editor.addEventListener('input', render);
pageBreakSections.addEventListener('change', () => {
  preview.classList.toggle('page-break-sections', pageBreakSections.checked);
});
openButton.addEventListener('click', openFile);
saveButton.addEventListener('click', saveFile);
exportButton.addEventListener('click', exportPdf);
themeButton.addEventListener('click', () => document.body.classList.toggle('dark'));
templateButton.addEventListener('click', () => {
  editor.value = DEFAULT_MARKDOWN;
  currentFilePath = null;
  documentName.textContent = 'Untitled.md';
  render();
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
render();
