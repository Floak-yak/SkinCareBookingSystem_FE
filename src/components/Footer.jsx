import { Link } from "react-router-dom";
import { FacebookOutlined, TwitterOutlined, InstagramOutlined } from "@ant-design/icons";
import Logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer style={{ background: "#fff", color: "#222", padding: "40px 50px", marginTop: "50px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        
        {/* Cột 1 - Thông tin trung tâm */}
        <div style={{ flex: 1, minWidth: "250px" }}>
          <img src={Logo} alt="SkinCare" style={{ height: 40, marginBottom: "10px" }} />
          <p>Providing the best skincare services tailored to your needs.</p>
        </div>

        {/* Cột 2 - Liên kết nhanh */}
        <div style={{ flex: 1, minWidth: "150px" }}>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link><br />
          <Link to="/services">Services</Link><br />
          <Link to="/skin-test">Skin Testing</Link><br />
          <Link to="/blog">Blog</Link>
        </div>

        {/* Cột 3 - Hỗ trợ khách hàng */}
        <div style={{ flex: 1, minWidth: "150px" }}>
          <h4>Support</h4>
          <Link to="/faq">FAQs</Link><br />
          <Link to="/contact">Contact Us</Link><br />
          <Link to="/privacy-policy">Privacy Policy</Link>
        </div>

        {/* Cột 4 - Social Media */}
        <div style={{ flex: 1, minWidth: "150px" }}>
          <h4>Follow Us</h4>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FacebookOutlined style={{ fontSize: "20px", marginRight: "10px" }} /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><TwitterOutlined style={{ fontSize: "20px", marginRight: "10px" }} /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><InstagramOutlined style={{ fontSize: "20px" }} /></a>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px", borderTop: "1px solid #444", paddingTop: "10px" }}>
        © 2025 SkinCare Booking System. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
