import assert from 'node:assert';
import test from 'node:test';
import * as adminService from '../src/services/adminService.js';
import { getHealth, getStats, getConfig } from '../src/controllers/adminController.js';
import { statsTracker } from '../src/middleware/statsTracker.js';

test('Admin Services, Controllers & Stats Tracker Middleware Tests', async (t) => {
  // Helper to create mock request/response context
  const setupMockContext = (user = null) => {
    const responseHeaders = {};
    const callbacks = [];
    const mockReq = {
      user,
      ip: '192.168.1.1',
      originalUrl: '/test',
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
      },
      on(event, callback) {
        if (event === 'finish') {
          callbacks.push(callback);
        }
      },
      // Test utility: manually trigger finish listeners
      emitFinish() {
        callbacks.forEach((cb) => cb());
      },
    };
    return { mockReq, mockRes, responseHeaders };
  };

  await t.test('statsTracker middleware: should correctly track allowed anonymous requests', () => {
    const { mockReq, mockRes } = setupMockContext();

    let nextCalled = false;
    statsTracker(mockReq, mockRes, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true);

    // Simulate response ending with 200 OK
    mockRes.statusCode = 200;
    mockRes.emitFinish();

    const stats = adminService.getAdminStats();
    assert.ok(stats.totalRequests > 0);
    assert.ok(stats.allowedRequests > 0);
    assert.ok(stats.anonymousRequests > 0);
  });

  await t.test('statsTracker middleware: should track blocked and authenticated requests', () => {
    const { mockReq, mockRes } = setupMockContext({ id: 'user123' });

    statsTracker(mockReq, mockRes, () => {});

    // Simulate 429 response ending
    mockRes.statusCode = 429;
    mockRes.emitFinish();

    const stats = adminService.getAdminStats();
    assert.ok(stats.blockedRequests > 0);
    assert.ok(stats.authenticatedRequests > 0);
  });

  await t.test('getHealth controller: should return environment details and uptime status', () => {
    const { mockReq, mockRes } = setupMockContext();
    getHealth(mockReq, mockRes, () => {});

    assert.strictEqual(mockRes.statusCode, 200);
    assert.strictEqual(mockRes.body.status, 'success');
    assert.ok(mockRes.body.data.uptime > 0);
    assert.strictEqual(typeof mockRes.body.data.redisStatus, 'string');
    assert.strictEqual(typeof mockRes.body.data.mongoStatus, 'string');
  });

  await t.test('getStats controller: should return current application stats', () => {
    const { mockReq, mockRes } = setupMockContext();
    getStats(mockReq, mockRes, () => {});

    assert.strictEqual(mockRes.statusCode, 200);
    assert.strictEqual(mockRes.body.status, 'success');
    assert.ok(mockRes.body.data.totalRequests > 0);
  });

  await t.test('getConfig controller: should return list of active strategies and supported algorithms', () => {
    const { mockReq, mockRes } = setupMockContext();
    getConfig(mockReq, mockRes, () => {});

    assert.strictEqual(mockRes.statusCode, 200);
    assert.strictEqual(mockRes.body.status, 'success');
    assert.deepStrictEqual(mockRes.body.data.availableStrategies, ['fixed-window', 'sliding-window']);
  });
});
