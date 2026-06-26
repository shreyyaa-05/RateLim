import dotenv from 'dotenv';
import app from './app.js';
import { connectRedis, redisClient } from './config/redis.js';

// Initialize environment variables config
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Connect to Redis in the background (non-blocking)
  connectRedis();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('[Server] Gracefully terminating HTTP server...');
    
    server.close(async () => {
      console.log('[Server] HTTP server terminated.');
      
      try {
        if (redisClient.isOpen) {
          await redisClient.quit();
          console.log('[Server] Redis connection gracefully closed.');
        }
      } catch (err) {
        console.error('[Server] Error closing Redis client connection:', err.message);
      }
      
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
