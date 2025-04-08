import apiClient from './apiClient';

const authApi = {
  login: (credentials) => {
    return apiClient.post('/api/Auth/login', credentials);
  },
  register: (userData) => {
    return apiClient.post('/api/Auth/register', userData);
  },
  refreshToken: (refreshToken) => {
    return apiClient.post('/api/Auth/refresh-token', { refreshToken });
  },
  // Thêm các phương thức API xác thực khác nếu cần
};

export default authApi;
