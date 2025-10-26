# 📋 Backend Refactoring - Epic & Stories

**Document Version**: 1.0
**Date**: October 26, 2025
**Product Manager**: John (PM Agent)
**Status**: READY FOR IMPLEMENTATION

**Reference Documents**:
- ARCHITECTURAL_REFACTORING_PROPOSAL.md (Winston - Architect)
- CODE_REVIEW_REPORT.md (Mary - Business Analyst)

---

## 📊 EPIC OVERVIEW

### Epic ID: EPIC-001
### Epic Name: Backend Modular Refactoring

### Description

Transform the SYD Cyber backend from a 3910-line monolithic architecture to a modular monolith with clear service boundaries, enabling scalability, testability, and maintainability for the v1.0 production release.

### Business Value

**Problem**: Current monolithic backend (3910 lines in `main.py`) blocks:
- New feature development (high cognitive load)
- Team scaling (impossible to onboard developers)
- Testing (zero unit test coverage)
- Bug fixes (risk of regressions)
- Production scaling (1000+ users)

**Solution**: Modular monolith with 6 domain services

**Benefits**:
- ✅ **50% reduction** in maintenance time
- ✅ **30% increase** in development velocity
- ✅ **85% test coverage** (from 0%)
- ✅ **Scalability** to 1000+ concurrent users
- ✅ **Professional codebase** ready for team growth

**Timeline**: 3 weeks (15 working days)
**Risk**: LOW (incremental, reversible strategy)
**Investment**: 177 hours ≈ 22 days effort (with buffer)

---

### Success Criteria

#### Technical Metrics
- [ ] Backend `main.py` reduced from 3910 to <200 lines
- [ ] 6 domain services extracted and operational
- [ ] Test coverage increased from 0% to 85%+
- [ ] Zero breaking changes to API contracts
- [ ] All deployments successful (Railway + Vercel)
- [ ] Performance maintained or improved (< 500ms response times)

#### User Experience
- [ ] Zero downtime during migration
- [ ] All 3 frontend instances working (dario, marcello, claudio)
- [ ] No regression bugs in production
- [ ] User feedback system operational
- [ ] Syd AI responses unchanged

#### Business Goals
- [ ] v1.0 launch timeline updated (+3 weeks accepted)
- [ ] Foundation ready for Phase 2-4 roadmap
- [ ] Technical debt eliminated
- [ ] Team onboarding enabled

---

### Epic Timeline

| Phase | Duration | Stories | Effort | Deploy |
|-------|----------|---------|--------|--------|
| **Phase 1: Foundation** | Week 1 (Days 1-5) | 5 stories | 30h | NO |
| **Phase 2: Service Extraction** | Week 2 (Days 6-12) | 7 stories | 102h | YES |
| **Phase 3: Cleanup & Docs** | Week 3 (Days 13-15) | 5 stories | 45h | YES |
| **TOTAL** | **3 weeks** | **17 stories** | **177h** | **~22 days** |

---

### Risk Summary

| Risk Level | Count | Mitigation Strategy |
|------------|-------|---------------------|
| 🔴 HIGH | 2 | Pre-refactoring tests, dual endpoints, 1-week monitoring |
| 🟡 MEDIUM | 4 | Service unit tests, comparison tests, Telegram test chat |
| 🟢 LOW | 11 | Standard testing, incremental deployment |

**Critical Risks**:
1. **Visura Extraction** (1000 lines, complex PDF processing) → Dual endpoints for 1 week
2. **Risk Calculation** (36 matrix positions) → Golden master tests for all positions

---

## 📖 STORIES BY PHASE

---

## PHASE 1: FOUNDATION SETUP (Week 1 - Days 1-5)

**Goal**: Create modular structure, no production deployment yet

---

### Story 1.1: Setup Project Directory Structure

**As a**: Developer
**I want**: Clean modular folder structure for services
**So that**: Code is organized by domain boundaries

**Priority**: 🔴 CRITICAL
**Effort**: 4 hours
**Risk**: 🟢 LOW
**Dependencies**: None

#### Acceptance Criteria
- [ ] `/app` root folder created in backend
- [ ] 6 service domain folders created:
  - `app/services/risk_service.py`
  - `app/services/ateco_service.py`
  - `app/services/visura_service.py`
  - `app/services/seismic_service.py`
  - `app/services/session_service.py`
  - `app/services/notification_service.py`
- [ ] 7 router folders created:
  - `app/routers/health.py`
  - `app/routers/risk.py`
  - `app/routers/ateco.py`
  - `app/routers/visura.py`
  - `app/routers/seismic.py`
  - `app/routers/session.py`
  - `app/routers/feedback.py`
- [ ] Core infrastructure folders:
  - `app/core/` (config, database, dependencies)
  - `app/models/` (SQLAlchemy ORM)
  - `app/schemas/` (Pydantic validation)
  - `app/utils/` (helpers)
- [ ] Test structure created:
  - `tests/unit/services/`
  - `tests/unit/routers/`
  - `tests/integration/`
  - `tests/comparison/`
  - `tests/fixtures/`
- [ ] All `__init__.py` files created
- [ ] `legacy/` folder created for archiving old code

#### Technical Tasks
1. Create directory structure with `mkdir -p`
2. Generate all `__init__.py` files
3. Create empty template files for services/routers
4. Set up pytest configuration (`conftest.py`)
5. Update `.gitignore` if needed
6. Verify structure with `tree` command

#### Definition of Done
- Directory structure matches ARCHITECTURAL_REFACTORING_PROPOSAL.md
- All folders importable (`from app.services import ...`)
- pytest discovers test directories

---

### Story 1.2: Migrate Core Configuration & Database

**As a**: Developer
**I want**: Centralized configuration and database connection
**So that**: All services share consistent settings and DB access

**Priority**: 🔴 CRITICAL
**Effort**: 8 hours
**Risk**: 🟡 MEDIUM
**Dependencies**: Story 1.1

#### Acceptance Criteria
- [ ] `app/core/config.py` created with Pydantic settings
- [ ] All 20+ hardcoded values moved to configuration:
  - CORS origins (5 URLs)
  - Telegram bot token & chat ID
  - Database URL
  - File paths (legacy)
- [ ] Environment variables loaded from `.env`
- [ ] `app/core/database.py` created with:
  - PostgreSQL connection pooling
  - `get_db()` FastAPI dependency
  - Session management
- [ ] Existing `database/config.py` functionality migrated
- [ ] Configuration validated on startup
- [ ] All sensitive values in `.env.example` documented

#### Technical Tasks
1. Create `app/core/config.py`:
   ```python
   from pydantic_settings import BaseSettings

   class Settings(BaseSettings):
       # Database
       database_url: str

       # CORS
       allowed_origins: List[str]

       # Telegram
       telegram_bot_token: str
       telegram_chat_id: str

       class Config:
           env_file = ".env"

   settings = Settings()
   ```
2. Create `app/core/database.py` (from existing `database/config.py`)
3. Create `.env.example` with all required variables
4. Write unit tests for config validation
5. Verify database connection pooling works

#### Definition of Done
- `from app.core.config import settings` works
- `from app.core.database import get_db` works
- Database connections pool correctly (20+10 connections)
- No hardcoded values in code

---

### Story 1.3: Create SQLAlchemy Models

**As a**: Developer
**I want**: ORM models for all database entities
**So that**: Services can query PostgreSQL consistently

**Priority**: 🔴 CRITICAL
**Effort**: 6 hours
**Risk**: 🟢 LOW
**Dependencies**: Story 1.2

#### Acceptance Criteria
- [ ] 5 SQLAlchemy models created:
  - `app/models/risk_event.py` (187 events)
  - `app/models/ateco.py` (2,714 codes)
  - `app/models/seismic_zone.py` (7,896 comuni)
  - `app/models/user_session.py` (session tracking)
  - `app/models/user_feedback.py` (feedback storage)
- [ ] All models inherit from `Base` (SQLAlchemy declarative)
- [ ] Relationships defined where needed
- [ ] Models match existing PostgreSQL schema (already migrated Oct 12)
- [ ] Table names match existing database
- [ ] Models importable and queryable

#### Technical Tasks
1. Create base model in `app/models/__init__.py`
2. Create each model file with table definition
3. Verify models match existing database schema:
   ```bash
   # Compare to existing tables
   psql $DATABASE_URL -c "\d risk_events"
   ```
4. Write model tests (CRUD operations)
5. Test relationships and queries

#### Definition of Done
- All 5 models created and tested
- Models can query existing PostgreSQL data
- No schema changes needed (data already migrated)

---

### Story 1.4: Create Pydantic Validation Schemas

**As a**: Developer
**I want**: Pydantic schemas for request/response validation
**So that**: API endpoints validate input automatically

**Priority**: 🟡 HIGH
**Effort**: 6 hours
**Risk**: 🟢 LOW
**Dependencies**: Story 1.3

#### Acceptance Criteria
- [ ] 4 Pydantic schema files created:
  - `app/schemas/risk.py` (risk calculations, assessments)
  - `app/schemas/ateco.py` (ATECO lookups)
  - `app/schemas/visura.py` (PDF extraction)
  - `app/schemas/feedback.py` (user feedback)
- [ ] Request schemas replace `data: dict` in endpoints
- [ ] Response schemas define API contracts
- [ ] Validation rules implemented:
  - `economic_loss`: Literal['G', 'Y', 'O', 'R']
  - `control_level`: Literal['++', '+', '-', '--']
  - ATECO code format: regex `^\d{2}\.\d{2}$`
- [ ] Custom validators for complex fields
- [ ] Schema examples documented

#### Technical Tasks
1. Create schema files with BaseModel classes
2. Define request/response models per endpoint
3. Add validators for complex fields:
   ```python
   @validator('ateco_code')
   def validate_ateco(cls, v):
       if not re.match(r'^\d{2}\.\d{2}$', v):
           raise ValueError("Invalid ATECO format")
       return v
   ```
4. Write schema validation tests
5. Document schema examples in docstrings

#### Definition of Done
- 25+ endpoints have typed schemas (replacing `data: dict`)
- Invalid input raises validation errors
- FastAPI auto-generates correct OpenAPI docs

---

### Story 1.5: Create Pre-Refactoring Baseline Tests

**As a**: Developer
**I want**: Comprehensive tests capturing current behavior
**So that**: I can verify refactored code produces identical results

**Priority**: 🔴 CRITICAL (BLOCKS REFACTORING)
**Effort**: 16 hours (2 days)
**Risk**: 🟢 LOW
**Dependencies**: None (tests current monolith)

#### Acceptance Criteria
- [ ] Integration tests cover 40+ existing endpoints
- [ ] Baseline results saved for comparison:
  - Risk calculation: All 36 matrix positions tested
  - Visura extraction: 10+ real PDFs tested with golden results
  - ATECO lookup: 100+ codes tested
  - Seismic zones: All 7,896 comuni tested
- [ ] Contract tests verify API schemas
- [ ] End-to-end tests cover critical flows:
  - Complete risk assessment journey
  - Visura upload → ATECO conversion → risk events
- [ ] Test coverage reaches 60% (baseline)
- [ ] All tests passing against current monolith
- [ ] Baseline results saved to `tests/fixtures/`

#### Technical Tasks
1. **Create risk calculation baseline**:
   ```python
   # tests/integration/test_current_behavior.py
   def test_risk_matrix_baseline():
       """Test all 36 matrix positions"""
       results = {}
       for economic in ['G', 'Y', 'O', 'R']:
           for non_economic in ['G', 'Y', 'O', 'R']:
               for control in ['++', '+', '-', '--']:
                   response = client.post("/calculate-risk-assessment", json={
                       'economic_loss': economic,
                       'non_economic_loss': non_economic,
                       'control_level': control
                   })
                   results[(economic, non_economic, control)] = response.json()

       # Save baseline
       with open("tests/fixtures/risk_matrix_baseline.json", "w") as f:
           json.dump(results, f, indent=2)
   ```

2. **Create visura extraction baseline**:
   ```python
   def test_visura_extraction_baseline():
       """Test with 10+ real visura PDFs"""
       for pdf_file in VISURA_TEST_FILES:
           with open(pdf_file, "rb") as f:
               response = client.post("/api/extract-visura", files={"file": f})

           # Save golden master
           with open(f"tests/fixtures/visura_golden_{pdf_file.stem}.json", "w") as f:
               json.dump(response.json(), f, indent=2)
   ```

3. **Create API contract tests**:
   ```python
   def test_api_contracts():
       """Verify response schemas don't change"""
       # Test each endpoint's response format
   ```

4. **Create E2E flow tests**:
   ```python
   def test_complete_risk_assessment_flow():
       """User journey: visura → assessment → report"""
   ```

5. Run pytest with coverage:
   ```bash
   pytest --cov=. --cov-report=html
   # Target: 60% coverage
   ```

#### Definition of Done
- 60% test coverage achieved
- All 36 risk matrix positions have baseline results
- 10+ visura PDFs have golden master results
- 100+ ATECO codes tested
- All tests passing (green)
- Baseline files committed to git

---

## PHASE 2: SERVICE EXTRACTION (Week 2 - Days 6-12)

**Goal**: Extract 6 services, deploy with dual endpoints, verify production

---

### Story 2.1: Extract Health Check & Core Services

**As a**: Developer
**I want**: Health check endpoint as modular service
**So that**: I can practice the extraction pattern on low-risk code

**Priority**: 🟡 HIGH (practice before complex services)
**Effort**: 4 hours
**Risk**: 🟢 LOW
**Dependencies**: Phase 1 complete

#### Acceptance Criteria
- [ ] `app/routers/health.py` created with `/health` endpoint
- [ ] Health check logic extracted from monolith
- [ ] `app/main.py` updated to include health router
- [ ] Old `/health` endpoint removed (or proxies to new)
- [ ] Health check verifies:
  - Database connection
  - API status
  - Version info
- [ ] Deployed to Railway
- [ ] Verified in production (all 3 frontends)

#### Technical Tasks
1. Create `app/routers/health.py`:
   ```python
   from fastapi import APIRouter, Depends
   from sqlalchemy.orm import Session
   from app.core.database import get_db

   router = APIRouter(prefix="/health", tags=["Health"])

   @router.get("/")
   async def health_check(db: Session = Depends(get_db)):
       # Check database
       try:
           db.execute("SELECT 1")
           db_status = "connected"
       except Exception:
           db_status = "disconnected"

       return {
           "status": "online",
           "database": db_status,
           "version": "1.0.0"
       }
   ```

2. Update `app/main.py`:
   ```python
   from app.routers import health

   app.include_router(health.router)
   ```

3. Deploy to Railway
4. Test all 3 frontend instances
5. Remove old health endpoint from legacy code

#### Definition of Done
- `/health` endpoint responds correctly
- Database connection verified
- Production deployment successful
- All 3 Vercel frontends working

---

### Story 2.2: Extract ATECO Service (CRITICAL DEPENDENCY)

**As a**: Developer
**I want**: ATECO lookup as standalone service
**So that**: Risk and Visura services can depend on it

**Priority**: 🔴 CRITICAL (others depend on this)
**Effort**: 12 hours (1.5 days)
**Risk**: 🟢 LOW (already separated in `ateco_lookup.py`)
**Dependencies**: Story 2.1

#### Acceptance Criteria
- [ ] `app/services/ateco_service.py` created
- [ ] `ateco_lookup.py` logic migrated to service:
  - `search_smart()` function
  - `normalize_code()` function
  - ATECO 2022→2025 conversion
  - Autocomplete functionality
- [ ] `app/routers/ateco.py` created with 4 endpoints:
  - `GET /ateco/lookup?code=XX.XX`
  - `GET /ateco/autocomplete?partial=62`
  - `POST /ateco/batch`
  - `GET /ateco/db/lookup` (PostgreSQL version)
- [ ] Old endpoints in monolith proxy to new service
- [ ] Unit tests for service (80%+ coverage)
- [ ] Integration tests for endpoints
- [ ] Deployed to Railway with dual endpoints
- [ ] Verified in production

#### Technical Tasks
1. **Create service**:
   ```python
   # app/services/ateco_service.py
   class ATECOService:
       def __init__(self, db: Session):
           self.db = db

       def lookup(self, code: str) -> Optional[ATECOCode]:
           """Search ATECO code in database"""
           return self.db.query(ATECOCode)\
               .filter(ATECOCode.code == code)\
               .first()

       def convert_2022_to_2025(self, code_2022: str) -> str:
           """Convert ATECO 2022 → 2025 format"""
           # Migrate logic from ateco_lookup.py
           pass

       def autocomplete(self, partial: str, limit: int = 10) -> List[ATECOCode]:
           """Autocomplete ATECO codes"""
           return self.db.query(ATECOCode)\
               .filter(ATECOCode.code.startswith(partial))\
               .limit(limit)\
               .all()
   ```

2. **Create router**:
   ```python
   # app/routers/ateco.py
   from fastapi import APIRouter, Depends
   from app.services.ateco_service import ATECOService

   router = APIRouter(prefix="/ateco", tags=["ATECO"])

   @router.get("/lookup")
   async def lookup_ateco(
       code: str,
       service: ATECOService = Depends()
   ):
       result = service.lookup(code)
       if not result:
           raise HTTPException(404, "ATECO not found")
       return result
   ```

3. **Update main.py** (dual endpoints):
   ```python
   # NEW router
   app.include_router(ateco.router)

   # OLD endpoint (proxy to new)
   @app.get("/lookup")
   def old_lookup(code: str, db: Session = Depends(get_db)):
       service = ATECOService(db)
       return service.lookup(code)
   ```

4. **Write tests**:
   ```python
   # tests/unit/services/test_ateco_service.py
   def test_lookup_valid_code():
       service = ATECOService(test_db)
       result = service.lookup("62.01")
       assert result.code == "62.01"
       assert result.description is not None

   def test_convert_2022_to_2025():
       service = ATECOService(test_db)
       code_2025 = service.convert_2022_to_2025("62.01")
       assert re.match(r'^\d{2}\.\d{2}$', code_2025)

   # tests/integration/test_ateco_endpoints.py
   def test_ateco_lookup_endpoint():
       response = client.get("/ateco/lookup?code=62.01")
       assert response.status_code == 200
       assert response.json()["code"] == "62.01"
   ```

5. Deploy to Railway
6. Verify both `/lookup` (old) and `/ateco/lookup` (new) work
7. Test all 3 Vercel frontends

#### Definition of Done
- ATECO service extracted and tested (80%+ coverage)
- All 4 endpoints working (old + new)
- ATECO conversion logic migrated
- Production deployment successful
- No breaking changes to existing API

---

### Story 2.3: Extract Risk Assessment Service

**As a**: Developer
**I want**: Risk calculation as standalone service
**So that**: Business logic is testable and maintainable

**Priority**: 🔴 CRITICAL
**Effort**: 20 hours (2.5 days)
**Risk**: 🔴 HIGH (complex matrix logic)
**Dependencies**: Story 2.2 (needs ATECO service)

#### Acceptance Criteria
- [ ] `app/services/risk_service.py` created
- [ ] Risk calculation logic extracted (~800 lines):
  - Matrix position calculation (36 positions)
  - Risk level determination
  - Risk recommendations
  - Event enrichment (with ATECO data)
- [ ] `app/routers/risk.py` created with 8 endpoints:
  - `GET /risk/events/{category}`
  - `GET /risk/description/{event_code}`
  - `POST /risk/calculate`
  - `POST /risk/save`
  - (4 more from monolith)
- [ ] ATECO service injected (dependency)
- [ ] Golden master tests for all 36 matrix positions
- [ ] Comparison tests verify identical results to baseline
- [ ] Unit tests (85%+ coverage)
- [ ] Deployed with dual endpoints
- [ ] Verified in production

#### Technical Tasks
1. **Create service with matrix logic**:
   ```python
   # app/services/risk_service.py
   class RiskService:
       def __init__(
           self,
           db: Session,
           ateco_service: ATECOService
       ):
           self.db = db
           self.ateco_service = ateco_service

       def calculate_risk_matrix(
           self,
           economic_loss: Literal['G', 'Y', 'O', 'R'],
           non_economic_loss: Literal['G', 'Y', 'O', 'R'],
           control_level: Literal['++', '+', '-', '--']
       ) -> RiskMatrixResult:
           """Calculate risk matrix position"""

           # Color to value mapping
           color_to_value = {'G': 4, 'Y': 3, 'O': 2, 'R': 1}

           # Calculate inherent risk
           economic_value = color_to_value[economic_loss]
           non_economic_value = color_to_value[non_economic_loss]
           inherent_risk = min(economic_value, non_economic_value)

           # Map to matrix position (A1-D4)
           control_to_row = {'--': 1, '-': 2, '+': 3, '++': 4}
           row = control_to_row[control_level]

           # Determine matrix position
           col_labels = ['A', 'B', 'C', 'D']
           col = col_labels[4 - inherent_risk]  # Invert for matrix
           position = f"{col}{row}"

           # Get risk level from mapping
           risk_levels = {
               'A4': {'level': 'Low', 'color': 'green', 'value': 0},
               # ... all 36 positions
               'D1': {'level': 'Critical', 'color': 'red', 'value': 1}
           }

           level_info = risk_levels[position]

           return RiskMatrixResult(
               matrix_position=position,
               risk_level=level_info['level'],
               risk_color=level_info['color'],
               risk_value=level_info['value'],
               inherent_risk=inherent_risk,
               control_adequacy=control_level
           )

       def get_events_by_category(
           self,
           category: str,
           enrich_ateco: bool = True
       ) -> List[RiskEvent]:
           """Get risk events, optionally enrich with ATECO data"""
           events = self.db.query(RiskEvent)\
               .filter(RiskEvent.category == category)\
               .all()

           if enrich_ateco:
               for event in events:
                   if event.ateco_relevant:
                       ateco_data = self.ateco_service.lookup(event.ateco_code)
                       event.ateco_info = ateco_data

           return events
   ```

2. **Create router**:
   ```python
   # app/routers/risk.py
   from fastapi import APIRouter, Depends
   from app.services.risk_service import RiskService
   from app.schemas.risk import RiskCalculationRequest, RiskMatrixResponse

   router = APIRouter(prefix="/risk", tags=["Risk Assessment"])

   @router.post("/calculate", response_model=RiskMatrixResponse)
   async def calculate_risk(
       request: RiskCalculationRequest,
       service: RiskService = Depends()
   ):
       result = service.calculate_risk_matrix(
           request.economic_loss,
           request.non_economic_loss,
           request.control_level
       )
       return result
   ```

3. **Write golden master tests** (CRITICAL):
   ```python
   # tests/unit/services/test_risk_service.py
   @pytest.mark.parametrize("economic,non_economic,control,expected_position,expected_level", [
       # Test ALL 36 matrix positions
       ('G', 'G', '++', 'A4', 'Low'),
       ('G', 'G', '+', 'A3', 'Low'),
       ('G', 'G', '-', 'A2', 'Medium'),
       ('G', 'G', '--', 'A1', 'Medium'),
       ('Y', 'Y', '++', 'B4', 'Low'),
       # ... all 36 combinations
       ('R', 'R', '--', 'D1', 'Critical'),
   ])
   def test_risk_matrix_all_positions(
       economic, non_economic, control,
       expected_position, expected_level
   ):
       service = RiskService(db=test_db, ateco_service=mock_ateco)
       result = service.calculate_risk_matrix(economic, non_economic, control)

       assert result.matrix_position == expected_position
       assert result.risk_level == expected_level
   ```

4. **Write comparison tests**:
   ```python
   # tests/comparison/test_risk_calculation.py
   def test_risk_calculation_matches_baseline():
       """Ensure new service produces identical results to old code"""
       with open("tests/fixtures/risk_matrix_baseline.json") as f:
           baseline = json.load(f)

       service = RiskService(db=test_db, ateco_service=ateco_service)

       for (economic, non_economic, control), expected in baseline.items():
           result = service.calculate_risk_matrix(economic, non_economic, control)

           # MUST match exactly
           assert result.matrix_position == expected['matrix_position']
           assert result.risk_level == expected['risk_level']
           assert result.risk_color == expected['risk_color']
   ```

5. Deploy with dual endpoints
6. Verify both old and new endpoints produce identical results
7. Monitor production for 24 hours

#### Definition of Done
- Risk service extracted (800 lines → service)
- All 36 matrix positions tested and verified
- Comparison tests pass (new matches baseline)
- ATECO enrichment works (dependency injected)
- Unit test coverage 85%+
- Production deployment successful
- No regression bugs detected

---

### Story 2.4: Extract Visura Extraction Service (HIGHEST RISK)

**As a**: Developer
**I want**: PDF extraction as standalone service
**So that**: Complex extraction logic is isolated and testable

**Priority**: 🔴 CRITICAL
**Effort**: 28 hours (3.5 days)
**Risk**: 🔴 VERY HIGH (1000 lines, complex PDF processing)
**Dependencies**: Story 2.2 (needs ATECO conversion)

#### Acceptance Criteria
- [ ] `app/services/visura_service.py` created
- [ ] PDF extraction logic extracted (~1000 lines):
  - 3 extraction engines (pdfplumber, PyPDF2, Tesseract)
  - Chain of responsibility pattern
  - Retry logic with timeout
  - Field extraction (6 fields)
  - ATECO conversion (via ATECO service)
- [ ] `app/utils/pdf_extractors.py` created:
  - `PDFPlumberExtractor` class
  - `PyPDF2Extractor` class
  - `TesseractOCRExtractor` class
- [ ] `app/routers/visura.py` created with 2 endpoints:
  - `POST /api/extract-visura` (new service)
  - `POST /api/extract-visura-legacy` (old code, fallback)
- [ ] Dual endpoints active for **1 week minimum**
- [ ] Golden master tests with 10+ real visura PDFs
- [ ] Success rate ≥95% (matching old implementation)
- [ ] Performance within 10% of old version
- [ ] Confidence scores match old implementation
- [ ] Deployed to Railway
- [ ] Monitored in production for 1 week before deprecating old endpoint

#### Technical Tasks
1. **Extract PDF extractors to utilities**:
   ```python
   # app/utils/pdf_extractors.py
   from abc import ABC, abstractmethod

   class PDFExtractor(ABC):
       """Base class for PDF extraction strategies"""

       @property
       @abstractmethod
       def name(self) -> str:
           pass

       @abstractmethod
       def extract(self, pdf_path: Path) -> Optional[str]:
           pass

   class PDFPlumberExtractor(PDFExtractor):
       name = "pdfplumber"

       def extract(self, pdf_path: Path) -> Optional[str]:
           """Extract text using pdfplumber"""
           try:
               import pdfplumber
               with pdfplumber.open(pdf_path) as pdf:
                   text = ""
                   for page in pdf.pages:
                       text += page.extract_text() or ""
                   return text if text.strip() else None
           except Exception as e:
               logger.warning(f"pdfplumber failed: {e}")
               return None

   class PyPDF2Extractor(PDFExtractor):
       name = "PyPDF2"

       def extract(self, pdf_path: Path) -> Optional[str]:
           """Extract text using PyPDF2"""
           # Migrate logic from monolith
           pass

   class TesseractOCRExtractor(PDFExtractor):
       name = "Tesseract OCR"

       def extract(self, pdf_path: Path) -> Optional[str]:
           """Extract text using OCR (last resort)"""
           # Migrate OCR logic from monolith
           pass
   ```

2. **Create visura service**:
   ```python
   # app/services/visura_service.py
   class VisuraService:
       def __init__(
           self,
           db: Session,
           ateco_service: ATECOService
       ):
           self.db = db
           self.ateco_service = ateco_service
           self.extractors = [
               PDFPlumberExtractor(),
               PyPDF2Extractor(),
               TesseractOCRExtractor()
           ]

       async def extract(self, pdf_file: UploadFile) -> VisuraExtractionResult:
           """Extract visura data from PDF (chain of responsibility)"""

           # Save uploaded file temporarily
           temp_path = await self._save_temp_file(pdf_file)

           # Try extractors in order
           text = None
           for extractor in self.extractors:
               logger.info(f"Trying {extractor.name}...")
               text = extractor.extract(temp_path)
               if text:
                   logger.info(f"✅ {extractor.name} succeeded")
                   break

           if not text:
               raise ExtractionError("All extractors failed")

           # Extract fields
           partita_iva = self._extract_partita_iva(text)
           ateco_2022 = self._extract_ateco(text)
           oggetto_sociale = self._extract_oggetto_sociale(text)
           sede_legale = self._extract_sede_legale(text)
           denominazione = self._extract_denominazione(text)
           forma_giuridica = self._extract_forma_giuridica(text)

           # Convert ATECO 2022 → 2025
           if ateco_2022:
               ateco_2025 = self.ateco_service.convert_2022_to_2025(ateco_2022)
           else:
               ateco_2025 = None

           # Calculate confidence
           fields_extracted = sum([
               bool(partita_iva),
               bool(ateco_2025),
               bool(oggetto_sociale),
               bool(sede_legale),
               bool(denominazione),
               bool(forma_giuridica)
           ])
           confidence = (fields_extracted / 6.0) * 100

           return VisuraExtractionResult(
               partita_iva=partita_iva,
               codice_ateco=ateco_2025,
               oggetto_sociale=oggetto_sociale,
               sede_legale=sede_legale,
               denominazione=denominazione,
               forma_giuridica=forma_giuridica,
               confidence=confidence,
               extractor_used=extractor.name
           )

       def _extract_partita_iva(self, text: str) -> Optional[str]:
           """Extract 11-digit VAT number"""
           # Migrate regex logic from monolith
           pass
   ```

3. **Create router with DUAL endpoints** (critical for safety):
   ```python
   # app/routers/visura.py
   from fastapi import APIRouter, UploadFile, File
   from app.services.visura_service import VisuraService

   router = APIRouter(prefix="/api", tags=["Visura"])

   @router.post("/extract-visura")
   async def extract_visura_new(
       file: UploadFile = File(...),
       service: VisuraService = Depends()
   ):
       """NEW service-based extraction"""
       result = await service.extract(file)
       return {
           "status": "success",
           "data": result.dict(),
           "version": "v2.0-service"
       }

   @router.post("/extract-visura-legacy")
   async def extract_visura_old(file: UploadFile = File(...)):
       """OLD monolithic extraction (fallback for 1 week)"""
       # Keep original 1000-line implementation as fallback
       # Will be removed after 1 week of monitoring
       pass
   ```

4. **Write golden master tests** (CRITICAL):
   ```python
   # tests/integration/test_visura_extraction.py
   @pytest.mark.parametrize("pdf_file,expected_golden", [
       ("visura_sample_1.pdf", "golden_1.json"),
       ("visura_sample_2.pdf", "golden_2.json"),
       # ... 10+ real visura PDFs
   ])
   def test_visura_extraction_golden(pdf_file, expected_golden):
       """Ensure extraction produces known-good results"""

       # Extract with NEW service
       with open(f"tests/fixtures/{pdf_file}", "rb") as f:
           response = client.post("/api/extract-visura", files={"file": f})

       result = response.json()

       # Load golden master
       with open(f"tests/golden/{expected_golden}") as f:
           golden = json.load(f)

       # Verify all fields match
       assert result['data']['partita_iva'] == golden['partita_iva']
       assert result['data']['codice_ateco'] == golden['codice_ateco']
       assert result['data']['confidence'] >= 95.0  # High confidence required
   ```

5. **Write comparison tests**:
   ```python
   # tests/comparison/test_visura_old_vs_new.py
   def test_visura_extraction_matches_legacy():
       """Ensure NEW service produces same results as OLD code"""

       for pdf_file in VISURA_TEST_FILES:
           with open(pdf_file, "rb") as f:
               old_result = client.post("/api/extract-visura-legacy", files={"file": f})

           with open(pdf_file, "rb") as f:
               new_result = client.post("/api/extract-visura", files={"file": f})

           # Results must match
           assert old_result.json()['data'] == new_result.json()['data']
   ```

6. Deploy to Railway with **BOTH endpoints active**
7. Update frontend to use new endpoint (but keep old as fallback)
8. Monitor production for **1 week**:
   - Success rate ≥95%
   - Performance within 10% of old
   - Confidence scores ≥95%
9. After 1 week of stability, deprecate legacy endpoint

#### Definition of Done
- Visura service extracted (1000 lines → modular services)
- 3 extraction strategies implemented (chain of responsibility)
- ATECO conversion integrated (dependency)
- 10+ golden master tests passing
- Success rate ≥95% verified in production
- Dual endpoints deployed and monitored for 1 week
- Performance metrics within acceptable range
- No regression bugs detected

---

### Story 2.5: Extract Seismic Zone Service

**As a**: Developer
**I want**: Seismic zone lookup as standalone service
**So that**: Geographic data queries are isolated

**Priority**: 🟡 HIGH
**Effort**: 6 hours
**Risk**: 🟢 LOW (simple lookup)
**Dependencies**: Phase 1 complete

#### Acceptance Criteria
- [ ] `app/services/seismic_service.py` created
- [ ] Seismic lookup logic extracted (~200 lines)
- [ ] `app/routers/seismic.py` created with 2 endpoints:
  - `GET /seismic-zone/{comune}?provincia={prov}`
  - `GET /seismic/db/{comune}` (PostgreSQL version)
- [ ] All 7,896 comuni queryable
- [ ] Unit tests (85%+ coverage)
- [ ] Integration tests verify all comuni
- [ ] Deployed to Railway
- [ ] Verified in production

#### Technical Tasks
1. Create service:
   ```python
   # app/services/seismic_service.py
   class SeismicService:
       def __init__(self, db: Session):
           self.db = db

       def lookup_zone(self, comune: str, provincia: Optional[str] = None) -> Optional[SeismicZone]:
           """Lookup seismic zone for Italian comune"""
           query = self.db.query(SeismicZone)\
               .filter(SeismicZone.comune.ilike(comune))

           if provincia:
               query = query.filter(SeismicZone.provincia.ilike(provincia))

           return query.first()
   ```

2. Create router
3. Write tests (test all 7,896 comuni from database)
4. Deploy and verify

#### Definition of Done
- Seismic service extracted and tested
- All comuni queryable from PostgreSQL
- Production deployment successful

---

### Story 2.6: Extract Session Tracking Service

**As a**: Developer
**I want**: User session tracking as cross-cutting service
**So that**: All services can log user events consistently

**Priority**: 🟡 HIGH
**Effort**: 14 hours (1.75 days)
**Risk**: 🟡 MEDIUM (cross-cutting concern)
**Dependencies**: Phase 1 complete

#### Acceptance Criteria
- [ ] `app/services/session_service.py` created
- [ ] Session tracking logic extracted (~500 lines)
- [ ] `app/routers/session.py` created with 4 endpoints:
  - `POST /api/events` (save event)
  - `GET /api/sessions/{userId}` (get history)
  - `GET /api/sessions/{userId}/summary` (stats)
- [ ] Injectable into all other services
- [ ] PostgreSQL storage working
- [ ] Unit tests (80%+ coverage)
- [ ] Deployed to Railway
- [ ] Verified in production (Syd Onnisciente feature)

#### Technical Tasks
1. Create service (injectable into all other services)
2. Create router
3. Write tests
4. Deploy and verify

#### Definition of Done
- Session service extracted and tested
- Cross-cutting concern properly injected
- Syd Onnisciente feature working (session memory)
- Production deployment successful

---

### Story 2.7: Extract Feedback & Notification Service

**As a**: Developer
**I want**: User feedback and Telegram notifications as service
**So that**: Communication logic is centralized

**Priority**: 🔴 CRITICAL (Telegram notifications production-critical)
**Effort**: 18 hours (2.25 days)
**Risk**: 🟡 MEDIUM (Telegram integration must not break)
**Dependencies**: Phase 1 complete

#### Acceptance Criteria
- [ ] `app/services/notification_service.py` created
- [ ] Telegram integration extracted (~600 lines)
- [ ] `app/routers/feedback.py` created with 5 endpoints:
  - `POST /api/feedback` (save feedback)
  - `POST /api/send-risk-report-pdf` (send via Telegram)
  - `POST /api/send-prereport-pdf`
- [ ] Telegram bot tested with **separate test chat** (not production)
- [ ] Retry logic for failed notifications
- [ ] Graceful degradation (if Telegram fails, request succeeds)
- [ ] Unit tests with mocked Telegram API
- [ ] Integration tests with real test chat
- [ ] Deployed to Railway
- [ ] Verified Telegram notifications working in production

#### Technical Tasks
1. **Create notification service**:
   ```python
   # app/services/notification_service.py
   import telegram
   from tenacity import retry, stop_after_attempt, wait_exponential

   class NotificationService:
       def __init__(
           self,
           telegram_bot_token: str,
           telegram_chat_id: str
       ):
           self.bot = telegram.Bot(token=telegram_bot_token)
           self.chat_id = telegram_chat_id

       @retry(
           stop=stop_after_attempt(3),
           wait=wait_exponential(multiplier=1, min=2, max=10)
       )
       async def send_feedback_notification(self, feedback: UserFeedback):
           """Send feedback notification to Telegram (with retry)"""
           message = self._format_feedback_message(feedback)

           try:
               await self.bot.send_message(
                   chat_id=self.chat_id,
                   text=message,
                   parse_mode="Markdown"
               )
               logger.info(f"✅ Telegram notification sent")
           except Exception as e:
               logger.error(f"❌ Telegram failed: {e}")
               # Don't fail the entire request
               raise  # tenacity will retry

       def _format_feedback_message(self, feedback: UserFeedback) -> str:
           """Format feedback as Telegram message with emoji ratings"""
           # Migrate formatting logic from monolith
           pass
   ```

2. Create router with feedback endpoints
3. Write tests:
   ```python
   # tests/unit/services/test_notification_service.py
   @pytest.mark.asyncio
   async def test_send_feedback_notification(mocker):
       """Test Telegram notification (mocked)"""
       mock_bot = mocker.Mock()
       service = NotificationService(bot=mock_bot)

       feedback = UserFeedback(rating=5, comment="Great!")
       await service.send_feedback_notification(feedback)

       mock_bot.send_message.assert_called_once()

   # tests/integration/test_telegram.py (use test chat!)
   @pytest.mark.asyncio
   async def test_telegram_integration_with_test_chat():
       """Test with REAL Telegram API (test chat only)"""
       service = NotificationService(
           telegram_bot_token=TEST_BOT_TOKEN,
           telegram_chat_id=TEST_CHAT_ID  # ⚠️ NOT production chat
       )

       feedback = UserFeedback(rating=5, comment="Test notification")
       await service.send_feedback_notification(feedback)

       # Verify message received in test chat
   ```

4. Deploy to Railway
5. Test Telegram notifications in **test chat first**
6. Switch to production chat after verification

#### Definition of Done
- Notification service extracted (600 lines)
- Telegram integration tested with retry logic
- Feedback storage working (PostgreSQL)
- Production Telegram notifications working
- Graceful degradation if Telegram fails
- Unit + integration tests passing

---

## PHASE 3: CLEANUP & DOCUMENTATION (Week 3 - Days 13-15)

**Goal**: Remove legacy code, update docs, finalize refactoring

---

### Story 3.1: Update Frontend to Use New Endpoints

**As a**: Developer
**I want**: Frontend calling new modular endpoints
**So that**: We can deprecate old monolithic endpoints

**Priority**: 🔴 CRITICAL
**Effort**: 8 hours
**Risk**: 🟡 MEDIUM (production frontends)
**Dependencies**: All Phase 2 stories complete

#### Acceptance Criteria
- [ ] Frontend API config updated:
  - `/events/{category}` → `/risk/events/{category}`
  - `/lookup` → `/ateco/lookup`
  - `/calculate-risk-assessment` → `/risk/calculate`
  - (all other endpoints mapped to new routes)
- [ ] Deployed in order (test → production):
  1. Claudio instance → test 30 min
  2. Marcello instance → test 30 min
  3. Dario instance → test 30 min
- [ ] Full E2E test on each instance
- [ ] All features working (visura, risk, feedback)
- [ ] No errors in production logs
- [ ] Rollback plan ready (keep old config in git)

#### Technical Tasks
1. Update `src/config/api.ts`:
   ```typescript
   export const API_ENDPOINTS = {
     // OLD
     // risk: `${API_BASE}/events`,
     // ateco: `${API_BASE}/lookup`,

     // NEW
     risk: `${API_BASE}/risk/events`,
     ateco: `${API_BASE}/ateco/lookup`,
     riskCalculate: `${API_BASE}/risk/calculate`,
     visuraExtract: `${API_BASE}/api/extract-visura`,
     seismicZone: `${API_BASE}/seismic-zone`,
     feedback: `${API_BASE}/api/feedback`,
   };
   ```

2. Deploy to Vercel instances sequentially:
   ```bash
   # 1. Claudio (test instance)
   git push origin main
   # Wait for Vercel deploy
   # Test manually for 30 min

   # 2. Marcello
   # Deploy and test

   # 3. Dario (production instance)
   # Deploy and test
   ```

3. Run E2E tests on each instance
4. Monitor error logs for 24 hours

#### Definition of Done
- All 3 frontend instances using new endpoints
- Full E2E tests passing on all instances
- No production errors
- Old endpoints still available (for rollback)

---

### Story 3.2: Remove Legacy Monolith Code

**As a**: Developer
**I want**: Old monolithic code archived
**So that**: Codebase is clean and maintainable

**Priority**: 🟡 HIGH
**Effort**: 6 hours
**Risk**: 🟢 LOW (frontends already migrated)
**Dependencies**: Story 3.1 (frontend using new endpoints)

#### Acceptance Criteria
- [ ] Old endpoints removed from `main.py`
- [ ] `main.py` reduced from 3910 to <200 lines
- [ ] Legacy files archived to `legacy/` folder:
  - `legacy/main_old.py` (original 3910 lines)
  - `legacy/ateco_lookup.py`
  - `legacy/visura_extractor_*.py`
- [ ] New `main.py` contains only:
  - FastAPI app initialization
  - Router includes (7 routers)
  - Middleware setup (CORS)
  - Startup/shutdown events
- [ ] Deployed to Railway
- [ ] Production verified (all features working)
- [ ] Legacy code kept in git history (for reference)

#### Technical Tasks
1. **Create clean new main.py**:
   ```python
   # app/main.py (NEW - ~150 lines total)
   from fastapi import FastAPI
   from fastapi.middleware.cors import CORSMiddleware
   from app.core.config import settings
   from app.routers import health, risk, ateco, visura, seismic, session, feedback

   app = FastAPI(
       title="SYD Cyber API",
       version="2.0.0",
       description="Modular Risk Assessment Platform"
   )

   # CORS
   app.add_middleware(
       CORSMiddleware,
       allow_origins=settings.allowed_origins,
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )

   # Include routers
   app.include_router(health.router)
   app.include_router(risk.router)
   app.include_router(ateco.router)
   app.include_router(visura.router)
   app.include_router(seismic.router)
   app.include_router(session.router)
   app.include_router(feedback.router)

   @app.on_event("startup")
   async def startup():
       logger.info("🚀 SYD Cyber API starting...")

   @app.on_event("shutdown")
   async def shutdown():
       logger.info("👋 SYD Cyber API shutting down...")

   # That's it! ~150 lines total
   ```

2. **Archive old code**:
   ```bash
   mkdir legacy/
   cp main.py legacy/main_old.py
   cp ateco_lookup.py legacy/
   cp visura_extractor_*.py legacy/

   # Commit archived files
   git add legacy/
   git commit -m "Archive legacy monolithic code"
   ```

3. Replace `main.py` with new clean version
4. Deploy to Railway
5. Verify all endpoints working
6. Monitor for 24 hours

#### Definition of Done
- `main.py` reduced to <200 lines
- Legacy code archived in `legacy/` folder
- All features working in production
- No regressions detected

---

### Story 3.3: Achieve 85% Test Coverage

**As a**: Developer
**I want**: Comprehensive test suite
**So that**: Future changes don't break production

**Priority**: 🔴 CRITICAL
**Effort**: 16 hours (2 days)
**Risk**: 🟢 LOW
**Dependencies**: All Phase 2 stories complete

#### Acceptance Criteria
- [ ] Test coverage ≥85% overall
  - Unit tests: 80%+ per service
  - Integration tests: 50%+ per router
  - E2E tests: 40%+ critical flows
- [ ] Performance tests passing:
  - Risk calculation: <100ms
  - ATECO lookup: <50ms
  - Visura extraction: <5s
- [ ] Load tests passing:
  - 100 concurrent requests handled
  - No memory leaks
  - Database connections pooled correctly
- [ ] CI/CD pipeline configured (optional):
  - Tests run on every PR
  - Coverage report generated
  - Deploy blocked if tests fail

#### Technical Tasks
1. **Add missing unit tests** (target 80% per service)
2. **Add integration tests** (test all endpoints)
3. **Add performance tests**:
   ```python
   # tests/performance/test_response_times.py
   def test_risk_calculation_performance():
       import time
       client = TestClient(app)

       start = time.time()
       response = client.post("/risk/calculate", json={
           'economic_loss': 'R',
           'non_economic_loss': 'R',
           'control_level': '--'
       })
       elapsed = time.time() - start

       assert response.status_code == 200
       assert elapsed < 0.1  # 100ms threshold
   ```

4. **Add load tests**:
   ```python
   # tests/load/test_concurrent_requests.py
   import asyncio
   import aiohttp

   async def test_100_concurrent_requests():
       async def make_request():
           async with aiohttp.ClientSession() as session:
               async with session.post(f"{API_BASE}/risk/calculate", json={...}) as resp:
                   return await resp.json()

       tasks = [make_request() for _ in range(100)]
       results = await asyncio.gather(*tasks)

       # All should succeed
       assert all(r['status'] == 'success' for r in results)
   ```

5. Run coverage report:
   ```bash
   pytest --cov=app --cov-report=html --cov-report=term
   # Open htmlcov/index.html
   # Verify 85%+ coverage
   ```

#### Definition of Done
- Test coverage ≥85% (verified with pytest-cov)
- All tests passing (unit + integration + E2E)
- Performance tests within thresholds
- Load tests passing (100 concurrent requests)
- Coverage report generated

---

### Story 3.4: Update Documentation

**As a**: Developer
**I want**: Documentation reflecting new architecture
**So that**: Future developers understand the system

**Priority**: 🟡 HIGH
**Effort**: 8 hours
**Risk**: 🟢 LOW
**Dependencies**: All refactoring complete

#### Acceptance Criteria
- [ ] `docs/ARCHITECTURE.md` updated with:
  - New modular monolith structure
  - Service boundaries diagram
  - Dependency injection flow
  - Database schema
- [ ] `docs/DEVELOPMENT_GUIDE.md` updated with:
  - How to run tests
  - How to add new service
  - How to add new endpoint
  - Local development setup
- [ ] `docs/ROADMAP.md` updated:
  - Refactoring marked COMPLETE
  - v1.0 timeline adjusted (+3 weeks)
- [ ] `docs/REFACTORING_COMPLETE.md` created:
  - Summary of changes
  - Before/after comparison
  - Lessons learned
  - Metrics (test coverage, lines of code, etc.)
- [ ] `README.md` in backend updated
- [ ] API documentation (Swagger) auto-generated and correct

#### Technical Tasks
1. Update ARCHITECTURE.md with new diagrams
2. Update DEVELOPMENT_GUIDE.md with new workflows
3. Update ROADMAP.md (mark refactoring complete)
4. Create REFACTORING_COMPLETE.md (summary document)
5. Update README.md
6. Verify Swagger docs are correct (http://localhost:8000/docs)

#### Definition of Done
- All documentation updated and accurate
- New developer can onboard using docs
- API documentation (Swagger) correct

---

### Story 3.5: Final Production Verification & Celebration

**As a**: Project Owner
**I want**: Complete verification that refactoring succeeded
**So that**: We can confidently move to v1.0

**Priority**: 🔴 CRITICAL
**Effort**: 4 hours
**Risk**: 🟢 LOW
**Dependencies**: All stories complete

#### Acceptance Criteria
- [ ] All success criteria met (from Epic Overview)
- [ ] Production health checks:
  - All 3 Vercel frontends online and functional
  - Railway backend online (99%+ uptime)
  - Database connections healthy
  - Telegram notifications working
- [ ] Performance metrics within targets:
  - API response times <500ms
  - Test coverage ≥85%
  - Zero critical bugs
- [ ] User verification:
  - Test with real user (Dario, Marcello, or Claudio)
  - Complete risk assessment end-to-end
  - Verify PDF report generation
  - Verify feedback submission
- [ ] Metrics comparison (before → after):
  - main.py: 3910 lines → <200 lines ✅
  - Test coverage: 0% → 85%+ ✅
  - Services: 1 monolith → 6 modular ✅
  - Maintainability: Impossible → Professional ✅
- [ ] Rollback plan documented (just in case)
- [ ] Team celebration! 🎉

#### Technical Tasks
1. Run full production verification checklist
2. Test with real user (complete flow)
3. Collect metrics (before/after)
4. Document rollback plan (git tags, Railway rollback)
5. Create summary report
6. Celebrate success! 🚀

#### Definition of Done
- All success criteria verified ✅
- Production stable and performant
- Refactoring COMPLETE
- Ready for v1.0 development

---

## 📊 TIMELINE & DEPENDENCIES

### Gantt-Style Timeline

```
Week 1: FOUNDATION
├── Day 1-2: Story 1.1 (Directory Structure) ████░░░░░░░░░░░
├── Day 2-3: Story 1.2 (Config & Database)   ░░░░████████░░░
├── Day 3-4: Story 1.3 (SQLAlchemy Models)   ░░░░░░░░████░░░
├── Day 4: Story 1.4 (Pydantic Schemas)      ░░░░░░░░░░░░███
└── Day 4-5: Story 1.5 (Baseline Tests)      ░░░░░░░░░███████ [CRITICAL]

Week 2: SERVICE EXTRACTION
├── Day 6: Story 2.1 (Health Check)          ███░░░░░░░░░░░░
├── Day 6-7: Story 2.2 (ATECO Service)       ░░█████████░░░░ [DEPENDENCY]
├── Day 8-9: Story 2.3 (Risk Service)        ░░░░░░░░░███████████ [depends on ATECO]
├── Day 10-12: Story 2.4 (Visura Service)    ░░░░░░░░░░░░░███████████████ [HIGH RISK]
├── Day 11: Story 2.5 (Seismic Service)      ░░░░░░░░░░░███░░░░░░
├── Day 11-12: Story 2.6 (Session Service)   ░░░░░░░░░░░░░████████
└── Day 12-13: Story 2.7 (Notification)      ░░░░░░░░░░░░░░░░███████

Week 3: CLEANUP & DOCS
├── Day 13: Story 3.1 (Frontend Update)      ███████░░░░░░░░
├── Day 13-14: Story 3.2 (Remove Legacy)     ░░░░░░████░░░░░
├── Day 14-15: Story 3.3 (Test Coverage)     ░░░░░░░░████████
├── Day 15: Story 3.4 (Documentation)        ░░░░░░░░░░░░████
└── Day 15: Story 3.5 (Verification)         ░░░░░░░░░░░░░░██
```

### Critical Path

**CRITICAL PATH** (stories that MUST complete on time):
1. Story 1.5 → **Baseline Tests** (blocks all refactoring)
2. Story 2.2 → **ATECO Service** (Risk & Visura depend on it)
3. Story 2.4 → **Visura Service** (highest risk, longest duration)
4. Story 3.1 → **Frontend Update** (needed to deprecate old endpoints)

### Dependency Graph

```
Foundation (Week 1)
    ↓
    ├─→ Story 2.1 (Health) ──────────────┐
    ├─→ Story 2.2 (ATECO) ────────┐      │
    │       ↓                     ↓      ↓
    │   Story 2.3 (Risk)      Story 2.4 (Visura)
    │       ↓                     ↓      │
    ├─→ Story 2.5 (Seismic) ─────────────┤
    ├─→ Story 2.6 (Session) ─────────────┤
    └─→ Story 2.7 (Notification) ────────┘
            ↓
    All Phase 2 Complete
            ↓
    Story 3.1 (Frontend) → Story 3.2 (Legacy) → Story 3.3 (Tests) → Story 3.4 (Docs) → Story 3.5 (Verify)
```

### Parallel Work Opportunities

**Week 1** (can be parallelized):
- Story 1.3 + 1.4 can overlap (models & schemas independent)
- Story 1.5 can start early (test current behavior)

**Week 2** (some parallel work):
- Story 2.5 (Seismic) + 2.6 (Session) can be done in parallel
- Story 2.1 (Health) can be done while 2.2 (ATECO) is in progress

**Week 3** (mostly sequential):
- Must complete frontend update before removing legacy code
- Documentation can be written in parallel with testing

---

## 🎯 MILESTONE CHECKPOINTS

### Milestone 1: Foundation Complete (End of Week 1)
**Date**: Day 5
**Criteria**:
- [ ] All directory structure created
- [ ] Configuration centralized
- [ ] Models & schemas defined
- [ ] Baseline tests passing (60% coverage)

**Go/No-Go Decision**: If baseline tests don't reach 60%, PAUSE refactoring

---

### Milestone 2: Core Services Extracted (Mid Week 2)
**Date**: Day 9
**Criteria**:
- [ ] Health, ATECO, Risk services deployed
- [ ] Dual endpoints working in production
- [ ] No regressions detected
- [ ] Test coverage 70%+

**Go/No-Go Decision**: If regressions found, rollback and investigate

---

### Milestone 3: All Services Extracted (End of Week 2)
**Date**: Day 12
**Criteria**:
- [ ] All 6 services deployed
- [ ] Visura extraction verified (95%+ success)
- [ ] Telegram notifications working
- [ ] Frontend still functional

**Go/No-Go Decision**: If Visura success <95%, keep dual endpoints longer

---

### Milestone 4: Refactoring Complete (End of Week 3)
**Date**: Day 15
**Criteria**:
- [ ] Legacy code archived
- [ ] Frontend using new endpoints
- [ ] Test coverage ≥85%
- [ ] Documentation updated
- [ ] Production stable

**Success**: Move to v1.0 development 🚀

---

## 📞 HANDOFF TO @dev

### Implementation Ready ✅

**John (PM) Deliverables**:
- ✅ Epic defined with business value
- ✅ 17 stories broken down (Phase 1-3)
- ✅ Effort estimated (177 hours total)
- ✅ Dependencies mapped
- ✅ Timeline with milestones
- ✅ Risk mitigation strategies
- ✅ Success criteria defined

**Next Action**: Call `@dev` (Amelia) to execute stories

**Recommended Execution Order**:
1. Week 1: Foundation (Stories 1.1-1.5)
2. Week 2: Service Extraction (Stories 2.1-2.7)
3. Week 3: Cleanup (Stories 3.1-3.5)

**Daily Standups** (recommended):
- What was completed yesterday?
- What will be completed today?
- Any blockers?
- Any risks discovered?

**Progress Tracking**:
- Update story status daily
- Report milestone completion
- Flag issues immediately
- Celebrate small wins!

---

## 📊 SUMMARY METRICS

### Epic Summary

| Metric | Value |
|--------|-------|
| **Total Stories** | 17 |
| **Total Effort** | 177 hours ≈ 22 days |
| **Timeline** | 3 weeks (15 working days) |
| **Services Extracted** | 6 domains |
| **Lines Refactored** | 3910 → <200 (main.py) |
| **Test Coverage Target** | 0% → 85% |
| **Risk Level** | LOW (incremental strategy) |

### Story Breakdown

| Phase | Stories | Effort | Risk |
|-------|---------|--------|------|
| **Phase 1: Foundation** | 5 | 30h | 🟢 LOW |
| **Phase 2: Services** | 7 | 102h | 🟡 MEDIUM |
| **Phase 3: Cleanup** | 5 | 45h | 🟢 LOW |

### Risk Distribution

| Risk Level | Stories | Mitigation |
|------------|---------|------------|
| 🔴 HIGH | 2 | Dual endpoints, golden tests, 1-week monitoring |
| 🟡 MEDIUM | 4 | Service tests, comparison tests, retry logic |
| 🟢 LOW | 11 | Standard testing, incremental deployment |

---

## ✅ APPROVAL & SIGN-OFF

**Epic Status**: ✅ **READY FOR IMPLEMENTATION**

**Product Manager**: John (PM Agent)
**Date**: October 26, 2025
**Version**: 1.0

**Reviewed By**:
- Winston (Architect) - ✅ Architecture validated
- Mary (Analyst) - ✅ Code review complete
- Claudio (Owner) - ⏳ Pending approval

**Next Action**:
```
@dev Execute refactoring stories in order (Phase 1 → 2 → 3)
```

**Good Luck Team! Let's build something great! 🚀**

---

*This implementation plan was created through the BMAD workflow by John (PM Agent) based on architectural design by Winston and code review by Mary, in collaboration with Claudio (Project Owner).*
