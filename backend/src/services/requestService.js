const requestLogs = [];
const MAX_LOGS = 100;

/**
 * Add a new request log to the in-memory store.
 * Keeps only the latest 100 requests (descending order, newest first).
 * 
 * @param {Object} log The request log object
 */
export const addRequestLog = (log) => {
  requestLogs.unshift(log);
  if (requestLogs.length > MAX_LOGS) {
    requestLogs.pop();
  }
};

/**
 * Retrieve all currently logged requests.
 * 
 * @returns {Array} List of latest request logs
 */
export const getRequestLogs = () => {
  return [...requestLogs];
};
