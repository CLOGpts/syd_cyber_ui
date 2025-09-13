#!/bin/bash

echo "🔄 Riavvio del server..."

# Kill tutti i processi Node e npm
echo "⏹️  Fermando processi esistenti..."
killall -9 node 2>/dev/null
killall -9 npm 2>/dev/null
sleep 1

# Pulisci cache se necessario
echo "🧹 Pulizia cache..."
rm -rf .vite 2>/dev/null

# Avvia il server
echo "🚀 Avvio server su http://localhost:5173/"
npm run dev
