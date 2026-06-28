import assert from 'node:assert';
import test from 'node:test';
import { redisClient } from '../src/config/redis.js';
import { slidingWindowCounterStrategy } from '../src/strategies/slidingWindowCounterStrategy.js';

test('Sliding Window Counter Strategy Tests', async (t) => {
  // Preserve original Redis connection states & functions
  const originalIsOpen = redisClient.isOpen;
  const originalIsReady = redisClient.isReady;
  const originalGet = redisClient.get;
  const originalIncr = redisClient.incr;
  const originalExpire = redisClient.expire;

  // Local storage structures mock Redis keyspace & TTLs
  let memoryDb = {};
  let ttlStore = {};

  // Mock active client connection using defineProperty
  Object.defineProperty(redisClient, 'isOpen', {
    get: () => true,
    configurable: true
  });
  Object.defineProperty(redisClient, 'isReady', {
    get: () => true,
    configurable: true
  });

  redisClient.get = async (key) => {
    return memoryDb[key] !== undefined ? memoryDb[key].toString() : null;
  };

  redisClient.incr = async (key) => {
    memoryDb[key] = (memoryDb[key] || 0) + 1;
    return memoryDb[key];
  };

  redisClient.expire = async (key, duration) => {
    ttlStore[key] = duration;
    return true;
  };

  await t.test('should allow requests within limit and increment current window counter', async () => {
    memoryDb = {};
    ttlStore = {};
    const ip = '10.0.0.1';
    const options = { maxRequests: 2, windowInSeconds: 10 };

    // Request 1: should be allowed, remaining should be 1
    const res1 = await slidingWindowCounterStrategy(ip, options);
    assert.strictEqual(res1.isAllowed, true);
    assert.strictEqual(res1.limit, 2);
    assert.strictEqual(res1.remaining, 1);
    assert.strictEqual(res1.retryAfter, 0);

    // Request 2: should be allowed, remaining should be 0
    const res2 = await slidingWindowCounterStrategy(ip, options);
    assert.strictEqual(res2.isAllowed, true);
    assert.strictEqual(res2.remaining, 0);
    assert.strictEqual(res2.retryAfter, 0);

    // Request 3: should block
    const res3 = await slidingWindowCounterStrategy(ip, options);
    assert.strictEqual(res3.isAllowed, false);
    assert.strictEqual(res3.remaining, 0);
    assert.ok(res3.retryAfter > 0);
  });

  await t.test('should calculate weighted sum correctly using previous window count', async () => {
    memoryDb = {};
    ttlStore = {};
    const ip = '10.0.0.2';
    const windowDuration = 10;
    const options = { maxRequests: 10, windowInSeconds: windowDuration };

    const now = Date.now();
    const windowDurationMs = windowDuration * 1000;
    const currentWindowStart = Math.floor(now / windowDurationMs) * windowDurationMs;
    const previousWindowStart = currentWindowStart - windowDurationMs;

    const previousKey = `rate_limit:sliding_counter:${ip}:${previousWindowStart}`;
    
    // Set previous window request count to 8
    memoryDb[previousKey] = 8;

    // Simulate request at exactly 50% through the current window (weight = 0.5)
    // estimatedCount = currentCount + previousCount * 0.5 = 0 + 8 * 0.5 = 4
    // Request 1: estimatedCount + 1 = 5 <= 10 -> allowed, remaining = 10 - 5 = 5
    const originalDateNow = Date.now;
    Date.now = () => currentWindowStart + 5000; // 50% elapsed

    const res = await slidingWindowCounterStrategy(ip, options);
    assert.strictEqual(res.isAllowed, true);
    assert.strictEqual(res.remaining, 5); // 10 - Math.floor(4 + 1) = 5
    assert.strictEqual(res.retryAfter, 0);

    // Restore Date.now
    Date.now = originalDateNow;
  });

  await t.test('should gracefully fail-open when Redis is disconnected', async () => {
    Object.defineProperty(redisClient, 'isOpen', {
      get: () => false,
      configurable: true
    });

    const ip = '10.0.0.3';
    const options = { maxRequests: 5, windowInSeconds: 15 };

    const res = await slidingWindowCounterStrategy(ip, options);
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
  redisClient.get = originalGet;
  redisClient.incr = originalIncr;
  redisClient.expire = originalExpire;
});
