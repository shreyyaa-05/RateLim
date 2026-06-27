import jwt from 'jsonwebtoken';

/**
 * Authentication middleware that verifies JWTs.
 * If a token is provided in the Authorization header:
 * - Verifies the token.
 * - Stores user information in req.user.
 * - Returns 401 if the token is invalid.
 * If no token is provided, request continues as unauthenticated.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid or expired authentication token.',
      });
    }
  }

  next();
};

/**
 * Guard middleware that blocks request if req.user is not populated.
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Unauthorized access. Authentication is required.',
    });
  }
  next();
};
