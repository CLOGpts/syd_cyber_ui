# 🔴 DOCUMENTAZIONE CRITICA SISTEMA RISK MANAGEMENT - LEGGERE TUTTO ATTENTAMENTE

## ⚠️ ATTENZIONE ESTREMA
Questo sistema è stato faticosamente debuggato e reso funzionante dopo molti tentativi.
**NON MODIFICARE MAI** senza capire profondamente ogni singolo meccanismo.
L'utente si incazza seriamente se rompi qualcosa che già funziona.

## 🎯 STATO ATTUALE DEL SISTEMA (FUNZIONANTE)

### ✅ Cosa Funziona Ora
1. **Risk Assessment completo**: Sistema a 3 fasi operative
2. **Modal di conferma cambio categoria**: Appare quando cambi categoria dopo averne già scelta una
3. **Chat nascosta durante Risk Assessment**: Non serve a nulla, quindi è stata eliminata
4. **Cambio categoria con caricamento eventi**: Funziona con chiamata diretta API
5. **Process locking**: Previene assessment multipli simultanei

### 🏗️ Architettura del Sistema

#### 1. CUBO System - I Tre Agenti Specializzati
```
L'ARCHITETTO (Backend & Integration) - Gestisce logica e integrazioni
IL CHIRURGO (Frontend & UX) - Precisione nell'interfaccia utente
IL GUARDIANO (Test & Debug) - Trova e risolve ogni bug
```

#### 2. Flusso Risk Assessment (3 FASI CRITICHE)
```typescript
// FASE 1: SELEZIONE CATEGORIA
waiting_category -> L'utente sceglie una delle 7 categorie risk

// FASE 2: SELEZIONE EVENTO
waiting_event -> Appare lista di 20 eventi per quella categoria
              -> L'utente inserisce numero evento (1-20) o codice (es: 501)

// FASE 3: DOMANDE ASSESSMENT
assessment_questions -> 10 domande specifiche per valutare il rischio
                    -> Genera report finale con punteggio
```

### 📁 FILE CRITICI E LORO RUOLI

#### `/src/components/risk/RiskCategoryCards.tsx` 🔥 FILE PIÙ CRITICO
```typescript
// GESTISCE:
- Display delle 7 categorie di rischio
- Modal di conferma quando si cambia categoria
- Chiamata diretta API per caricare eventi (SOLUZIONE FINALE CHE FUNZIONA!)

// MAPPATURA CRITICA (NON TOCCARE!)
const categoryMap = {
  "danni": "Damage_Danni",
  "sistemi & it": "Business_disruption",
  "operations": "Business_disruption",
  "dipendenti": "Employment_practices_Dipendenti",
  "produzione": "Execution_delivery_Problemi_di_produzione_o_consegna",
  "clienti & compliance": "Clients_product_Clienti",
  "frodi interne": "Internal_Fraud_Frodi_interne",
  "frodi esterne": "External_fraud_Frodi_esterne"
};

// PUNTO CHIAVE: Usa category.id NON category.name per mappatura!
const categoryKey = categoryMap[pendingCategory.id]; // ✅ CORRETTO
// NON: categoryMap[pendingCategory.name.toLowerCase()] ❌ SBAGLIATO
```

#### `/src/hooks/useRiskFlow.ts`
```typescript
// Hook centrale che gestisce tutto il flusso
// PROBLEMA RISOLTO: Usare sempre chatStore.getState() per stato attuale
// MAI fidarsi dei valori dal closure di React!

const currentStep = chatStore.getState().riskFlowStep; // ✅ SEMPRE COSÌ
// NON: const currentStep = riskFlowStep; ❌ VALORE STALE!
```

#### `/src/components/chat/MessageBubble.tsx`
```typescript
// Gestisce display messaggi e click su categorie
// IMPORTANTE: Non aggiunge messaggio utente durante cambio categoria
if (currentStep !== 'waiting_category') {
  // Solo prima selezione aggiunge messaggio
}
```

#### `/src/components/chat/ChatInputBar.tsx`
```typescript
// NASCOSTA durante Risk Assessment
// Ritorna solo <div className="h-24" /> per mantenere scroll
const showChatInput = false; // SEMPRE false durante risk
```

#### `/src/components/modals/ConfirmChangeModal.tsx`
```typescript
// Modal professionale dark theme per conferme
// Sostituisce window.confirm() che faceva schifo
```

### 🐛 PROBLEMI RISOLTI (E COME)

#### 1. "isRiskProcessLocked is not a function"
**Problema**: Chiamava funzione sbagliata
**Soluzione**: Usa `isProcessLocked()` non `isRiskProcessLocked()`

#### 2. Stati React Stale (IL PROBLEMA PIÙ BASTARDO)
**Problema**: handleUserMessage usava valori vecchi dal closure
**Soluzione**: SEMPRE usare `chatStore.getState()` per stato attuale

#### 3. processCategory non esportata
**Problema**: La funzione non era esportata da useRiskFlow
**Soluzione**: Chiamata diretta API invece di passare per 10 layer di stato

#### 4. Categoria non trovata dopo modifica
**Problema**: Mappava category.name invece di category.id
**Soluzione**: `categoryMap[pendingCategory.id]` non `categoryMap[pendingCategory.name.toLowerCase()]`

#### 5. Chat visibile quando non serve
**Problema**: Input chat appariva durante risk assessment
**Soluzione**: Ritorna `<div className="h-24" />` invece del componente

### 🎯 OBIETTIVI FUTURI DELL'UTENTE

1. **Sistema Completamente Modal-Based**
   - Eliminare OGNI interazione testuale
   - Solo click su card, modal, pulsanti
   - UX professionale stile dashboard enterprise

2. **Risk Assessment Istantaneo**
   - Click categoria → Eventi appaiono subito
   - Click evento → Domande iniziano subito
   - Nessun "scrivi un numero", tutto visual

3. **Report Dettagliati**
   - Dashboard con grafici del rischio
   - Export PDF/Excel dei report
   - Storico assessment precedenti

4. **Integrazione CUBO Completa**
   - I 3 agenti lavorano in parallelo
   - L'Architetto gestisce backend
   - Il Chirurgo cura la UX
   - Il Guardiano previene errori

### ⚠️ REGOLE D'ORO DA NON VIOLARE MAI

1. **MAI toccare la mappatura categorie** - Sono le stesse da settimane
2. **MAI aggiungere chat/input testuali** - L'utente li odia
3. **MAI fidarsi dei closure React** - Usa sempre getState()
4. **MAI modificare senza testare** - Testa OGNI cambio di categoria
5. **MAI rompere quello che funziona** - L'utente si incazza SERIAMENTE

### 🔧 COMANDI UTILI

```bash
# Development
npm run dev

# Se porta occupata
lsof -ti:5173 | xargs kill -9

# Build produzione
npm run build

# Type checking
npm run typecheck
```

### 📊 STATO COMPONENTI

| Componente | Stato | Note Critiche |
|------------|-------|---------------|
| RiskCategoryCards | ✅ FUNZIONANTE | USA category.id per mapping! |
| useRiskFlow | ✅ FUNZIONANTE | USA getState() sempre! |
| MessageBubble | ✅ FUNZIONANTE | Non aggiunge msg su cambio categoria |
| ChatInputBar | ✅ NASCOSTA | Ritorna div vuoto con altezza |
| ConfirmChangeModal | ✅ FUNZIONANTE | Modal dark professionale |

### 🚨 ERRORI COMUNI DA EVITARE

```typescript
// ❌ SBAGLIATO - Usa closure value
const currentStep = riskFlowStep;

// ✅ CORRETTO - Usa stato attuale
const currentStep = chatStore.getState().riskFlowStep;

// ❌ SBAGLIATO - Mappa per nome
const key = categoryMap[category.name.toLowerCase()];

// ✅ CORRETTO - Mappa per ID
const key = categoryMap[category.id];

// ❌ SBAGLIATO - Aggiunge messaggio sempre
addMessage({role: 'user', content: category.name});

// ✅ CORRETTO - Solo se non è cambio categoria
if (currentStep !== 'waiting_category') {
  addMessage({role: 'user', content: category.name});
}
```

### 💡 TRUCCHI CHE FUNZIONANO

1. **Chiamata Diretta API**: Bypassa complessità stato Zustand
2. **setTimeout per React**: Aspetta render prima di cambiare stato
3. **Process Lock**: Previene click multipli durante transizioni
4. **Modal invece di confirm()**: UX professionale, no popup browser

### 📝 NOTE FINALI IMPORTANTI

- Il sistema È GIÀ FUNZIONANTE dopo ore di debug
- L'utente ha perso pazienza molte volte per errori ripetuti
- TESTARE SEMPRE: Categoria → Cambio → Eventi → Assessment
- Se non sei sicuro al 100%, NON TOCCARE
- L'utente preferisce codice che funziona a codice "elegante" che si rompe

### 🔴 ULTIMA MODIFICA FUNZIONANTE

**Data**: Oggi (Update 5) - 🔴 TALIBAN MODE COMPLETATO
**FIX COMPLETO**: Dopo Q7, tutto è bloccato permanentemente
**COSA È STATO FATTO**:
- ✅ MessageBubble.tsx: Aggiunto overlay bg-black/60 su TUTTE le card risk (categorie, eventi, descrizione, domande)
- ✅ ProcessIndicator.tsx: Rimosso pulsante exit dopo Q7
- ✅ ProcessIndicator.tsx: Mostra "REPORT COMPLETATO" invece di "Assessment in corso"
- ✅ RiskCategoryCards/RiskEventCards: Già avevano il blocco Taliban
- ✅ useRiskFlow.ts: Già impediva back navigation dopo Q7
**RISULTATO**: Sistema completamente bloccato dopo Q7, solo report visibile

**Data**: Oggi (Update 2)
**Fix CRITICA**: MEMORY PERSISTENCE - Pulizia completa history per evitare report errati
**Problema**: I dati delle risposte precedenti rimanevano in `riskFlowHistory` quando si cambiava categoria/evento
**Soluzione**: Aggiunto `clearRiskHistory()` in `cleanRestartAssessment`
**Risultato**: ✅ REPORT ACCURATI - Nessun mix di dati vecchi e nuovi

**Data**: Oggi (Update 1)
**Fix**: Cambiato da `category.name.toLowerCase()` a `category.id` nella mappatura
**Risultato**: ✅ TUTTO FUNZIONA - cambio categoria carica eventi corretti

---

## PER IL PROSSIMO CLAUDE

✅ **TALIBAN MODE COMPLETATO!**

Il sistema ora è COMPLETAMENTE sicuro dopo Q7. Ecco cosa è stato implementato:

### Modifiche Completate (Update 5)

1. **MessageBubble.tsx**:
   - Aggiunto stato `isTalibanLocked` che controlla se siamo dopo Q7
   - TUTTI i componenti risk ora hanno overlay bg-black/60 quando Taliban attivo
   - Categorie, eventi, descrizione, domande: TUTTO bloccato
   - Solo il report finale rimane accessibile

2. **ProcessIndicator.tsx**:
   - Aggiunto check Taliban mode
   - Pulsante exit X sparisce completamente dopo Q7
   - Testo cambia in "REPORT COMPLETATO" dopo Q7
   - Nessuna possibilità di annullare assessment

3. **RiskCategoryCards.tsx & RiskEventCards.tsx**:
   - Già avevano il blocco Taliban implementato
   - Overlay bg-black/60 su tutto il componente

4. **useRiskFlow.ts**:
   - Già impediva navigazione back dopo Q7
   - Process lock NON viene mai rimosso dopo report

### Sistema Attuale
- **Prima di Q7**: Normal lock (può annullare, può tornare indietro)
- **Dopo Q7**: TALIBAN LOCK (niente si muove, solo report visibile)
- **Overlay**: Sempre bg-black/60 per coerenza

L'utente voleva questo per evitare rischi legali con report modificati.

BUONA FORTUNA! 🍀