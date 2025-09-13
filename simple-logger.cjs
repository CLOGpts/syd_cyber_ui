// Simple Logger - Alternativa a Playwright senza dipendenze di sistema
// Inserisce uno script nel tuo index.html per catturare i log

const fs = require('fs');
const path = require('path');

// Crea il codice da iniettare nell'app
const loggerScript = `
<script>
// Real-time logger injected
(function() {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  const sendToLogger = (type, args) => {
    const message = Array.from(args).map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    // Invia al server locale
    fetch('http://localhost:9999/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        message,
        timestamp: new Date().toISOString(),
        url: window.location.href
      })
    }).catch(() => {}); // Ignora errori di connessione
  };
  
  console.log = function(...args) {
    originalLog.apply(console, args);
    sendToLogger('log', args);
  };
  
  console.warn = function(...args) {
    originalWarn.apply(console, args);
    sendToLogger('warn', args);
  };
  
  console.error = function(...args) {
    originalError.apply(console, args);
    sendToLogger('error', args);
  };
  
  window.addEventListener('error', (e) => {
    sendToLogger('error', [e.message, e.filename, e.lineno]);
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    sendToLogger('error', ['Unhandled Promise Rejection:', e.reason]);
  });
})();
</script>
`;

// Leggi index.html
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Controlla se lo script è già stato iniettato
if (!indexContent.includes('Real-time logger injected')) {
  // Inietta prima della chiusura di </head>
  indexContent = indexContent.replace('</head>', loggerScript + '</head>');
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Logger script injected into index.html');
} else {
  console.log('ℹ️ Logger script already present in index.html');
}

// Crea server per ricevere i log
const http = require('http');
const logStream = fs.createWriteStream('browser.log', { flags: 'a' });

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const logLine = `[${data.timestamp}] [${data.type}] ${data.message}`;
        console.log(logLine);
        logStream.write(logLine + '\n');
      } catch (e) {
        console.error('Failed to parse log:', e);
      }
      res.writeHead(200);
      res.end('OK');
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(9999, () => {
  console.log('🎯 Logger server running on http://localhost:9999');
  console.log('📝 Logs will be saved to browser.log');
  console.log('👀 Watching for console outputs from your app...');
  console.log('\nPress Ctrl+C to stop\n');
});