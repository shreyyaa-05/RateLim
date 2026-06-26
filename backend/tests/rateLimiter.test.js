import assert from 'node:assert';
import test from 'node:test';
import { redisClient } from '../src/config/redis.js';
import { fixedWindowRateLimiter } from '../src/middleware/rateLimiter.js';

// Configure environment parameters for testing context
process.env.RATE_LIMIT_MAX = '3';
process.env.RATE_LIMIT_WINDOW = '10';

test('Fixed Window Rate Limiter Middleware Tests', async (t) => {
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

  // Helper function mock Express Req/Res objects
  const setupMockRequestContext = () => {
    const responseHeaders = {};
    const mockRes = {
      statusCode: 200,
      setHeader(name, value) {
        responseHeaders[name] = value;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      }
    };
    return {
      mockReq: { ip: '192.168.1.1' },
      mockRes,
      responseHeaders
    };
  };

  await t.test('should allow requests below the maximum limit and increment counter correctly', async () => {
    // Request #1
    const { mockReq: req1, mockRes: res1, responseHeaders: h1 } = setupMockRequestContext();
    let next1Called = false;
    await fixedWindowRateLimiter(req1, res1, () => { next1Called = true; });

    assert.strictEqual(next1Called, true);
    assert.strictEqual(h1['X-RateLimit-Limit'], 3);
    assert.strictEqual(h1['X-RateLimit-Remaining'], 2);

    // Request #2
    const { mockReq: req2, mockRes: res2, responseHeaders: h2 } = setupMockRequestContext();
    let next2Called = false;
    await fixedWindowRateLimiter(req2, res2, () => { next2Called = true; });

    assert.strictEqual(next2Called, true);
    assert.strictEqual(h2['X-RateLimit-Remaining'], 1);

    // Request #3
    const { mockReq: req3, mockRes: res3, responseHeaders: h3 } = setupMockRequestContext();
    let next3Called = false;
    await fixedWindowRateLimiter(req3, res3, () => { next3Called = true; });

    assert.strictEqual(next3Called, true);
    assert.strictEqual(h3['X-RateLimit-Remaining'], 0);
  });

  await t.test('should block request and respond with 429 status code and headers when count exceeds limit', async () => {
    // Request #4 (counter is at 3, this will increment to 4, exceeding max rate limit limit of 3)
    const { mockReq: req4, mockRes: res4, responseHeaders: h4 } = setupMockRequestContext();
    let next4Called = false;
    await fixedWindowRateLimiter(req4, res4, () => { next4Called = true; });

    assert.strictEqual(next4Called, false);
    assert.strictEqual(res4.statusCode, 429);
    assert.strictEqual(h4['X-RateLimit-Limit'], 3);
    assert.strictEqual(h4['X-RateLimit-Remaining'], 0);
    assert.strictEqual(h4['Retry-After'], 10);
    assert.strictEqual(res4.body.status, 'error');
    assert.strictEqual(res4.body.message, 'Too Many Requests');
    assert.strictEqual(res4.body.retryAfter, 10);
  });

  // Restore client configuration
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
