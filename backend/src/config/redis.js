import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis client initiating connection...');
});

redisClient.on('ready', () => {
  console.log('Redis client successfully connected and ready.');
});

redisClient.on('end', () => {
  console.log('Redis client connection closed.');
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to establish connection with Redis:', error.message);
  }
};

export { redisClient, connectRedis };
