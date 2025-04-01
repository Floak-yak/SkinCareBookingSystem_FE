import axios from "axios";

const apiClient = axios.create({
  baseURL: 'https://localhost:7101',
  headers: {
    "Content-Type": "application/json",
  }
});

// Add request interceptor to include authorization token for all requests
apiClient.interceptors.request.use(request => {
  // Get token from localStorage
  const token = localStorage.getItem("token");
  
  // If token exists, add it to the request headers
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
    
    // For debugging specific endpoints
    if (request.url.includes('/Survey/db/user-history')) {
      console.log('Sending request to survey history with token:', token.substring(0, 20) + '...');
    }
  } else {
    // For debugging specific endpoints that need authentication
    if (request.url.includes('/Survey/db/user-history')) {
      console.warn('No auth token available for protected endpoint:', request.url);
    }
  }
  
  console.log('API Request:', {
    method: request.method?.toUpperCase(),
    url: request.baseURL + request.url,
    params: request.params
  });
  return request;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_CONNECTION_REFUSED') {
      console.error('Server connection failed. Please check if the backend is running at:', error.config?.baseURL);
    }
    
    // Enhanced error logging for authentication issues
    if (error.response && error.response.status === 401) {
      console.error('401 Authorization Error:', {
        endpoint: error.config?.url,
        hasToken: !!localStorage.getItem('token'),
        message: error.response?.data?.message || error.message
      });
      
      // Check if token exists but is expired or invalid
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Attempt to decode the token to see if it's expired
          // This is a simple check and doesn't validate signature
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace('-', '+').replace('_', '/');
          const payload = JSON.parse(window.atob(base64));
          const exp = payload.exp;
          const now = Date.now() / 1000;
          
          if (exp && exp < now) {
            console.warn('Token is expired. Expiration:', new Date(exp * 1000), 'Current time:', new Date());
          } else {
            console.warn('Token exists but was rejected by the server. Token might be invalid.');
          }
        } catch (e) {
          console.warn('Could not decode token:', e);
        }
      }
    }
    
    console.error('API Error:', {
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    throw error;
  }
);

export default apiClient;
