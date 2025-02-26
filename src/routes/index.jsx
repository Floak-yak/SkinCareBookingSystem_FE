import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import BlogDetail from "../pages/BlogDetail";
import BlogPage from "../pages/BlogPage";
import CreateBlog from "../pages/CreateBlog";
import ApproveBlog from "../pages/ApproveBlog";
import Services from "../pages/Services";
import Booking from "../pages/Booking";
import Contact from "../pages/Contact";
import ServiceDetail from "../pages/ServiceDetail";
import ProductPage from "../pages/ProductPage";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import ForgotPassword from "../pages/ForgotPassword";

const AppRoutes = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} /> 
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/blogs" element={<BlogPage />} />
      <Route path="/blogs/:id" element={<BlogDetail />} />
      <Route path="/blogs/create" element={<CreateBlog />} />
      <Route path="/staff/approve-blogs" element={<ApproveBlog />} />
      <Route path="/services" element={<Services />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/service/:id" element={<ServiceDetail />} />
      <Route path="/products" element={<ProductPage />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
    </Routes>
  );
};

export default AppRoutes;
