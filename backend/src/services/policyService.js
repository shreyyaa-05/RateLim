import { RateLimitPolicy } from '../models/RateLimitPolicy.js';

let policiesCache = new Map();
let refreshIntervalId = null;

// Default fallback configuration
const DEFAULT_LIMITS = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  windowInSeconds: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60,
  algorithm: 'fixed-window',
  enabled: true,
};

/**
 * Load all policies from MongoDB and update the in-memory cache.
 */
export const loadPolicies = async () => {
  try {
    const policies = await RateLimitPolicy.find({});
    const newCache = new Map();
    
    policies.forEach((policy) => {
      newCache.set(policy.endpoint, {
        id: policy._id.toString(),
        endpoint: policy.endpoint,
        algorithm: policy.algorithm,
        maxRequests: policy.maxRequests,
        windowInSeconds: policy.windowInSeconds,
        enabled: policy.enabled,
        description: policy.description,
        updatedAt: policy.updatedAt,
      });
    });

    policiesCache = newCache;
    console.log(`[Policy Service] Loaded ${policiesCache.size} rate limiting policies into cache.`);
  } catch (error) {
    console.error('[Policy Service] Failed to load policies from database:', error.message);
  }
};

/**
 * Initialize policy service, seed default values if db is empty, and start the auto-refresh.
 */
export const initPolicyService = async () => {
  try {
    // Check if we need to seed defaults
    const count = await RateLimitPolicy.countDocuments({});
    if (count === 0) {
      console.log('[Policy Service] Seeding default rate limiting policies...');
      await RateLimitPolicy.create([
        {
          endpoint: '/test',
          algorithm: 'fixed-window',
          maxRequests: 5,
          windowInSeconds: 10,
          enabled: true,
          description: 'Default policy for /test endpoint',
        },
        {
          endpoint: '/login',
          algorithm: 'fixed-window',
          maxRequests: 3,
          windowInSeconds: 60,
          enabled: true,
          description: 'Default policy for /login endpoint',
        },
        {
          endpoint: '/sliding-test',
          algorithm: 'sliding-window',
          maxRequests: 5,
          windowInSeconds: 60,
          enabled: true,
          description: 'Default policy for /sliding-test endpoint',
        },
      ]);
    }
  } catch (error) {
    console.error('[Policy Service] Error during seeding:', error.message);
  }

  // Load policies initially
  await loadPolicies();

  // Clean up any existing interval
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }

  // Auto refresh cache every 30 seconds
  refreshIntervalId = setInterval(async () => {
    await loadPolicies();
  }, 30000);
};

/**
 * Clean up resource allocations (useful for tests to prevent leaving hanging intervals)
 */
export const stopPolicyService = () => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
  policiesCache.clear();
};

/**
 * Retrieve rate limiting policy for a specific normalized endpoint path.
 * 
 * @param {string} endpoint Normalized request path
 * @returns {Object} Configured or fallback rate limiting policy
 */
export const getPolicyForEndpoint = (endpoint) => {
  const policy = policiesCache.get(endpoint);
  if (policy) {
    return policy;
  }
  // If no policy exists, return fallback default limits
  return { ...DEFAULT_LIMITS, endpoint };
};
