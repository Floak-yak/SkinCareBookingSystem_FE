import { createContext, useState} from "react";

// Khởi tạo context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("currentUser"); // Lấy user từ localStorage
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData)); // Lưu vào localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser"); // Xóa user khi logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
