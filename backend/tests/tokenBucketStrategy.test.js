import assert from 'node:assert';
import test from 'node:test';
import { redisClient } from '../src/config/redis.js';
import { tokenBucketStrategy } from '../src/strategies/tokenBucketStrategy.js';

test('Token Bucket Strategy Tests', async (t) => {
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

  await t.test('should allow requests when tokens are available and decrement tokens by 1', async () => {
    memoryDb = {};
    ttlStore = {};
    const ip = '10.0.0.1';
    const options = { maxRequests: 5, windowInSeconds: 10 };

    // Request 1: allowed, remaining = 4
    const res1 = await tokenBucketStrategy(ip, options);
    assert.strictEqual(res1.isAllowed, true);
    assert.strictEqual(res1.limit, 5);
    assert.strictEqual(res1.remaining, 4);

    // Request 2: allowed, remaining = 3
    const res2 = await tokenBucketStrategy(ip, options);
    assert.strictEqual(res2.isAllowed, true);
    assert.strictEqual(res2.remaining, 3);
  });

  await t.test('should refill tokens dynamically based on elapsed time', async () => {
    memoryDb = {};
    ttlStore = {};
    const ip = '10.0.0.2';
    const options = { maxRequests: 10, windowInSeconds: 10 }; // 1 token per second refill rate

    const now = Date.now();
    
    // Set bucket state manually: 2 tokens, last refilled 3 seconds ago
    memoryDb[`rate_limit:token_bucket:${ip}`] = {
      tokens: '2.0',
      lastRefillTime: (now - 3000).toString()
    };

    // With 1 token/sec refill rate, 3 seconds elapsed should refill 3 tokens
    // 2 + 3 = 5 tokens. After request: 4 tokens remaining.
    const res = await tokenBucketStrategy(ip, options);
    assert.strictEqual(res.isAllowed, true);
    assert.strictEqual(res.remaining, 4);
  });

  await t.test('should block requests when bucket is empty and calculate retryAfter', async () => {
    memoryDb = {};
    ttlStore = {};
    const ip = '10.0.0.3';
    const options = { maxRequests: 2, windowInSeconds: 2 }; // 1 token per second refill rate

    // Consume all tokens
    await tokenBucketStrategy(ip, options); // tokens -> 1
    await tokenBucketStrategy(ip, options); // tokens -> 0

    // Next request should block
    const res = await tokenBucketStrategy(ip, options);
    assert.strictEqual(res.isAllowed, false);
    assert.strictEqual(res.remaining, 0);
    assert.ok(res.retryAfter > 0);
  });

  await t.test('should gracefully fail-open when Redis is disconnected', async () => {
    Object.defineProperty(redisClient, 'isOpen', {
      get: () => false,
      configurable: true
    });

    const ip = '10.0.0.4';
    const options = { maxRequests: 5, windowInSeconds: 10 };

    const res = await tokenBucketStrategy(ip, options);
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
