import assert from 'node:assert';
import test from 'node:test';
import { RateLimitPolicy } from '../src/models/RateLimitPolicy.js';
import * as policyService from '../src/services/policyService.js';
import { getPolicies, updatePolicy } from '../src/controllers/policyController.js';
import { fixedWindowRateLimiter } from '../src/middleware/rateLimiter.js';
import { redisClient } from '../src/config/redis.js';

test('Rate Limit Policy Service, Controller, and Middleware Tests', async (t) => {
  // Preserve original mongoose model methods
  const originalFind = RateLimitPolicy.find;
  const originalFindByIdAndUpdate = RateLimitPolicy.findByIdAndUpdate;
  const originalCount = RateLimitPolicy.countDocuments;
  const originalCreate = RateLimitPolicy.create;

  // Preserve original Redis connection config
  const originalIsOpen = redisClient.isOpen;
  const originalIsReady = redisClient.isReady;
  const originalIncr = redisClient.incr;
  const originalTtl = redisClient.ttl;
  const originalExpire = redisClient.expire;

  // Local variables to hold mock db data
  let mockDatabase = [
    {
      _id: '6a3fcf69272ffe22891fbc01',
      endpoint: '/test',
      algorithm: 'fixed-window',
      maxRequests: 2,
      windowInSeconds: 10,
      enabled: true,
      description: 'Test Policy',
      updatedAt: new Date(),
    },
    {
      _id: '6a3fcf69272ffe22891fbc02',
      endpoint: '/login',
      algorithm: 'fixed-window',
      maxRequests: 3,
      windowInSeconds: 60,
      enabled: false, // disabled policy
      description: 'Disabled Policy',
      updatedAt: new Date(),
    }
  ];

  // Apply mocks to RateLimitPolicy model
  RateLimitPolicy.find = () => {
    return {
      sort: () => Promise.resolve(mockDatabase)
    };
  };

  RateLimitPolicy.findByIdAndUpdate = async (id, update, options) => {
    const item = mockDatabase.find(d => d._id === id);
    if (!item) return null;
    const updated = { ...item, ...update, updatedAt: new Date() };
    // update in our mock db
    mockDatabase = mockDatabase.map(d => d._id === id ? updated : d);
    return updated;
  };

  RateLimitPolicy.countDocuments = async () => mockDatabase.length;

  RateLimitPolicy.create = async (arr) => {
    arr.forEach(p => {
      mockDatabase.push({ ...p, _id: new Date().getTime().toString() + Math.random(), updatedAt: new Date() });
    });
    return mockDatabase;
  };

  // Mock Redis
  const memoryDb = {};
  const ttlStore = {};
  Object.defineProperty(redisClient, 'isOpen', { get: () => true, configurable: true });
  Object.defineProperty(redisClient, 'isReady', { get: () => true, configurable: true });
  redisClient.incr = async (key) => {
    memoryDb[key] = (memoryDb[key] || 0) + 1;
    return memoryDb[key];
  };
  redisClient.ttl = async (key) => ttlStore[key] !== undefined ? ttlStore[key] : -1;
  redisClient.expire = async (key, duration) => {
    ttlStore[key] = duration;
    return true;
  };

  const setupMockContext = (body = {}, params = {}) => {
    const mockReq = {
      body,
      params,
      baseUrl: '',
      path: '/test',
      ip: '192.168.1.1',
    };
    const mockRes = {
      statusCode: 200,
      headers: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
      setHeader(name, value) {
        this.headers[name] = value;
      }
    };
    return { mockReq, mockRes };
  };

  await t.test('policy loading & fallback: loadPolicies should populate cache and fallback should work', async () => {
    await policyService.loadPolicies();
    
    // Check `/test` configured policy
    const policy = policyService.getPolicyForEndpoint('/test');
    assert.strictEqual(policy.maxRequests, 2);
    assert.strictEqual(policy.algorithm, 'fixed-window');

    // Check fallback for missing policy `/non-existent`
    const fallbackPolicy = policyService.getPolicyForEndpoint('/non-existent');
    assert.strictEqual(fallbackPolicy.maxRequests, parseInt(process.env.RATE_LIMIT_MAX, 10) || 100);
    assert.strictEqual(fallbackPolicy.windowInSeconds, parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60);

    // Check fallback for disabled policy `/login`
    const disabledPolicy = policyService.getPolicyForEndpoint('/login');
    assert.strictEqual(disabledPolicy.maxRequests, parseInt(process.env.RATE_LIMIT_MAX, 10) || 100); // defaults back because it is disabled
  });

  await t.test('cache refresh: initPolicyService should set up cache refresh interval', async () => {
    let loadCalledCount = 0;
    const originalLoadPolicies = policyService.loadPolicies;
    policyService.loadPolicies = async () => {
      loadCalledCount++;
    };

    // Temporarily speed up the refresh interval for tests by replacing setInterval
    const originalSetInterval = global.setInterval;
    let intervalCallback = null;
    global.setInterval = (cb, time) => {
      intervalCallback = cb;
      return 12345;
    };
    const originalClearInterval = global.clearInterval;
    global.clearInterval = (id) => {};

    await policyService.initPolicyService();
    assert.strictEqual(loadCalledCount, 1); // loaded initially
    assert.ok(intervalCallback);

    // Manually trigger interval callback
    await intervalCallback();
    assert.strictEqual(loadCalledCount, 2); // loaded second time

    // Restore timers
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
    policyService.loadPolicies = originalLoadPolicies;
    policyService.stopPolicyService();
  });

  await t.test('update endpoint: updatePolicy controller should validate input and update policies', async () => {
    // 1. Success case
    const { mockReq: req1, mockRes: res1 } = setupMockContext(
      { algorithm: 'sliding-window', maxRequests: 10, windowInSeconds: 30, enabled: true },
      { id: '6a3fcf69272ffe22891fbc01' }
    );
    await updatePolicy(req1, res1, () => {});
    assert.strictEqual(res1.statusCode, 200);
    assert.strictEqual(res1.body.maxRequests, 10);
    assert.strictEqual(res1.body.algorithm, 'sliding-window');

    // Verify cache updated instantly
    await policyService.loadPolicies();
    const updated = policyService.getPolicyForEndpoint('/test');
    assert.strictEqual(updated.maxRequests, 10);
    assert.strictEqual(updated.algorithm, 'sliding-window');

    // 2. Validation error case: invalid fields
    const { mockReq: req2, mockRes: res2 } = setupMockContext(
      { algorithm: 'invalid-algo', maxRequests: -5, windowInSeconds: 0, enabled: 'not-a-bool' },
      { id: '6a3fcf69272ffe22891fbc01' }
    );
    await updatePolicy(req2, res2, () => {});
    assert.strictEqual(res2.statusCode, 400);
    assert.strictEqual(res2.body.status, 'error');
    assert.ok(res2.body.errors.length > 0);
  });

  await t.test('middleware integration: fixedWindowRateLimiter should apply limits dynamically from cache', async () => {
    // Configure `/test` policy to only allow 1 request per 10 seconds
    const policyId = '6a3fcf69272ffe22891fbc01';
    mockDatabase = [
      {
        _id: policyId,
        endpoint: '/test',
        algorithm: 'fixed-window',
        maxRequests: 1,
        windowInSeconds: 10,
        enabled: true,
        description: 'Test Policy',
        updatedAt: new Date(),
      }
    ];
    await policyService.loadPolicies();

    const middleware = fixedWindowRateLimiter();

    // First request should pass
    const { mockReq: req1, mockRes: res1 } = setupMockContext();
    req1.ip = '10.0.0.99';
    let next1 = false;
    await middleware(req1, res1, () => { next1 = true; });
    assert.strictEqual(next1, true);

    // Second request should be blocked
    const { mockReq: req2, mockRes: res2 } = setupMockContext();
    req2.ip = '10.0.0.99';
    let next2 = false;
    await middleware(req2, res2, () => { next2 = true; });
    assert.strictEqual(next2, false);
    assert.strictEqual(res2.statusCode, 429);
  });

  // Restore mongoose model methods
  RateLimitPolicy.find = originalFind;
  RateLimitPolicy.findByIdAndUpdate = originalFindByIdAndUpdate;
  RateLimitPolicy.countDocuments = originalCount;
  RateLimitPolicy.create = originalCreate;

  // Restore Redis connection
  Object.defineProperty(redisClient, 'isOpen', { get: () => originalIsOpen, configurable: true });
  Object.defineProperty(redisClient, 'isReady', { get: () => originalIsReady, configurable: true });
  redisClient.incr = originalIncr;
  redisClient.ttl = originalTtl;
  redisClient.expire = originalExpire;
  policyService.stopPolicyService();
});
