import { fixedWindowStrategy } from './fixedWindowStrategy.js';
import { slidingWindowStrategy } from './slidingWindowStrategy.js';
import { slidingWindowCounterStrategy } from './slidingWindowCounterStrategy.js';
import { tokenBucketStrategy } from './tokenBucketStrategy.js';
import { leakyBucketStrategy } from './leakyBucketStrategy.js';

const strategies = {
  'fixed-window': fixedWindowStrategy,
  'sliding-window': slidingWindowStrategy,
  'sliding-window-counter': slidingWindowCounterStrategy,
  'token-bucket': tokenBucketStrategy,
  'leaky-bucket': leakyBucketStrategy,
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
