import assert from 'node:assert';
import test from 'node:test';
import { redisClient } from '../src/config/redis.js';
import { slidingWindowStrategy } from '../src/strategies/slidingWindowStrategy.js';

test('Sliding Window Log Strategy Tests', async (t) => {
  // Preserve original Redis connection states & functions
  const originalIsOpen = redisClient.isOpen;
  const originalIsReady = redisClient.isReady;
  const originalMulti = redisClient.multi;
  const originalZRange = redisClient.zRange;

  // Mock connection details
  Object.defineProperty(redisClient, 'isOpen', {
    get: () => true,
    configurable: true
  });
  Object.defineProperty(redisClient, 'isReady', {
    get: () => true,
    configurable: true
  });

  // Simple state storage to mock Redis behaviors
  let memorySet = [];

  // Mock multi chain
  redisClient.multi = () => {
    const chain = {
      zRemRangeByScore(key, min, max) {
        // filter out elements older than max (which is minTime)
        memorySet = memorySet.filter(item => item.score >= max);
        return this;
      },
      zAdd(key, entry) {
        memorySet.push({ score: entry.score, value: entry.value });
        return this;
      },
      zCard(key) {
        return this;
      },
      expire(key, duration) {
        return this;
      },
      async exec() {
        // Return array of results matching expected indexes in exec():
        // results[2] is count from zCard
        return [null, null, memorySet.length, null];
      }
    };
    return chain;
  };

  redisClient.zRange = async (key, start, end) => {
    // Sort memorySet by score and return member values
    const sorted = [...memorySet].sort((a, b) => a.score - b.score);
    return sorted.slice(start, end + 1).map(item => item.value);
  };

  await t.test('should allow requests within limit and track remaining correctly', async () => {
    memorySet = []; // Reset state
    const ip = '10.0.0.1';
    const options = { maxRequests: 3, windowInSeconds: 10 };

    // Request #1
    const res1 = await slidingWindowStrategy(ip, options);
    assert.strictEqual(res1.isAllowed, true);
    assert.strictEqual(res1.limit, 3);
    assert.strictEqual(res1.remaining, 2);

    // Request #2
    const res2 = await slidingWindowStrategy(ip, options);
    assert.strictEqual(res2.isAllowed, true);
    assert.strictEqual(res2.remaining, 1);

    // Request #3
    const res3 = await slidingWindowStrategy(ip, options);
    assert.strictEqual(res3.isAllowed, true);
    assert.strictEqual(res3.remaining, 0);
  });

  await t.test('should block requests exceeding limit and return correct retryAfter', async () => {
    // Keep memorySet state from previous test (now size is 3, limit is 3)
    const ip = '10.0.0.1';
    const options = { maxRequests: 3, windowInSeconds: 10 };

    const res4 = await slidingWindowStrategy(ip, options);
    assert.strictEqual(res4.isAllowed, false);
    assert.strictEqual(res4.remaining, 0);
    assert.ok(res4.retryAfter > 0);
  });

  await t.test('should expire and remove old timestamps correctly from sliding window', async () => {
    const ip = '10.0.0.2';
    const options = { maxRequests: 2, windowInSeconds: 5 };

    const now = Date.now();
    // Pre-populate with one expired request (e.g. 6 seconds ago)
    memorySet = [
      { score: now - 6000, value: `${now - 6000}-old` }
    ];

    // This request should remove the old one, keeping count at 1 (itself)
    const res = await slidingWindowStrategy(ip, options);
    assert.strictEqual(res.isAllowed, true);
    assert.strictEqual(res.remaining, 1); // limit is 2, 1 current request active
  });

  await t.test('should gracefully fail-open if Redis is down', async () => {
    Object.defineProperty(redisClient, 'isOpen', {
      get: () => false,
      configurable: true
    });

    const ip = '10.0.0.3';
    const options = { maxRequests: 5, windowInSeconds: 10 };

    const res = await slidingWindowStrategy(ip, options);
    assert.strictEqual(res.isAllowed, true);
    assert.strictEqual(res.limit, 5);
    assert.strictEqual(res.remaining, 5);
    assert.strictEqual(res.retryAfter, 0);
  });

  // Restore client configurations
  Object.defineProperty(redisClient, 'isOpen', {
    get: () => originalIsOpen,
    configurable: true
  });
  Object.defineProperty(redisClient, 'isReady', {
    get: () => originalIsReady,
    configurable: true
  });
  redisClient.multi = originalMulti;
  redisClient.zRange = originalZRange;
});
