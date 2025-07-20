const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Security first
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('index.html');
  win.webContents.openDevTools(); // Enable dev tools for debugging
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function showSpinner() {
  document.getElementById('spinner').style.display = 'block';
}
function hideSpinner() {
  document.getElementById('spinner').style.display = 'none';
}
async function updatePrice() {
  showSpinner();
  try {
    // ...existing code...
    document.getElementById('price').textContent = `Bitcoin Price: $${price}`;
  } catch (err) {
    document.getElementById('price').textContent = 'Error loading price.';
  }
  hideSpinner();
}