import { redisClient } from '../config/redis.js';

/**
 * Health check controller to verify server uptime and Redis connection status.
 */
export const getHealth = async (req, res, next) => {
  try {
    const isRedisOpen = redisClient.isOpen;
    const isRedisReady = redisClient.isReady;
    
    let redisStatus = 'DOWN';
    if (isRedisOpen && isRedisReady) {
      try {
        await redisClient.ping();
        redisStatus = 'UP';
      } catch (pingErr) {
        console.error('Redis health check ping failed:', pingErr.message);
      }
    }

    const isSystemHealthy = redisStatus === 'UP';
    // If Redis connection is down, return DEGRADED with a 503 status code
    const statusCode = isSystemHealthy ? 200 : 503;

    res.status(statusCode).json({
      status: isSystemHealthy ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        server: 'UP',
        redis: redisStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
