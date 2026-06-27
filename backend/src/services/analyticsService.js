const activityMap = new Map();

/**
 * Get current minute label in HH:MM format (local time).
 * 
 * @param {Date} date Optional Date object
 * @returns {string} HH:MM formatted label
 */
const getMinuteLabel = (date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Record a request in the current minute bucket.
 * Automatically evicts minute buckets older than 60 minutes.
 * 
 * @param {boolean} isAllowed Whether the request was successful
 * @param {boolean} isBlocked Whether the request was rate-limited
 */
export const trackRequest = (isAllowed, isBlocked) => {
  const now = new Date();
  const key = getMinuteLabel(now);

  if (!activityMap.has(key)) {
    activityMap.set(key, { total: 0, allowed: 0, blocked: 0, timestamp: now.getTime() });
  }

  const record = activityMap.get(key);
  record.total++;
  if (isAllowed) record.allowed++;
  if (isBlocked) record.blocked++;

  // Evict records older than 60 minutes
  const cutoff = now.getTime() - 60 * 60 * 1000;
  for (const [k, v] of activityMap.entries()) {
    if (v.timestamp < cutoff) {
      activityMap.delete(k);
    }
  }
};

/**
 * Retrieve traffic analytics for the last 60 minutes.
 * Dynamically fills gaps with 0 counts to ensure a continuous timeline.
 * 
 * @returns {Object} Grouped analytics lists
 */
export const getAnalytics = () => {
  const labels = [];
  const totalRequests = [];
  const allowedRequests = [];
  const blockedRequests = [];

  const now = new Date();
  // Construct the last 60 minutes in chronological order (ending at the current minute)
  for (let i = 59; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 1000);
    const key = getMinuteLabel(time);

    labels.push(key);

    const record = activityMap.get(key) || { total: 0, allowed: 0, blocked: 0 };
    totalRequests.push(record.total);
    allowedRequests.push(record.allowed);
    blockedRequests.push(record.blocked);
  }

  return {
    labels,
    totalRequests,
    allowedRequests,
    blockedRequests,
  };
};
