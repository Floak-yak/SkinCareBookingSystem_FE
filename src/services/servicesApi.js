import axiosInstance from '../config/axios';

export const getServices = async (page, pageSize) => {
  try {
    const response = await axiosInstance.get('/api/SkincareServices/GetServices', {
      params: { page, pageSize }
    });
    console.log('API Response:', response);
    return response.data;
  } catch (error) {
    console.error('API Error Details:', error.response || error);
    throw error;
  }
};
