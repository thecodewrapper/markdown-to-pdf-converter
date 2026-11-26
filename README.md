# Markdown to PDF

A lightweight desktop Markdown editor with a live preview and one-click PDF export.

## Build the Windows executable

Prerequisites: [Node.js](https://nodejs.org/) 20 or newer and npm.

```powershell
git clone https://github.com/thecodewrapper/markdown-to-pdf-converter.git
cd markdown-to-pdf-converter
npm install
npm run build
```

The unpacked executable is created at:

```text
dist\win-unpacked\Markdown to PDF.exe
```

## Run locally

```powershell
npm install
npm start
```

## Features

- Live GitHub-flavored Markdown preview
- Open and save `.md`, `.markdown`, and `.txt` files
- A4 PDF export using Electron's native print engine
- Light/dark workspace themes
- Keyboard shortcuts: `Ctrl+O`, `Ctrl+S`, and `Ctrl+E`
