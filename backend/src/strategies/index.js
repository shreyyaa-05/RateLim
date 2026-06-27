import { fixedWindowStrategy } from './fixedWindowStrategy.js';

const strategies = {
  'fixed-window': fixedWindowStrategy,
};

/**
 * Retrieve rate-limiting strategy function by name.
 * 
 * @param {string} name Strategy name
 * @returns {Function} Strategy implementation
 */
export const getStrategy = (name) => {
  const strategy = strategies[name];
  if (!strategy) {
    throw new Error(`Rate limiting strategy "${name}" is not supported.`);
  }
  return strategy;
};
