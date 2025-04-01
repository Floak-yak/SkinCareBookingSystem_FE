import React, { useRef, useState, useEffect } from "react";
import Hero from "../components/Hero";
import CardSpa from "../components/CardSpa";
import DoctorProfiles from "../components/Doctor";
import "../styles/CardSpa.css";
import "../styles/HomePage.css";
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AboutUs from "../components/AboutUs";
import SpaGallery from "../components/SpaGallery";
import servicesApi from "../api/servicesApi";

const HomePage = () => {
  const scrollRef = useRef(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await servicesApi.getAllServices1();
        setServices(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError(error.code === 'ERR_CONNECTION_REFUSED' 
          ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.'
          : 'Không thể tải dịch vụ. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const scroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = 300;
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <Hero></Hero>

      <AboutUs></AboutUs>

      <h1 className="highlighted-title">Dịch Vụ Nổi Bật</h1>

      <div className="container_Card">
        <button className="scroll-button left" onClick={() => scroll("left")}>
          <FaChevronLeft />
        </button>

        <div className="row" ref={scrollRef}>
          {services.map((service) => (
            <CardSpa
              key={service.id}
              id={service.id}
              serviceName={service.serviceName}
              image={service.image ? `data:image/jpeg;base64,${service.image}` : 'https://img.freepik.com/free-photo/woman-getting-treatment-spa_23-2149157871.jpg'}
            />
          ))}
        </div>

        <button className="scroll-button right" onClick={() => scroll("right")}>
          <FaChevronRight />
        </button>

        <a href="/Services" className="btn-primary">Xem Thêm</a>
      </div>

      <DoctorProfiles></DoctorProfiles>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2>Khách Hàng Nói Gì Về Chúng Tôi</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p>
              "Dịch vụ tuyệt vời, nhân viên chuyên nghiệp. Tôi rất hài lòng với kết quả sau liệu trình."
            </p>
            <div className="testimonial-author">
              <img src="https://randomuser.me/api/portraits/women/1.jpg" alt="Customer" />
              <div>
                <h4>Nguyễn Thị A</h4>
                {/* <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div> */}
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p>
              "Không gian thư giãn, sang trọng. Các liệu trình đều mang lại hiệu quả rõ rệt."
            </p>
            <div className="testimonial-author">
              <img src="https://randomuser.me/api/portraits/women/2.jpg" alt="Customer" />
              <div>
                <h4>Trần Thị B</h4>
                {/* <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div> */}
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p>
              "Đội ngũ nhân viên nhiệt tình, chu đáo. Sẽ tiếp tục ủng hộ spa trong thời gian tới."
            </p>
            <div className="testimonial-author">
              <img src="https://randomuser.me/api/portraits/women/3.jpg" alt="Customer" />
              <div>
                <h4>Lê Thị C</h4>
                {/* <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-text">
        <h2>Không Gian Spa</h2>
      </section>

      <SpaGallery></SpaGallery>
    </div>
  );
};

export default HomePage;
