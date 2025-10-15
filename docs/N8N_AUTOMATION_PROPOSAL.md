# 🤖 n8n Automation Proposal - SYD CYBER

**Documento**: Proposta Integrazione n8n per Automation
**Data Creazione**: 13 Ottobre 2025
**Autore**: Claude AI + Claudio
**Status**: 💡 Proposta da valutare

---

## 📋 INDICE

1. [Cos'è n8n](#cosè-n8n)
2. [Architettura Integrazione](#architettura-integrazione)
3. [Workflow Prioritari](#workflow-prioritari)
4. [Setup Tecnico](#setup-tecnico)
5. [Roadmap Implementazione](#roadmap-implementazione)
6. [ROI e Impatto](#roi-e-impatto)

---

## 🎯 COS'È n8n

**n8n** (n-eight-n) = **"nodemation"**

- **Workflow automation platform** open-source (come Zapier/Make)
- **Visual node-based editor** (drag & drop)
- **500+ integrazioni** pronte (API, database, AI, email, etc.)
- **Self-hosted** o Cloud (pieno controllo dati)

### Perché per SYD CYBER?

SYD CYBER è **perfetto per automation** perché:
- ✅ Workflow ripetitivi (onboarding clienti, report, notifiche)
- ✅ Molte integrazioni (PostgreSQL, Gemini AI, email, cloud storage)
- ✅ Eventi trigger chiari (assessment completato, rischio critico, etc.)
- ✅ Valore enorme per consulenti (risparmio tempo 70%)

---

## 🏗️ ARCHITETTURA INTEGRAZIONE

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  User completa assessment → Trigger webhook                  │
└───────────────────┬─────────────────────────────────────────┘
                    │ POST /webhook/assessment-complete
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    n8n WORKFLOW ENGINE                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Workflow 1: Report Generation & Distribution       │   │
│  │  Workflow 2: Risk Alerts & Monitoring               │   │
│  │  Workflow 3: Client Onboarding Automation           │   │
│  │  Workflow 4: AI Analysis Enhancement                │   │
│  │  Workflow 5: Business Intelligence                  │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬──────────────┐
        ▼           ▼           ▼              ▼
    ┌─────┐   ┌─────────┐  ┌────────┐   ┌──────────┐
    │EMAIL│   │PostgreSQL│ │ Gemini │   │  Slack   │
    │SMTP │   │ Database │  │   AI   │   │  Teams   │
    └─────┘   └─────────┘  └────────┘   └──────────┘
```

### Punti di Integrazione

1. **Webhook Endpoints** (da creare in backend FastAPI):
   - `/webhook/assessment-complete`
   - `/webhook/risk-critical`
   - `/webhook/client-created`

2. **PostgreSQL Direct Access**:
   - n8n legge/scrive direttamente nel database
   - Query custom per analytics
   - Trigger su INSERT/UPDATE

3. **Gemini AI Integration**:
   - n8n chiama Gemini per analisi avanzate
   - Post-processing risposte AI
   - Batch operations

---

## 🎯 WORKFLOW PRIORITARI

### 🥇 WORKFLOW 1: Report Generation Pipeline ⭐⭐⭐

**Priorità**: ALTISSIMA
**Effort**: 2-3 ore setup
**Impatto**: Risparmio 15 min per report × N clienti/giorno

#### Flow Dettagliato

```
Trigger: Webhook POST /webhook/assessment-complete
Input: { assessmentId, userId, clientName }
  ↓
Node 1: PostgreSQL Query
  SELECT * FROM assessments
  WHERE id = {{ $json.assessmentId }}
  ↓
Node 2: PostgreSQL Query - Risk Events
  SELECT * FROM assessment_events
  WHERE assessment_id = {{ $json.assessmentId }}
  ↓
Node 3: Data Transformation
  Aggrega dati per categoria
  Calcola statistiche (High/Critical count, etc.)
  ↓
Node 4: IF risk_score > 75 THEN
  └─ Add "URGENTE" label to subject
  ↓
Node 5: Generate PDF (API call o node PDF)
  Template: report_template.html
  Data: assessment + events + statistics
  ↓
Node 6: [PARALLELO - 3 branch]
  ├─ Branch A: Email to Consulente
  │   ├─ To: {{ $json.consultant_email }}
  │   ├─ Subject: "Report {clientName} pronto ✅"
  │   └─ Attachment: report.pdf
  │
  ├─ Branch B: Email to Cliente (CC)
  │   ├─ To: {{ $json.client_email }}
  │   ├─ Subject: "La tua valutazione rischio cyber"
  │   └─ Attachment: report.pdf
  │
  └─ Branch C: Upload Google Drive
      ├─ Folder: /Clienti/{clientName}/Reports/
      └─ Filename: Report_{date}_{clientName}.pdf
  ↓
Node 7: Update Database
  UPDATE assessments
  SET report_sent = true,
      report_sent_at = NOW()
  WHERE id = {{ $json.assessmentId }}
  ↓
Node 8: Slack Notification
  Channel: #syd-reports
  Message: "📊 Report inviato: {clientName} | Score: {riskScore}"
```

#### Benefici

- ✅ Zero click per consulente (tutto automatico)
- ✅ Report salvato in cloud (non si perde mai)
- ✅ Cliente riceve report immediatamente
- ✅ Tracciabilità completa (timestamp, log)
- ✅ Consulente può lavorare su altro cliente nel frattempo

---

### 🥈 WORKFLOW 2: Smart Risk Alerting ⭐⭐⭐

**Priorità**: ALTA
**Effort**: 1-2 ore setup
**Impatto**: Risposta immediata a rischi critici (<5 min)

#### Flow Dettagliato

```
Trigger: Polling PostgreSQL ogni 5 minuti
  ↓
Node 1: Query New Critical Risks
  SELECT a.*, c.name as client_name, u.email as consultant_email
  FROM assessments a
  JOIN companies c ON a.company_id = c.id
  JOIN users u ON a.user_id = u.id
  WHERE a.risk_level IN ('High', 'Critical')
    AND a.notified = false
    AND a.created_at > NOW() - INTERVAL '10 minutes'
  ↓
Node 2: IF (results > 0) → Continue, ELSE Stop
  ↓
Node 3: Loop Over Each Risk
  ↓
Node 4: Switch by Risk Level
  ├─ CASE: risk_level = 'Critical'
  │   ├─ Send SMS (Twilio node)
  │   │   To: consultant_phone
  │   │   Message: "🚨 RISCHIO CRITICO: {client_name}"
  │   │
  │   ├─ Call PagerDuty/Incident API
  │   │   Severity: high
  │   │   Description: "Critical risk for {client_name}"
  │   │
  │   └─ Email URGENT
  │       Subject: "🚨 URGENTE: Rischio Critico {client_name}"
  │       Priority: High
  │
  └─ CASE: risk_level = 'High'
      ├─ Email notification
      │   Subject: "⚠️ Rischio High: {client_name}"
      │
      └─ Slack message
          Channel: #risk-alerts
  ↓
Node 5: [OPZIONALE] AI Analysis
  Gemini API Call:
  Prompt: "Analizza questo rischio e suggerisci 3 azioni immediate:
          Cliente: {client_name}
          Settore: {ateco_code}
          Rischio: {risk_description}
          Score: {risk_score}"
  ↓
Node 6: Send AI Insights
  Email to consultant with AI suggestions
  ↓
Node 7: Update Database
  UPDATE assessments
  SET notified = true,
      notified_at = NOW()
  WHERE id = {{ $json.assessment_id }}
```

#### Benefici

- ✅ Risposta immediata a rischi critici
- ✅ Consulente sempre informato (SMS + email + Slack)
- ✅ AI suggerisce azioni concrete
- ✅ SLA garantiti (notifica entro 5 min)
- ✅ Incident management integrato

---

### 🥉 WORKFLOW 3: Client Onboarding Automation ⭐⭐

**Priorità**: MEDIA-ALTA
**Effort**: 3-4 ore setup
**Impatto**: Risparmio 15-20 min per cliente

#### Flow Dettagliato

```
Trigger: Email Received (IMAP watcher)
  Subject contains: "Nuovo cliente" OR "Visura"
  Has attachment: *.pdf
  ↓
Node 1: Download PDF Attachment
  Extract from email
  Save to temp storage
  ↓
Node 2: POST to Backend API
  Endpoint: /api/extract-visura
  Body: { file: pdf_base64 }
  ↓
Node 3: Receive Extraction Result
  {
    partita_iva: "...",
    codice_ateco: "...",
    sede_legale: {...},
    confidence: 0.95
  }
  ↓
Node 4: IF confidence >= 0.80 → Auto-process
         IF confidence < 0.80 → Manual review
  ↓
Node 5: [AUTO PROCESS BRANCH]
  ├─ Create Company in PostgreSQL
  │   INSERT INTO companies (...)
  │
  ├─ Create Google Drive Folder
  │   Path: /Clienti/{ragione_sociale}/
  │   Subfolders: /Reports, /Documenti, /Visure
  │
  ├─ Upload Original Visura
  │   To: /Clienti/{ragione_sociale}/Visure/
  │
  ├─ Create Pre-filled Assessment
  │   INSERT INTO assessments (
  │     company_id,
  │     ateco_code,
  │     status: 'draft'
  │   )
  │
  └─ Send Welcome Email to Client
      Subject: "Benvenuto in SYD Cyber"
      Body: Link to assessment + istruzioni
      Attachment: Guida_uso.pdf
  ↓
Node 6: [MANUAL REVIEW BRANCH]
  └─ Email to Consultant
      Subject: "⚠️ Visura richiede revisione manuale"
      Body: "Confidence: {confidence}%"
      Attachment: original_visura.pdf
  ↓
Node 7: Slack Notification
  Channel: #new-clients
  Message: "🎉 Nuovo cliente: {ragione_sociale} | ATECO: {code}"
```

#### Benefici

- ✅ Da email a cliente attivo in 30 secondi
- ✅ Zero data entry manuale
- ✅ Organizzazione automatica documenti
- ✅ Consulente risparmia 15-20 minuti per cliente
- ✅ Onboarding professionale e veloce

---

### 🏅 WORKFLOW 4: AI-Enhanced Risk Analysis ⭐⭐⭐

**Priorità**: ALTA (differenziatore competitivo)
**Effort**: 4-5 ore setup
**Impatto**: Syd diventa consulente proattivo senior

#### Flow Dettagliato

```
Trigger: Webhook POST /webhook/category-completed
Input: { assessmentId, category, eventsSelected }
  ↓
Node 1: Query Assessment Context
  SELECT a.*, c.ateco_code, c.sector
  FROM assessments a
  JOIN companies c ON a.company_id = c.id
  WHERE a.id = {{ $json.assessmentId }}
  ↓
Node 2: Query Industry Benchmarks (PostgreSQL)
  SELECT category, AVG(risk_score) as avg_score
  FROM assessments
  WHERE ateco_code = {{ $json.ateco_code }}
  GROUP BY category
  ↓
Node 3: Build AI Analysis Prompt
  Prompt: "
  Sei un Senior Risk Management Advisor.

  CONTESTO:
  - Cliente: {ragione_sociale}
  - Settore: {ateco_description}
  - Categoria completata: {category}
  - Eventi selezionati: {events_list}
  - Benchmark settore: {industry_avg}

  ANALISI RICHIESTA:
  1. Ci sono rischi mancanti critici per questo settore?
  2. Quali controlli sono insufficienti?
  3. Suggerisci 3 azioni prioritarie concrete
  4. Stima probabilità incidente nei prossimi 12 mesi
  5. Confronto con benchmark settore: sopra/sotto media?
  "
  ↓
Node 4: Call Gemini AI
  Model: gemini-2.5-flash
  Temperature: 0.3 (precise)
  Max tokens: 2000
  ↓
Node 5: Parse AI Response
  Extract structured data:
  - missing_risks: []
  - weak_controls: []
  - priority_actions: []
  - incident_probability: number
  - benchmark_comparison: string
  ↓
Node 6: Save AI Insights (PostgreSQL)
  INSERT INTO ai_insights (
    assessment_id,
    category,
    analysis: json,
    created_at: NOW()
  )
  ↓
Node 7: IF missing_risks.length > 0 THEN
  └─ Webhook to Frontend
      POST /webhook/ai-alert
      Trigger toast: "🔍 Syd ha trovato 2 rischi non considerati!"
  ↓
Node 8: IF weak_controls.length > 0 THEN
  └─ Generate Improvement Checklist
      Template: checklist_template.md
      Save to Google Drive: /Clienti/{name}/Checklist_Miglioramento.pdf
  ↓
Node 9: Email Summary to Consultant
  Subject: "💡 Insights AI: {client_name} - {category}"
  Body:
    - Rischi mancanti: {count}
    - Azioni prioritarie: {list}
    - Probabilità incidente: {probability}%
    - Confronto settore: {comparison}
```

#### Weekly Aggregate (Bonus)

```
Trigger: CRON - Ogni Lunedì 08:00
  ↓
Node 1: Query Last Week Insights
  SELECT ateco_code, category, analysis
  FROM ai_insights
  WHERE created_at > NOW() - INTERVAL '7 days'
  ↓
Node 2: Aggregate by Sector
  Top 10 rischi per settore
  Trend della settimana
  ↓
Node 3: Generate Newsletter Email
  Subject: "📊 SYD Weekly: Top Risks & Trends"
  Send to all consultants
```

#### Benefici

- ✅ Syd diventa consulente senior proattivo
- ✅ Zero rischi dimenticati (AI controlla sempre)
- ✅ Best practices automatiche per settore
- ✅ Consulente sempre aggiornato su trend
- ✅ Differenziatore competitivo enorme

---

### 💰 WORKFLOW 5: Business Intelligence Dashboard ⭐⭐

**Priorità**: MEDIA (nice to have)
**Effort**: 3-4 ore setup
**Impatto**: Decisioni data-driven, visibilità business

#### Flow Dettagliato

```
Trigger: CRON - Ogni Lunedì 08:00
  ↓
Node 1: Query KPI Last Week
  Queries multiple:
  - Total assessments completed
  - Avg completion time
  - Distribution by risk level
  - Top 5 categories
  - Distribution by ATECO sector
  - Critical risks count
  ↓
Node 2: Calculate Trends
  Compare with previous week
  Growth %
  ↓
Node 3: Generate Charts (Chart.js or API)
  - Bar chart: Assessments by day
  - Pie chart: Risk distribution
  - Line chart: Completion time trend
  ↓
Node 4: Create PDF Report
  Template: executive_report_template.html
  Include charts + tables
  ↓
Node 5: Email to Owner (Claudio)
  Subject: "📊 SYD CYBER Weekly Report"
  Body:
    - KPI settimana
    - Insights business
    - Azioni consigliate
  Attachment: report.pdf
  ↓
Node 6: [OPZIONALE] Slack Post
  Channel: #metrics
  Message: Summary KPI with inline charts
```

#### Benefici

- ✅ Visibilità completa su performance
- ✅ Decisioni data-driven
- ✅ Identificazione trend precoce
- ✅ Forecast revenue
- ✅ Monitoring salute business

---

## 🚀 SETUP TECNICO

### Opzione A: n8n Cloud (Consigliata per Start)

**Vantaggi**:
- ✅ Setup in 5 minuti (zero configurazione)
- ✅ Sempre online (99.9% uptime)
- ✅ Backup automatici
- ✅ Update automatici
- ✅ SSL incluso

**Svantaggi**:
- ❌ Costo mensile (€20/mese starter)
- ❌ Dipendenza servizio esterno

**Costo**: €20/mese (starter) o €50/mese (pro)

**Link**: https://n8n.io/cloud/

---

### Opzione B: Self-Hosted (Per Full Control)

**Vantaggi**:
- ✅ Pieno controllo dati
- ✅ Costo fisso basso (€5-10/mese VPS)
- ✅ Personalizzazione completa
- ✅ No limiti esecuzioni

**Svantaggi**:
- ❌ Setup iniziale 1-2 ore
- ❌ Manutenzione manuale
- ❌ Responsabilità backup

**Costo**: €5-10/mese (VPS) + €0 software (open source)

**Provider VPS consigliati**:
- DigitalOcean: $6/mese (1GB RAM)
- Hetzner: €4.5/mese (2GB RAM) ⭐ Best value
- Railway: $5/mese + pay-as-you-go

**Setup Docker**:
```bash
# Docker Compose per n8n + PostgreSQL
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.yourdomain.com/
    volumes:
      - ./n8n_data:/home/node/.n8n
```

---

### Requisiti Backend (Modifiche necessarie)

#### 1. Aggiungere Webhook Endpoints

File: `/Varie/Celerya_Cyber_Ateco/main.py`

```python
# Nuovo: Webhook endpoints per n8n
@app.post("/webhook/assessment-complete")
async def webhook_assessment_complete(data: dict):
    """
    Triggered when user completes assessment.
    Sends data to n8n for report generation.
    """
    assessment_id = data.get('assessmentId')
    user_id = data.get('userId')

    # Log evento
    print(f"📊 Assessment completed: {assessment_id}")

    # n8n riceverà questa chiamata e processerà
    return {"status": "webhook_received", "assessment_id": assessment_id}


@app.post("/webhook/risk-critical")
async def webhook_risk_critical(data: dict):
    """
    Triggered when critical risk detected.
    Sends alert to n8n for notification pipeline.
    """
    risk_data = data.get('risk')

    print(f"🚨 Critical risk detected: {risk_data}")

    return {"status": "alert_triggered"}
```

#### 2. Environment Variables

Aggiungi al `.env` backend:

```bash
# n8n Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
N8N_API_KEY=your_n8n_api_key
```

---

## 📅 ROADMAP IMPLEMENTAZIONE

### Phase 1: Foundation & Quick Win (Week 1)

**Obiettivi**:
- ✅ Setup n8n (cloud o self-hosted)
- ✅ Primo workflow funzionante (report automation)
- ✅ Webhook endpoints backend creati

**Tasks**:
1. Scegliere n8n Cloud o Self-hosted
2. Setup account/installazione
3. Creare webhook endpoints in backend (`/webhook/assessment-complete`)
4. Configurare primo workflow: Report Generation
5. Test end-to-end con assessment reale
6. Deploy in produzione

**Deliverable**: Report automatici funzionanti

**Effort**: 4-6 ore
**Valore**: ALTO (risparmio immediato per consulenti)

---

### Phase 2: Alerting & Monitoring (Week 2)

**Obiettivi**:
- ✅ Sistema alerting rischi critici
- ✅ Notifiche multi-canale (email, Slack, SMS)

**Tasks**:
1. Configurare Slack workspace + channel
2. Setup Twilio per SMS (opzionale)
3. Creare workflow Risk Alerting
4. Configurare polling PostgreSQL
5. Test scenari High/Critical risk
6. Tuning frequenza polling

**Deliverable**: Alerting real-time funzionante

**Effort**: 2-3 ore
**Valore**: ALTO (SLA su rischi critici)

---

### Phase 3: Client Onboarding (Week 3)

**Obiettivi**:
- ✅ Onboarding clienti automatizzato
- ✅ Zero data entry manuale

**Tasks**:
1. Setup email IMAP watcher
2. Integrare Google Drive API
3. Creare workflow Onboarding
4. Template email welcome cliente
5. Test con visure reali
6. Documentare processo

**Deliverable**: Onboarding 100% automatico

**Effort**: 4-5 ore
**Valore**: MEDIO-ALTO (risparmio tempo)

---

### Phase 4: AI Enhancement (Week 4)

**Obiettivi**:
- ✅ Syd proattivo con analisi AI
- ✅ Insights automatici per consulenti

**Tasks**:
1. Design prompt Gemini avanzati
2. Creare workflow AI Analysis
3. Setup database table `ai_insights`
4. Integrare con frontend (toast notifications)
5. Test analisi per tutti i settori ATECO
6. Weekly newsletter automation

**Deliverable**: AI consulente proattivo

**Effort**: 5-6 ore
**Valore**: ALTISSIMO (differenziatore)

---

### Phase 5: Business Intelligence (Week 5+)

**Obiettivi**:
- ✅ Dashboard analytics automatici
- ✅ KPI tracking

**Tasks**:
1. Design report template esecutivo
2. Setup Chart.js integration
3. Creare workflow BI
4. Weekly/monthly reports
5. Custom dashboards per consulente

**Deliverable**: BI automation completo

**Effort**: 4-5 ore
**Valore**: MEDIO (nice to have)

---

## 💰 ROI & IMPATTO

### Costi

| Item | Opzione Cloud | Opzione Self-Hosted |
|------|---------------|---------------------|
| n8n | €20-50/mese | €0 (open source) |
| VPS Hosting | - | €5-10/mese |
| Twilio SMS | €0.01/SMS | €0.01/SMS |
| Setup Time | 4-6 ore | 6-8 ore |
| **Totale Mensile** | **€20-50** | **€5-10** |

### Benefici Misurabili

| Metrica | Senza n8n | Con n8n | Miglioramento | Valore €/mese |
|---------|-----------|---------|---------------|---------------|
| Tempo report | 15 min | 0 min | **-100%** | €500/mese (33 clienti) |
| Onboarding cliente | 20 min | 30 sec | **-97%** | €300/mese (15 clienti) |
| Risposta rischi critici | Variabile | <5 min | **+500%** | Incalcolabile (reputazione) |
| Workload consulente | 100% | 30% | **-70%** | +140% capacità |
| Email manuali | 50/mese | 0 | **-100%** | 10 ore/mese risparmiate |

**ROI Annuale**:
- Costo: €240-600/anno (n8n)
- Risparmio: €9,600/anno (tempo consulente)
- **ROI: 1,500% - 4,000%**

### Impatti Qualitativi

1. **Esperienza Cliente**:
   - ⭐⭐⭐ → ⭐⭐⭐⭐⭐
   - Report immediato post-assessment
   - Comunicazione professionale automatica
   - Onboarding rapido e fluido

2. **Competitività**:
   - Consulenti possono servire +140% clienti
   - Differenziatore AI proattivo
   - SLA su rischi critici (<5 min)
   - Professionalità percepita altissima

3. **Scalabilità**:
   - Da 10 clienti/mese → 30+ clienti/mese
   - Zero assunzioni aggiuntive
   - Automation handle crescita

4. **Data Intelligence**:
   - Decisioni data-driven
   - Trend identificati precocemente
   - Benchmark settoriali automatici
   - Forecast accurati

---

## 🎯 RACCOMANDAZIONE FINALE

### Start Strategy: Quick Win Approach

**Step 1** (Week 1): Implementa **WORKFLOW 1 (Report Automation)**
- ✅ Impatto visibile immediato
- ✅ Setup semplice
- ✅ Valore enorme
- ✅ Foundation per tutto il resto

**Step 2** (Week 2): Aggiungi **WORKFLOW 2 (Risk Alerting)**
- ✅ Completa la value proposition
- ✅ SLA su rischi critici
- ✅ Peace of mind per consulenti

**Step 3** (Week 3-4): Scale up con altri workflow
- Valuta quali servono davvero
- Prioritizza basandoti su feedback consulenti

### Tech Stack Consigliato

- **n8n**: Cloud (per validare velocemente)
- **Hosting**: Railway (backend già lì, same platform)
- **Notifications**: Email + Slack (no SMS per ora)
- **Storage**: Google Drive (consulenti già lo usano)

### Success Metrics (KPI da trackare)

- Tempo medio generazione report (target: <30 sec)
- % report inviati automaticamente (target: 95%+)
- Tempo risposta rischi critici (target: <5 min)
- Consulente satisfaction (survey mensile)
- # clienti serviti per consulente (crescita %)

---

## 📞 NEXT STEPS

### Per iniziare SUBITO:

1. **Decisione**: Cloud vs Self-hosted?
   - Consiglio: **n8n Cloud** per partire veloce

2. **Setup iniziale** (30 min):
   - Crea account n8n Cloud
   - Connetti a PostgreSQL (connection string Railway)
   - Test connessione database

3. **Primo workflow** (2-3 ore):
   - Implementa Report Automation
   - Test con assessment reale
   - Deploy in produzione

4. **Feedback loop**:
   - Chiedi feedback a consulenti
   - Itera e migliora
   - Scale up gradualmente

---

## 📚 RISORSE UTILI

### Documentazione

- n8n Docs: https://docs.n8n.io/
- n8n Community: https://community.n8n.io/
- n8n Templates: https://n8n.io/workflows/

### Tutorial Video

- n8n Crash Course: https://www.youtube.com/watch?v=RpjQTGKm-ok
- Database Automation: https://www.youtube.com/watch?v=9PJEMXYHLhE

### Integration Guides

- PostgreSQL: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/
- Gmail: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/
- Slack: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/

---

## ✅ CHECKLIST PRE-IMPLEMENTAZIONE

Completa questa checklist prima di iniziare:

- [ ] Decisione Cloud vs Self-hosted presa
- [ ] Budget approvato (€20-50/mese o VPS)
- [ ] Account n8n creato (se cloud)
- [ ] Webhook endpoints progettati
- [ ] Email SMTP configurato (per notifiche)
- [ ] Google Drive API attivato (se necessario)
- [ ] Slack workspace setup (se necessario)
- [ ] Consulenti informati su nuove feature
- [ ] Piano di test definito

---

**Documento creato**: 13 Ottobre 2025
**Ultima revisione**: 13 Ottobre 2025
**Status**: 💡 Proposta aperta - Pronto per implementation

**Per domande o implementazione**: Chiedimi! 🚀
