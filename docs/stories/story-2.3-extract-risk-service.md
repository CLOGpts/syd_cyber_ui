# Story 2.3: Extract Risk Service

Status: Approved

## Story

As a **Backend Developer**,
I want to **extract Risk calculation logic from main.py into a dedicated service module**,
so that **we have a clean, testable, and reusable Risk service for the modular architecture**.

## Context

**Completed Work:**
- ✅ Story 2.2: ATECO Service extracted (207 tests)
- ✅ Dual endpoint pattern established
- ✅ Service + Router architecture proven

**Current Situation:**
- Risk logic scattered in main.py (~500 linee)
- 5 risk endpoints mixed with other logic
- Risk data loaded from MAPPATURE_EXCEL_PERFETTE.json
- Core business logic needs extraction:
  - Event categorization and severity mapping
  - Event description with impact/probability/controls
  - Risk assessment fields structure
  - Risk score calculation
  - Risk matrix calculation (inherent risk + control effectiveness)

**Strategic Goal:**
Create `app/services/risk_service.py` and `app/routers/risk.py` following Story 2.2 pattern. Risk calculation is CORE business logic - needs high test coverage and modularity.

## Acceptance Criteria

1. **AC1: Risk Service Module Created**
   - File `app/services/risk_service.py` exists
   - Contains all core Risk logic:
     - `load_risk_data()` - Load JSON data
     - `get_events_for_category()` - Event listing with severity
     - `get_event_description()` - Detailed event info
     - `calculate_risk_score()` - Score calculation
     - `calculate_risk_matrix()` - Matrix position calculation
   - Class `RiskService` with dependency injection
   - Proper error handling and logging
   - Type hints on all functions

2. **AC2: Risk Router Module Created**
   - File `app/routers/risk.py` exists
   - Contains 5 Risk endpoints:
     - `GET /risk/events/{category}` - Events by category
     - `GET /risk/description/{event_code}` - Event details
     - `GET /risk/assessment-fields` - Form fields structure
     - `POST /risk/save-assessment` - Save and score
     - `POST /risk/calculate-assessment` - Matrix calculation
   - All endpoints use RiskService dependency injection
   - Proper request/response models (Pydantic)
   - Error responses follow FastAPI best practices

3. **AC3: Dual Endpoints for Safety**
   - Old endpoints in main.py REMAIN active:
     - `GET /events/{category}` (old)
     - `GET /description/{event_code}` (old)
     - `GET /risk-assessment-fields` (old)
     - `POST /save-risk-assessment` (old)
     - `POST /calculate-risk-assessment` (old)
   - Both old and new endpoints return identical responses
   - No breaking changes for existing API consumers

4. **AC4: Unit Tests Written (80%+ Coverage)**
   - File `tests/unit/services/test_risk_service.py` created
   - Tests for all service functions (30+ tests)
   - File `tests/unit/routers/test_risk.py` created
   - Tests for all router endpoints (20+ tests)
   - Minimum 80% coverage on new code

5. **AC5: Integration Tests Pass**
   - All 207 existing tests still pass
   - New integration tests for Risk router (10+ tests)
   - Total test count: 260+ passing
   - Test execution time < 40 seconds

6. **AC6: Documentation & Code Quality**
   - Docstrings on all public functions
   - Type hints on all function signatures
   - Code follows project style
   - No lint warnings

## Dev Notes

### Technical Context

**Backend Repository:** `/mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco`

**Source Code to Extract:**
- `main.py` lines 640-1165 (~500 lines Risk logic)
- Data file: `MAPPATURE_EXCEL_PERFETTE.json`

**Key Functions to Extract:**

1. **load_risk_data()** (lines 641-663)
   - Loads MAPPATURE_EXCEL_PERFETTE.json
   - Returns: EXCEL_CATEGORIES, EXCEL_DESCRIPTIONS
   - Error handling for missing/corrupt JSON

2. **get_events_for_category()** (lines 666-734)
   - Maps category names (operational, cyber, etc.)
   - Extracts event code + name from Excel format
   - Calculates severity based on code prefix
   - Returns: events list with code/name/severity

3. **get_event_description()** (lines 737-848)
   - Finds event in EXCEL_CATEGORIES
   - Looks up VLOOKUP description if available
   - Calculates impact, probability, controls by code
   - Returns: detailed event info

4. **calculate_risk_score()** (lines 970-1042)
   - Scores financial impact (0-40 pts)
   - Scores economic loss (0-30 pts)
   - Scores boolean impacts (10 pts each)
   - Applies control multiplier
   - Returns: score + analysis

5. **calculate_risk_matrix()** (lines 1044-1165)
   - Converts colors to values (G=4, Y=3, O=2, R=1)
   - Calculates inherent risk (min of economic/non-economic)
   - Maps control level to matrix row
   - Determines matrix position (A1-D4)
   - Returns: position, level, recommendations

**Endpoints to Create:**

```python
# New modular endpoints
GET  /risk/events/{category}
GET  /risk/description/{event_code}
GET  /risk/assessment-fields
POST /risk/save-assessment
POST /risk/calculate-assessment

# Old endpoints (keep active)
GET  /events/{category}
GET  /description/{event_code}
GET  /risk-assessment-fields
POST /save-risk-assessment
POST /calculate-risk-assessment
```

### Risk Data Structure

**MAPPATURE_EXCEL_PERFETTE.json:**
```json
{
  "mappature_categoria_eventi": {
    "Damage_Danni": ["101 - Evento 1", "102 - Evento 2", ...],
    "Business_disruption": [...],
    ...
  },
  "vlookup_map": {
    "101": "Descrizione dettagliata evento 101",
    "201": "Descrizione dettagliata evento 201",
    ...
  }
}
```

### Known Constraints

1. **Zero Breaking Changes:**
   - Old endpoints MUST remain functional
   - Responses MUST be identical
   - Risk calculation = core business = extra caution

2. **Test Coverage:**
   - All 207 existing tests must pass
   - New code must have 80%+ coverage
   - Risk matrix logic = critical = thorough testing

3. **Data Dependencies:**
   - MAPPATURE_EXCEL_PERFETTE.json must be loadable
   - Graceful fallback if file missing
   - Error handling for corrupt JSON

## Dev Agent Record

### Context Reference

Story Context: `docs/stories/story-2.3-context.json`

### Agent Model Used

claude-sonnet-4-5-20250929

### File List

**Files to Create:**
- `app/services/risk_service.py` (~400 lines)
- `app/routers/risk.py` (~350 lines)
- `tests/unit/services/test_risk_service.py` (30+ tests)
- `tests/unit/routers/test_risk.py` (20+ tests)
- `tests/integration/test_risk_router.py` (10+ tests)
- `docs/stories/story-2.3-context.json`

**Files to Modify:**
- `main.py` (register risk router)
- `app/routers/__init__.py` (export risk router)
- `app/services/__init__.py` (export RiskService)

**Expected Test Results:**
- Unit tests: 50+ new tests
- Integration tests: 10+ new tests
- Total tests: 260+ passing (was 207)
- Coverage on new code: 80%+
- Test execution time: < 40 seconds
