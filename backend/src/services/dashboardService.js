import { redisClient } from '../config/redis.js';
import mongoose from 'mongoose';

// In-memory statistics storage
const stats = {
  totalRequests: 0,
  allowedRequests: 0,
  blockedRequests: 0,
  authenticatedRequests: 0,
  anonymousRequests: 0,
};

/**
 * Increment a specific metric counter.
 * 
 * @param {string} metric Name of the metric to increment
 */
export const incrementStats = (metric) => {
  if (stats[metric] !== undefined) {
    stats[metric]++;
  }
};

/**
 * Compile health status report for services, active algorithm, and server uptime.
 */
export const getDashboardStats = () => {
  const redisConnected = redisClient.isOpen && redisClient.isReady;
  const mongoConnected = mongoose.connection && mongoose.connection.readyState === 1;

  // Use environment variable to determine algorithm, defaulting to "Sliding Window"
  let algorithm = process.env.RATE_LIMIT_ALGORITHM || 'Sliding Window';

  // Format the algorithm name consistently
  if (algorithm === 'sliding-window' || algorithm === 'Sliding Window Log') {
    algorithm = 'Sliding Window';
  } else if (algorithm === 'fixed-window' || algorithm === 'Fixed Window Counter') {
    algorithm = 'Fixed Window';
  }

  return {
    server: 'UP',
    redis: redisConnected ? 'UP' : 'DOWN',
    mongodb: mongoConnected ? 'UP' : 'DOWN',
    algorithm,
    ...stats,
    uptime: process.uptime(),
  };
};
