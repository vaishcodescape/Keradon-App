const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    },
  });

  const isDev = process.env.NODE_ENV === 'development';

  const startURL = isDev
    ? 'http://localhost:3000'
    : url.format({
        pathname: path.join(__dirname, 'out/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  win.loadURL(startURL);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
}); 