// src/api/userApi.js
import apiClient from "./apiClient";

const userApi = {
  // Login
  login: (email, password) => {
    return apiClient.post("/User/Login", {
      email,
      password,
    });
  },

  // Register
  register: (fullName, yearOfBirth, email, password, phoneNumber) => {
    return apiClient.post("/User/Register", {
      fullName,
      yearOfBirth,
      email,
      password,
      phoneNumber,
    });
  },

  // Reset Password
  resetPassword: (email) => {
    return apiClient.put(`/User/ResetPassword?email=${email}`);
  },

  getAll: () => apiClient.get("/User/GetUsers"),
  getStaffs: () => apiClient.get("/User/GetStaffs"),
  getSkinTherapists: () => apiClient.get("/User/GetSkinTherapists"),
  getCustomers: () => apiClient.get("/User/GetCustomers"),
  create: (data) => apiClient.post("/User/CreateAccount", data),
  updateRole: (userId, role, categoryId = 0) =>
    apiClient.put("/User", null, { params: { userId, role, categoryId } }),
  delete: (userId) => apiClient.delete(`/User/Remove?userId=${userId}`),
};

export default userApi;
