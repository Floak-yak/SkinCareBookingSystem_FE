import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Đồng bộ user giữa nhiều tab
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("currentUser");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  //Auto-logout khi token hết hạn
  useEffect(() => {
    if (user?.token) {
      try {
        // Decode token để lấy thời gian hết hạn (exp)
        const decoded = jwtDecode(user.token);
        const now = Date.now();

        // exp trong token là giây, còn now là milliseconds
        // => so sánh decoded.exp * 1000 với now
        if (decoded.exp * 1000 < now) {
          // Token đã hết hạn
          logout();
        } else {
          // Token còn hạn -> Tính thời gian còn lại
          const timeLeft = decoded.exp * 1000 - now;
          // Đặt setTimeout để logout khi đến thời điểm hết hạn
          const logoutTimer = setTimeout(() => {
            logout();
          }, timeLeft);

          // Clear setTimeout nếu user thay đổi (hoặc unmount)
          return () => clearTimeout(logoutTimer);
        }
      } catch (error) {
        console.error("Token không hợp lệ:", error);
        logout();
      }
    }
  }, [user]); // Mỗi lần user thay đổi, effect này sẽ chạy

  const login = (userData) => {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    localStorage.setItem("hideTestReminder", "false");
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.setItem("hideTestReminder", "false");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
