import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>Về Chúng Tôi</h1>
        <p>Chăm sóc sắc đẹp của bạn là sứ mệnh của chúng tôi</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Câu Chuyện Của Chúng Tôi</h2>
          <p>
            Được thành lập từ năm 2020, chúng tôi đã không ngừng nỗ lực để mang
            đến những dịch vụ chăm sóc da tốt nhất cho khách hàng. Với đội ngũ
            chuyên gia giàu kinh nghiệm và trang thiết bị hiện đại, chúng tôi cam
            kết mang đến trải nghiệm spa hoàn hảo.
          </p>
        </section>

        <section className="mission-section">
          <h2>Sứ Mệnh</h2>
          <p>
            Chúng tôi cam kết mang đến những dịch vụ chăm sóc da chất lượng cao,
            giúp khách hàng tự tin tỏa sáng với làn da khỏe mạnh và rạng rỡ.
          </p>
        </section>

        <section className="values-section">
          <h2>Giá Trị Cốt Lõi</h2>
          <ul>
            <li>Chất lượng dịch vụ hàng đầu</li>
            <li>Đội ngũ chuyên nghiệp</li>
            <li>Công nghệ hiện đại</li>
            <li>Sự hài lòng của khách hàng</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default About;
