import axios from "axios";

const apiClient = axios.create({
  baseURL: 'https://localhost:7101',
  headers: {
    "Content-Type": "application/json",
  },
  httpsAgent: process.env.NODE_ENV === 'development' ? 
    new (require('https').Agent)({ rejectUnauthorized: false }) : undefined
});

apiClient.interceptors.request.use(request => {
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
