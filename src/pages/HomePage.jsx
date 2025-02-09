import React, { useRef } from 'react';
import Hero from '../components/Hero';
import CardSpa from '../components/CardSpa';
import DoctorProfiles from '../components/Doctor';
import '../styles/CardSpa.css';
import '../styles/HomePage.css';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AboutUs from '../components/AboutUs';
import SpaGallery from '../components/SpaGallery';

const SpaDATA = [
  { id: '1', name: 'Chăm Sóc Da Cơ Bản', image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNwYXxlbnwwfHwwfHx8MA%3D%3D' },
  { id: '2', name: 'Peel Da Chuyên Sâu', image: 'https://media.istockphoto.com/id/528887735/vi/anh/ng%C6%B0%E1%BB%9Di-ph%E1%BB%A5-n%E1%BB%AF-%C4%91eo-m%E1%BA%B7t-n%E1%BA%A1-spa.jpg?s=612x612&w=0&k=20&c=hzstRBsIlXxGh9KTwC7PA8mFFlaYspIGT54wPJXL_7s=' },
  { id: '3', name: 'Trị Liệu Ánh Sáng LED', image: 'https://rebibeauty.com/wp-content/uploads/2024/05/Dich-vu-Laser-Tan-Nhang-Nam.webp' },
  { id: '4', name: 'Điều Trị Mụn Chuyên Sâu', image: 'https://th.bing.com/th/id/OIP.NB-iuGza8NsdQVck7eeuWQHaE7?w=270&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7' },
  { id: '5', name: 'Điều Trị Nám - Tàn Nhang', image: 'https://th.bing.com/th/id/OIP.-nIxvtb2ArIZwk7rpYPYFwHaEv?w=300&h=192&c=7&r=0&o=5&dpr=1.3&pid=1.7' },
  { id: '6', name: 'Tẩy Tế Bào Chết', image: 'https://media.istockphoto.com/id/480062395/fr/photo/soin-de-la-peau.webp?a=1&s=612x612&w=0&k=20&c=HdPO8uX5B9tEgaiBJCIgW9l8E24G7R6xfUSzizn8J7c=' },
  { id: '7', name: 'Chăm Sóc Da Nhạy Cảm', image: 'https://th.bing.com/th?id=OIF.lsBOd25sY%2fBxxwuFytXt2Q&w=222&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7' },
  { id: '8', name: 'Dưỡng Ẩm Chuyên Sâu', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHNwYXxlbnwwfHwwfHx8MA%3D%3D' }

]

const HomePage = () => {

  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = 300;
    if (container) {
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div>
      <Hero></Hero>

      <AboutUs></AboutUs>

      {/* <div className="container_Card"
        style={{
          background: "linear-gradient(to right, #a6c1ee, #fbc2eb)",
          paddingRight: "30px",
        }}
      >
        <h1
          style={{
            textAlign: "center", // Căn giữa nội dung text
            margin: "10px auto", // Căn giữa và tạo khoảng cách
            marginTop: "20px",
            backgroundColor: "#863948",
            width: "320px",
            borderRadius: "20px",
            padding: "10px", // Thêm khoảng đệm để đẹp hơn
            color: "#fff", // Màu chữ trắng cho dễ nhìn
            fontSize: "1.5rem", // Tăng kích thước chữ
          }}
        >Dich Vu Noi Bat</h1>
        <div className="row"
          style={{
            display: "flex",
            flexWrap: "nowrap",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: "20px",
            overflowX: "hidden",
            overflow: "auto",
            padding: "20px",
            width: "100%",
            // animation: "scroll 20s linear infinite",
          }}
        >
          {SpaDATA.map((item) => <CardSpa key={item.id} id={item.id} name={item.name} image={item.image}
            style={{ animation: "scroll 20s linear infinite", }} />)}
        </div>
      </div> */}

      <h1
        style={{
          textAlign: "center",
          margin: "10px auto",
          marginTop: "20px",
          backgroundColor: "#f4a261",
          width: "320px",
          borderRadius: "20px",
          padding: "10px",
          color: "#fff",
          fontSize: "1.5rem",
          position: "relative",
          bottom: "-30px",
          zIndex: 3,
          // position: "-28px auto 28px",
        }}
      >
        Dịch Vụ Nổi Bật
      </h1>

      <div className="container_Card"
        style={{
          background: "#f4eade",
          position: "relative",
          width: "95%",
          overflowX: "hidden",
          margin: "0 auto",


        }}
      >

        <button
          className="scroll-button left"
          onClick={() => scroll('left')}
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <FaChevronLeft />
        </button>

        <div className="row"
          ref={scrollRef}
          style={{
            display: "flex",
            flexWrap: "nowrap",
            gap: "20px",
            overflowX: "auto",
            // overflowX: "hidden",
            padding: "40px 20px 30px",
            width: "100%",
            scrollBehavior: "smooth",
            msOverflowStyle: "none",
            scrollbarWidth: "none",

          }}
        >
          {SpaDATA.map((item) => (
            <CardSpa
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
            />
          ))}
        </div>

        <button
          className="scroll-button right"
          onClick={() => scroll('right')}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2
          }}
        >
          <FaChevronRight />
        </button>

        <a href='/Services' style={{ textDecoration: "none" }}>
          <button
            className="btn btn-primary"
            style={{
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
              margin: "0px auto 10px",
              // marginTop: "20px",
              backgroundColor: "#f4a261",
              width: "200px",
              borderRadius: "20px",
              padding: "10px",
              color: "#fff",
              fontSize: "1.5rem",
              position: "relative",
              // top: "-30px",
              transition: "background-color 0.3s ease",
              border: "1px solid #f4a261",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f4a200")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f4a261")}
          // onClick={() => alert('Xem Thêm clicked!')

          // } // hoặc hành động khác bạn muốn thực hiện
          >
            Xem Thêm
          </button>
        </a>
      </div>

      <DoctorProfiles></DoctorProfiles>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2>Khách Hàng Nói Gì Về Chúng Tôi</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p>"Dịch vụ tuyệt vời, nhân viên chuyên nghiệp. Tôi rất hài lòng với kết quả sau liệu trình."</p>
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
            <p>"Không gian thư giãn, sang trọng. Các liệu trình đều mang lại hiệu quả rõ rệt."</p>
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
            <p>"Đội ngũ nhân viên nhiệt tình, chu đáo. Sẽ tiếp tục ủng hộ spa trong thời gian tới."</p>
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
      <section className="gallery">
        <h2>Không Gian Spa</h2>

      </section>

      <SpaGallery></SpaGallery>

    </div >
  );
};

export default HomePage;
