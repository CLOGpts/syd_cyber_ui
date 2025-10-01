# 🧪 Test Plan - Risk Wizard Refactoring

**Data**: 2025-09-30
**Obiettivo**: Sostituire ChatWindow con RiskWizard per Risk Management

---

## ✅ Pre-Refactoring Checklist

### 1. Funzionalità Esistenti da Preservare
- [ ] Selezione categorie (7 categorie)
- [ ] Caricamento eventi per categoria
- [ ] Visualizzazione descrizione evento
- [ ] Questionario 7 domande assessment
- [ ] Navigazione back (Q1-Q6)
- [ ] Taliban lock (Q7+ non modificabile)
- [ ] Generazione report finale
- [ ] Backend API integration

### 2. UX Issues da Risolvere
- [x] **ELIMINATO**: Auto-scroll invasivo
- [x] **ELIMINATO**: Messaggi utente visibili in chat
- [ ] **NUOVO**: Layout fisso centrale
- [ ] **NUOVO**: Animazioni fade in/out
- [ ] **NUOVO**: Progress bar visibile

### 3. Nuove Features
- [ ] Multi-report: accumulo valutazioni
- [ ] Multi-report: selezione categorie multiple
- [ ] Multi-report: aggregazione dati

---

## 🧪 Test di Validazione

### Test 1: Inizializzazione
```typescript
// BEFORE: ChatWindow + useRiskFlow
- Click "risk" → Mostra categorie come messaggi
- Auto-scroll attivo
- Messaggi accumulati

// AFTER: RiskWizard
- Apertura → Mostra categorie come card centrali
- NO scroll
- NO messaggi accumulati
```

### Test 2: Selezione Categoria
```typescript
// BEFORE
- Click categoria → Aggiunge messaggio utente
- Scroll in basso
- Mostra eventi come nuovi messaggi

// AFTER
- Click categoria → Nessun messaggio
- Fade out categorie
- Fade in eventi (stesso slot)
```

### Test 3: Navigazione Assessment
```typescript
// BEFORE
- Domanda Q1 → Risposta → Domanda Q2 (append)
- Back Q2 → Rimuove messaggi

// AFTER
- Domanda Q1 → Risposta → Domanda Q2 (sostituzione)
- Back Q2 → Fade out Q2, fade in Q1
- Progress bar aggiornato
```

### Test 4: Taliban Lock
```typescript
// BEFORE
- Q7 completata → Blocca UI con overlay
- Back button disabilitato

// AFTER
- Q7 completata → Blocca navigation
- Back button rimosso visualmente
```

### Test 5: Multi-Report
```typescript
// NEW FEATURE
- Report 1 completato → Bottone "Nuovo Assessment"
- Report 2 avviato → State pulito ma Report 1 salvato
- Aggregazione finale → Somma/Media punteggi
```

---

## 🔍 Checklist Errori Comuni

### State Management
- [ ] chatStore pulito correttamente tra wizard steps
- [ ] riskAssessmentData non contaminato tra report multipli
- [ ] selectedEventCode resettato quando serve
- [ ] Backend chiamate con error handling

### UI/UX
- [ ] NO overflow scroll involontario
- [ ] Animazioni smooth (no jank)
- [ ] Card responsive su mobile
- [ ] Accessibilità keyboard navigation

### Backend Integration
- [ ] Timeout handling (10s)
- [ ] Retry logic (3 tentativi)
- [ ] Error messages user-friendly
- [ ] Validazione input sanitizzato

---

## 📊 Success Criteria

### Must Have
1. ✅ Nessun messaggio chat visibile
2. ✅ Layout fisso senza scroll
3. ✅ Tutte le funzionalità esistenti funzionanti
4. ✅ Zero errori console browser

### Should Have
1. ⚠️ Multi-report funzionante
2. ⚠️ Animazioni fluide
3. ⚠️ Progress bar accurato
4. ⚠️ Mobile-friendly

### Nice to Have
1. 💡 Statistiche aggregate report
2. 💡 Export PDF multi-report
3. 💡 Storia valutazioni precedenti

---

## 🚨 Rollback Plan

Se qualcosa va storto:
1. Backup ChatWindow.tsx esistente
2. Mantieni route vecchia commentata
3. Feature flag per switchare tra vecchio/nuovo
4. Rollback entro 5 minuti se errori critici

---

## 📝 Note Implementazione

### Componenti Riutilizzabili
- ✅ RiskCategoryCards.tsx (no modifiche)
- ✅ RiskEventCards.tsx (no modifiche)
- ✅ AssessmentQuestionCard.tsx (no modifiche)
- ✅ RiskReport.tsx (no modifiche)

### Nuovi Componenti
- 🆕 RiskWizard.tsx (container principale)
- 🆕 WizardStep.tsx (wrapper singolo step)
- 🆕 ProgressBar.tsx (barra progresso)
- 🆕 MultiReportManager.tsx (gestione accumulo)

### Hook Modificati
- ⚠️ useRiskFlow.ts (eventualmente semplificato, rimuovendo logica messaggi)
