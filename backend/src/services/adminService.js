import { redisClient } from '../config/redis.js';
import mongoose from 'mongoose';

import { incrementStats as dashboardIncrement, getDashboardStats } from './dashboardService.js';

export const incrementStats = dashboardIncrement;

/**
 * Retrieve current collected statistics.
 */
export const getAdminStats = () => {
  const allStats = getDashboardStats();
  return {
    totalRequests: allStats.totalRequests,
    blockedRequests: allStats.blockedRequests,
    allowedRequests: allStats.allowedRequests,
    authenticatedRequests: allStats.authenticatedRequests,
    anonymousRequests: allStats.anonymousRequests,
  };
};

/**
 * Compile health status report for services and server uptime.
 */
export const getAdminHealth = () => {
  const redisConnected = redisClient.isOpen && redisClient.isReady;
  const mongoConnected = mongoose.connection && mongoose.connection.readyState === 1;

  return {
    redisStatus: redisConnected ? 'UP' : 'DOWN',
    mongoStatus: mongoConnected ? 'UP' : 'DOWN',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };
};

/**
 * Retrieve configurations of rate limiter limits and strategy features.
 */
export const getAdminConfig = () => {
  return {
    supportedAlgorithms: ['Fixed Window Counter', 'Sliding Window Log', 'Sliding Window Counter', 'Token Bucket'],
    defaultLimits: {
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
      windowInSeconds: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60,
    },
    availableStrategies: ['fixed-window', 'sliding-window', 'sliding-window-counter', 'token-bucket'],
  };
};
