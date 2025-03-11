import React, { useEffect } from 'react';
import '../styles/AboutUs.css';
import { Image } from 'antd';
import { 
  HeartOutlined, 
  SafetyCertificateOutlined, 
  TrophyOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

const AboutUs = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      mirror: false
    });
  }, []);

  return (
    <div className="about-us-container">
      <div className="about-hero parallax-bg">
        <div className="hero-overlay"></div>
        <div className="hero-content" data-aos="fade-up">
          <div className="hero-badge">Thành lập từ 2010</div>
          <h1>Về Chúng Tôi</h1>
          <p className="hero-subtitle">Nơi Vẻ Đẹp Được Chăm Sóc Tận Tâm</p>
          <div className="hero-stats">
            <div className="stat-item" data-aos="fade-up" data-aos-delay="200">
              <div className="stat-circle">
                <span className="stat-number">5000+</span>
              </div>
              <p>Khách hàng<br/>hài lòng</p>
            </div>
            <div className="stat-item" data-aos="fade-up" data-aos-delay="400">
              <div className="stat-circle">
                <span className="stat-number">10+</span>
              </div>
              <p>Năm<br/>kinh nghiệm</p>
            </div>
            <div className="stat-item" data-aos="fade-up" data-aos-delay="600">
              <div className="stat-circle">
                <span className="stat-number">50+</span>
              </div>
              <p>Chuyên gia<br/>làm đẹp</p>
            </div>
          </div>
        </div>
        <div className="scroll-down">
          <div className="mouse"></div>
          <div className="arrow"></div>
        </div>
      </div>

      <div className="about-content">
        <section className="about-section story-section glass-effect">
          <div className="section-image" data-aos="fade-right">
            <div className="image-frame">
              <Image
                src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3"
                alt="Spa environment"
              />
            </div>
          </div>
          <div className="section-text" data-aos="fade-left">
            <div className="section-header">
              <span className="section-subtitle">Câu Chuyện Của Chúng Tôi</span>
              <h2>Hành Trình Kiến Tạo Vẻ Đẹp</h2>
            </div>
            <p>
              SkinCare Booking được thành lập với mục tiêu mang đến những dịch vụ chăm sóc da
              chất lượng cao, chuyên nghiệp và an toàn. Chúng tôi tin rằng mỗi người đều xứng đáng
              có được làn da khỏe mạnh và tự tin với vẻ đẹp của mình.
            </p>
            <div className="story-features">
              <div className="feature">
                <CheckCircleOutlined className="feature-icon" />
                <span>Công nghệ hiện đại</span>
              </div>
              <div className="feature">
                <CheckCircleOutlined className="feature-icon" />
                <span>Chuyên gia hàng đầu</span>
              </div>
              <div className="feature">
                <CheckCircleOutlined className="feature-icon" />
                <span>Dịch vụ cao cấp</span>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section mission-section glass-effect">
          <div className="section-text" data-aos="fade-right">
            <div className="section-header">
              <span className="section-subtitle">Sứ Mệnh</span>
              <h2>Cam Kết Của Chúng Tôi</h2>
            </div>
            <p>
              Chúng tôi cam kết mang đến những trải nghiệm chăm sóc da tốt nhất cho khách hàng,
              kết hợp giữa công nghệ hiện đại và phương pháp tự nhiên, giúp bạn đạt được làn da
              mơ ước một cách an toàn và hiệu quả.
            </p>
            <div className="mission-highlights">
              <div className="highlight">
                <HeartOutlined className="highlight-icon" />
                <h4>Tận Tâm</h4>
                <p>Chăm sóc chu đáo</p>
              </div>
              <div className="highlight">
                <SafetyCertificateOutlined className="highlight-icon" />
                <h4>An Toàn</h4>
                <p>Đảm bảo chất lượng</p>
              </div>
              <div className="highlight">
                <TrophyOutlined className="highlight-icon" />
                <h4>Chuyên Nghiệp</h4>
                <p>Dịch vụ hàng đầu</p>
              </div>
            </div>
          </div>
          <div className="section-image" data-aos="fade-left">
            <div className="image-frame">
              <Image
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3"
                alt="Spa treatment"
              />
            </div>
          </div>
        </section>

        <section className="about-section values-section">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
          <div className="section-header center">
            <span className="section-subtitle">Giá Trị Cốt Lõi</span>
            <h2>Những Điều Chúng Tôi Tin Tưởng</h2>
          </div>
          <div className="core-values">
            <div className="value-item" data-aos="fade-up" data-aos-delay="200">
              <div className="value-icon">
                <CustomerServiceOutlined className="icon" />
              </div>
              <h3>Chất Lượng</h3>
              <p>Cam kết sử dụng các sản phẩm và thiết bị chất lượng cao</p>
            </div>
            <div className="value-item" data-aos="fade-up" data-aos-delay="400">
              <div className="value-icon">
                <TeamOutlined className="icon" />
              </div>
              <h3>Chuyên Nghiệp</h3>
              <p>Đội ngũ nhân viên được đào tạo chuyên sâu và tận tâm</p>
            </div>
            <div className="value-item" data-aos="fade-up" data-aos-delay="600">
              <div className="value-icon">
                <SafetyCertificateOutlined className="icon" />
              </div>
              <h3>An Toàn</h3>
              <p>Đặt sự an toàn của khách hàng lên hàng đầu</p>
            </div>
          </div>
        </section>

        <section className="about-section team-section">
          <div className="section-header mb-4">
            <span className="section-subtitle mb-2">Đội Ngũ Của Chúng Tôi</span>
            <h2>Gặp Gỡ Các Chuyên Gia</h2>
          </div>
          <div className="team-grid">
            <div className="team-member card-hover" data-aos="fade-up" data-aos-delay="200">
              <div className="member-image">
                <Image
                  src="https://images.unsplash.com/photo-1559599101-f09722fb4948?ixlib=rb-4.0.3"
                  alt="Team member"
                />
                <div className="member-overlay">
                  <h4>Dr. Minh Anh</h4>
                  <p>Chuyên Gia Da Liễu</p>
                </div>
              </div>
              <div className="member-info">
                <h3>Chuyên Gia Da Liễu</h3>
                <p>Với hơn 10 năm kinh nghiệm trong lĩnh vực chăm sóc da</p>
              </div>
            </div>
            <div className="team-member card-hover" data-aos="fade-up" data-aos-delay="400">
              <div className="member-image">
                <Image
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3"
                  alt="Team member"
                />
                <div className="member-overlay">
                  <h4>Thanh Thảo</h4>
                  <p>Chuyên Viên Spa</p>
                </div>
              </div>
              <div className="member-info">
                <h3>Chuyên Viên Spa</h3>
                <p>Được đào tạo chuyên sâu về các liệu trình chăm sóc da</p>
              </div>
            </div>
            <div className="team-member card-hover" data-aos="fade-up" data-aos-delay="600">
              <div className="member-image">
                <Image
                  src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?ixlib=rb-4.0.3"
                  alt="Team member"
                />
                <div className="member-overlay">
                  <h4>Thu Hương</h4>
                  <p>Cố Vấn Làm Đẹp</p>
                </div>
              </div>
              <div className="member-info">
                <h3>Cố Vấn Làm Đẹp</h3>
                <p>Tư vấn giải pháp làm đẹp phù hợp với từng khách hàng</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs; 