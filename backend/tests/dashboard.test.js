import assert from 'node:assert';
import test from 'node:test';
import * as dashboardService from '../src/services/dashboardService.js';
import { getStats } from '../src/controllers/dashboardController.js';
import { requireAuth } from '../src/middleware/auth.js';
import { redisClient } from '../src/config/redis.js';
import mongoose from 'mongoose';

test('Dashboard Module Service, Controller & Routing Middleware Tests', async (t) => {
  // Helper to create mock request/response context
  const setupMockContext = (user = null) => {
    const mockReq = {
      user,
      ip: '192.168.1.1',
      originalUrl: '/api/dashboard/stats',
    };
    const mockRes = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };
    return { mockReq, mockRes };
  };

  await t.test('statistics updates: incrementStats should increase metrics', () => {
    const initialStats = { ...dashboardService.getDashboardStats() };
    
    dashboardService.incrementStats('totalRequests');
    dashboardService.incrementStats('allowedRequests');
    dashboardService.incrementStats('blockedRequests');
    dashboardService.incrementStats('authenticatedRequests');
    dashboardService.incrementStats('anonymousRequests');

    const updatedStats = dashboardService.getDashboardStats();

    assert.strictEqual(updatedStats.totalRequests, initialStats.totalRequests + 1);
    assert.strictEqual(updatedStats.allowedRequests, initialStats.allowedRequests + 1);
    assert.strictEqual(updatedStats.blockedRequests, initialStats.blockedRequests + 1);
    assert.strictEqual(updatedStats.authenticatedRequests, initialStats.authenticatedRequests + 1);
    assert.strictEqual(updatedStats.anonymousRequests, initialStats.anonymousRequests + 1);
  });

  await t.test('unauthorized access: requireAuth middleware should return 401 for unauthenticated user', () => {
    const { mockReq, mockRes } = setupMockContext(null);
    let nextCalled = false;

    requireAuth(mockReq, mockRes, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(mockRes.statusCode, 401);
    assert.strictEqual(mockRes.body.status, 'error');
    assert.strictEqual(mockRes.body.statusCode, 401);
    assert.ok(mockRes.body.message.includes('Authentication is required'));
  });

  await t.test('authenticated access: requireAuth middleware should call next() for authenticated user', () => {
    const { mockReq, mockRes } = setupMockContext({ id: 'user_123' });
    let nextCalled = false;

    requireAuth(mockReq, mockRes, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
  });

  await t.test('response structure: getStats controller should return stats with correct properties and values', () => {
    const { mockReq, mockRes } = setupMockContext({ id: 'user_123' });

    getStats(mockReq, mockRes, (err) => {
      assert.fail('Should not call error handler: ' + err.message);
    });

    assert.strictEqual(mockRes.statusCode, 200);
    const body = mockRes.body;

    // Verify response structure keys and value types
    assert.ok(body);
    assert.strictEqual(body.server, 'UP');
    assert.ok(body.redis === 'UP' || body.redis === 'DOWN');
    assert.ok(body.mongodb === 'UP' || body.mongodb === 'DOWN');
    assert.strictEqual(body.algorithm, 'Sliding Window'); // default
    assert.strictEqual(typeof body.totalRequests, 'number');
    assert.strictEqual(typeof body.allowedRequests, 'number');
    assert.strictEqual(typeof body.blockedRequests, 'number');
    assert.strictEqual(typeof body.authenticatedRequests, 'number');
    assert.strictEqual(typeof body.anonymousRequests, 'number');
    assert.strictEqual(typeof body.uptime, 'number');
    assert.ok(body.uptime >= 0);
  });
});
