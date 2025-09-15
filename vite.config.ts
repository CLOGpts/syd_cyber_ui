import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CONFIGURAZIONE SPECIALE PER WSL + WINDOWS
// Questo risolve i problemi di HMR su WSL
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Ascolta su tutti gli indirizzi
    port: 5175,
    strictPort: true,
    watch: {
      // CRITICO per WSL: usa polling invece di eventi nativi
      usePolling: true,
      interval: 1000, // Controlla ogni secondo
      // Ignora node_modules per performance
      ignored: ['**/node_modules/**']
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5175,
      timeout: 5000
    }
  },
  // Forza rebuild quando necessario
  optimizeDeps: {
    exclude: ['lucide-react'], // Evita problemi con icone
    force: true
  },
  // Clear screen ogni volta
  clearScreen: true
})