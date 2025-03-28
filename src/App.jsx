import React from "react";
import { BrowserRouter as Router} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Header />
          <main className="main-content">
            <AppRoutes />
          </main>
          <Footer />
          <ToastContainer position="bottom-right" autoClose={3000} />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
