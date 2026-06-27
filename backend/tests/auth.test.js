import assert from 'node:assert';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import { authenticate } from '../src/middleware/auth.js';
import { fixedWindowRateLimiter } from '../src/middleware/rateLimiter.js';
import { redisClient } from '../src/config/redis.js';

// Setup environment secret for the tests
process.env.JWT_SECRET = 'test_secret';

test('Authentication Middleware & User-Based Rate Limiting Tests', async (t) => {
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

  const setupMockContext = (authHeader = null, ip = '192.168.1.1') => {
    const responseHeaders = {};
    const mockReq = {
      headers: authHeader ? { authorization: authHeader } : {},
      ip,
      user: undefined,
    };
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
    return { mockReq, mockRes, responseHeaders };
  };

  await t.test('authenticate middleware: should parse valid token and populate req.user', async () => {
    const userId = 'user123';
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
    const { mockReq, mockRes } = setupMockContext(`Bearer ${token}`);
    
    let nextCalled = false;
    authenticate(mockReq, mockRes, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.ok(mockReq.user);
    assert.strictEqual(mockReq.user.id, userId);
  });

  await t.test('authenticate middleware: should block request and return 401 for invalid token', async () => {
    const { mockReq, mockRes } = setupMockContext('Bearer invalid_token_value');
    
    let nextCalled = false;
    authenticate(mockReq, mockRes, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(mockRes.statusCode, 401);
    assert.strictEqual(mockRes.body.status, 'error');
    assert.strictEqual(mockRes.body.message, 'Invalid or expired authentication token.');
  });

  await t.test('authenticate middleware: should pass request without user object when authorization header is missing', async () => {
    const { mockReq, mockRes } = setupMockContext(null);
    
    let nextCalled = false;
    authenticate(mockReq, mockRes, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(mockReq.user, undefined);
  });

  await t.test('rate limiter: should apply rate limit per User ID for authenticated users', async () => {
    const userId = 'user_999';
    const limiter = fixedWindowRateLimiter({ maxRequests: 2, windowInSeconds: 10 });
    
    // Simulate authenticated request
    const { mockReq, mockRes, responseHeaders } = setupMockContext(null, '192.168.1.5');
    mockReq.user = { id: userId };

    let nextCalled = false;
    await limiter(mockReq, mockRes, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(responseHeaders['X-RateLimit-Limit'], 2);
    assert.strictEqual(responseHeaders['X-RateLimit-Remaining'], 1);

    // Verify key created in Redis contains the User ID
    const expectedKey = `rate_limit:fixed:${userId}`;
    assert.strictEqual(memoryDb[expectedKey], 1);
  });

  await t.test('rate limiter: should fall back to IP-based rate limiting for unauthenticated users', async () => {
    const ip = '192.168.10.10';
    const limiter = fixedWindowRateLimiter({ maxRequests: 2, windowInSeconds: 10 });
    
    const { mockReq, mockRes, responseHeaders } = setupMockContext(null, ip);
    // mockReq.user is undefined (unauthenticated)

    let nextCalled = false;
    await limiter(mockReq, mockRes, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(responseHeaders['X-RateLimit-Limit'], 2);
    assert.strictEqual(responseHeaders['X-RateLimit-Remaining'], 1);

    // Verify key created in Redis contains the IP address
    const expectedKey = `rate_limit:fixed:${ip}`;
    assert.strictEqual(memoryDb[expectedKey], 1);
  });

  // Restore client configurations
  Object.defineProperty(redisClient, 'isOpen', { get: () => originalIsOpen, configurable: true });
  Object.defineProperty(redisClient, 'isReady', { get: () => originalIsReady, configurable: true });
  redisClient.incr = originalIncr;
  redisClient.ttl = originalTtl;
  redisClient.expire = originalExpire;
});
