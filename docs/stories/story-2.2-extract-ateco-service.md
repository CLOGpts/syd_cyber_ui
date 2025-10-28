# Story 2.2: Extract ATECO Service

Status: Approved

## Story

As a **Backend Developer**,
I want to **extract ATECO lookup logic from main.py into a dedicated service module**,
so that **we have a clean, testable, and reusable ATECO service for the modular architecture**.

## Context

**Completed Work:**
- ✅ Story 1.6: Test coverage 46% (137 integration tests)
- ✅ Story 2.1: Health check router extracted (147 tests passing)
- ✅ Testing infrastructure stable
- ✅ Dual endpoint pattern established

**Current Situation:**
- `ateco_lookup.py` is 1518 lines with business logic + FastAPI endpoints mixed
- ATECO logic is used by Risk and Visura services (CRITICAL DEPENDENCY)
- 300+ lines of core logic need extraction:
  - Code normalization (normalize_code, strip_code, code_variants)
  - Smart search with 2022/2025 conversion
  - Dataset loading and caching
  - Enrichment with sector mapping
- 4 ATECO endpoints currently in main.py need modularization

**Strategic Goal:**
Create `app/services/ateco_service.py` and `app/routers/ateco.py` following the same pattern as Story 2.1 (health check). This is CRITICAL because Stories 2.3 (Risk) and 2.4 (Visura) depend on ATECO service.

## Acceptance Criteria

1. **AC1: ATECO Service Module Created**
   - File `app/services/ateco_service.py` exists
   - Contains all core ATECO logic from ateco_lookup.py:
     - `normalize_code()` function
     - `strip_code()` function
     - `code_variants()` function
     - `search_smart()` function
     - `find_similar_codes()` function
     - `flatten()` function
     - `enrich()` function
     - `load_dataset()` function
     - `normalize_headers()` function
   - Service class `ATECOService` with dependency injection pattern
   - Proper error handling and logging
   - Type hints on all functions

2. **AC2: ATECO Router Module Created**
   - File `app/routers/ateco.py` exists
   - Contains 4 ATECO endpoints:
     - `GET /ateco/lookup?code=XX.XX` - Single code lookup
     - `GET /ateco/autocomplete?partial=62` - Autocomplete suggestions
     - `POST /ateco/batch` - Batch lookup for multiple codes
     - `GET /db/ateco/lookup` - Database-based lookup (legacy compatibility)
   - All endpoints use ATECOService dependency injection
   - Proper request/response models (Pydantic)
   - Error responses follow FastAPI best practices

3. **AC3: Dual Endpoints for Safety**
   - Old endpoints in main.py REMAIN active:
     - `GET /lookup` (old)
     - `POST /batch` (old)
     - `GET /autocomplete` (old)
   - Old endpoints proxy to new router internally
   - Both old and new endpoints return identical responses
   - No breaking changes for existing API consumers

4. **AC4: Unit Tests Written (80%+ Coverage)**
   - File `tests/unit/services/test_ateco_service.py` created
   - Tests for all service functions:
     - Code normalization tests (10+ scenarios)
     - Search smart tests (exact, prefix, fuzzy)
     - Dataset loading tests
     - Enrichment tests
   - File `tests/unit/routers/test_ateco.py` created
   - Tests for all router endpoints (20+ tests)
   - Minimum 80% coverage on new code
   - All tests use mocks (no real dataset dependency)

5. **AC5: Integration Tests Pass**
   - All 147 existing integration tests still pass
   - New integration tests for ATECO router (5+ tests)
   - Total test count: 152+ passing
   - Test execution time < 30 seconds
   - No flaky tests

6. **AC6: Documentation & Code Quality**
   - Docstrings on all public functions
   - Type hints on all function signatures
   - Comments explain non-obvious logic
   - Code follows existing project style (black, isort)
   - No lint warnings (pylint, flake8)

## Tasks / Subtasks

- [ ] **Task 1: Create ATECO Service Module** (AC: #1, #6)
  - [ ] 1.1: Create `app/services/__init__.py`
  - [ ] 1.2: Create `app/services/ateco_service.py` with class structure
  - [ ] 1.3: Migrate `normalize_code()`, `strip_code()`, `code_variants()` from ateco_lookup.py
  - [ ] 1.4: Migrate `load_dataset()`, `normalize_headers()` with caching
  - [ ] 1.5: Migrate `search_smart()`, `search_smart_internal()`, `cached_search()`
  - [ ] 1.6: Migrate `find_similar_codes()` for fuzzy matching
  - [ ] 1.7: Migrate `flatten()`, `enrich()` for response formatting
  - [ ] 1.8: Add proper error handling and logging
  - [ ] 1.9: Add type hints and docstrings
  - [ ] 1.10: Add dependency injection pattern (dataset path as config)

- [ ] **Task 2: Create ATECO Router Module** (AC: #2, #6)
  - [ ] 2.1: Create `app/routers/ateco.py` with router setup
  - [ ] 2.2: Create Pydantic request/response models
  - [ ] 2.3: Implement `GET /ateco/lookup` endpoint
  - [ ] 2.4: Implement `GET /ateco/autocomplete` endpoint
  - [ ] 2.5: Implement `POST /ateco/batch` endpoint
  - [ ] 2.6: Implement `GET /db/ateco/lookup` (legacy compat)
  - [ ] 2.7: Add error responses (404, 400, 500)
  - [ ] 2.8: Add dependency injection for ATECOService
  - [ ] 2.9: Add docstrings and comments

- [ ] **Task 3: Update Main.py with Dual Endpoints** (AC: #3)
  - [ ] 3.1: Register new ATECO router in main.py
  - [ ] 3.2: Keep old endpoints (`/lookup`, `/batch`, `/autocomplete`)
  - [ ] 3.3: Make old endpoints proxy to new router functions
  - [ ] 3.4: Verify both endpoint sets return identical responses
  - [ ] 3.5: Add deprecation warnings to old endpoints (in logs, not responses)

- [ ] **Task 4: Write Unit Tests** (AC: #4, #6)
  - [ ] 4.1: Create `tests/unit/services/test_ateco_service.py`
  - [ ] 4.2: Test normalize_code with edge cases (spaces, dots, nulls)
  - [ ] 4.3: Test code_variants generation
  - [ ] 4.4: Test search_smart (exact match, prefix, fuzzy)
  - [ ] 4.5: Test find_similar_codes suggestions
  - [ ] 4.6: Test enrich sector mapping
  - [ ] 4.7: Create `tests/unit/routers/test_ateco.py`
  - [ ] 4.8: Test GET /ateco/lookup (success, not found, invalid)
  - [ ] 4.9: Test GET /ateco/autocomplete
  - [ ] 4.10: Test POST /ateco/batch
  - [ ] 4.11: Run coverage: `pytest tests/unit/services/test_ateco_service.py --cov=app/services/ateco_service`
  - [ ] 4.12: Run coverage: `pytest tests/unit/routers/test_ateco.py --cov=app/routers/ateco`
  - [ ] 4.13: Verify 80%+ coverage achieved

- [ ] **Task 5: Write Integration Tests** (AC: #5)
  - [ ] 5.1: Create `tests/integration/test_ateco_router.py`
  - [ ] 5.2: Test new endpoints with real test client
  - [ ] 5.3: Test dual endpoints return same data
  - [ ] 5.4: Run all tests: `pytest tests/ -v`
  - [ ] 5.5: Verify 152+ tests passing
  - [ ] 5.6: Verify test execution time < 30s

- [ ] **Task 6: Manual Testing with Clo** (AC: #3, #5)
  - [ ] 6.1: Start local server: `python3 main.py --serve`
  - [ ] 6.2: Test old endpoint: `GET /lookup?code=62.01`
  - [ ] 6.3: Test new endpoint: `GET /ateco/lookup?code=62.01`
  - [ ] 6.4: Verify identical responses
  - [ ] 6.5: Test autocomplete: `GET /ateco/autocomplete?partial=62`
  - [ ] 6.6: Get Clo's approval before commit

- [ ] **Task 7: Code Quality & Documentation** (AC: #6)
  - [ ] 7.1: Run black formatter: `black app/services/ app/routers/`
  - [ ] 7.2: Run isort: `isort app/services/ app/routers/`
  - [ ] 7.3: Run pylint: `pylint app/services/ateco_service.py`
  - [ ] 7.4: Run flake8: `flake8 app/services/ app/routers/`
  - [ ] 7.5: Fix any lint warnings
  - [ ] 7.6: Review all docstrings and comments

- [ ] **Task 8: Commit & Push (ONLY AFTER CLO APPROVAL)** (AC: All)
  - [ ] 8.1: Create branch: `git checkout -b feature/story-2.2-ateco-service`
  - [ ] 8.2: Stage changes: `git add app/services/ app/routers/ tests/ main.py`
  - [ ] 8.3: Commit: `git commit -m "feat(story-2.2): extract ATECO service and router"`
  - [ ] 8.4: Ask Clo for push approval
  - [ ] 8.5: Push: `git push -u origin feature/story-2.2-ateco-service`
  - [ ] 8.6: Update story status to "Done"

## Dev Notes

### Technical Context

**Backend Repository:** `/mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco`

**Source Files to Extract:**
- `ateco_lookup.py` (1518 lines) - Contains logic to extract
  - Lines 86-111: Code normalization functions
  - Lines 122-143: Dataset loading
  - Lines 158-204: Search smart logic
  - Lines 206-225: Fuzzy matching
  - Lines 228-268: Response formatting

**Target Architecture:**
```
app/
├── services/
│   ├── __init__.py
│   └── ateco_service.py       [NEW - Story 2.2]
├── routers/
│   ├── __init__.py
│   ├── health.py              [✅ Story 2.1]
│   └── ateco.py               [NEW - Story 2.2]
└── main.py                    [MODIFY - add router, keep old endpoints]
```

**Dependencies Pattern (from Story 2.1):**
```python
# In ateco.py router
from app.services.ateco_service import ATECOService

router = APIRouter(prefix="/ateco", tags=["ATECO"])

@router.get("/lookup")
def lookup_ateco(code: str, service: ATECOService = Depends()):
    return service.search(code)
```

**Testing Strategy:**
1. **Unit Tests (80%+ coverage):**
   - Mock dataset loading
   - Test all service functions in isolation
   - Test all router endpoints with mocked service

2. **Integration Tests:**
   - Use real TestClient with real dataset
   - Test dual endpoints return identical data
   - Verify no regression in existing 147 tests

3. **Manual Testing:**
   - Start server locally
   - Test both old and new endpoints
   - Get Clo's approval before commit

### Key Functions to Extract

**From ateco_lookup.py → ateco_service.py:**

1. **normalize_code(raw: Union[str, float]) -> str** (Line 86)
   - Normalizes ATECO codes (removes spaces, replaces commas)

2. **strip_code(raw: Union[str, float]) -> str** (Line 91)
   - Strips non-alphanumeric characters

3. **code_variants(code: str) -> List[str]** (Line 96)
   - Generates code variants (with/without dots, padded zeros)

4. **load_dataset(path: Path, debug: bool) -> pd.DataFrame** (Line 122)
   - Loads Excel dataset with header normalization

5. **search_smart(df, code, prefer, prefix) -> pd.DataFrame** (Line 158)
   - Smart search with 2022/2025 fallback

6. **find_similar_codes(df, code, limit) -> List[Dict]** (Line 206)
   - Fuzzy matching for typos

7. **flatten(row: pd.Series) -> Dict** (Line 228)
   - Converts DataFrame row to JSON dict

8. **enrich(item: dict) -> dict** (Line 236)
   - Adds sector, normative, certifications

### Endpoints to Create

**New Router Endpoints (app/routers/ateco.py):**

1. **GET /ateco/lookup?code=XX.XX**
   - Single ATECO code lookup
   - Query params: code, prefer (2022/2025/2025-camerale), prefix (bool)
   - Response: `{"found": 1, "items": [...]}`

2. **GET /ateco/autocomplete?partial=62**
   - Autocomplete suggestions for partial code
   - Query params: partial, limit (default 5, max 20)
   - Response: `{"partial": "62", "suggestions": [...], "count": 5}`

3. **POST /ateco/batch**
   - Batch lookup for multiple codes
   - Body: `{"codes": ["62.01", "62.02"], "prefer": "2022"}`
   - Response: `{"total_codes": 2, "results": [...]}`

4. **GET /db/ateco/lookup** (legacy compatibility)
   - Same as /ateco/lookup but different path
   - Supports old API consumers

**Old Endpoints (main.py - keep as proxy):**
- `GET /lookup` → proxies to `/ateco/lookup`
- `POST /batch` → proxies to `/ateco/batch`
- `GET /autocomplete` → proxies to `/ateco/autocomplete`

### Known Constraints

1. **Zero Breaking Changes:**
   - Old endpoints MUST remain functional
   - Responses MUST be identical between old/new
   - No change in response format or status codes

2. **Test Coverage:**
   - All 147 existing tests must pass
   - New code must have 80%+ coverage
   - No test execution time regression

3. **Code Quality:**
   - Follow existing style (black, isort)
   - Type hints required
   - Docstrings required
   - No lint warnings

4. **Manual Approval:**
   - Test locally with Clo BEFORE commit
   - NO push without explicit approval
   - Document any deviations in this story

### References

- **Handoff Document:** `docs/stories/AMELIA-HANDOFF.md`
- **Story 2.1 Pattern:** `app/routers/health.py` (reference implementation)
- **Source Code:** `ateco_lookup.py` (lines 86-268 for logic, lines 452-566 for endpoints)
- **Epic Document:** `docs/refactoring/REFACTORING_EPIC_STORIES.md` (lines 477-595)

## Dev Agent Record

### Context Reference

Story Context will be generated in Task 1 after analyzing ateco_lookup.py structure.

**Expected path:** `docs/stories/story-2.2-context.json`

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

<!-- Add links to debug logs during implementation -->

### Completion Notes

<!-- Dev agent will populate during implementation -->

### File List

**Files to Create:**
- `app/services/__init__.py`
- `app/services/ateco_service.py`
- `app/routers/ateco.py`
- `tests/unit/services/test_ateco_service.py`
- `tests/unit/routers/test_ateco.py`
- `tests/integration/test_ateco_router.py`
- `docs/stories/story-2.2-context.json`

**Files to Modify:**
- `main.py` (register router, keep old endpoints as proxy)
- `app/routers/__init__.py` (add ateco router)

**Expected Test Results:**
- Unit tests: 30+ new tests
- Integration tests: 5+ new tests
- Total tests: 152+ passing (was 147)
- Coverage on new code: 80%+
- Test execution time: < 30 seconds
