import mongoose from 'mongoose';

const rateLimitPolicySchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    algorithm: {
      type: String,
      required: true,
      enum: ['fixed-window', 'sliding-window', 'sliding-window-counter', 'token-bucket'],
      default: 'fixed-window',
    },
    maxRequests: {
      type: Number,
      required: true,
      min: 1,
    },
    windowInSeconds: {
      type: Number,
      required: true,
      min: 1,
    },
    enabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const RateLimitPolicy = mongoose.model('RateLimitPolicy', rateLimitPolicySchema);
