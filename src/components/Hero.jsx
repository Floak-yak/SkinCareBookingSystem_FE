import React from 'react';
import '../styles/Hero.css';

const Hero = () => {
    return (

        <section className="hero">
            <div className="hero-overlay" />
            <div className="hero-content">
                <h1>Thiên đường thư giãn của bạn</h1>
                <p>Trải nghiệm dịch vụ spa cao cấp với công nghệ hàng đầu từ Châu Âu</p>
                <a href="/booking" className="cta-button">
                    Đặt lịch ngay
                </a>
            </div>
        </section>
    );
};

export default Hero;