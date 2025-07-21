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
let lastPrice = 0;
function updateKnotColor(newPrice) {
  if (newPrice > lastPrice) {
    knot.material.color.set(0x4CAF50); // Green for up
  } else if (newPrice < lastPrice) {
    knot.material.color.set(0xF44336); // Red for down
  } else {
    knot.material.color.set(0x7E9AFF); // Default
  }
  lastPrice = newPrice;
}
async function updatePrice() {
  showSpinner();
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const data = await res.json();
    const price = data.bitcoin.usd;
    document.getElementById('price').textContent = `Bitcoin Price: $${price}`;
    updateKnotColor(price);
  } catch (err) {
    document.getElementById('price').textContent = 'Error loading price.';
  }
  hideSpinner();
}

document.querySelector('.connect-btn').addEventListener('click', () => {
  document.getElementById('wallet-modal').style.display = 'flex';
});
document.getElementById('close-wallet-modal').addEventListener('click', () => {
  document.getElementById('wallet-modal').style.display = 'none';
});
document.getElementById('metamask-btn').addEventListener('click', () => {
  document.getElementById('wallet-status').textContent = 'Connected: MetaMask (mock)';
  document.getElementById('wallet-modal').style.display = 'none';
});
document.getElementById('walletconnect-btn').addEventListener('click', () => {
  document.getElementById('wallet-status').textContent = 'Connected: WalletConnect (mock)';
  document.getElementById('wallet-modal').style.display = 'none';
});
document.getElementById('trade-tab').addEventListener('click', () => {
  document.getElementById('trade-section').style.display = 'block';
  document.getElementById('stats-section').style.display = 'none';
  document.getElementById('trade-tab').classList.add('active');
  document.getElementById('stats-tab').classList.remove('active');
});
document.getElementById('stats-tab').addEventListener('click', () => {
  document.getElementById('trade-section').style.display = 'none';
  document.getElementById('stats-section').style.display = 'block';
  document.getElementById('stats-tab').classList.add('active');
  document.getElementById('trade-tab').classList.remove('active');
  loadPriceHistory();
});
async function loadPriceHistory() {
  const chart = document.getElementById('price-chart');
  const ctx = chart.getContext('2d');
  document.getElementById('stats-error').textContent = '';
  ctx.clearRect(0, 0, chart.width, chart.height);
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7');
    const data = await res.json();
    const prices = data.prices.map(p => p[1]);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    ctx.beginPath();
    prices.forEach((price, i) => {
      const x = (i / prices.length) * chart.width;
      const y = chart.height - ((price - min) / (max - min)) * chart.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#7E9AFF';
    ctx.lineWidth = 3;
    ctx.stroke();
  } catch (err) {
    document.getElementById('stats-error').textContent = 'Error loading price history.';
  }
}
document.getElementById('buy-btn').addEventListener('click', () => {
  const price = document.getElementById('price').textContent.replace(/[^\d.]/g, '');
  const log = document.getElementById('trade-log');
  log.textContent = `Bought 1 BTC at $${price} (mock)`;
});
document.getElementById('sell-btn').addEventListener('click', () => {
  const price = document.getElementById('price').textContent.replace(/[^\d.]/g, '');
  const log = document.getElementById('trade-log');
  log.textContent = `Sold 1 BTC at $${price} (mock)`;
});
let debugMode = false;
document.getElementById('debug-btn').addEventListener('click', () => {
  debugMode = !debugMode;
  document.getElementById('debug-btn').textContent = `Debug: ${debugMode ? 'On' : 'Off'}`;
  if (!debugMode) document.getElementById('debug-info').textContent = '';
});
function updateDebugInfo(frame, price, lastFetchTime, lastError) {
  if (debugMode) {
    document.getElementById('debug-info').textContent = `Frame: ${frame} | Price: $${price} | Last Fetch: ${lastFetchTime} | Error: ${lastError}`;
  }
}