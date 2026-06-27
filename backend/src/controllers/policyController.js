import { RateLimitPolicy } from '../models/RateLimitPolicy.js';
import { loadPolicies } from '../services/policyService.js';
import mongoose from 'mongoose';

/**
 * GET /api/policies
 * Returns all configured rate limit policies.
 */
export const getPolicies = async (req, res, next) => {
  try {
    const policies = await RateLimitPolicy.find({}).sort({ endpoint: 1 });
    return res.status(200).json(policies);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/policies/:id
 * Updates a specific rate limit policy.
 */
export const updatePolicy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { algorithm, maxRequests, windowInSeconds, enabled } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Invalid policy ID format.',
      });
    }

    // Input Validation
    const errors = [];
    if (algorithm !== undefined && !['fixed-window', 'sliding-window'].includes(algorithm)) {
      errors.push("Algorithm must be either 'fixed-window' or 'sliding-window'.");
    }
    if (maxRequests !== undefined && (!Number.isInteger(maxRequests) || maxRequests <= 0)) {
      errors.push('maxRequests must be a positive integer.');
    }
    if (windowInSeconds !== undefined && (!Number.isInteger(windowInSeconds) || windowInSeconds <= 0)) {
      errors.push('windowInSeconds must be a positive integer.');
    }
    if (enabled !== undefined && typeof enabled !== 'boolean') {
      errors.push('enabled must be a boolean.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed.',
        errors,
      });
    }

    // Build update object dynamically
    const updateData = {};
    if (algorithm !== undefined) updateData.algorithm = algorithm;
    if (maxRequests !== undefined) updateData.maxRequests = maxRequests;
    if (windowInSeconds !== undefined) updateData.windowInSeconds = windowInSeconds;
    if (enabled !== undefined) updateData.enabled = enabled;

    const updatedPolicy = await RateLimitPolicy.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedPolicy) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Rate limit policy not found.',
      });
    }

    // Force refresh the in-memory cache immediately
    await loadPolicies();

    return res.status(200).json(updatedPolicy);
  } catch (error) {
    next(error);
  }
};
