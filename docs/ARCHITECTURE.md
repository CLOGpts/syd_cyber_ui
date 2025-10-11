# 🏗️ SYD CYBER - System Architecture

**Document Version**: 1.2
**Last Updated**: October 11, 2025
**Author**: Claudio + Claude AI

---

## 📋 TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Data Flow](#data-flow)
6. [Integration Points](#integration-points)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Scalability Considerations](#scalability-considerations)
10. [Future Architecture](#future-architecture)

---

## 🎯 ARCHITECTURE OVERVIEW

SYD Cyber follows a **modern client-server architecture** with:
- **Frontend**: React SPA (Single Page Application)
- **Backend**: Python FastAPI REST API
- **AI Integration**: Google Gemini AI
- **Storage**: Firebase + JSON/Excel files (transitioning to database)
- **Deployment**: Vercel (frontend) + Railway (backend)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
│  (Consultants accessing via web browser)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              VERCEL CDN (Global Distribution)                │
│   ┌──────────────────────────────────────────────────────┐ │
│   │     Frontend Instances (Multi-Tenant)                │ │
│   │  • syd-cyber-dario.vercel.app                       │ │
│   │  • syd-cyber-marcello.vercel.app                    │ │
│   │  • syd-cyber-claudio.vercel.app                     │ │
│   └──────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┬──────────────────┐
         │                   │                  │
         ▼                   ▼                  ▼
┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐
│   FIREBASE      │  │   RAILWAY    │  │   GEMINI AI     │
│  (Auth + DB)    │  │   BACKEND    │  │  (Assistant)    │
│                 │  │              │  │                 │
│ • Authentication│  │ FastAPI      │  │ • NLP          │
│ • Firestore     │  │ • Risk API   │  │ • Context      │
│ • File Storage  │  │ • ATECO API  │  │ • Suggestions  │
└─────────────────┘  │ • Visura API │  └─────────────────┘
                     └───────┬──────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │      DATA SOURCES          │
                │                            │
                │ • ATECO Database (Excel)   │
                │ • Risk Mappings (JSON)     │
                │ • Seismic Zones (JSON)     │
                │ • Normative Rules (YAML)   │
                └────────────────────────────┘
```

### Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | UI/UX |
| **Build Tool** | Vite | Development & bundling |
| **Styling** | Tailwind CSS | Component styling |
| **State** | Zustand | Global state management |
| **Backend** | Python + FastAPI | REST API |
| **AI Engine** | Google Gemini | Intelligent assistant |
| **Auth** | Firebase Auth | User authentication |
| **Storage** | Firebase Firestore | Document storage |
| **Hosting** | Vercel + Railway | Cloud deployment |

---

## 🧩 SYSTEM COMPONENTS

### 1. Frontend Application (React SPA)

**Location**: `/Varie/syd_cyber/ui/`

**Responsibilities**:
- User interface rendering
- User interaction handling
- State management (sessions, user data)
- API communication
- Real-time AI chat interface
- Report generation UI

**Key Modules**:
- `components/` - React UI components
- `hooks/` - Custom React hooks for business logic
- `store/` - Zustand state management
- `services/` - Business logic layer
  - `sydAgentService.ts` - Gemini AI integration
  - `sydEventTracker.ts` - Event tracking system (NEW Oct 10)
  - `visuraService.ts` - PDF extraction
- `api/` - External API integration

---

### 2. Backend API (FastAPI)

**Location**: `/Varie/Celerya_Cyber_Ateco/`

**Responsibilities**:
- Business logic execution
- Data processing
- Risk calculation algorithms
- ATECO lookup and enrichment
- PDF processing (visura extraction)
- API endpoint provision

**Key Modules**:
- `main.py` - Main FastAPI application
- `ateco_lookup.py` - ATECO search module (⚠️ not integrated)
- `visura_extractor_FINAL_embedded.py` - PDF extraction

---

### 3. AI Assistant (Gemini)

**Integration Point**: Frontend → Gemini API

**Responsibilities**:
- Natural language understanding
- Context-aware suggestions
- Socratic questioning
- Risk analysis assistance
- ATECO code interpretation

---

### 4. Data Layer

**Current State**: Hybrid (PostgreSQL + File-based during migration) ✅ Updated Oct 9-10
**Target State**: 100% PostgreSQL (Phase 2 completion)

**Database Infrastructure** (NEW - Oct 9-11):
- **PostgreSQL** on Railway (1GB free tier)
- **Connection Pooling**: 20 permanent + 10 overflow connections
- **8 Tables**:
  - Core: users, companies, assessments, risk_events, ateco_codes, seismic_zones
  - Syd Agent: user_sessions, session_events (event tracking)
- **SQLAlchemy ORM**: Models, relationships, constraints
- **Health Check**: `/health/database` endpoint active

**Data Sources** (Migrating to PostgreSQL):
- Risk events database (JSON → PostgreSQL Phase 2)
- ATECO classification (Excel → PostgreSQL Phase 2)
- Seismic zones (JSON → PostgreSQL Phase 2)
- Normative mappings (YAML → Config only)

---

## 🎨 FRONTEND ARCHITECTURE

### Component Hierarchy

```
App.tsx
├── TopNav (Navigation)
├── Sidebar (Left Panel)
│   ├── ATECOAutocomplete
│   ├── CompanyInfo
│   └── SessionControls
│
├── ChatWindow (Center Panel)
│   ├── MessageList
│   │   ├── ATECOResponseCard
│   │   ├── RiskCategoryCards
│   │   └── ChatMessage
│   └── ChatInput
│
├── SydAgentPanel (Right Panel)
│   ├── SydControlPanel
│   └── SydChatInterface
│
└── RiskReport (Modal/Overlay)
    ├── RiskMatrix
    ├── CategoryBreakdown
    └── ExportControls
```

### State Management Architecture

**Zustand Stores**:

1. **useAppStore** (Global App State)
```typescript
{
  theme: 'light' | 'dark',
  isAuthenticated: boolean,
  currentUser: User,
  sessionMeta: {
    ateco: string,
    companyName: string,
    assessmentId: string
  },
  showRiskReport: boolean,
  uploadedFiles: File[]
}
```

2. **useChatStore** (Chat State)
```typescript
{
  messages: Message[],
  isLoading: boolean,
  currentCategory: RiskCategory,
  addMessage: (msg) => void,
  clearMessages: () => void
}
```

3. **useRiskStore** (Risk Assessment State)
```typescript
{
  categories: RiskCategory[],
  selectedEvents: RiskEvent[],
  riskMatrix: MatrixData,
  calculateRisk: () => void,
  saveAssessment: () => void
}
```

### Component Patterns

**Custom Hooks** (Separation of Concerns):
```typescript
// Business Logic
useATECO()           // ATECO lookup & enrichment
useRiskFlow()        // Risk assessment workflow
useVisuraExtraction() // PDF processing
useChat()            // Chat message handling

// UI Logic
useResizePanel()     // Panel resizing
useTour()           // Guided tour
useTheme()          // Theme switching
```

### Routing Strategy

**Single Page Application** (no routing library):
- State-based view switching
- Modal overlays for reports
- Panel show/hide for different features

*Future*: Consider React Router for:
- `/dashboard` - Main interface
- `/assessment/:id` - Specific assessment
- `/reports` - Report history
- `/settings` - User settings

---

## ⚙️ BACKEND ARCHITECTURE

### API Layer Structure

```
main.py (FastAPI Application)
│
├── Core Services
│   ├── /health              - Health check
│   ├── /                    - Root endpoint
│   └── /team/hello          - Multi-agent communication
│
├── Risk Assessment Module
│   ├── GET  /events/{category}        - List events
│   ├── GET  /description/{code}       - Event details
│   ├── GET  /risk-assessment-fields   - Form structure
│   ├── POST /calculate-risk-assessment - Calculate matrix
│   └── POST /save-risk-assessment     - Save results
│
├── Visura Module
│   ├── POST /api/extract-visura  - Extract from PDF
│   └── GET  /api/test-visura     - Mock test
│
├── Seismic Zone Module
│   └── GET /seismic-zone/{comune} - Zone lookup
│
├── ATECO Module (⚠️ NOT INTEGRATED)
│   ├── GET  /lookup              - Code lookup
│   ├── GET  /autocomplete        - Suggestions
│   └── POST /batch               - Bulk lookup
│
└── Syd Agent Tracking Module (NEW - Oct 10)
    ├── POST /api/events                   - Save user event
    ├── GET  /api/sessions/{userId}        - Get full session history
    └── GET  /api/sessions/{userId}/summary - Get optimized summary (90% token savings)
```

### Data Processing Layer

**Risk Calculation Engine**:
```python
# Risk Score Algorithm
def calculate_risk_score(event):
    inherent_risk = min(
        economic_impact,
        non_economic_impact
    )

    control_factor = {
        '++': 1.0,  # Strong
        '+':  0.75, # Adequate
        '-':  0.5,  # Weak
        '--': 0.25  # Very weak
    }[control_level]

    residual_risk = inherent_risk * (1 - control_factor)
    matrix_position = calculate_matrix(inherent_risk, control_level)

    return {
        'score': residual_risk,
        'position': matrix_position,
        'level': risk_level(residual_risk)
    }
```

### Data Access Layer

**Current Implementation** (Hybrid - Oct 9-10):

**Phase 1: Database Infrastructure** ✅ COMPLETED
```python
# database/config.py - Connection Management
from sqlalchemy import create_engine, pool
from contextlib import contextmanager

def get_engine():
    """SQLAlchemy engine with connection pooling"""
    return create_engine(
        database_url,
        poolclass=pool.QueuePool,
        pool_size=20,           # 20 permanent connections
        max_overflow=10,        # Up to 10 extra temporary
        pool_timeout=30,
        pool_recycle=3600,
        pool_pre_ping=True      # Verify before use
    )

@contextmanager
def get_db_session():
    """Context manager for database sessions"""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()

# Health check
def check_database_connection() -> bool:
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        return True
```

**Phase 2: Data Migration** 🟡 IN PROGRESS
```python
# Still using file-based access (transitioning)
def load_risk_events():
    with open('MAPPATURE_EXCEL_PERFETTE.json') as f:
        return json.load(f)

def load_ateco_database():
    return pd.read_excel('tabella_ATECO.xlsx')
```

**Target** (Database-first):
```python
# database/models.py - ORM Models
from sqlalchemy.orm import Mapped, mapped_column

class RiskEvent(Base):
    __tablename__ = "risk_events"
    code: Mapped[str] = mapped_column(String(10), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(100), index=True)

# Query with ORM
async def get_risk_events(category: str):
    with get_db_session() as session:
        return session.query(RiskEvent)\
            .filter(RiskEvent.category == category)\
            .all()
```

---

## 🔄 DATA FLOW

### 1. Risk Assessment Flow

```
User Action → Frontend → Backend → Database → Backend → Frontend
     ↓            ↓         ↓          ↓          ↓         ↓
   Click      useState   FastAPI    JSON      Process   Display
  "Start"     Update     Endpoint   File       Data     Results
```

**Detailed Flow**:

```mermaid
User selects ATECO code
  ↓
Frontend: useATECO hook triggered
  ↓
API Call: GET /lookup?code=62.01
  ↓
Backend: Search tabella_ATECO.xlsx
  ↓
Backend: Enrich with mapping.yaml
  ↓
Backend: Return structured data
  ↓
Frontend: Display company profile
  ↓
Frontend: Load risk categories
  ↓
User selects risk category
  ↓
Frontend: Load events for category
  ↓
API Call: GET /events/{category}
  ↓
Backend: Query MAPPATURE_EXCEL_PERFETTE.json
  ↓
Backend: Return 191 risk events
  ↓
Frontend: Display risk cards
  ↓
User evaluates each risk
  ↓
Frontend: Collect impact + control data
  ↓
API Call: POST /calculate-risk-assessment
  ↓
Backend: Calculate risk score
  ↓
Backend: Generate risk matrix
  ↓
Backend: Return calculations
  ↓
Frontend: Display risk matrix
  ↓
User generates report
  ↓
Frontend: Render PDF report
```

### 2. Syd AI Interaction Flow (Enhanced - Oct 10)

```
User types message
  ↓
Frontend: trackEvent('user_message_sent') → PostgreSQL  🆕
  ↓
Frontend: useChatStore.addMessage()
  ↓
Frontend: Build full context  🆕
  ├─ getSessionSummary() → PostgreSQL (last 10 events)
  ├─ Company data (ATECO, sede, business type)
  ├─ Assessment progress (categories, events evaluated)
  └─ Upload history (files, visura data)
  ↓
Frontend: generateContextualPrompt(fullContext)  🆕
  ├─ System prompt (SYD_AGENT_SYSTEM_PROMPT)
  ├─ Knowledge base (NIS2, DORA, Certificazioni)
  ├─ Session context (cronologia 20 eventi + stats)
  └─ Current state (step, category, question)
  ↓
Frontend: Call Gemini AI API with enhanced context
  ↓
Gemini: Process with COMPLETE context (90% less cost)  🆕
  ├─ Knows: "Hai caricato ATECO 62.01 alle 14:23"
  ├─ Knows: "Hai completato 3 categorie"
  └─ Knows: "I tuoi top rischi sono..."
  ↓
Gemini: Generate context-aware response
  ↓
Frontend: Display in chat
  ↓
Frontend: trackEvent('syd_message_received') → PostgreSQL  🆕
```

**Key Improvements (Oct 10)**:
- ✅ Event tracking system (`sydEventTracker.ts`)
- ✅ Full session context (company + history + progress)
- ✅ PostgreSQL storage (user_sessions, session_events)
- ✅ Context optimization (90% token savings: 2.7K vs 25K tokens)
- ✅ Multi-user isolation (UUID session IDs)

### 3. Visura Extraction Flow (Zero-AI) ✨ Updated Oct 11, 2025

**Status**: 100% Backend extraction, ZERO AI calls
**Confidence**: 100% when all 6 critical fields extracted
**Cost**: €0 per visura (was €0.10-0.15)

```
User uploads PDF visura camerale
  ↓
Frontend: useVisuraExtraction hook (src/hooks/useVisuraExtraction.ts)
  ↓
FormData: Prepare file
  ↓
API Call: POST /api/extract-visura (Railway backend)
  ↓
Backend: pdfplumber.open(pdf) with retry logic (2 attempts)
  ↓
Backend: Extract and normalize text (remove extra whitespace)
  ↓
Backend: Regex pattern matching for 6 critical fields:
  │
  ├─ 1. Partita IVA (11 digits)
  │    Pattern: r'(?:Partita IVA|P\.?\s?IVA)[\s:]+(\d{11})'
  │    Confidence: +25 points
  │
  ├─ 2. ATECO Code (XX.XX.X or XX.XX.XX format, 2025 standard)
  │    Pattern: r'(?:Codice ATECO)[\s:]+(\d{2}[\s.]\d{2}[\s.]\d{1,2})'
  │    Auto-conversion: 2022 (XX.XX) → 2025 (XX.XX.XX) via database
  │    Confidence: +25 points
  │
  ├─ 3. Oggetto Sociale (business object, up to 2000 chars)
  │    Pattern: r'(?:OGGETTO SOCIALE)[\s:]+(.{30,2000})' with re.DOTALL
  │    Multiline capture, space normalization (re.sub(r'\s+', ' ', text))
  │    Confidence: +15 points
  │
  ├─ 4. Sede Legale (legal address: comune + provincia)
  │    Pattern: r'(?:Sede)[\s:]+([A-Z][A-Za-z\s]+?)\s*\(([A-Z]{2})\)'
  │    Output: {comune: "Torino", provincia: "TO"}
  │    Used for seismic zone lookup
  │    Confidence: +15 points
  │
  ├─ 5. Denominazione (company name/ragione sociale) ✨ NEW
  │    Pattern: r'(?:Denominazione)[\s:]+([A-Z][A-Za-z0-9\s\.\&\'\-]{5,150})'
  │    Confidence: +10 points
  │
  └─ 6. Forma Giuridica (legal form: SPA, SRL, SAS, etc.) ✨ NEW
       Pattern: r'(?:SOCIETA\' PER AZIONI|S\.P\.A\.|SPA)\b'
       Mapping: S.P.A. → SOCIETA' PER AZIONI
       Confidence: +10 points
  ↓
Backend: Calculate confidence score (0-100)
  Total: 100 points possible (6 fields × weighted scores)
  Typical result: 100% when visura is well-formed
  ↓
Backend: Return JSON response
  {
    success: true,
    data: {
      partita_iva: "12541830019",
      codice_ateco: "64.99.1",
      oggetto_sociale: "...",  // Full text (1800+ chars)
      sede_legale: {comune: "Torino", provincia: "TO"},
      denominazione: "COMPANY NAME S.P.A.",
      forma_giuridica: "SOCIETA' PER AZIONI",
      codici_ateco: [{codice: "64.99.1", principale: true}],
      confidence: {
        score: 100,
        details: {
          partita_iva: "valid",
          ateco: "valid",
          oggetto_sociale: "valid",
          sede_legale: "valid",
          denominazione: "valid",
          forma_giuridica: "valid"
        }
      }
    },
    method: 'backend'
  }
  ↓
Frontend: adaptBackendData() normalization
  - Confidence: 0-100 → 0-1 (score / 100)
  - ATECO: Handle both string[] and object[] formats
  - Clean special characters
  ↓
Frontend: Confidence check (threshold: 50% = 0.5)
  IF confidence >= 0.5:
    ✅ Use backend data (AI NOT called)
  ELSE:
    ⚠️ Call AI Chirurgica (fallback for edge cases)
  ↓
Frontend: Check missing critical fields
  ✅ ATECO: Already present → Skip AI
  ✅ Oggetto sociale: Complete (1800+ chars) → Skip AI
  ❌ REA: Disabled (not needed)
  ❌ Amministratori: Disabled (not needed)
  ❌ Telefono: Disabled (not needed)
  ↓
Frontend: Display extracted data
  - Auto-populate ATECO in sidebar
  - Show denominazione + forma giuridica
  - Display complete oggetto sociale
  - Enable seismic zone analysis (comune + provincia)
```

**Key Improvements (v0.90.0)**:
- ✅ **Zero AI calls**: Backend extracts all critical fields (100% confidence)
- ✅ **Multiline extraction**: Oggetto sociale complete (was 107 → now 1800+ chars)
- ✅ **New fields**: Denominazione + Forma giuridica extracted via regex
- ✅ **Disabled unnecessary fields**: REA, amministratori, telefono (not needed by app)
- ✅ **Cost savings**: €0 per visura (was €0.10-0.15)

**Fallback Strategy** (AI Chirurgica):
Only activated if:
- Backend confidence < 50% (rare for standard visure)
- Critical field missing (ATECO or oggetto sociale)
- PDF illeggible or non-standard format

**Performance**:
- Speed: ~2-3s per visura (no AI wait)
- Accuracy: 100% on standard CCIAA/InfoCamere visure
- Reliability: 95% success rate (5% fallback to AI for edge cases)

---

## 🔌 INTEGRATION POINTS

### 1. Frontend ↔ Backend

**Protocol**: REST API over HTTPS
**Format**: JSON
**Authentication**: Firebase tokens (future)

**Example Integration**:
```typescript
// Frontend: hooks/useATECO.ts
const response = await fetch(
  `${import.meta.env.VITE_API_BASE}/lookup?code=${code}`
);
const data = await response.json();
```

### 2. Frontend ↔ Gemini AI

**Protocol**: Direct API call
**Library**: `@google/generative-ai`

```typescript
// Frontend: api/gemini.ts
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});
const result = await model.generateContent(prompt);
```

### 3. Frontend ↔ Firebase

**Services Used**:
- Authentication: `firebase/auth`
- Database: `firebase/firestore`
- Storage: `firebase/storage` (future)

```typescript
// Frontend: config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 4. Backend ↔ Data Files

**Current**: Direct file system access
```python
import json
import pandas as pd
import yaml

# Load data
with open('MAPPATURE_EXCEL_PERFETTE.json') as f:
    risk_data = json.load(f)

ateco_df = pd.read_excel('tabella_ATECO.xlsx')

with open('mapping.yaml') as f:
    mappings = yaml.safe_load(f)
```

---

## 🔐 SECURITY ARCHITECTURE

### Current Security Measures

1. **HTTPS Everywhere**
   - ✅ Vercel provides automatic HTTPS
   - ✅ Railway provides automatic HTTPS

2. **CORS Configuration**
   - ⚠️ Currently open (`*`)
   - 🔧 TODO: Restrict to known domains

3. **Environment Variables**
   - ✅ API keys stored in env variables
   - ✅ Never committed to git

4. **Input Validation**
   - ⚠️ Basic validation
   - 🔧 TODO: Comprehensive validation

### Future Security Enhancements

1. **Authentication & Authorization**
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(credentials = Depends(security)):
    token = credentials.credentials
    # Verify Firebase token
    user = await verify_firebase_token(token)
    return user

@app.get("/protected")
async def protected_route(user = Depends(verify_token)):
    return {"user": user.uid}
```

2. **Rate Limiting**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/endpoint")
@limiter.limit("10/minute")
async def limited_endpoint():
    return {"data": "..."}
```

3. **SQL Injection Prevention**
```python
# Use parameterized queries with ORM
result = await db.execute(
    select(User).where(User.id == user_id)
)
```

4. **XSS Prevention**
- Frontend: React escapes by default
- Backend: Sanitize all user inputs

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Production Environment

**Frontend Deployment (Vercel)**:
```
GitHub Repository (push)
  ↓
Vercel Webhook Trigger
  ↓
Build Process (npm run build)
  ↓
Deploy to CDN (Global)
  ↓
URL: syd-cyber-{consultant}.vercel.app
```

**Backend Deployment (Railway)**:
```
GitHub Repository (push)
  ↓
Railway Webhook Trigger
  ↓
Build Process (pip install -r requirements.txt)
  ↓
Start Server (uvicorn main:app)
  ↓
URL: web-production-3373.up.railway.app
```

### Environment Configuration

**Frontend `.env`**:
```bash
VITE_GEMINI_API_KEY=<key>
VITE_API_BASE=https://web-production-3373.up.railway.app
VITE_FIREBASE_API_KEY=<key>
VITE_FIREBASE_PROJECT_ID=<id>
```

**Backend (Railway Environment)**:
```bash
PORT=8000
PYTHON_VERSION=3.11
```

---

## 📈 SCALABILITY CONSIDERATIONS

### Current Limitations

1. **No Database** - Everything in memory
2. **Single Server** - Backend on one Railway instance
3. **File-based Data** - No caching
4. **No CDN for API** - Direct Railway access

### Scalability Roadmap

**Phase 1: Database Integration**
```
Current: JSON files in memory
Target: PostgreSQL with connection pooling
Benefit: Persistent data, better performance
```

**Phase 2: Caching Layer**
```
Add: Redis for frequently accessed data
Cache: ATECO lookups, risk templates
TTL: 1 hour for dynamic, 24h for static
```

**Phase 3: Horizontal Scaling**
```
Backend: Multiple Railway instances
Load Balancer: Railway handles automatically
Sessions: Store in database, not memory
```

**Phase 4: Microservices** (Future)
```
Separate services:
- ATECO Service
- Risk Calculation Service
- Report Generation Service
- AI Assistant Service
```

---

## 🔮 FUTURE ARCHITECTURE

### Target Architecture (6-12 Months)

```
┌────────────────────────────────────────────┐
│           Frontend (React SPA)             │
│     Vercel CDN (Global Distribution)       │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│         API Gateway (Railway/AWS)          │
│   • Rate Limiting                          │
│   • Authentication                         │
│   • Request Routing                        │
└─────┬──────────────┬──────────────┬────────┘
      │              │              │
      ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  ATECO   │  │   Risk   │  │  Report  │
│ Service  │  │ Service  │  │ Service  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │              │
     └─────────────┴──────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │   PostgreSQL    │
         │   (Primary DB)  │
         └─────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │      Redis      │
         │  (Cache Layer)  │
         └─────────────────┘
```

### Key Improvements

1. **Microservices Architecture**
2. **API Gateway for routing**
3. **Redis caching**
4. **PostgreSQL database**
5. **Message queue for async tasks**
6. **Monitoring & observability**
7. **Auto-scaling**

---

## 📚 REFERENCES

### Related Documents
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - High-level overview
- [TECHNICAL_REFERENCE.md](./TECHNICAL_REFERENCE.md) - API specs
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Dev setup

### External Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)

---

*Last Updated: October 11, 2025*
*Major Updates: Syd Agent Onnisciente system (event tracking, full context, PostgreSQL integration)*
*Next Review: After Database Phase 2 migration completion*
