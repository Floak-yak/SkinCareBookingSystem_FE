// src/api/userApi.js
import apiClient from "./apiClient";

const userApi = {
  // Login
  login: (email, password) => {
    return apiClient.post("/User/Login", {
      email,
      password
    });
  },

  // Register
  register: (fullName, yearOfBirth, email, password, phoneNumber) => {
    return apiClient.post("/User/Register", {
      fullName,
      yearOfBirth,
      email,
      password,
      phoneNumber
    });
  },

  // Reset Password
  resetPassword: (email) => {
    return apiClient.put("/User/ResetPassword", { email });
  },
};

export default userApi;
