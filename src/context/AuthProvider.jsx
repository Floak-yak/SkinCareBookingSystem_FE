import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import authApi from '../api/authApi';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra người dùng đã đăng nhập từ localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Error loading user from localStorage:", err);
    }
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      const userData = response.data;
      
      // Lưu thông tin người dùng và token
      setUser(userData);
      setToken(userData.token);
      
      // Lưu vào localStorage để giữ phiên đăng nhập
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      
      setLoading(false);
      setError(null);
      
      // Kiểm tra và lấy URL chuyển hướng sau đăng nhập
      const redirectUrl = localStorage.getItem('authRedirectUrl');
      if (redirectUrl) {
        // Xóa redirectUrl từ localStorage sau khi đã sử dụng
        localStorage.removeItem('authRedirectUrl');
        return redirectUrl;
      }
      
      return '/'; // URL mặc định nếu không có redirectUrl
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
      throw error;
    }
  };

  const logout = () => {
    // Xóa thông tin người dùng và token
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
