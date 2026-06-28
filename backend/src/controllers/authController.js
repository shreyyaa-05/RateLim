import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token containing the user ID.
 * 
 * @param {string} userId User ID from MongoDB
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'supersecretjwtkey', {
    expiresIn: '1d',
  });
};

/**
 * Register a new user.
 */
export const register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      const error = new Error('Username and password are required.');
      error.statusCode = 400;
      return next(error);
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      const error = new Error('User already exists.');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.create({ username, password, role });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login an existing user.
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const error = new Error('Username and password are required.');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      const error = new Error('Invalid credentials.');
      error.statusCode = 401;
      return next(error);
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
