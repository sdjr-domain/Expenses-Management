import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Required to send Flask session cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor to handle standardized API errors
apiClient.interceptors.response.use(
  (response) => response.data.data ?? response.data,
  (error) => {
    const apiError = error.response?.data?.error || 'An unexpected error occurred';
    return Promise.reject(apiError);
  }
);

export default apiClient;
