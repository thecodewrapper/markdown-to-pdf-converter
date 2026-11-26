function createPrintDocument(html, title, { pageBreakSections = false } = {}) {
  const documentClass = pageBreakSections ? ' class="page-break-sections"' : '';
  return `<!doctype html>
    <html><head><meta charset="utf-8"><title>${escapeHtml(title || 'Markdown document')}</title>
    <style>
      @page { size: A4; margin: 21mm 19mm 22mm; }
      body { color: #252735; font: 10.8pt/1.7 "Segoe UI", Arial, sans-serif; }
      h1, h2, h3, h4 { color: #171925; line-height: 1.2; break-after: avoid; }
      h1 { margin: 0 0 .65em; padding-bottom: .35em; border-bottom: 2px solid #6c63ff; font-size: 28pt; letter-spacing: -.025em; }
      h2 { margin: 1.8em 0 .45em; font-size: 19pt; letter-spacing: -.015em; }
      h3 { margin: 1.4em 0 .4em; font-size: 14pt; }
      h4 { margin: 1.2em 0 .35em; font-size: 11.5pt; }
      p, ul, ol, blockquote, pre, table { margin: .85em 0; }
      ul, ol { padding-left: 1.5em; }
      blockquote { border-left: 4px solid #6c63ff; padding: 3px 16px; color: #626775; margin-left: 0; background: #f7f7fb; }
      code { background: #f0f1f6; padding: 2px 5px; border-radius: 4px; font-size: .9em; }
      pre { background: #20232d; color: #f7f8fb; padding: 16px 18px; border-radius: 8px; overflow-wrap: break-word; line-height: 1.55; }
      pre code { background: none; padding: 0; }
      img { max-width: 100%; border-radius: 6px; } a { color: #5148d7; }
      table { border-collapse: separate; border-spacing: 0; width: 100%; overflow: hidden; border: 1px solid #dfe1e8; border-radius: 6px; }
      th, td { border-bottom: 1px solid #dfe1e8; padding: 8px 10px; text-align: left; }
      th { background: #f0f1f6; font-weight: 700; } tr:last-child td { border-bottom: 0; }
      hr { border: 0; border-top: 1px solid #dfe1e8; margin: 2em 0; }
      pre, blockquote, table, img { break-inside: avoid; }
      .page-break-sections h1:not(:first-of-type) { break-before: page; page-break-before: always; }
    </style></head><body${documentClass}>${html}</body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
}

module.exports = { createPrintDocument, escapeHtml };
