import assert from 'node:assert';
import test from 'node:test';
import { redisClient } from '../src/config/redis.js';
import { fixedWindowStrategy } from '../src/strategies/fixedWindowStrategy.js';

test('Fixed Window Strategy Tests', async (t) => {
  // Preserve original Redis connection states & functions
  const originalIsOpen = redisClient.isOpen;
  const originalIsReady = redisClient.isReady;
  const originalIncr = redisClient.incr;
  const originalTtl = redisClient.ttl;
  const originalExpire = redisClient.expire;

  // Local storage structures mock Redis keyspace & TTLs
  const memoryDb = {};
  const ttlStore = {};

  // Mock active client connection using defineProperty
  Object.defineProperty(redisClient, 'isOpen', {
    get: () => true,
    configurable: true
  });
  Object.defineProperty(redisClient, 'isReady', {
    get: () => true,
    configurable: true
  });

  redisClient.incr = async (key) => {
    memoryDb[key] = (memoryDb[key] || 0) + 1;
    return memoryDb[key];
  };

  redisClient.ttl = async (key) => {
    return ttlStore[key] !== undefined ? ttlStore[key] : -1;
  };

  redisClient.expire = async (key, duration) => {
    ttlStore[key] = duration;
    return true;
  };

  await t.test('should allow requests within limit and track metadata correctly', async () => {
    const ip = '10.0.0.1';
    const options = { maxRequests: 2, windowInSeconds: 10 };

    // First request: should be allowed, remaining 1
    const res1 = await fixedWindowStrategy(ip, options);
    assert.strictEqual(res1.isAllowed, true);
    assert.strictEqual(res1.limit, 2);
    assert.strictEqual(res1.remaining, 1);
    assert.strictEqual(res1.retryAfter, 10);

    // Second request: should be allowed, remaining 0
    const res2 = await fixedWindowStrategy(ip, options);
    assert.strictEqual(res2.isAllowed, true);
    assert.strictEqual(res2.remaining, 0);

    // Third request: should block, remaining 0
    const res3 = await fixedWindowStrategy(ip, options);
    assert.strictEqual(res3.isAllowed, false);
    assert.strictEqual(res3.remaining, 0);
    assert.strictEqual(res3.retryAfter, 10);
  });

  await t.test('should gracefully fail-open when Redis is disconnected', async () => {
    // Override connection state to be closed
    Object.defineProperty(redisClient, 'isOpen', {
      get: () => false,
      configurable: true
    });

    const ip = '10.0.0.2';
    const options = { maxRequests: 5, windowInSeconds: 15 };

    const res = await fixedWindowStrategy(ip, options);
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
  redisClient.incr = originalIncr;
  redisClient.ttl = originalTtl;
  redisClient.expire = originalExpire;
});
