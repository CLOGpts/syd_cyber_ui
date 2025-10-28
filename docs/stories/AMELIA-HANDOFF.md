# 🤖 AMELIA HANDOFF - SYD Cyber Refactoring

**Data Handoff:** 27 Ottobre 2025
**Progetto:** SYD Cyber Risk Management Backend
**Obiettivo:** Refactoring Monolite → Architettura Modulare
**Status:** Story 2.1 COMPLETATA ✅

---

## 📊 STATO ATTUALE

### Repositories

**Backend:**
```bash
Repository: /mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco
Remote: git@github.com:CLOGpts/ateco-lookup.git
Branch Lavoro: feature/story-2.1-health-check
Branch Main: main
```

**Frontend UI (Docs):**
```bash
Repository: /mnt/c/Users/speci/Desktop/Varie/syd_cyber/ui/BMAD-METHOD
Remote: git@github.com:CLOGpts/syd_cyber_ui.git
Branch: v6-alpha
```

### Stories Completate

#### ✅ Story 1.6: Expand Test Coverage (COMPLETATA)
- **Obiettivo:** Portare coverage da 20% a 60%
- **Risultato:** 46% coverage (137 test passing)
- **Commit:** bea072a (branch: feature/baseline-tests)
- **Push:** ✅ GitHub
- **Files:**
  - 8 test files in `tests/integration/`
  - 107 golden master JSON in `tests/fixtures/`
  - Test plan: `tests/test-plan-story-1.6.md`

#### ✅ Story 2.1: Extract Health Check Service (COMPLETATA)
- **Obiettivo:** Estrarre health check in router modulare
- **Risultato:** Router creato + 10 unit test
- **Commit:** 9b1f91f (branch: feature/story-2.1-health-check)
- **Push:** ✅ GitHub
- **Files:**
  - `app/routers/health.py` (47 linee)
  - `tests/unit/routers/test_health.py` (10 test)
  - `main.py` (modificato - dual endpoints)
- **Test:** 147/147 passing ✅
- **Test Locale:** ✅ Funziona

---

## 🎯 PROSSIMO STEP - Story 2.2

### Story 2.2: Extract ATECO Service (CRITICAL DEPENDENCY)

**Priorità:** 🔴 CRITICAL (Risk e Visura dipendono da questo)
**Effort:** 12 ore (1.5 giorni)
**Risk:** 🟢 LOW (codice già separato in ateco_lookup.py)

**Obiettivo:**
- Estrarre ATECO lookup come servizio modulare
- Creare `app/services/ateco_service.py`
- Creare `app/routers/ateco.py` (4 endpoint)
- Unit test (80%+ coverage)
- Dual endpoints per sicurezza

**Acceptance Criteria:**
- [ ] `app/services/ateco_service.py` creato
- [ ] Logic migrata da `ateco_lookup.py`:
  - `search_smart()` function
  - `normalize_code()` function
  - ATECO 2022→2025 conversion
  - Autocomplete functionality
- [ ] `app/routers/ateco.py` con 4 endpoint:
  - `GET /ateco/lookup?code=XX.XX`
  - `GET /ateco/autocomplete?partial=62`
  - `POST /ateco/batch`
  - `GET /ateco/db/lookup`
- [ ] Vecchi endpoint proxy ai nuovi (dual endpoints)
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests
- [ ] Test locale ✅
- [ ] Commit + Push

---

## 🛡️ REGOLE DI SICUREZZA

### OBBLIGATORIE per Ogni Story:

1. **Branch Isolato SEMPRE**
   ```bash
   git checkout -b feature/story-X.X-nome
   ```

2. **Test PRIMA di Commit**
   ```bash
   pytest tests/ -v
   # TUTTI VERDI → procedi
   # UNO ROSSO → STOP e fix
   ```

3. **Dual Endpoints**
   ```python
   # Vecchio endpoint (main.py) RESTA attivo
   @app.get("/lookup")  # OLD

   # Nuovo endpoint (router)
   @app.get("/ateco/lookup")  # NEW
   ```

4. **Test Manuale Clo**
   - Avvio server locale
   - Clo testa nel browser
   - Clo da OK → procedi
   - Clo dice NO → fix

5. **Commit Solo dopo OK**
   ```bash
   git add .
   git commit -m "feat: ..."
   git push -u origin feature/...
   ```

6. **NO Deploy Produzione senza Approvazione**

---

## 📂 Struttura Codebase

### Directory Backend Attuale

```
Celerya_Cyber_Ateco/
├── app/                           [NUOVO - Modular]
│   ├── __init__.py
│   └── routers/
│       ├── __init__.py
│       └── health.py              [✅ Story 2.1]
│
├── tests/
│   ├── integration/               [✅ Story 1.6 - 137 test]
│   │   ├── test_health.py
│   │   ├── test_risk_calculation.py
│   │   ├── test_ateco_lookup.py
│   │   └── ... (8 files)
│   │
│   ├── unit/                      [✅ Story 2.1 - 10 test]
│   │   └── routers/
│   │       └── test_health.py
│   │
│   └── fixtures/                  [107 golden masters]
│
├── main.py                        [3910 linee - da ridurre]
├── ateco_lookup.py                [300 linee - da estrarre]
├── database/
│   └── config.py
├── pytest.ini
└── requirements.txt
```

### Directory Target (Fine Refactoring)

```
app/
├── core/
│   ├── config.py
│   ├── database.py
│   └── dependencies.py
├── services/
│   ├── ateco_service.py           [Story 2.2]
│   ├── risk_service.py            [Story 2.3]
│   └── ...
├── routers/
│   ├── health.py                  [✅ Story 2.1]
│   ├── ateco.py                   [Story 2.2]
│   └── ...
└── main.py                        [150 linee - solo routing]
```

---

## 🔧 Comandi Utili

### Setup Ambiente
```bash
cd /mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco
source venv/bin/activate  # se necessario
```

### Run Tests
```bash
# Tutti i test
pytest tests/ -v

# Solo integration
pytest tests/integration/ -v

# Solo unit
pytest tests/unit/ -v

# Con coverage
pytest tests/ --cov=app --cov=main --cov-report=term-missing
```

### Run Server Locale
```bash
python3 main.py --serve --host 127.0.0.1 --port 8000
# Testa: http://127.0.0.1:8000/health
# Docs: http://127.0.0.1:8000/docs
```

### Git Workflow
```bash
# Check branch
git branch

# Crea nuovo branch per story
git checkout -b feature/story-2.2-ateco-service

# Status
git status

# Commit
git add .
git commit -m "feat(story-2.2): ..."

# Push
git push -u origin feature/story-2.2-ateco-service
```

---

## 📋 TODO List Immediata

### Per la Nuova Amelia:

1. **Leggi questo documento** ✅
2. **Verifica stato repository:**
   ```bash
   cd /mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco
   git status
   git branch
   ```
3. **Run test per conferma:**
   ```bash
   pytest tests/ -v
   # Expected: 147 passed, 1 skipped
   ```
4. **Chiedi a Clo:** "Ok per iniziare Story 2.2 (ATECO Service)?"
5. **Se OK → Crea branch:**
   ```bash
   git checkout -b feature/story-2.2-ateco-service
   ```
6. **Segui Story 2.2 in:** `docs/refactoring/REFACTORING_EPIC_STORIES.md` (linea 477-595)

---

## 🚨 Se Qualcosa Va Storto

### Rollback Sicuro

**Scenario 1: Test falliscono**
```bash
git status
git diff  # vedi cosa hai cambiato
git restore <file>  # ripristina file
```

**Scenario 2: Branch sbagliato**
```bash
git stash  # salva modifiche
git checkout <branch-corretto>
git stash pop  # riprendi modifiche
```

**Scenario 3: Clo dice "Non funziona"**
```bash
git log -1  # ultimo commit
git reset --soft HEAD~1  # annulla commit (mantieni modifiche)
# oppure
git reset --hard HEAD~1  # annulla tutto (ATTENZIONE)
```

---

## 💬 Comunicazione con Clo

### Frasi Chiave:

**Prima di iniziare story:**
> "Clo, Story 2.1 completata! Posso iniziare Story 2.2 (ATECO Service)?"

**Durante sviluppo:**
> "Ho estratto il servizio ATECO, test 45/45 verdi. Posso testare locale?"

**Prima di commit:**
> "Tutto funziona, test locali OK. Posso committare?"

**Prima di push:**
> "Commit fatto. Posso pushare su GitHub?"

### Mai Fare Senza Chiedere:
- ❌ Push su branch main
- ❌ Deploy produzione
- ❌ Rimuovere vecchi endpoint
- ❌ Modifiche breaking changes

---

## 📖 Riferimenti Documenti

### Documenti Chiave:

1. **Epic & Stories:**
   ```
   /docs/refactoring/REFACTORING_EPIC_STORIES.md
   ```

2. **Story 1.6 (Completata):**
   ```
   /docs/stories/story-1.6-expand-test-coverage.md
   ```

3. **Architectural Proposal:**
   ```
   /docs/refactoring/ARCHITECTURAL_REFACTORING_PROPOSAL.md
   ```

4. **Code Review:**
   ```
   /docs/refactoring/CODE_REVIEW_REPORT.md
   ```

---

## ✅ Checklist Nuova Sessione

Prima di iniziare:
- [ ] Letto questo documento
- [ ] Verificato repository path
- [ ] Verificato git branch
- [ ] Run pytest → 147 passing
- [ ] Capito Story 2.2 obiettivi
- [ ] Chiesto OK a Clo

Durante Story:
- [ ] Branch isolato creato
- [ ] Test scritti PRIMA del codice
- [ ] Test 100% verdi
- [ ] Test locale con Clo
- [ ] Commit solo dopo OK
- [ ] Push solo dopo OK

---

## 🎯 Obiettivo Finale

**DA:** main.py (3910 linee monolite)
**A:** Architettura modulare (6 servizi + routers)

**Dopo Refactoring:**
- ✅ 85% test coverage
- ✅ Main.py <200 linee
- ✅ Moduli indipendenti
- ✅ Scalabile per nuovi moduli
- ✅ Team-ready
- ✅ Performance migliorate (2-3x)

---

**Buon Lavoro Amelia! 🚀**

---

*Documento creato da: Amelia (Claude Code)*
*Per: Amelia (prossima sessione)*
*Data: 27 Ottobre 2025*
*Progetto: SYD Cyber Backend Refactoring*
