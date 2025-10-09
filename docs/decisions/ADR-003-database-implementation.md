# ADR-003: Implementazione Database PostgreSQL

**Status**: 🟡 Accepted (In Progress)
**Date**: 2025-10-09
**Author**: Claudio + Claude AI
**Deciders**: Claudio (Product Owner)

---

## 📋 Context

SYD Cyber attualmente utilizza file JSON e Excel per memorizzare dati statici (eventi di rischio, codici ATECO, zone sismiche). **Non esiste persistenza per le valutazioni degli utenti**.

### Problemi Attuali:
- ❌ Valutazioni perse al restart del server
- ❌ Nessuno storico per consultanti/aziende
- ❌ Impossibile fare analisi trend
- ❌ Dati lenti da caricare (parsing JSON/Excel ogni avvio)
- ❌ Non scalabile per 100+ utenti

### Requisiti:
- ✅ Salvare storico valutazioni permanentemente
- ✅ Associare valutazioni a utenti e aziende
- ✅ Statistiche aggregate (rischio medio per settore, eventi più frequenti)
- ✅ Supportare 100 utenti concorrenti
- ✅ Backup automatici
- ✅ Performance: < 500ms query time

---

## 🎯 Decision

**Adottare PostgreSQL come database primario** con architettura relazionale.

### Perché PostgreSQL:
1. **Open Source** - Gratuito, community attiva
2. **Railway Integration** - Addon nativo (1GB free tier)
3. **Relazionale** - Perfetto per relazioni users → assessments → companies
4. **Performance** - Indici, query optimization, connection pooling
5. **Backup** - Railway backup giornalieri automatici
6. **Scalabile** - Gestisce milioni di record senza problemi
7. **SQLAlchemy Support** - ORM Python maturo e stabile

### Alternative Considerate:

| Opzione | Pro | Contro | Decisione |
|---------|-----|--------|-----------|
| **PostgreSQL** ✅ | Relazionale, Railway native, gratuito | Setup iniziale | **SCELTO** |
| MongoDB | NoSQL flessibile | Non relazionale, Railway non native | ❌ Scartato |
| SQLite | File-based, zero config | Non adatto per produzione multi-user | ❌ Scartato |
| MySQL | Popolare, simile a PostgreSQL | Railway addon paid | ❌ Scartato |
| Firebase Firestore | Già usato per auth | Costo scala male, lock-in | ❌ Scartato |

---

## 📐 Database Schema

### **Architettura Overview**

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   users     │────┐    │ assessments  │────┐    │  companies  │
│ (100 users) │    │    │ (migliaia)   │    │    │  (centinaia)│
└─────────────┘    │    └──────────────┘    │    └─────────────┘
                   │            │            │
                   └────────────┼────────────┘
                                │
                   ┌────────────┴────────────┐
                   │                         │
           ┌───────▼──────┐         ┌───────▼──────┐
           │ risk_events  │         │ ateco_codes  │
           │ (191 eventi) │         │ (25K codici) │
           └──────────────┘         └──────────────┘
                                            │
                                    ┌───────▼──────┐
                                    │seismic_zones │
                                    │(8,102 comuni)│
                                    └──────────────┘
```

---

### **Tabella 1: `users` (Consultanti)**

**Scopo**: Gestire i 3 consultanti attuali (scalabile a 100)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | ID univoco utente |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email (login) |
| `name` | VARCHAR(100) | NOT NULL | Nome consultante |
| `subdomain` | VARCHAR(50) | UNIQUE | dario/marcello/claudio |
| `role` | ENUM | DEFAULT 'consultant' | consultant/admin |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Data creazione |
| `last_login` | TIMESTAMP | NULLABLE | Ultimo accesso |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account attivo |

**Indici**:
- PRIMARY KEY su `id`
- UNIQUE INDEX su `email`
- INDEX su `subdomain`

**Dimensioni stimate**: 100 utenti × 500 bytes = **50 KB**

---

### **Tabella 2: `companies` (Aziende Analizzate)**

**Scopo**: Anagrafica aziende clienti per riuso dati

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | ID univoco azienda |
| `partita_iva` | VARCHAR(11) | UNIQUE, NOT NULL | P.IVA (11 cifre) |
| `codice_ateco` | VARCHAR(10) | NOT NULL | ATECO 2025 (XX.XX.XX) |
| `ragione_sociale` | VARCHAR(255) | NOT NULL | Nome azienda |
| `oggetto_sociale` | TEXT | NULLABLE | Descrizione attività |
| `comune` | VARCHAR(100) | NULLABLE | Sede legale comune |
| `provincia` | VARCHAR(2) | NULLABLE | Sigla provincia |
| `zona_sismica` | INTEGER | NULLABLE | 1-4 (calcolato) |
| `created_by_user_id` | UUID | FOREIGN KEY → users(id) | Chi ha creato |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Prima valutazione |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Ultimo aggiornamento |

**Indici**:
- PRIMARY KEY su `id`
- UNIQUE INDEX su `partita_iva`
- INDEX su `codice_ateco` (per stats settore)
- INDEX su `created_by_user_id` (per ricerche consultante)

**Dimensioni stimate**: 500 aziende × 2 KB = **1 MB**

---

### **Tabella 3: `assessments` (Valutazioni Rischio)**

**Scopo**: Salvare ogni valutazione di rischio completata

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | ID univoco assessment |
| `user_id` | UUID | FOREIGN KEY → users(id) | Consultante che ha fatto assessment |
| `company_id` | UUID | FOREIGN KEY → companies(id) | Azienda valutata |
| `event_code` | VARCHAR(10) | FOREIGN KEY → risk_events(code) | Evento valutato (es: "101") |
| `risk_score` | INTEGER | CHECK (0-100) | Score calcolato 0-100 |
| `risk_level` | VARCHAR(20) | NOT NULL | Low/Medium/High/Critical |
| `matrix_position` | VARCHAR(5) | NOT NULL | Posizione matrice (A1-D4) |
| `economic_loss` | CHAR(1) | CHECK (G/Y/O/R) | Verde/Giallo/Arancio/Rosso |
| `non_economic_loss` | CHAR(1) | CHECK (G/Y/O/R) | Verde/Giallo/Arancio/Rosso |
| `control_level` | VARCHAR(2) | CHECK (++/+/-/--) | Livello controlli |
| `financial_impact` | VARCHAR(50) | NULLABLE | Range (es: "10-50K€") |
| `image_impact` | BOOLEAN | DEFAULT FALSE | Impatto immagine |
| `regulatory_impact` | BOOLEAN | DEFAULT FALSE | Conseguenze regolamentari |
| `criminal_impact` | BOOLEAN | DEFAULT FALSE | Conseguenze penali |
| `notes` | TEXT | NULLABLE | Note consultante |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Data valutazione |

**Indici**:
- PRIMARY KEY su `id`
- INDEX su `user_id` (ricerche per consultante)
- INDEX su `company_id` (storico azienda)
- INDEX su `event_code` (statistiche per evento)
- COMPOSITE INDEX su `(company_id, created_at)` (timeline azienda)

**Dimensioni stimate**:
- 100 utenti × 50 aziende × 10 valutazioni = 50,000 assessments
- 50,000 × 1 KB = **50 MB**

---

### **Tabella 4: `risk_events` (191 Eventi di Rischio)**

**Scopo**: Catalogo eventi da JSON (MAPPATURE_EXCEL_PERFETTE.json)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `code` | VARCHAR(10) | PRIMARY KEY | Codice evento (101, 201, etc.) |
| `name` | VARCHAR(255) | NOT NULL | Nome evento |
| `category` | VARCHAR(100) | NOT NULL | Categoria Basel II (7 categorie) |
| `description` | TEXT | NULLABLE | Descrizione dettagliata (VLOOKUP) |
| `severity` | VARCHAR(20) | DEFAULT 'medium' | low/medium/high/critical |
| `suggested_controls` | JSON | NULLABLE | Array controlli suggeriti |

**Indici**:
- PRIMARY KEY su `code`
- INDEX su `category` (ricerca per categoria)

**Dimensioni stimate**: 191 eventi × 2 KB = **382 KB**

---

### **Tabella 5: `ateco_codes` (25,000+ Codici ATECO)**

**Scopo**: Lookup ATECO 2022 → 2025 da Excel

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-increment |
| `code_2022` | VARCHAR(10) | NULLABLE | Codice ATECO 2022 (XX.XX) |
| `code_2025` | VARCHAR(10) | NOT NULL | Codice ATECO 2025 (XX.XX.XX) |
| `code_2025_camerale` | VARCHAR(10) | NULLABLE | Variante sistema camerale |
| `title_2022` | TEXT | NULLABLE | Descrizione 2022 |
| `title_2025` | TEXT | NOT NULL | Descrizione 2025 |
| `hierarchy` | VARCHAR(20) | NULLABLE | Sezione/Divisione/Gruppo |
| `sector` | VARCHAR(50) | NULLABLE | Settore (chimico/ict/finance) |
| `regulations` | JSON | NULLABLE | Array normative applicabili |
| `certifications` | JSON | NULLABLE | Array certificazioni |

**Indici**:
- PRIMARY KEY su `id`
- UNIQUE INDEX su `code_2025`
- INDEX su `code_2022` (conversione 2022→2025)
- INDEX su `sector` (statistiche settore)
- GIN INDEX su `regulations` (ricerca JSON)

**Dimensioni stimate**: 25,000 codici × 3 KB = **75 MB**

---

### **Tabella 6: `seismic_zones` (8,102 Comuni Italiani)**

**Scopo**: Database completo zone sismiche ISTAT

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-increment |
| `comune` | VARCHAR(100) | NOT NULL | Nome comune (UPPERCASE) |
| `provincia` | VARCHAR(2) | NOT NULL | Sigla provincia |
| `regione` | VARCHAR(50) | NOT NULL | Regione italiana |
| `zona_sismica` | INTEGER | CHECK (1-4) | 1=Alta, 4=Bassa |
| `accelerazione_ag` | DECIMAL(4,2) | NOT NULL | Accelerazione g (0.00-0.35) |
| `risk_level` | VARCHAR(20) | NOT NULL | Molto Alta/Alta/Media/Bassa |

**Indici**:
- PRIMARY KEY su `id`
- UNIQUE INDEX su `(comune, provincia)` (disambiguazione omonimi)
- INDEX su `provincia` (ricerca regionale)
- INDEX su `zona_sismica` (filtro per zona)

**Dimensioni stimate**: 8,102 comuni × 500 bytes = **4 MB**

---

## 📊 Relazioni (Foreign Keys)

```sql
assessments.user_id → users.id (ON DELETE CASCADE)
assessments.company_id → companies.id (ON DELETE CASCADE)
assessments.event_code → risk_events.code (ON DELETE RESTRICT)
companies.created_by_user_id → users.id (ON DELETE SET NULL)
```

**Spiegazione**:
- Se cancelli un utente → cancelli anche i suoi assessment (CASCADE)
- Se cancelli un'azienda → cancelli assessment relativi (CASCADE)
- **NON** puoi cancellare un evento se ci sono assessment collegati (RESTRICT)

---

## 🔧 Tecnologie

### Stack:
- **Database**: PostgreSQL 15+ (Railway addon)
- **ORM**: SQLAlchemy 2.0+ (Python)
- **Migration**: Alembic (versioning schema)
- **Connection Pool**: psycopg2 + SQLAlchemy pooling
- **Backup**: Railway automatic daily backups

### Configuration:
```python
DATABASE_URL = "postgresql://user:password@host:5432/sydcyber"
POOL_SIZE = 20  # Per 100 utenti concorrenti
MAX_OVERFLOW = 10
POOL_TIMEOUT = 30
```

---

## 📈 Performance Estimates

### Storage (1 anno operativo):

| Tabella | Righe Stimate | Storage |
|---------|---------------|---------|
| users | 100 | 50 KB |
| companies | 500 | 1 MB |
| assessments | 50,000 | 50 MB |
| risk_events | 191 | 382 KB |
| ateco_codes | 25,000 | 75 MB |
| seismic_zones | 8,102 | 4 MB |
| **TOTAL** | **83,893** | **~130 MB** |

**Railway Free Tier**: 1 GB → Supporta 7+ anni di dati 🎉

### Query Performance:

| Query | Tempo Stimato | Ottimizzazione |
|-------|---------------|----------------|
| Lookup ATECO | < 10ms | INDEX su code_2022/2025 |
| Zona sismica | < 5ms | INDEX su (comune, provincia) |
| Storico azienda | < 50ms | COMPOSITE INDEX |
| Stats settore | < 100ms | INDEX + GROUP BY |
| Insert assessment | < 20ms | FOREIGN KEY checks |

---

## 🚀 Migration Strategy

### Fase 1: Setup (1 giorno)
1. Attivare PostgreSQL addon su Railway
2. Installare SQLAlchemy + Alembic
3. Creare modelli Python (6 tabelle)
4. Testare connessione

### Fase 2: Data Migration (3 giorni)
1. Script `migrate_risk_events.py` → Import JSON
2. Script `migrate_ateco.py` → Import Excel
3. Script `migrate_seismic.py` → Import JSON + completare ISTAT
4. Validazione integrità dati

### Fase 3: Backend Integration (3 giorni)
1. Aggiornare endpoint `/lookup` → query DB
2. Aggiornare endpoint `/events/{category}` → query DB
3. **NUOVO** endpoint `/assessments` → CRUD
4. **NUOVO** endpoint `/companies` → CRUD
5. **NUOVO** endpoint `/stats` → analytics

### Fase 4: Testing (1 giorno)
1. Unit test CRUD operations
2. Integration test API endpoints
3. Performance test (100 concurrent users)
4. Backup/restore test

---

## ✅ Success Criteria

- [ ] Database live su Railway con 6 tabelle
- [ ] 100% dati migrati (191 eventi, 25K ATECO, 8K comuni)
- [ ] Endpoint `/assessments` funzionante (GET/POST)
- [ ] Query < 500ms @ 95 percentile
- [ ] Backup automatici attivi
- [ ] Zero data loss in 1 settimana test

---

## ⚠️ Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Migration data loss | Medium | High | Backup JSON/Excel prima di migrare |
| Railway free tier esaurito | Low | Medium | Monitor storage, upgrade se necessario ($5/mo) |
| Performance degradation | Low | Medium | Indici corretti, connection pooling |
| Breaking changes frontend | Medium | High | Mantenere endpoint compatibili durante transition |

---

## 📚 References

- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [Railway PostgreSQL](https://docs.railway.app/databases/postgresql)
- [ADR-001: ATECO Integration](./ADR-001-ateco-integration-strategy.md)

---

**Decision Date**: 2025-10-09
**Implementation Start**: 2025-10-09
**Target Completion**: 2025-10-20 (10 giorni)
