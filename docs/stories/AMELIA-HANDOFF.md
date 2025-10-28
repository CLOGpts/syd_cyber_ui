# 🤖 AMELIA HANDOFF - SYD Cyber Refactoring

**Data Handoff:** 28 Ottobre 2025
**Progetto:** SYD Cyber Backend Refactoring
**Obiettivo:** Completare refactoring modulare (Story 2.6 + 2.7)
**Status:** 80% completato - mancano 2 story finali

---

## 🎯 CHI SEI

**Nome:** Amelia 💻
**Ruolo:** Developer Agent (BMAD)
**Task:** Completare refactoring backend SYD Cyber

**IMPORTANTE:** Ad ogni step, presentati:
> "Ciao! Sono Amelia 💻, Developer Agent BMAD. Sto continuando il refactoring backend."

---

## 📂 DIRECTORY - LEGGI BENE

```
FRONTEND UI + DOCS (qui trovi documentazione):
/mnt/c/Users/speci/Desktop/Varie/syd_cyber/ui/BMAD-METHOD/
├── docs/
│   ├── stories/
│   │   ├── AMELIA-HANDOFF.md         ← Questo file
│   │   ├── story-2.2-extract-ateco-service.md
│   │   ├── story-2.3-extract-risk-service.md
│   │   └── story-2.2-context.json
│   ├── ANALYST-BRIEF.md
│   └── SYD-BUSINESS-PLAN.md
└── (questo è il frontend React)

BACKEND (qui lavori sul codice):
/mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco/
├── app/
│   ├── services/
│   │   ├── risk_service.py          ✅ Story 2.3
│   │   ├── visura_service.py        ✅ Story 2.4
│   │   └── db_admin_service.py      ✅ Story 2.5
│   └── routers/
│       ├── risk.py                  ✅ Story 2.3
│       ├── visura.py                ✅ Story 2.4
│       └── db_admin.py              ✅ Story 2.5
├── tests/
│   ├── unit/
│   └── integration/
├── main.py                          (3935 righe - da pulire)
├── ateco_lookup.py                  (1517 righe - da rimuovere)
└── requirements.txt

Git Remote: git@github.com:CLOGpts/ateco-lookup.git
```

---

## ✅ STATO ATTUALE (cosa è stato fatto)

### Stories Completate

**✅ Story 2.3: Risk Service** (COMPLETATA)
- Service: `app/services/risk_service.py` (21KB)
- Router: `app/routers/risk.py` (13KB)
- Test: 48 unit test
- Branch: `feature/story-2.3-complete` ✅ pushato
- Dual endpoints: vecchi `/events/*` + nuovi `/risk/*`

**✅ Story 2.4: Visura Service** (COMPLETATA)
- Service: `app/services/visura_service.py` (28KB)
- Router: `app/routers/visura.py` (6KB)
- Test: 63 unit test
- Branch: `feature/story-2.4-complete` ✅ pushato
- Dual endpoints: vecchi `/api/extract-visura` + nuovi `/visura/*`

**✅ Story 2.5: DB Admin Service** (COMPLETATA)
- Service: `app/services/db_admin_service.py` (22KB)
- Router: `app/routers/db_admin.py` (11KB)
- Test: 19 unit test
- Branch: `feature/story-2.5-db-admin` ✅ pushato
- Dual endpoints: vecchi `/api/*` + nuovi `/db-admin/*`

### Test Coverage

```bash
Total: 130 tests passing ✅
- Story 2.3 (Risk): 48 test
- Story 2.4 (Visura): 63 test
- Story 2.5 (DB Admin): 19 test
```

### Git Status

```
Branch main (locale):
- 6 commits avanti rispetto a origin/main
- Contiene tutte e 3 le storie (2.3 + 2.4 + 2.5)
- NON ancora pushato su origin/main

Branch remoti su GitHub:
- feature/story-2.3-complete ✅
- feature/story-2.4-complete ✅
- feature/story-2.5-db-admin ✅
```

---

## 🎯 STRATEGIA REFACTORING (importante capire)

**Obiettivo:** Passare da monolite a modulare SENZA rompere nulla

**Come:**
1. Creare codice NUOVO modulare (services + routers)
2. Tenerlo IN PARALLELO con il vecchio monolite
3. Dual endpoints: vecchi + nuovi coesistono
4. Utenti continuano a usare endpoint vecchi (stabili)
5. Testare endpoint nuovi in parallelo
6. ALLA FINE: rimuovere vecchio, tenere solo nuovo

**Perché è sicuro:**
- ✅ Utenti in beta testing non vengono disturbati
- ✅ Se nuovo ha bug → vecchio funziona sempre
- ✅ Zero breaking changes
- ✅ Merge incrementali

---

## 🚀 COSA DEVI FARE (le 2 story finali)

### Story 2.6: Extract Seismic Zones Service

**Tempo stimato:** 2-3 ore
**Difficoltà:** Bassa (stesso pattern delle altre)

**Task:**
1. Creare `app/services/seismic_service.py`
   - Estrarre logica zone sismiche da main.py (~300 righe)
   - Load zone_sismiche_comuni.json
   - Funzioni lookup per comune/CAP

2. Creare `app/routers/seismic.py`
   - Endpoint: `GET /seismic/zone?comune=Roma`
   - Endpoint: `GET /seismic/zone-by-cap?cap=00100`
   - Dual mode con vecchi endpoint

3. Scrivere test unitari (20+ test)
   - `tests/unit/services/test_seismic_service.py`
   - `tests/unit/routers/test_seismic.py`

4. Branch: `feature/story-2.6-seismic`

5. Push quando Clo approva

### Story 2.7: Final Cleanup & Consolidation

**Tempo stimato:** 1-2 ore
**Difficoltà:** Media (attenzione a non rompere)

**Task:**
1. **Rimuovere monolite ATECO**
   - Cancellare `ateco_lookup.py` (1517 righe)
   - Verificare che nessun import lo usi

2. **Pulire main.py** (3935 → ~200 righe)
   - Rimuovere endpoint vecchi (dual mode → solo nuovo)
   - Tenere solo:
     - Import routers
     - App setup
     - CORS config
     - Startup/shutdown
   - Rimuovere tutta la business logic

3. **Merge branch su main**
   - Merge tutte le feature branch
   - Verifica 130+ test passano
   - Push finale su origin/main

4. **Documentazione**
   - Aggiornare README
   - Aggiornare API docs

---

## 📋 WORKFLOW OBBLIGATORIO (segui sempre)

### Prima di Iniziare Ogni Task

```bash
# 1. Presentati
"Ciao! Sono Amelia 💻, Developer Agent BMAD."

# 2. Verifica directory
cd /mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco
pwd

# 3. Verifica branch
git branch
git status

# 4. Chiedi conferma
"Clo, posso iniziare Story 2.6 (Seismic Zones)?"
```

### Durante Sviluppo

**Regola: PICCOLI STEP**

1. **Crea 1 file alla volta**
   - Esempio: prima `seismic_service.py`, poi `seismic.py`

2. **Scrivi test SUBITO dopo ogni file**
   - Service → Test service
   - Router → Test router

3. **Run test dopo OGNI modifica**
   ```bash
   pytest tests/ -v
   # TUTTI VERDI → procedi
   # UNO ROSSO → STOP e fix
   ```

4. **Chiedi conferma a Clo ogni 2-3 step**
   - "Ho creato seismic_service.py, test 145/145 verdi. Procedo con router?"

### Test Workflow

**Chi fa cosa:**

1. **TU (Amelia) fai:**
   - Unit test (pytest)
   - Integration test (pytest)
   - Verifica che tutti i test passano

2. **CLO fa:**
   - Test manuale sul browser
   - Verifica frontend funziona
   - Prova endpoint vecchi + nuovi

**Sequenza:**
```
1. TU: "Ho finito service + test. 145 test verdi."
2. CLO: "OK, avvio server e testo."
3. CLO testa locale → dice "OK" oppure "NO"
4. Se OK → procedi con commit
5. Se NO → fix problema
```

### Commit & Push

**Solo dopo OK di Clo:**

```bash
# 1. Crea branch feature
git checkout -b feature/story-2.6-seismic

# 2. Add files
git add app/services/seismic_service.py
git add app/routers/seismic.py
git add tests/unit/services/test_seismic_service.py
git add tests/unit/routers/test_seismic.py
git add main.py

# 3. Commit con messaggio chiaro
git commit -m "feat: extract Seismic Zones Service (Story 2.6)

- Create app/services/seismic_service.py
- Create app/routers/seismic.py
- Add 20+ unit tests
- Dual endpoints for backward compatibility
- All 150+ tests passing

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Push
git push -u origin feature/story-2.6-seismic

# 5. Torna su main
git checkout main
```

---

## 🚨 REGOLE DI SICUREZZA (non violare MAI)

### OBBLIGATORIO

1. ✅ **Branch isolato per ogni story**
   - NON lavorare mai su main diretto
   - Sempre `feature/story-X.X-nome`

2. ✅ **Test PRIMA di commit**
   - Tutti i test devono essere verdi
   - Nessuna eccezione

3. ✅ **Dual endpoints durante refactoring**
   - Vecchi endpoint RESTANO attivi
   - Nuovi endpoint aggiunti
   - Solo in Story 2.7 rimuovi vecchi

4. ✅ **Clo approva PRIMA di push**
   - Non pushare senza conferma
   - Clo deve testare locale

5. ✅ **NO breaking changes**
   - API responses identiche
   - Frontend continua a funzionare
   - Utenti non notano nulla

### VIETATO

- ❌ Push su origin/main senza approvazione
- ❌ Rimuovere endpoint vecchi prima di Story 2.7
- ❌ Modifiche che rompono test esistenti
- ❌ Deploy produzione senza Clo
- ❌ Commit senza test verdi

---

## 🔧 COMANDI UTILI

### Setup Ambiente

```bash
# Directory backend
cd /mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco

# Check status
git status
git branch
```

### Run Tests

```bash
# Tutti i test
pytest tests/ -v

# Solo nuovi test
pytest tests/unit/services/test_seismic_service.py -v

# Con coverage
pytest tests/ --cov=app --cov-report=term-missing
```

### Run Server Locale (per Clo)

```bash
# Avvio server
python3 main.py --serve --host 127.0.0.1 --port 8000

# Oppure
uvicorn main:app --reload --port 8000

# Test:
# http://127.0.0.1:8000/health
# http://127.0.0.1:8000/docs
```

### Git Workflow

```bash
# Crea branch story
git checkout -b feature/story-2.6-seismic

# Status
git status

# Commit
git add .
git commit -m "feat(story-2.6): ..."

# Push
git push -u origin feature/story-2.6-seismic

# Torna main
git checkout main

# Merge (solo se Clo dice OK)
git merge feature/story-2.6-seismic
```

---

## 🎯 OBIETTIVO FINALE

**DA:**
```
main.py: 3935 righe (monolite)
ateco_lookup.py: 1517 righe (monolite)
Business logic sparsa ovunque
```

**A:**
```
main.py: ~200 righe (solo bootstrap)
app/services/: 5 servizi modulari
app/routers/: 5 routers puliti
Test coverage: 85%+
Architettura scalabile
```

---

## 💬 FRASI CHIAVE per Comunicare con Clo

**All'inizio:**
> "Ciao! Sono Amelia 💻, Developer Agent BMAD. Ho letto l'handoff. Siamo a Story 2.6 (Seismic Zones), poi Story 2.7 (Final Cleanup) e abbiamo finito. Posso iniziare?"

**Durante sviluppo:**
> "Ho estratto seismic_service.py, test 145/145 verdi. Posso creare il router?"

**Dopo test unitari:**
> "Tutto pronto: service + router + 20 test. Tutti verdi. Puoi testare locale?"

**Prima di commit:**
> "Test locale OK? Posso committare?"

**Prima di push:**
> "Commit fatto su branch feature/story-2.6-seismic. Posso pushare?"

**A fine story:**
> "Story 2.6 completata e pushata! Procedo con Story 2.7 (Final Cleanup)?"

---

## 🚨 Se Qualcosa Va Storto

### Test Falliscono

```bash
# Vedi cosa è cambiato
git status
git diff

# Ripristina file
git restore <file>

# Oppure stash temporaneo
git stash
```

### Branch Sbagliato

```bash
# Salva modifiche
git stash

# Cambia branch
git checkout <branch-corretto>

# Riprendi modifiche
git stash pop
```

### Clo dice "Non Funziona"

```bash
# Vedi ultimo commit
git log -1

# Annulla commit (mantieni modifiche)
git reset --soft HEAD~1

# Fix problema
# Re-test
# Re-commit
```

---

## 📖 RIFERIMENTI DOCUMENTI

**Story Details:**
```
/docs/stories/story-2.2-extract-ateco-service.md
/docs/stories/story-2.3-extract-risk-service.md
/docs/stories/story-2.2-context.json
```

**Business Context:**
```
/docs/ANALYST-BRIEF.md
/docs/SYD-BUSINESS-PLAN.md
```

**Codice Backend:**
```
/mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco/
```

---

## ✅ CHECKLIST INIZIO SESSIONE

Prima di iniziare:
- [ ] Letto questo handoff completo
- [ ] Verificato directory backend corretta
- [ ] Verificato git branch
- [ ] Run pytest → 130 passing
- [ ] Capito obiettivo Story 2.6 + 2.7
- [ ] Presentato come Amelia BMAD
- [ ] Chiesto OK a Clo

---

## 📊 PROGRESS TRACKER

```
Story 1.6: Test Coverage        ✅ COMPLETATA
Story 2.1: Health Check         ✅ COMPLETATA
Story 2.2: ATECO Service        ✅ COMPLETATA (branch separato)
Story 2.3: Risk Service         ✅ COMPLETATA
Story 2.4: Visura Service       ✅ COMPLETATA
Story 2.5: DB Admin Service     ✅ COMPLETATA
Story 2.6: Seismic Zones        ⏳ DA FARE (prossima)
Story 2.7: Final Cleanup        ⏳ DA FARE (ultima)
```

**Progresso:** 80% completato
**Tempo stimato rimanente:** 4-5 ore

---

## 🎉 QUANDO HAI FINITO

**Dopo Story 2.7:**

1. Verifica finale:
   - ✅ main.py ~200 righe
   - ✅ ateco_lookup.py rimosso
   - ✅ Tutti test passano (130+)
   - ✅ Clo ha testato tutto

2. Merge finale su origin/main:
   ```bash
   git checkout main
   git push origin main
   ```

3. Messaggio finale:
   > "🎉 Refactoring completato! Architettura modulare pronta. Backend da 3935 righe monolite → 200 righe + 5 servizi modulari. 130+ test verdi. Production-ready!"

---

**Buon Lavoro Amelia! 🚀**

**Ricorda:**
- Piccoli step
- Test sempre verdi
- Conferma con Clo ad ogni fase
- Dual endpoints fino a Story 2.7

---

*Documento creato da: Amelia (Claude Code)*
*Per: Amelia (prossima sessione)*
*Data: 28 Ottobre 2025*
*Progetto: SYD Cyber Backend Refactoring (Final Phase)*
