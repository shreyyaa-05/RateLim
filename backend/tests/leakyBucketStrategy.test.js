import assert from 'node:assert';
import test from 'node:test';
import { redisClient } from '../src/config/redis.js';
import { leakyBucketStrategy } from '../src/strategies/leakyBucketStrategy.js';

test('Leaky Bucket Strategy Tests', async (t) => {
  // Preserve original Redis connection states & functions
  const originalIsOpen = redisClient.isOpen;
  const originalIsReady = redisClient.isReady;
  const originalHGetAll = redisClient.hGetAll;
  const originalHSet = redisClient.hSet;
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

  redisClient.hGetAll = async (key) => {
    return memoryDb[key] || {};
  };

  redisClient.hSet = async (key, data) => {
    memoryDb[key] = { ...memoryDb[key], ...data };
    return 1;
  };

  redisClient.expire = async (key, duration) => {
    ttlStore[key] = duration;
    return true;
  };

  await t.test('should allow requests within limit and increment water level by 1', async () => {
    memoryDb = {};
    ttlStore = {};
    const ip = '10.0.0.1';
    const options = { maxRequests: 3, windowInSeconds: 10 };

    // Request 1: allowed, remaining capacity = 2
    const res1 = await leakyBucketStrategy(ip, options);
    assert.strictEqual(res1.isAllowed, true);
    assert.strictEqual(res1.limit, 3);
    assert.strictEqual(res1.remaining, 2);

    // Request 2: allowed, remaining capacity = 1
    const res2 = await leakyBucketStrategy(ip, options);
    assert.strictEqual(res2.isAllowed, true);
    assert.strictEqual(res2.remaining, 1);
  });

  await t.test('should leak water dynamically over time', async () => {
    memoryDb = {};
    ttlStore = {};
    const ip = '10.0.0.2';
    const options = { maxRequests: 5, windowInSeconds: 5 }; // leak rate: 1 unit per second

    const now = Date.now();
    
    // Set bucket state manually: 3 units water, last leaked 2 seconds ago
    memoryDb[`rate_limit:leaky_bucket:${ip}`] = {
      waterLevel: '3.0',
      lastLeakTime: (now - 2000).toString()
    };

    // With 1 unit/sec leak rate, 2 seconds elapsed should leak 2 units of water
    // New level before request: 3 - 2 = 1 unit.
    // Request is allowed, adding 1 unit of water -> water level becomes 2.
    // Remaining capacity: 5 - 2 = 3.
    const res = await leakyBucketStrategy(ip, options);
    assert.strictEqual(res.isAllowed, true);
    assert.strictEqual(res.remaining, 3);
  });

  await t.test('should block requests when bucket overflows and calculate correct retryAfter and reset', async () => {
    memoryDb = {};
    ttlStore = {};
    const ip = '10.0.0.3';
    const options = { maxRequests: 2, windowInSeconds: 2 }; // leak rate: 1 unit per second

    // Consume capacity: 2 requests
    await leakyBucketStrategy(ip, options); // level -> 1
    await leakyBucketStrategy(ip, options); // level -> 2

    // Third request should block
    const res = await leakyBucketStrategy(ip, options);
    assert.strictEqual(res.isAllowed, false);
    assert.strictEqual(res.remaining, 0);
    assert.ok(res.retryAfter > 0);
    assert.ok(res.reset > Math.ceil(Date.now() / 1000));
  });

  await t.test('should gracefully fail-open when Redis is disconnected', async () => {
    Object.defineProperty(redisClient, 'isOpen', {
      get: () => false,
      configurable: true
    });

    const ip = '10.0.0.4';
    const options = { maxRequests: 5, windowInSeconds: 10 };

    const res = await leakyBucketStrategy(ip, options);
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
  redisClient.hGetAll = originalHGetAll;
  redisClient.hSet = originalHSet;
  redisClient.expire = originalExpire;
});
