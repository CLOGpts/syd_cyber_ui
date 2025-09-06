# 📚 DOCUMENTAZIONE FRONTEND - Sistema SYD_Cyber UI

## 🎯 Executive Summary
Sistema completo di analisi rischi aziendali e compliance con funzionalità avanzate:

### Funzionalità Core
- **🔍 Lookup ATECO**: Ricerca codici ATECO con arricchimento AI per normative e certificazioni
- **📄 Estrazione Visura Camerale**: Sistema STRICT a 3 campi (P.IVA, ATECO, Oggetto Sociale)
- **🛡️ Risk Management**: Sistema conversazionale per navigare 191 rischi aziendali
- **📊 Generazione Report**: Mockup professionale stile Studio Perassi con grafici interattivi
- **💬 Chat AI Assistita**: Interfaccia conversazionale con Gemini 2.5 Flash

### Stato Attuale (09/04/2025)
- ✅ Sistema visura funzionante con estrazione 3 campi STRICT
- ✅ Backend su Render.com operativo
- ✅ Generazione report HTML con codice ATECO dinamico
- ✅ Sistema Risk Management completo
- ✅ Frontend React/TypeScript/Vite stabile

## 🏗️ Architettura Sistema

### Stack Tecnologico
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS con tema dark/light
- **State Management**: Zustand (2 store separati)
- **Backend**: FastAPI Python su Render.com
- **AI Integration**: Google Gemini 2.5 Flash
- **Hosting Frontend**: Local development (porta 5173)

### Flusso Dati

#### 1. Sistema ATECO
```
User Input → Frontend → Backend API (Render) → Dati Ufficiali
                     ↓
                Gemini API → Arricchimento AI
                     ↓
              Structured Response → UI Card
```

#### 2. Sistema Visura Camerale (STRICT - 3 Campi)
```
PDF Upload → Frontend → Backend Python (pdfplumber)
                     ↓
              Estrazione STRICT:
              1. Partita IVA (regex validata)
              2. Codice ATECO (pattern specifico)
              3. Oggetto Sociale (testo completo)
                     ↓
              Confidence Score → Sidebar Update
```

#### 3. Sistema Generazione Report
```
ATECO Analizzato → Click "Genera Report" → HTML Generation
                                         ↓
                                   Report Mockup:
                                   - 5 pagine A4
                                   - Risk Matrix 4x4
                                   - Charts (Bar, Doughnut, Radar)
                                   - Download automatico
```

## 📂 Struttura Progetto

```
ui/
├── src/
│   ├── api/
│   │   ├── gemini.ts        # Integrazione Gemini con prompt avanzato
│   │   ├── assistant.ts     # API simulata per chat
│   │   └── report.ts        # Generazione report HTML completa
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ChatInputBar.tsx
│   │   │   ├── MessageBubble.tsx     # Supporto messaggi strutturati
│   │   │   ├── ATECOResponseCard.tsx # Card per risposte ATECO
│   │   │   └── TypingIndicator.tsx
│   │   ├── sidebar/
│   │   │   ├── SessionPanel.tsx      # Gestione ATECO + Genera Report button
│   │   │   ├── UploadCenter.tsx      # Drag & drop con riconoscimento visure
│   │   │   ├── VisuraExtractionIndicator.tsx # Indicatore visivo estrazione
│   │   │   └── Sidebar.tsx
│   │   └── visura/
│   │       ├── Visura3FieldsCard.tsx       # Card STRICT 3 campi
│   │       └── VisuraProfessionalCard.tsx  # Card completa
│   ├── hooks/
│   │   ├── useATECO.ts                     # Hook centralizzato per logica ATECO
│   │   ├── useChat.ts                      # Gestione messaggi chat
│   │   ├── useUpload.ts                    # Upload files con riconoscimento visure
│   │   ├── useVisuraExtraction.ts          # Estrazione visura base
│   │   ├── useVisuraExtraction3Fields.ts   # STRICT: Solo 3 campi
│   │   ├── useVisuraExtraction3Secure.ts   # Versione sicura con validazione
│   │   └── useRiskFlow.ts                  # Gestione flusso Risk Management
│   ├── store/
│   │   ├── useStore.ts       # Store globale app
│   │   ├── useChat.ts        # Store dedicato chat
│   │   └── useVisuraStore.ts # Store per stato estrazione visura
│   └── types.ts              # TypeScript interfaces con campi visura
```

## 🚀 Sistema Generazione Report (09/04/2025)

### Mockup Report Professionale
Il sistema genera un report HTML completo che replica lo stile Studio Perassi:

#### Caratteristiche Report
- **5 Pagine A4**: Layout print-ready 210mm x 297mm
- **Matrice Rischi 4x4**: Colorata con livelli (Basso/Medio/Alto/Critico)
- **3 Tipi di Grafici**: Bar chart, Doughnut chart, Radar chart
- **Dati Dinamici**: ATECO code inserito automaticamente
- **Stile Professionale**: Gradients, tabelle, statistiche

#### Implementazione
```typescript
// src/api/report.ts
export const generateReport = async (sessionState: SessionMeta) => {
  const htmlContent = generateReportHTML(sessionState.ateco);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  // Download automatico
  const a = document.createElement('a');
  a.download = `risk-report-${sessionState.ateco}-${Date.now()}.html`;
  a.click();
};
```

#### Contenuto Report
1. **Pagina 1**: Executive Summary + Statistiche
2. **Pagina 2**: Metodologia Basel III + Categorie
3. **Pagina 3**: Risk Assessment Matrix + Distribution Chart
4. **Pagina 4**: Analisi Dettagliata + Top 5 Rischi
5. **Pagina 5**: Piano Mitigazione + Budget + Timeline

## 🔧 Sistema Visura STRICT (09/04/2025)

### Filosofia STRICT: Meglio Null che Sbagliato
- **Solo 3 campi fondamentali** estratti con certezza
- **Nessun dato inventato** o inferito
- **Confidence reale** basata su match effettivi

#### Backend Fix Visura
```python
# backend_fix_visura.py
def extract_strict_fields(pdf_text):
    result = {
        'partita_iva': None,
        'codice_ateco': None,
        'oggetto_sociale': None,
        'confidence': 0
    }
    
    # Solo regex validati e pattern sicuri
    # Mai inventare dati mancanti
    # Confidence = campi_trovati / 3
```

### Campi Estratti
1. **Partita IVA**: Validazione pattern `\d{11}`
2. **Codice ATECO**: Pattern `\d{2}\.\d{2}(?:\.\d{1,2})?`
3. **Oggetto Sociale**: Descrizione attività aziendale

## 🛡️ Sistema Risk Management

### Architettura 100% Fedele all'Excel
Il sistema replica ESATTAMENTE il comportamento dell'Excel originale con 191 rischi mappati:

#### Backend Risk Management
- **URL**: http://localhost:8000 (Python FastAPI)
- **Fonte Dati**: Excel con 191 rischi operativi mappati da consulenti
- **3 Endpoint Principali**:
  1. `/categories` - Restituisce le 7 categorie di rischio
  2. `/events/{category}` - Restituisce TUTTI gli eventi di una categoria
  3. `/description/{event}` - Restituisce la descrizione completa dell'evento

#### Categorie Risk Management

| Input Utente | Chiave Backend | Eventi |
|-------------|----------------|---------|
| clienti | Clients_product_Clienti | 44 |
| danni | Damage_Danni | 10 |
| sistemi | Business_disruption | 17 |
| dipendenti | Employment_practices_Dipendenti | 25 |
| produzione | Execution_delivery_Problemi | 37 |
| frodi interne | Internal_Fraud_Frodi_interne | 20 |
| frodi esterne | External_fraud_Frodi_esterne | 38 |

## 🔌 Integrazioni Esterne

### Backend API (Render)
- **Endpoint**: `https://ateco-lookup.onrender.com/lookup`
- **Parametri**: `?code={codice_ateco}`
- **Response**: JSON con campi ATECO

### Gemini API
- **Modello**: gemini-2.5-flash
- **API Key**: Configurata in `.env.local`
- **Timeout**: ~2-3 secondi per risposta

## 🔐 Configurazione Environment

```env
VITE_GEMINI_API_KEY=AIzaSy...
VITE_API_BASE=https://ateco-lookup.onrender.com
```

## 🎨 Design System

### Colori Sezioni ATECO
- **Lookup**: Blue (blue-700/blue-400)
- **Arricchimento**: Green (green-700/green-400)
- **Normative**: Purple (purple-700/purple-400)
- **Certificazioni**: Teal (teal-700/teal-400)
- **Rischi**: Red base con sottocategorie

### Componenti UI
- Card con gradient backgrounds
- Shadow elevation system
- Rounded corners (xl per card, lg per sections)
- Dark mode con slate color palette

## 🔍 Testing Checklist

### Sistema ATECO
- [x] Codice ATECO valido → Card strutturata
- [x] Codice ATECO invalido → Messaggio errore
- [x] Bottone sidebar funzionante
- [x] Comando chat "Imposta ATECO" funzionante

### Sistema Visura
- [x] Upload PDF visura → Estrazione automatica
- [x] Solo 3 campi estratti (P.IVA, ATECO, Oggetto)
- [x] Confidence score visualizzato
- [x] Drag & drop in chat → Upload alternativo

### Sistema Report
- [x] Click "Genera Report" → Download HTML
- [x] ATECO code inserito nel report
- [x] Grafici Chart.js funzionanti
- [x] Layout A4 stampabile

### Sistema Risk Management
- [x] Click pulsante → Mostra 7 categorie
- [x] Scelta categoria → Mostra TUTTI gli eventi
- [x] Selezione numero → Mostra descrizione
- [x] Navigazione con "altro", "cambia", "fine"

## 📅 Changelog

### v5.0.0 - 09/04/2025 📊 REPORT GENERATION & VISURA FIX
- **Sistema Generazione Report HTML**: Mockup professionale 5 pagine stile Studio Perassi
- **Risk Matrix 4x4**: Visualizzazione colorata probabilità/impatto
- **Grafici Chart.js**: Bar, Doughnut, Radar charts interattivi
- **ATECO Dinamico**: Codice inserito automaticamente nel report
- **Download Automatico**: File HTML scaricato al click del button
- **Visura STRICT Mode**: Solo 3 campi essenziali (P.IVA, ATECO, Oggetto)
- **Backend Fix**: Nuovo endpoint con estrazione sicura
- **Confidence Reale**: Basata su campi effettivamente trovati
- **Integrazione Sidebar**: Button "Genera Report" funzionante
- **Toast Notifications**: Feedback in italiano per l'utente

### v4.0.0 - 31/08/2025 🛡️ RISK MANAGEMENT COMPLETO
- Sistema Risk Management 100% Fedele all'Excel
- Backend Python FastAPI con 191 rischi
- Flusso conversazionale completo

### v3.0.0 - 30/08/2025 🚀 VISURA COMPLETA
- Sistema Visura con 30+ campi
- VisuraDataCard Component
- UI Fase 3 completata

### v2.0.0 - 30/08/2025 SISTEMA ANTIFRAGILE
- Sistema Antifragile Visura Camerale
- 3 livelli di fallback
- Auto-riconoscimento upload

### v1.1.0 - 29/08/2025 ATECO STRUTTURATO
- Sistema ATECO completo
- Card visualizzazione avanzata
- Hook centralizzato

---

*Documentazione Frontend - Ultimo aggiornamento: 09/04/2025 - v5.0.0*