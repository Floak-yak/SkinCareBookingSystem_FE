import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";

const LayoutWrapper = () => {
  const location = useLocation();

  //Không hiển thị Header/Footer ở các trang này
  const hiddenLayoutPaths = ["/login", "/register", "/forgot-password"];

  const hideLayout = hiddenLayoutPaths.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Header />}
      <main className="main-content">
        <AppRoutes />
      </main>
      {!hideLayout && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <LayoutWrapper />
          <ToastContainer position="bottom-right" autoClose={3000} />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
