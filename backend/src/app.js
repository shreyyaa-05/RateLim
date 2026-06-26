import express from 'express';
import morgan from 'morgan';
import healthRoutes from './routes/healthRoutes.js';
import testRoutes from './routes/testRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Trust reverse proxies to fetch correct client IP
app.set('trust proxy', true);

// Standard body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging using morgan
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Register routes
app.use('/health', healthRoutes);
app.use('/test', testRoutes);

// Fallback for 404 route not found
app.use((req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized error-handling middleware (must be registered last)
app.use(errorHandler);

export default app;
