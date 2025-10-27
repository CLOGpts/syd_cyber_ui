#!/usr/bin/env node

/**
 * SYD CYBER Load Test
 *
 * Simula 50 utenti che usano l'app simultaneamente:
 * - ATECO lookup
 * - Risk events query
 * - Event tracking
 */

const BASE_URL = 'https://web-production-3373.up.railway.app';

// Test configuration
const NUM_USERS = 50;
const TEST_DURATION_SEC = 60;

// Statistics
const stats = {
  requests: 0,
  successes: 0,
  failures: 0,
  responseTimes: [],
  errors: {},
};

// Generate random ATECO code
function randomATECO() {
  const codes = ['62.01', '62.02', '62.09', '63.11', '64.99.1', '70.22', '85.42'];
  return codes[Math.floor(Math.random() * codes.length)];
}

// Generate random category
function randomCategory() {
  const categories = ['operational', 'cyber', 'environmental', 'financial', 'legal', 'reputational', 'strategic'];
  return categories[Math.floor(Math.random() * categories.length)];
}

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Simulate single user action
async function simulateUser(userId) {
  const userActions = [
    // Action 1: ATECO lookup
    async () => {
      const start = Date.now();
      try {
        const atecoCode = randomATECO();
        const response = await fetch(`${BASE_URL}/db/lookup?code=${atecoCode}&prefer=2025`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        stats.requests++;
        stats.responseTimes.push(Date.now() - start);

        if (response.ok) {
          stats.successes++;
          await response.json();
        } else {
          stats.failures++;
          const error = `HTTP ${response.status}`;
          stats.errors[error] = (stats.errors[error] || 0) + 1;
        }
      } catch (error) {
        stats.requests++;
        stats.failures++;
        stats.responseTimes.push(Date.now() - start);
        const errorMsg = error.message || 'Unknown error';
        stats.errors[errorMsg] = (stats.errors[errorMsg] || 0) + 1;
      }
    },

    // Action 2: Risk events query
    async () => {
      const start = Date.now();
      try {
        const category = randomCategory();
        const response = await fetch(`${BASE_URL}/db/events/${category}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        stats.requests++;
        stats.responseTimes.push(Date.now() - start);

        if (response.ok) {
          stats.successes++;
          await response.json();
        } else {
          stats.failures++;
          const error = `HTTP ${response.status}`;
          stats.errors[error] = (stats.errors[error] || 0) + 1;
        }
      } catch (error) {
        stats.requests++;
        stats.failures++;
        stats.responseTimes.push(Date.now() - start);
        const errorMsg = error.message || 'Unknown error';
        stats.errors[errorMsg] = (stats.errors[errorMsg] || 0) + 1;
      }
    },

    // Action 3: Event tracking
    async () => {
      const start = Date.now();
      try {
        const response = await fetch(`${BASE_URL}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: `load_test_user_${userId}`,
            session_id: generateUUID(),
            event_type: 'ateco_uploaded',
            event_data: {
              code: randomATECO(),
              source: 'load_test',
              timestamp: new Date().toISOString(),
            },
          }),
        });

        stats.requests++;
        stats.responseTimes.push(Date.now() - start);

        if (response.ok) {
          stats.successes++;
          await response.json();
        } else {
          stats.failures++;
          const error = `HTTP ${response.status}`;
          stats.errors[error] = (stats.errors[error] || 0) + 1;
        }
      } catch (error) {
        stats.requests++;
        stats.failures++;
        stats.responseTimes.push(Date.now() - start);
        const errorMsg = error.message || 'Unknown error';
        stats.errors[errorMsg] = (stats.errors[errorMsg] || 0) + 1;
      }
    },
  ];

  // Each user does random actions for TEST_DURATION_SEC
  const endTime = Date.now() + (TEST_DURATION_SEC * 1000);

  while (Date.now() < endTime) {
    // Pick random action
    const action = userActions[Math.floor(Math.random() * userActions.length)];
    await action();

    // Wait 1-3 seconds between actions (realistic user behavior)
    const waitTime = 1000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

// Calculate statistics
function calculateStats() {
  if (stats.responseTimes.length === 0) return;

  const sorted = stats.responseTimes.sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return { avg, p50, p95, p99, min, max };
}

// Run load test
async function runLoadTest() {
  console.log('🚀 SYD CYBER Load Test Starting...');
  console.log(`👥 Simulating ${NUM_USERS} concurrent users`);
  console.log(`⏱️  Duration: ${TEST_DURATION_SEC} seconds`);
  console.log(`🎯 Target: ${BASE_URL}`);
  console.log('');
  console.log('Running test...');

  const startTime = Date.now();

  // Launch all users in parallel
  const userPromises = [];
  for (let i = 0; i < NUM_USERS; i++) {
    userPromises.push(simulateUser(i));
  }

  // Wait for all users to complete
  await Promise.all(userPromises);

  const duration = (Date.now() - startTime) / 1000;

  // Calculate and display results
  console.log('\n' + '='.repeat(60));
  console.log('📊 LOAD TEST RESULTS');
  console.log('='.repeat(60));
  console.log('');
  console.log(`⏱️  Total Duration: ${duration.toFixed(2)}s`);
  console.log(`👥 Concurrent Users: ${NUM_USERS}`);
  console.log('');
  console.log(`📝 Total Requests: ${stats.requests}`);
  console.log(`✅ Successful: ${stats.successes} (${((stats.successes / stats.requests) * 100).toFixed(2)}%)`);
  console.log(`❌ Failed: ${stats.failures} (${((stats.failures / stats.requests) * 100).toFixed(2)}%)`);
  console.log(`📈 Requests/sec: ${(stats.requests / duration).toFixed(2)}`);
  console.log('');

  const responseStats = calculateStats();
  if (responseStats) {
    console.log('⚡ Response Times (ms):');
    console.log(`   Min: ${responseStats.min}ms`);
    console.log(`   Avg: ${responseStats.avg.toFixed(2)}ms`);
    console.log(`   P50: ${responseStats.p50}ms`);
    console.log(`   P95: ${responseStats.p95}ms`);
    console.log(`   P99: ${responseStats.p99}ms`);
    console.log(`   Max: ${responseStats.max}ms`);
  }

  if (Object.keys(stats.errors).length > 0) {
    console.log('');
    console.log('❌ Errors:');
    for (const [error, count] of Object.entries(stats.errors)) {
      console.log(`   ${error}: ${count}`);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('');

  // Verdict
  const successRate = (stats.successes / stats.requests) * 100;
  const avgResponseTime = responseStats?.avg || 0;

  if (successRate >= 99 && avgResponseTime < 500) {
    console.log('✅ VERDICT: EXCELLENT - App handles load very well!');
  } else if (successRate >= 95 && avgResponseTime < 1000) {
    console.log('✅ VERDICT: GOOD - App handles load well');
  } else if (successRate >= 90 && avgResponseTime < 2000) {
    console.log('⚠️  VERDICT: ACCEPTABLE - Some performance degradation');
  } else if (successRate >= 80) {
    console.log('⚠️  VERDICT: POOR - Significant performance issues');
  } else {
    console.log('❌ VERDICT: CRITICAL - App cannot handle this load');
  }

  console.log('');
}

// Run the test
runLoadTest().catch(error => {
  console.error('❌ Load test failed:', error);
  process.exit(1);
});
