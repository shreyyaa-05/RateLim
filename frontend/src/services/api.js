import axios from 'axios';

// Create a reusable Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
});

/**
 * Ensures that the client has a valid JWT token stored in localStorage
 * and configured in Axios headers. If not, attempts background auto-registration/login.
 */
const ensureAuthenticated = async () => {
  let token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return;
  }

  const credentials = { username: 'admin', password: 'password123' };
  try {
    // Attempt to log in with default credentials
    const loginRes = await axios.post('http://localhost:3000/auth/login', credentials);
    token = loginRes.data.token;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    // If login fails (most likely user does not exist), register the user
    try {
      const registerRes = await axios.post('http://localhost:3000/auth/register', credentials);
      token = registerRes.data.token;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (regError) {
      console.error('[API Service] Background auto-authentication failed:', regError.message);
    }
  }
};

// Response Interceptor for handling errors and auto-retrying on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if error is 401 and we haven't retried this request yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      try {
        await ensureAuthenticated();
        // Update authorization header on the retried request
        const token = localStorage.getItem('token');
        if (token) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (authError) {
        console.error('[API Service] Re-authentication failed:', authError.message);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch current system traffic stats
 */
export const getDashboardStats = async () => {
  await ensureAuthenticated();
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

/**
 * Fetch current system traffic request logs
 */
export const getRequestLogs = async () => {
  await ensureAuthenticated();
  const response = await api.get('/api/requests');
  return response.data;
};

/**
 * Fetch current system traffic analytics (last 60 minutes)
 */
export const getAnalyticsData = async () => {
  await ensureAuthenticated();
  const response = await api.get('/api/analytics');
  return response.data;
};

/**
 * Fetch all configured rate limiting policies
 */
export const getPolicies = async () => {
  await ensureAuthenticated();
  const response = await api.get('/api/policies');
  return response.data;
};

/**
 * Update a specific rate limiting policy configuration
 */
export const updatePolicy = async (id, data) => {
  await ensureAuthenticated();
  const response = await api.put(`/api/policies/${id}`, data);
  return response.data;
};

export default api;
