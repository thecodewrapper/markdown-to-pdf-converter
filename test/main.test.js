const test = require('node:test');
const assert = require('node:assert/strict');
const { createPrintDocument, escapeHtml } = require('../src/print-utils');

test('escapes PDF document titles', () => {
  assert.equal(escapeHtml('<notes & ideas>'), '&lt;notes &amp; ideas&gt;');
});

test('creates a printable A4 document around rendered markdown', () => {
  const document = createPrintDocument('<h1>Hello</h1>', 'Notes');
  assert.match(document, /@page \{ size: A4/);
  assert.match(document, /<title>Notes<\/title>/);
  assert.match(document, /<h1>Hello<\/h1>/);
});

test('can start major sections on new pages', () => {
  const document = createPrintDocument('<h1>Introduction</h1><h1>Details</h1>', 'Notes', { pageBreakSections: true });
  assert.match(document, /class="page-break-sections"/);
  assert.match(document, /page-break-before: always/);
});
