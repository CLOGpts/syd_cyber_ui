import { test, expect } from '@playwright/test';

/**
 * IL GUARDIANO - Seismic Zone Integration Test Suite
 * 
 * SCOPE: Verify graceful degradation when backend endpoint offline
 * PRIORITY: Security (no crashes) + Robustness (UI consistency)
 */

test.describe('Seismic Zone Integration', () => {
  const BASE_URL = 'http://localhost:5175';
  const TEST_VISURA_PATH = '/mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco/2_2023-02-10 CELERYA VISURA ORD.pdf';

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  /**
   * TEST 1: Graceful Degradation - Backend Offline
   * 
   * VALIDATION:
   * - Console warning logged ✅
   * - UI does NOT crash ✅
   * - Seismic badge NOT displayed ✅
   * - Other visura data displayed normally ✅
   */
  test('should handle seismic endpoint offline gracefully', async ({ page }) => {
    // PATROL: Monitor console output
    const warnings: string[] = [];
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // DETECT: Block seismic endpoint to simulate offline backend
    await page.route('**/seismic-zone/**', route => {
      route.abort('failed'); // Simulate connection refused
    });

    // ACTION: Upload Visura PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_VISURA_PATH);

    // Wait for extraction to complete
    await page.waitForTimeout(5000); // Adjust based on actual extraction time

    // ELIMINATE: Verify no console errors (only warnings allowed)
    expect(errors.length).toBe(0);

    // FORTIFY: Verify console warning logged
    const seismicWarningFound = warnings.some(w => 
      w.includes('Seismic') || 
      w.includes('seismic') ||
      w.includes('Error fetching seismic zone')
    );
    expect(seismicWarningFound).toBeTruthy();

    // ISOLATE: Verify UI structure intact
    const visuraCard = page.locator('.visura-output-card, [class*="visura"]').first();
    await expect(visuraCard).toBeVisible({ timeout: 10000 });

    // DETECT: Verify seismic badge NOT present
    const seismicSection = page.locator('text=ZONA SISMICA');
    await expect(seismicSection).not.toBeVisible();

    // FORTIFY: Verify other sections ARE present
    const atecoSection = page.locator('text=CODICE ATECO');
    await expect(atecoSection).toBeVisible();

    console.log('✅ TEST 1 PASSED: Graceful degradation verified');
    console.log(`   - Warnings logged: ${warnings.length}`);
    console.log(`   - Errors: ${errors.length} (expected 0)`);
  });

  /**
   * TEST 2: Success Case - Backend Available
   * 
   * VALIDATION:
   * - Seismic data fetched ✅
   * - Badge displayed with correct zone ✅
   * - Risk level color correct ✅
   */
  test('should display seismic zone when backend available', async ({ page }) => {
    // DETECT: Mock backend response with valid seismic data
    await page.route('**/seismic-zone/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          comune: 'TORINO',
          provincia: 'TO',
          zona_sismica: 3,
          accelerazione_ag: 0.15,
          risk_level: 'Media',
          description: 'Zona 3 - Sismicità bassa',
          normativa: 'OPCM 3519/2006',
          confidence: 1.0,
          source: 'official_data'
        })
      });
    });

    // ACTION: Upload Visura
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_VISURA_PATH);

    // Wait for extraction
    await page.waitForTimeout(5000);

    // ELIMINATE: Verify seismic section IS visible
    const seismicSection = page.locator('text=ZONA SISMICA');
    await expect(seismicSection).toBeVisible({ timeout: 10000 });

    // FORTIFY: Verify correct zone displayed
    const zoneText = page.locator('text=/Zona 3/');
    await expect(zoneText).toBeVisible();

    // ISOLATE: Verify risk level
    const riskLevel = page.locator('text=Media');
    await expect(riskLevel).toBeVisible();

    // DETECT: Verify normativa tag
    const normativa = page.locator('text=OPCM 3519/2006');
    await expect(normativa).toBeVisible();

    console.log('✅ TEST 2 PASSED: Seismic data displayed correctly');
  });

  /**
   * TEST 3: Edge Case - Comune Not Found (API Error)
   * 
   * VALIDATION:
   * - API returns error object ✅
   * - UI handles gracefully ✅
   * - Badge NOT displayed ✅
   */
  test('should handle comune not found error', async ({ page }) => {
    // DETECT: Mock 200 response with error payload
    await page.route('**/seismic-zone/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'comune_not_found',
          message: 'Comune XYZ non trovato nel database'
        })
      });
    });

    // ACTION: Upload Visura
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_VISURA_PATH);

    await page.waitForTimeout(5000);

    // ELIMINATE: Verify badge NOT present
    const seismicSection = page.locator('text=ZONA SISMICA');
    await expect(seismicSection).not.toBeVisible();

    // FORTIFY: Verify no UI crash
    const visuraCard = page.locator('.visura-output-card, [class*="visura"]').first();
    await expect(visuraCard).toBeVisible();

    console.log('✅ TEST 3 PASSED: Comune not found handled gracefully');
  });

  /**
   * TEST 4: Edge Case - 404 Response
   * 
   * VALIDATION:
   * - HTTP 404 handled ✅
   * - Console warning logged ✅
   * - UI continues normally ✅
   */
  test('should handle 404 HTTP error', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    // DETECT: Mock 404 response
    await page.route('**/seismic-zone/**', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not Found' })
      });
    });

    // ACTION: Upload Visura
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_VISURA_PATH);

    await page.waitForTimeout(5000);

    // ELIMINATE: Verify warning logged
    expect(warnings.some(w => w.includes('not found'))).toBeTruthy();

    // FORTIFY: Verify badge NOT present
    const seismicSection = page.locator('text=ZONA SISMICA');
    await expect(seismicSection).not.toBeVisible();

    console.log('✅ TEST 4 PASSED: 404 error handled correctly');
  });

  /**
   * TEST 5: Edge Case - Network Timeout
   * 
   * VALIDATION:
   * - Timeout caught in try/catch ✅
   * - No application hang ✅
   * - Error logged appropriately ✅
   */
  test('should handle network timeout', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // DETECT: Simulate slow network (timeout)
    await page.route('**/seismic-zone/**', route => {
      // Never respond - will trigger timeout
      setTimeout(() => route.abort('timedout'), 30000);
    });

    // ACTION: Upload Visura
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_VISURA_PATH);

    await page.waitForTimeout(7000); // Wait longer than fetch timeout

    // ELIMINATE: Verify error logged (timeout caught)
    const timeoutErrorFound = errors.some(e => 
      e.includes('fetch') || 
      e.includes('timeout') ||
      e.includes('Error fetching seismic zone')
    );
    expect(timeoutErrorFound).toBeTruthy();

    // FORTIFY: Verify app still responsive
    const visuraCard = page.locator('.visura-output-card, [class*="visura"]').first();
    await expect(visuraCard).toBeVisible({ timeout: 15000 });

    console.log('✅ TEST 5 PASSED: Network timeout handled without hang');
  });

  /**
   * TEST 6: Security Check - No Sensitive Data in Logs
   * 
   * VALIDATION:
   * - No API keys logged ✅
   * - No tokens in console ✅
   * - Only public data (comune/provincia) visible ✅
   */
  test('should not log sensitive data in console', async ({ page }) => {
    const allLogs: string[] = [];
    
    page.on('console', msg => {
      allLogs.push(msg.text());
    });

    // Mock backend
    await page.route('**/seismic-zone/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          comune: 'TORINO',
          provincia: 'TO',
          zona_sismica: 3,
          risk_level: 'Media'
        })
      });
    });

    // Upload Visura
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_VISURA_PATH);

    await page.waitForTimeout(5000);

    // SECURITY CHECK: No sensitive patterns in logs
    const sensitivePatterns = [
      /api[_-]?key/i,
      /token/i,
      /secret/i,
      /password/i,
      /auth/i
    ];

    const sensitiveLogs = allLogs.filter(log => 
      sensitivePatterns.some(pattern => pattern.test(log))
    );

    expect(sensitiveLogs.length).toBe(0);

    console.log('✅ TEST 6 PASSED: No sensitive data logged');
    console.log(`   - Total logs analyzed: ${allLogs.length}`);
  });
});

/**
 * TEST SUMMARY METRICS
 * 
 * Coverage:
 * - Backend offline: TEST 1, 5
 * - Backend success: TEST 2
 * - API errors: TEST 3, 4
 * - Security: TEST 6
 * 
 * Φ Score Target: < 0.5 (all tests passing)
 * Expected Runtime: ~35s (6 tests × 5-7s each)
 */
