import express from 'express';
import morgan from 'morgan';
import healthRoutes from './routes/healthRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Standard body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging using morgan
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Register health routes
app.use('/health', healthRoutes);

// Fallback for 404 route not found
app.use((req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized error-handling middleware (must be registered last)
app.use(errorHandler);

export default app;
