# 🔧 Backend Refactoring - Documentazione

Questa cartella contiene **tutta la documentazione** relativa al refactoring del backend SYD Cyber (da monolite a modular monolith).

---

## 📂 Struttura Cartella

```
/docs/refactoring/
├── README.md                                    (questo file)
│
├── ARCHITECTURAL_REFACTORING_PROPOSAL.md        ← Piano architetturale (Winston)
├── CODE_REVIEW_REPORT.md                        ← Code review (Mary)
├── REFACTORING_EPIC_STORIES.md                  ← Epic & 17 Stories (John)
│
├── /stories/                                    ← Story individuali
│   └── (quando le creiamo)
│
└── /workflows/                                  ← Workflow BMAD
    └── (se necessari)
```

---

## 📚 Documenti Principali

### 1. **ARCHITECTURAL_REFACTORING_PROPOSAL.md**
- **Autore**: Winston (Architect Agent)
- **Data**: 26 Ottobre 2025
- **Contenuto**:
  - Analisi stato attuale (monolite 3910 righe)
  - Architettura target (modular monolith)
  - 6 service boundaries
  - Piano di migrazione (3 settimane)
  - Strategia Strangler Fig

### 2. **CODE_REVIEW_REPORT.md**
- **Autore**: Mary (Business Analyst Agent)
- **Data**: 26 Ottobre 2025
- **Contenuto**:
  - Code review dettagliato di `main.py`
  - 6 anti-pattern critici identificati
  - Validazione dei service boundaries
  - Ordine di estrazione ottimizzato (risk-based)
  - Strategia di testing completa
  - Effort estimation (177 ore)

### 3. **REFACTORING_EPIC_STORIES.md**
- **Autore**: John (Product Manager Agent)
- **Data**: 26 Ottobre 2025
- **Contenuto**:
  - Epic completo con business value
  - 17 stories dettagliate (Phase 1-3)
  - Acceptance criteria per ogni story
  - Task tecnici step-by-step
  - Timeline e dependency graph
  - Milestone checkpoints

---

## 🎯 Fasi del Refactoring

### **Phase 1: Foundation** (Week 1 - 5 stories, 30h)
1. Setup directory structure
2. Migrate config & database
3. Create SQLAlchemy models
4. Create Pydantic schemas
5. **Create baseline tests** (CRITICAL)

### **Phase 2: Service Extraction** (Week 2 - 7 stories, 102h)
1. Extract Health Check
2. **Extract ATECO** (dependency for others)
3. Extract Risk Assessment
4. **Extract Visura** (highest risk)
5. Extract Seismic Zone
6. Extract Session Tracking
7. Extract Feedback & Notifications

### **Phase 3: Cleanup** (Week 3 - 5 stories, 45h)
1. Update frontend endpoints
2. Remove legacy code
3. Achieve 85% test coverage
4. Update documentation
5. Final verification

---

## 🚀 Come Procedere

### **Approccio Consigliato: SOLUZIONE 1 (Hybrid)**

Invece di 3 settimane di refactoring completo, fare **solo le parti critiche** (5 giorni):

**Giorno 1-2**: Story 1.5 - Test automatici
**Giorno 3**: Story 1.2 - Configurazione centralizzata
**Giorno 4-5**: Story 2.2 - Servizio ATECO

Poi **PAUSA** e continua sviluppo features.

### **Comando per Partire**

```bash
@dev Implementa Story 1.5 - test automatici (baseline tests)
```

---

## 📊 Metriche

| Metrica | Valore |
|---------|--------|
| **Stories Totali** | 17 |
| **Effort Totale** | 177 ore ≈ 22 giorni |
| **Timeline** | 3 settimane (o 5 giorni Soluzione 1) |
| **Servizi da Estrarre** | 6 domini |
| **Test Coverage Target** | 0% → 85% |
| **main.py** | 3910 → <200 righe |

---

## 🔗 Riferimenti

- **Progetto Principale**: `/docs/PROJECT_OVERVIEW.md`
- **Architettura Attuale**: `/docs/ARCHITECTURE.md`
- **Roadmap**: `/docs/ROADMAP.md`

---

**Status**: ✅ Planning completo - Pronto per implementazione

**Prossimo Step**: Chiamare `@dev` per iniziare Story 1.5 (test automatici)

---

*Documentazione creata attraverso BMAD workflow da Winston (Architect), Mary (Analyst) e John (PM) in collaborazione con Claudio (Project Owner).*
