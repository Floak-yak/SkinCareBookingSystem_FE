import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import HomePage from '../pages/HomePage';
import BookingPage from '../pages/BookingPage';
import LoginPage from '../pages/LoginPage';
import PaymentPage from '../pages/PaymentPage';
import RegisterPage from '../pages/RegisterPage';
import TestingPage from '../pages/TestingPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/skin-test" element={<TestingPage />} />
    </Routes>
  );
};

export default AppRoutes;
