import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import "./styles/index.css"; 

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main className="main-content">
          <AppRoutes />
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;
