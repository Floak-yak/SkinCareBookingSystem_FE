// src/api/userApi.js
import apiClient from "./apiClient";

const userApi = {
  // Login
  login: (email, password) => {
    return apiClient.post("/api/User/Login", {
      email,
      password,
    });
  },

  // Register
  register: (fullName, yearOfBirth, email, password, phoneNumber) => {
    return apiClient.post("/api/User/Register", {
      fullName,
      yearOfBirth,
      email,
      password,
      phoneNumber,
    });
  },

  // Reset Password
  resetPassword: (email) => {
    return apiClient.put(`/api/User/ResetPassword?email=${email}`);
  },

  getAll: () => apiClient.get("/api/User/GetUsers"),
  getStaffs: () => apiClient.get("/api/User/GetStaffs"),
  getSkinTherapists: () => apiClient.get("/api/User/GetSkinTherapists"),
  getCustomers: () => apiClient.get("/api/User/GetCustomers"),
  create: (data) => apiClient.post("/api/User/CreateAccount", data),
  updateRole: (userId, role, categoryId = 0) =>
    apiClient.put("/api/User", null, { params: { userId, role, categoryId } }),
  delete: (userId) => apiClient.delete(`/api/User/Remove?userId=${userId}`),
};

export default userApi;
