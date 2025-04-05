import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://localhost:7101',
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message, error.config);
    throw error;
  }
);

export default axiosInstance;
