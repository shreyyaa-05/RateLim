/**
 * Test controller to demonstrate rate limiting functionality.
 */
export const testRateLimit = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Request successful. You have not exceeded your rate limit.',
    timestamp: new Date().toISOString(),
  });
};
