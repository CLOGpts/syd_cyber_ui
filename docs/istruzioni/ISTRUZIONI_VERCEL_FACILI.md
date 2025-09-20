# 📚 GUIDA PASSO-PASSO DEPLOY SU VERCEL
## Per chi non è esperto - Seguimi passo dopo passo!

---

# PARTE 1: PREPARAZIONE (5 minuti)

## 1️⃣ VAI SU VERCEL
- Apri il browser
- Vai su: **https://vercel.com**
- Clicca il bottone **"Sign Up"** (in alto a destra)

## 2️⃣ REGISTRATI CON GITHUB
- Clicca su **"Continue with GitHub"**
- Metti le tue credenziali GitHub
- Autorizza Vercel quando te lo chiede

---

# PARTE 2: PRIMO DEPLOY (DARIO) - 5 minuti

## 3️⃣ IMPORTA IL PROGETTO
Una volta loggato:
1. Clicca **"Add New..."** → **"Project"**
2. Vedrai la lista dei tuoi repository GitHub
3. Trova **"syd_cyber_ui"** (o come si chiama il tuo)
4. Clicca **"Import"**

## 4️⃣ CONFIGURA IL PROGETTO
Nella schermata di configurazione:

### Nome Progetto:
- Dove dice "Project Name" scrivi: **`syd-cyber-dario`**

### Framework Preset:
- Dovrebbe auto-detectare **"Vite"** (lascialo così)

### Build Settings:
- **Build Command:** `npm run build` (dovrebbe essere già così)
- **Output Directory:** `dist` (dovrebbe essere già così)
- **Install Command:** lascia vuoto (usa default)

## 5️⃣ AGGIUNGI VARIABILE D'AMBIENTE (IMPORTANTE!)
Sempre nella stessa pagina:
1. Clicca su **"Environment Variables"**
2. Aggiungi questa variabile:
   - **Name:** `VITE_RISK_API_BASE`
   - **Value:** `https://web-production-3373.up.railway.app`
3. Clicca **"Add"**

## 6️⃣ DEPLOY!
- Clicca il grande bottone **"Deploy"**
- Aspetta 2-3 minuti (vedrai una barra di progresso)
- Quando finisce, clicca **"Continue to Dashboard"**

## 7️⃣ IL TUO PRIMO SITO È LIVE!
- Vedrai l'URL tipo: **`https://syd-cyber-dario.vercel.app`**
- Clicca per verificare che funzioni!

---

# PARTE 3: SECONDO DEPLOY (MARCELLO) - 3 minuti

## 8️⃣ TORNA ALLA DASHBOARD
- Clicca su **"Vercel"** logo in alto a sinistra
- Ti porta alla dashboard principale

## 9️⃣ CREA SECONDO PROGETTO
1. Clicca di nuovo **"Add New..."** → **"Project"**
2. Importa di nuovo **"syd_cyber_ui"** (SÌ, lo stesso!)
3. Questa volta come nome metti: **`syd-cyber-marcello`**

## 🔟 RIPETI CONFIGURAZIONE
- Stesse impostazioni di prima
- **RICORDA**: Aggiungi la variabile d'ambiente:
  - **Name:** `VITE_RISK_API_BASE`
  - **Value:** `https://web-production-3373.up.railway.app`
- Clicca **"Deploy"**

---

# PARTE 4: TERZO DEPLOY (CLAUDIO) - 3 minuti

## 1️⃣1️⃣ STESSO PROCESSO
- Torna alla dashboard
- **"Add New..."** → **"Project"**
- Importa ancora **"syd_cyber_ui"**
- Nome: **`syd-cyber-claudio`**
- Stessa variabile d'ambiente
- **"Deploy"**

---

# ✅ FATTO! HAI 3 SITI LIVE!

## I tuoi URL finali:
1. **https://syd-cyber-dario.vercel.app**
2. **https://syd-cyber-marcello.vercel.app**
3. **https://syd-cyber-claudio.vercel.app**

---

# 🔧 TROUBLESHOOTING (Se qualcosa non va)

## ❌ "Repository not found"
- Vai su GitHub
- Assicurati che il repository sia pubblico
- O dai permessi a Vercel dalle impostazioni GitHub

## ❌ "Build failed"
- Controlla di aver messo la variabile d'ambiente
- Il nome deve essere ESATTO: `VITE_RISK_API_BASE`

## ❌ "Page not found" dopo deploy
- Aspetta 1-2 minuti in più
- Fai refresh con Ctrl+F5

## ❌ Il sito si vede ma non funziona
- Verifica che il backend Railway sia attivo
- Controlla: https://web-production-3373.up.railway.app/health
- Deve rispondere {"status":"healthy"}

---

# 🎯 AGGIORNAMENTI FUTURI

Quando modifichi il codice:
```bash
git add .
git commit -m "modifiche"
git push
```

**TUTTI E 3 I SITI SI AGGIORNANO DA SOLI!** ✨

---

# 📞 SUPPORTO

Se hai problemi:
1. **Screenshot dell'errore**
2. **A che punto sei bloccato**
3. **Cosa dice esattamente Vercel**

---

# 💡 TIPS FINALI

1. **Salva le password**: Vercel ti darà una password, salvala!
2. **Bookmark**: Salva nei preferiti la dashboard Vercel
3. **Test subito**: Appena deploy finito, testa login e funzioni base
4. **Mobile**: Prova anche da cellulare per sicurezza

---

# 🚀 TEMPI TOTALI

- **Registrazione**: 2 minuti
- **Primo deploy**: 5 minuti
- **Secondo deploy**: 3 minuti
- **Terzo deploy**: 3 minuti
- **TOTALE**: ~15 minuti per tutto!

---

# ✨ RISULTATO FINALE

Domani potrai dire:
> "Ogni consulente ha il suo ambiente cloud dedicato,
> accessibile da qualsiasi dispositivo,
> con aggiornamenti automatici in tempo reale"

**FAI UN FIGURONE GARANTITO!** 🎉