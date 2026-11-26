const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { createPrintDocument } = require('./print-utils');

const isMac = process.platform === 'darwin';

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1050,
    minHeight: 680,
    backgroundColor: '#f7f8fb',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  window.loadFile(path.join(__dirname, 'index.html'));
  window.once('ready-to-show', () => window.show());
  return window;
}

function createMenu(window) {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Markdown…',
          accelerator: 'CmdOrCtrl+O',
          click: () => window.webContents.send('menu:open')
        },
        {
          label: 'Save Markdown…',
          accelerator: 'CmdOrCtrl+S',
          click: () => window.webContents.send('menu:save')
        },
        { type: 'separator' },
        {
          label: 'Export PDF…',
          accelerator: 'CmdOrCtrl+E',
          click: () => window.webContents.send('menu:export')
        },
        { type: 'separator' },
        isMac ? { role: 'quit' } : { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }]
    },
    {
      label: 'View',
      submenu: [{ role: 'reload' }, { role: 'toggledevtools' }, { type: 'separator' }, { role: 'resetzoom' }, { role: 'zoomin' }, { role: 'zoomout' }]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle('file:open', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
  });

  if (result.canceled || !result.filePaths[0]) return null;
  const filePath = result.filePaths[0];
  return { filePath, content: await fs.readFile(filePath, 'utf8') };
});

ipcMain.handle('file:save', async (_event, { filePath, content }) => {
  let destination = filePath;
  if (!destination) {
    const result = await dialog.showSaveDialog({
      defaultPath: 'document.md',
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    });
    if (result.canceled || !result.filePath) return null;
    destination = result.filePath;
  }

  await fs.writeFile(destination, content, 'utf8');
  return destination;
});

ipcMain.handle('pdf:export', async (event, { html, title, pageBreakSections }) => {
  const result = await dialog.showSaveDialog({
    defaultPath: `${title || 'document'}.pdf`,
    filters: [{ name: 'PDF document', extensions: ['pdf'] }]
  });
  if (result.canceled || !result.filePath) return null;

  const sourceWindow = BrowserWindow.fromWebContents(event.sender);
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: { contextIsolation: true, sandbox: true }
  });

  try {
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(createPrintDocument(html, title, { pageBreakSections }))}`);
    const pdf = await printWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { marginType: 'default' }
    });
    await fs.writeFile(result.filePath, pdf);
    if (sourceWindow && !sourceWindow.isDestroyed()) sourceWindow.webContents.send('pdf:complete', result.filePath);
    return result.filePath;
  } finally {
    printWindow.destroy();
  }
});

app.whenReady().then(() => {
  const window = createWindow();
  createMenu(window);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});
