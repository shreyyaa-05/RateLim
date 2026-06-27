import express from 'express';
import morgan from 'morgan';
import healthRoutes from './routes/healthRoutes.js';
import testRoutes from './routes/testRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { authenticate } from './middleware/auth.js';
import { statsTracker } from './middleware/statsTracker.js';
import { fixedWindowRateLimiter } from './middleware/rateLimiter.js';
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

// Apply global authentication parser (extracts user info if token is provided)
app.use(authenticate);

// Track stats globally for all requests
app.use(statsTracker);

// Register routes
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/test', testRoutes);
app.use('/login', loginRoutes);

app.get('/sliding-test', fixedWindowRateLimiter({ strategy: 'sliding-window', maxRequests: 5, windowInSeconds: 60 }), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Sliding window request successful.',
    timestamp: new Date().toISOString(),
  });
});

// Fallback for 404 route not found
app.use((req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized error-handling middleware (must be registered last)
app.use(errorHandler);

export default app;
