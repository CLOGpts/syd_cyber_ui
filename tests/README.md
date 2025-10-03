# IL GUARDIANO - Seismic Zone Test Suite

## Prerequisites

### 1. Install System Dependencies (WSL)
Due to WSL limitations, install browser dependencies manually:

```bash
sudo apt-get update
sudo apt-get install -y \
  libnspr4 \
  libnss3 \
  libasound2t64
```

### 2. Verify Playwright Installation
```bash
cd /mnt/c/Users/speci/Desktop/Varie/syd_cyber/ui
npx playwright --version
```

## Running Tests

### Full Test Suite (All 6 Tests)
```bash
cd /mnt/c/Users/speci/Desktop/Varie/syd_cyber/ui
npx playwright test tests/seismic-zone.spec.ts
```

### Single Test (e.g., Test 1 - Offline Backend)
```bash
npx playwright test tests/seismic-zone.spec.ts -g "should handle seismic endpoint offline gracefully"
```

### Headed Mode (See Browser)
```bash
npx playwright test tests/seismic-zone.spec.ts --headed
```

### Debug Mode (Step-by-Step)
```bash
npx playwright test tests/seismic-zone.spec.ts --debug
```

### Specific Test by Number
```bash
# Test 1: Backend Offline
npx playwright test tests/seismic-zone.spec.ts -g "TEST 1"

# Test 2: Backend Available
npx playwright test tests/seismic-zone.spec.ts -g "TEST 2"

# Test 6: Security Check
npx playwright test tests/seismic-zone.spec.ts -g "TEST 6"
```

## Expected Output

### Success (All Tests Pass)
```
Running 6 tests using 1 worker

  ✓ [chromium] › seismic-zone.spec.ts:26:3 › should handle seismic endpoint offline gracefully (5s)
  ✓ [chromium] › seismic-zone.spec.ts:90:3 › should display seismic zone when backend available (5s)
  ✓ [chromium] › seismic-zone.spec.ts:143:3 › should handle comune not found error (5s)
  ✓ [chromium] › seismic-zone.spec.ts:176:3 › should handle 404 HTTP error (5s)
  ✓ [chromium] › seismic-zone.spec.ts:214:3 › should handle network timeout (7s)
  ✓ [chromium] › seismic-zone.spec.ts:256:3 › should not log sensitive data in console (5s)

  6 passed (35s)
```

### Failure Example
```
  ✗ [chromium] › seismic-zone.spec.ts:26:3 › should handle seismic endpoint offline gracefully
    Error: expect(received).toBe(expected)
    Expected: 0 (no console errors)
    Received: 1
```

## Manual Browser Test (Alternative)

If Playwright fails due to WSL issues:

### 1. Start Dev Server
```bash
cd /mnt/c/Users/speci/Desktop/Varie/syd_cyber/ui
npm run dev
```

### 2. Open Browser DevTools
- Navigate to http://localhost:5175
- Open DevTools (F12)
- Go to Console tab

### 3. Upload Test Visura
- Drag & drop: `/mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco/2_2023-02-10 CELERYA VISURA ORD.pdf`

### 4. Verify Console Output
Expected logs:
```
🔧 Tentativo 1: Backend Python per estrazione visura...
⚠️ Seismic zone not found for: TORINO TO
OR
Error fetching seismic zone: TypeError: Failed to fetch
```

### 5. Check UI State
- ✅ Visura card displays
- ✅ CODICE ATECO section visible
- ✅ ZONA SISMICA section NOT visible (backend offline)
- ✅ No error popups or crashes

## Test Coverage Summary

| Test Case | Edge Case | Expected Result |
|-----------|-----------|-----------------|
| TEST 1 | Backend offline (connection refused) | Console warning, no crash |
| TEST 2 | Backend online (200 OK) | Seismic badge displays |
| TEST 3 | API error response (comune not found) | Badge hidden, graceful |
| TEST 4 | HTTP 404 error | Warning logged, UI stable |
| TEST 5 | Network timeout | Error caught, no hang |
| TEST 6 | Security audit | No API keys in logs |

## Troubleshooting

### Error: "chromium not found"
```bash
npx playwright install chromium
```

### Error: "Missing system dependencies"
```bash
sudo npx playwright install-deps
```

### Test Timeout
Increase timeout in test file (line ~48):
```typescript
await page.waitForTimeout(10000); // 10 seconds
```

### File Path Issues
Verify test visura exists:
```bash
ls -lh "/mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco/2_2023-02-10 CELERYA VISURA ORD.pdf"
```

## Contact

For issues or questions, escalate to:
- **L'ARCHITETTO**: System design issues
- **IL CHIRURGO**: UI/UX bugs
- **IL GUARDIANO**: Test failures or coverage gaps
