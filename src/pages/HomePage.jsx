import React, { useRef } from "react";
import Hero from "../components/Hero";
import CardSpa from "../components/CardSpa";
import DoctorProfiles from "../components/Doctor";
import "../styles/CardSpa.css";
import "../styles/HomePage.css";
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AboutUs from "../components/AboutUs";
import SpaGallery from "../components/SpaGallery";

const SpaDATA = [
  {
    id: "1",
    name: "Chăm Sóc Da Cơ Bản",
    image:
      "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNwYXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: "2",
    name: "Peel Da Chuyên Sâu",
    image:
      "https://media.istockphoto.com/id/528887735/vi/anh/ng%C6%B0%E1%BB%9Di-ph%E1%BB%A5-n%E1%BB%AF-%C4%91eo-m%E1%BA%B7t-n%E1%BA%A1-spa.jpg?s=612x612&w=0&k=20&c=hzstRBsIlXxGh9KTwC7PA8mFFlaYspIGT54wPJXL_7s=",
  },
  {
    id: "3",
    name: "Trị Liệu Ánh Sáng LED",
    image:
      "https://rebibeauty.com/wp-content/uploads/2024/05/Dich-vu-Laser-Tan-Nhang-Nam.webp",
  },
  {
    id: "4",
    name: "Điều Trị Mụn Chuyên Sâu",
    image:
      "https://th.bing.com/th/id/OIP.NB-iuGza8NsdQVck7eeuWQHaE7?w=270&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
  },
  {
    id: "5",
    name: "Điều Trị Nám - Tàn Nhang",
    image:
      "https://th.bing.com/th/id/OIP.-nIxvtb2ArIZwk7rpYPYFwHaEv?w=300&h=192&c=7&r=0&o=5&dpr=1.3&pid=1.7",
  },
  {
    id: "6",
    name: "Tẩy Tế Bào Chết",
    image:
      "https://media.istockphoto.com/id/480062395/fr/photo/soin-de-la-peau.webp?a=1&s=612x612&w=0&k=20&c=HdPO8uX5B9tEgaiBJCIgW9l8E24G7R6xfUSzizn8J7c=",
  },
  {
    id: "7",
    name: "Chăm Sóc Da Nhạy Cảm",
    image:
      "https://th.bing.com/th?id=OIF.lsBOd25sY%2fBxxwuFytXt2Q&w=222&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
  },
  {
    id: "8",
    name: "Dưỡng Ẩm Chuyên Sâu",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHNwYXxlbnwwfHwwfHx8MA%3D%3D",
  },
];

const HomePage = () => {
  const scrollRef = useRef(null);

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
          {SpaDATA.map((item) => (
            <CardSpa key={item.id} id={item.id} name={item.name} image={item.image} />
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
