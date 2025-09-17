# 🎓 PERCORSO FORMATIVO - Capire SYD Cyber

## Ciao! Sono la tua guida per capire TUTTO di SYD Cyber

Ti spiego il sistema come se fossi il mio alunno preferito. Partiamo dalle basi e arriviamo a farti padroneggiare tutto!

---

## 📚 LEZIONE 1: LA GRANDE FOTO

### Cos'è SYD Cyber?
Immagina SYD come un **consulente digitale super intelligente** che aiuta le aziende a capire i loro rischi informatici.

### I 3 Pilastri del Sistema:
1. **Frontend** (La Faccia) - Quello che vedi tu
2. **Backend** (Il Cervello) - Dove avviene la magia
3. **AI** (L'Anima) - Gemini di Google che rende tutto intelligente

---

## 🏗️ LEZIONE 2: ARCHITETTURA (Come è costruito)

```
TU (Utente)
     ↓
[BROWSER] - Chrome/Edge
     ↓
[FRONTEND] - React (Vercel)
     ↓
[BACKEND] - Python (Railway)
     ↓
[AI] - Gemini API
```

### Tradotto in italiano:
1. **Tu** apri il browser
2. **Vercel** ti mostra la pagina bella (frontend React)
3. Quando clicchi qualcosa, **React** chiama **Railway** (backend Python)
4. **Python** chiede a **Gemini** di ragionare
5. La risposta torna indietro fino a te

---

## 💻 LEZIONE 3: IL FRONTEND (Quello che vedi)

### Cartella: `/ui/src/`

#### I Componenti Principali:
```
src/
├── components/       # I "mattoncini" dell'interfaccia
│   ├── chat/        # La chat con SYD
│   ├── sidebar/     # Il pannello laterale
│   ├── risk/        # Le card dei rischi
│   └── sydAgent/    # Il cervellone AI
├── hooks/           # "Trucchi" React per funzionalità
├── store/           # La memoria del sistema
└── data/            # I dati e le conoscenze
```

### File Chiave da Capire:

#### 1. `App.tsx` - Il Direttore d'Orchestra
```typescript
// Questo è il capo di tutto
function App() {
  // Decide se mostrare login
  // Gestisce tema dark/light
  // Coordina tutti i componenti
}
```

#### 2. `ChatWindow.tsx` - Dove Parli con SYD
```typescript
// Gestisce:
// - I tuoi messaggi
// - Le risposte di SYD
// - L'upload dei file
// - I comandi speciali (es: /risk)
```

#### 3. `SydAgentPanel.tsx` - L'Assistente AI
```typescript
// Il pannello con il cervello
// - Sa tutto su NIS2
// - Conosce 100+ certificazioni
// - Ti guida passo passo
```

---

## 🐍 LEZIONE 4: IL BACKEND (Il cervello)

### Cartella: `/Celerya_Cyber_Ateco/`

#### File Principale: `main.py`
```python
# FastAPI - Il server web velocissimo

@app.get("/health")
# Dice "sto bene!" quando chiedi

@app.post("/ateco-lookup")
# Riceve un codice ATECO
# Chiede a Gemini cosa significa
# Ti dice il settore dell'azienda

@app.get("/risk/categories")
# Ti dà le 7 categorie di rischio

@app.post("/risk/events/{category}")
# Ti mostra tutti i rischi di una categoria

@app.post("/risk/calculate")
# Calcola il tuo punteggio di rischio
```

### Come Funziona un Endpoint:
```python
# ESEMPIO: Quando chiedi i rischi
@app.get("/risk/categories")
async def get_categories():
    # 1. Legge l'Excel con i 191 rischi
    # 2. Li organizza in 7 categorie
    # 3. Te li manda in JSON
    return {"categories": [...]}
```

---

## 🧠 LEZIONE 5: L'INTELLIGENZA ARTIFICIALE

### Gemini - Il Cervello di SYD

#### Quando Interviene:
1. **Upload Visura** → Gemini estrae i dati
2. **Codice ATECO** → Gemini spiega il settore
3. **Domande Complesse** → SYD Agent usa Gemini

#### Come Parliamo con Gemini:
```python
# Nel backend
prompt = """
Sei un esperto di cyber security.
L'azienda ha codice ATECO 62.01.
Dimmi i rischi principali.
"""

response = gemini.generate(prompt)
# Gemini risponde con saggezza
```

---

## 🔄 LEZIONE 6: IL FLUSSO COMPLETO (Esempio Pratico)

### Quando Carichi una Visura:

1. **TU**: Trascini il PDF nella chat
   ```javascript
   // Frontend detecta il file
   handleFileDrop(file)
   ```

2. **FRONTEND**: Manda il file al backend
   ```javascript
   fetch('https://railway.app/extract-visura', {
     method: 'POST',
     body: pdfFile
   })
   ```

3. **BACKEND**: Riceve e processa
   ```python
   @app.post("/extract-visura")
   def extract(file):
       # Estrae testo dal PDF
       # Chiede a Gemini di capirlo
       return dati_azienda
   ```

4. **AI**: Gemini analizza
   ```
   "Trovami denominazione, ATECO e oggetto sociale"
   → "ACME SRL, 62.01, Sviluppo software"
   ```

5. **RITORNO**: I dati tornano a te
   ```javascript
   // Frontend mostra i risultati
   setSessionMeta({
     nome: "ACME SRL",
     ateco: "62.01"
   })
   ```

---

## 🎯 LEZIONE 7: I COMANDI SPECIALI

### Nella Chat Puoi Scrivere:

- `/ateco [codice]` - Cerca info su un codice
- `/risk` - Inizia valutazione rischi
- `/help` - Aiuto
- Oppure parla normale e SYD capisce!

### Come Funziona:
```typescript
// useChat.ts
if (message.startsWith('/ateco')) {
  // Chiama backend per ATECO
} else if (message.startsWith('/risk')) {
  // Inizia flusso rischi
} else {
  // SYD Agent risponde
}
```

---

## 💾 LEZIONE 8: LA MEMORIA (Store)

### Zustand - Ricorda Tutto

```typescript
// useStore.ts
const store = {
  // Sessione utente
  username: "Dario",

  // Messaggi chat
  messages: [...],

  // Dati azienda
  sessionMeta: {
    ateco: "62.01",
    nome: "ACME SRL"
  },

  // Preferenze
  theme: "dark",
  language: "it"
}
```

### localStorage - Sopravvive al Refresh
```javascript
// Anche se ricarichi, ricorda:
- Il tuo username
- I messaggi
- Il tema scelto
- La sessione di lavoro
```

---

## 🚀 LEZIONE 9: IL DEPLOY (Come va Online)

### Frontend su Vercel:
1. **Push su GitHub** → Vercel vede
2. **Build automatico** → Compila React
3. **Deploy** → Online in 1 minuto!

### Backend su Railway:
1. **Push su GitHub** → Railway vede
2. **Build Python** → Installa dipendenze
3. **Deploy** → API pronta!

### Multi-Utente:
```
Dario → syd-cyber-dario.vercel.app
         ↓
Marcello → syd-cyber-marcello.vercel.app  → Railway Backend
         ↓                                    (Condiviso)
Claudio → syd-cyber-claudio.vercel.app
```

---

## 📊 LEZIONE 10: I DATI

### Database (Excel):
```
Database/
├── Matrice_Rischi.xlsx      # 191 rischi mappati
├── Certificazioni_102.xlsx  # 102 certificazioni
└── NIS2_Mappatura.xlsx     # Requisiti NIS2
```

### Come Li Usa:
```python
# Backend legge Excel
df = pd.read_excel('Matrice_Rischi.xlsx')

# Li trasforma in JSON
risks = df.to_dict('records')

# Li manda al frontend
return {"risks": risks}
```

---

## 🎨 LEZIONE 11: L'INTERFACCIA (UI/UX)

### Tailwind CSS - Lo Stilista
```jsx
// Invece di CSS normale
<div className="bg-blue-500 p-4 rounded-lg shadow-lg">
  // bg-blue-500 = sfondo blu
  // p-4 = padding 4
  // rounded-lg = bordi arrotondati
  // shadow-lg = ombra grande
</div>
```

### Framer Motion - Le Animazioni
```jsx
<motion.div
  initial={{ opacity: 0 }}    // Inizia invisibile
  animate={{ opacity: 1 }}    // Diventa visibile
  transition={{ duration: 0.5 }} // In mezzo secondo
>
```

---

## 🔧 LEZIONE 12: COMANDI UTILI

### Per Sviluppare:
```bash
# Frontend locale
npm run dev

# Build produzione
npm run build

# Vedere modifiche live
git status
git add .
git commit -m "Migliorie"
git push
```

### Per Testare:
1. Apri http://localhost:5175
2. Fai modifiche ai file
3. Vedi cambiamenti istantanei!

---

## 🎯 ESERCIZI PRATICI

### Livello 1 - Principiante:
1. Cambia il colore di un bottone
2. Modifica un testo nella chat
3. Aggiungi un console.log per capire il flusso

### Livello 2 - Intermedio:
1. Aggiungi un nuovo comando chat (/info)
2. Crea una nuova card componente
3. Modifica il messaggio di benvenuto

### Livello 3 - Avanzato:
1. Aggiungi un nuovo endpoint backend
2. Integra una nuova categoria di rischi
3. Crea un nuovo tipo di report

---

## 🤝 LEZIONE FINALE: PADRONEGGIARE IL PRODOTTO

### Per Dominare SYD Devi Sapere:

1. **IL FLUSSO**: Utente → Frontend → Backend → AI → Ritorno
2. **I FILE CHIAVE**: App.tsx, main.py, useChat.ts
3. **LE TECNOLOGIE**: React, FastAPI, Gemini
4. **I DATI**: Excel con rischi e certificazioni
5. **IL DEPLOY**: Vercel + Railway

### Trucchi da Pro:
- **F12 nel browser** - Vedi errori e network
- **console.log ovunque** - Per capire cosa succede
- **Leggi gli errori** - Dicono sempre cosa c'è che non va
- **Copia dai file esistenti** - Non reinventare la ruota

---

## 📝 RIASSUNTO PER IL TUO CERVELLO

```
SYD Cyber = Frontend + Backend + AI

Frontend (React):
- Quello che vedi
- Bellezza e interazione
- Su Vercel

Backend (Python):
- Il cervello
- Logica e calcoli
- Su Railway

AI (Gemini):
- L'intelligenza
- Comprensione e risposte
- API di Google

Tu controlli tutto con:
- GitHub (codice)
- Vercel (frontend online)
- Railway (backend online)
```

---

## 🚀 PROSSIMI PASSI

1. **Guarda un file alla volta** - Non tutto insieme
2. **Modifica piccole cose** - Parti piano
3. **Rompi e ripara** - È così che si impara
4. **Chiedi quando blocchi** - Sono qui per questo!

---

## 💪 CE LA PUOI FARE!

Ora hai la mappa del tesoro. SYD non ha più segreti per te!

Ricorda: ogni esperto era un principiante che non si è arreso.

**Domande?** Chiedimi qualsiasi cosa! 🎓

---

*Creato con amore pedagogico da Claude per farti diventare un maestro di SYD Cyber*