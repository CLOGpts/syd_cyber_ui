# ADR-001: ATECO Lookup Module Integration Strategy

**Date**: October 7, 2025
**Status**: Proposed
**Deciders**: Claudio (Clo), Claude AI
**Tags**: critical, backend, architecture

---

## Context

The ATECO lookup functionality exists in a separate file (`ateco_lookup.py`, 66KB) but is **not integrated** into the main FastAPI application (`main.py`). This is a **critical blocker** for production.

**Current Situation**:
- Frontend needs ATECO lookup for company profiling
- `ateco_lookup.py` has full implementation including:
  - Code lookup with variants
  - Autocomplete functionality
  - Batch processing
  - Fuzzy matching
  - Enrichment with normative data
- Frontend currently uses **Gemini AI as a workaround**
- Backend endpoints `/lookup`, `/autocomplete`, `/batch` are not available

**Why this decision is needed**:
- Core functionality missing from production
- Unreliable AI fallback (Gemini may hallucinate ATECO codes)
- Cannot proceed with database migration until this is resolved
- Frontend-backend contract incomplete

---

## Decision

**We will integrate `ateco_lookup.py` as an importable module into `main.py` and expose its functionality through FastAPI endpoints.**

---

## Options Considered

### Option 1: Direct Integration (Refactor as Module)

**Description**: Refactor `ateco_lookup.py` to be importable, then import its functions into `main.py`

**Pros**:
- Clean separation of concerns
- Reusable code
- Easy to test
- Maintains single FastAPI app
- No duplicate code

**Cons**:
- Requires refactoring `ateco_lookup.py`
- Need to handle state (loaded DataFrame)
- Some rework needed

**Estimated Effort**: Medium (3-4 days)

---

### Option 2: Separate Microservice

**Description**: Run `ateco_lookup.py` as separate service, call from `main.py`

**Pros**:
- No refactoring needed
- Services can scale independently
- Clear boundaries

**Cons**:
- Additional complexity
- Network latency
- Two deployments to manage
- Overkill for current scale
- More expensive (two Railway instances)

**Estimated Effort**: High (1 week+)

---

### Option 3: Copy-Paste Code

**Description**: Copy ATECO logic directly into `main.py`

**Pros**:
- Quick and simple
- No module management

**Cons**:
- Code duplication
- Hard to maintain
- Loses `ateco_lookup.py` CLI capabilities
- Poor software engineering practice

**Estimated Effort**: Low (1 day)

---

### Option 4: Keep Current Workaround

**Description**: Continue using Gemini AI for ATECO lookup

**Pros**:
- No development work needed
- Already working

**Cons**:
- Unreliable (AI can hallucinate)
- Slow (API call to Gemini)
- Expensive (Gemini API costs)
- Not using existing code
- **NOT ACCEPTABLE FOR PRODUCTION**

**Estimated Effort**: None

---

## Rationale

**We chose Option 1 (Direct Integration)** because:

1. **Best Engineering Practice**: Clean, modular, maintainable
2. **Reusable**: ATECO module can be used elsewhere if needed
3. **Testable**: Can test module independently
4. **Single Deployment**: Keeps infrastructure simple
5. **Reasonable Effort**: 3-4 days is acceptable for critical feature
6. **Preserves CLI**: Keep `ateco_lookup.py` CLI tool for testing

**Why not Option 2 (Microservice)**:
- Too complex for current scale
- Not needed until we have traffic that demands it
- Can always refactor to microservices later if needed

**Why not Option 3 (Copy-Paste)**:
- Poor practice
- Creates technical debt immediately
- Hard to maintain

**Why not Option 4 (Keep Workaround)**:
- Unacceptable for production
- Core functionality must be reliable
- We have the code, we should use it!

---

## Consequences

### Positive Consequences
- ✅ Reliable ATECO lookup
- ✅ Fast responses (no AI API call)
- ✅ No additional costs
- ✅ Complete backend functionality
- ✅ Can proceed with database migration
- ✅ Better testing capability

### Negative Consequences
- ⚠️ Refactoring work required (3-4 days)
- ⚠️ Need to manage DataFrame in memory (until database)
- ⚠️ Potential for bugs during refactoring

### Mitigation Strategies
- Thorough testing with frontend after integration
- Keep original `ateco_lookup.py` for comparison
- Test with multiple ATECO codes
- Validate against known results

---

## Implementation

**Phase 1: Refactoring (Day 1-2)**
- [ ] Analyze `ateco_lookup.py` structure
- [ ] Extract core functions into module format
- [ ] Create `ateco_service.py` or similar
- [ ] Handle global state (DataFrame loading)
- [ ] Preserve CLI functionality in original file

**Phase 2: Integration (Day 2-3)**
- [ ] Import module in `main.py`
- [ ] Add `/lookup` endpoint
- [ ] Add `/autocomplete` endpoint
- [ ] Add `/batch` endpoint
- [ ] Load ATECO data on startup
- [ ] Add error handling

**Phase 3: Testing (Day 3-4)**
- [ ] Test endpoints with Swagger
- [ ] Update frontend `.env` to use new endpoints
- [ ] Test with `useATECO.ts` hook
- [ ] Verify autocomplete in UI
- [ ] Test with multiple ATECO codes
- [ ] Performance testing

**Phase 4: Deployment (Day 4)**
- [ ] Deploy to Railway
- [ ] Update all frontend instances
- [ ] Verify production
- [ ] Monitor for errors

**Timeline**: 3-4 days
**Owner**: Clo + Claude
**Priority**: 🔴 CRITICAL

---

## Validation

**Success Criteria**:
- ✅ `/lookup?code=62.01` returns correct ATECO data
- ✅ Frontend displays backend data (not Gemini)
- ✅ Autocomplete works in search bar
- ✅ No breaking changes to other endpoints
- ✅ Response time < 500ms
- ✅ All 3 frontend instances work correctly

**Evaluation Timeline**: 1 week after deployment

**Rollback Plan**: If integration fails, temporarily revert to Gemini fallback while fixing issues

---

## Related Decisions

- [ADR-002: Database Choice](./ADR-002-database-choice.md) - Dependent on this integration
- Future: ADR for caching strategy (after database)

---

## References

- `ateco_lookup.py` - Existing implementation
- `main.py` - Main FastAPI application
- `useATECO.ts` - Frontend hook that needs this
- Backend Documentation: [DOCUMENTAZIONE_TECNICA_COMPLETA.md](../../_archive_old_docs/DOCUMENTAZIONE_TECNICA_COMPLETA.md)

---

## Notes

**Important**: This is the **#1 priority** for Phase 1 of the roadmap. Without this, we cannot proceed with database migration or consider the backend "production-ready."

Once completed, we should remove Gemini ATECO fallback from frontend to ensure we're using the reliable backend source.

---

**Review Date**: After implementation (Est. October 14, 2025)
**Last Updated**: October 7, 2025
