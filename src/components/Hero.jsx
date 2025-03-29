import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/Hero.css';

const Hero = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleBookingClick = () => {
        if (user) {
            navigate('/booking');
        } else {
            navigate('/login?redirect=/booking');
        }
    };

    return (
        // <section className="hero">
        //     <div className="hero-overlay" />
        //     <div className="hero-content">
        //         <h1>Thiên đường thư giãn của bạn</h1>
        //         <p>Trải nghiệm dịch vụ spa cao cấp với công nghệ hàng đầu từ Châu Âu</p>
        //         <button onClick={handleBookingClick} className="cta-button">
        //             Đặt lịch ngay
        //         </button>
        //     </div>
        // </section>
        <section className="hero">
            <div className="hero-overlay" />
            <div className="particles" id="particles-js"></div>
            <div className="hero-content">
                <h1>Thiên đường thư giãn của bạn</h1>
                <p>Trải nghiệm dịch vụ spa cao cấp với công nghệ hàng đầu từ Châu Âu cùng đội ngũ chuyên gia giàu kinh nghiệm</p>
                <button onClick={handleBookingClick} className="cta-button">
                    Đặt lịch ngay
                    <span className="button-arrow"> →</span>
                </button>
            </div>
        </section>
    );
};

export default Hero;