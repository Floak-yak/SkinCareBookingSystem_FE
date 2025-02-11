import React from "react";
import "../styles/AboutUs.css";

const AboutUs = () => {
    const data = [
        {
            img: "https://rebibeauty.com/wp-content/uploads/2024/03/1-1.webp",
            title: "Natural Products",
            desc: "Chúng tôi sử dụng 100% dược mỹ phẩm tự nhiên, đảm bảo an toàn và phù hợp với mọi loại da.",
        },
        {
            img: "https://rebibeauty.com/wp-content/uploads/2024/03/2-1.webp",
            title: "Experienced Staff",
            desc: "Đội ngũ chuyên viên được đào tạo chuyên nghiệp, tận tâm và giàu kinh nghiệm.",
        },
        {
            img: "https://rebibeauty.com/wp-content/uploads/2024/03/3-1.webp",
            title: "Relaxing Space",
            desc: "Không gian thư giãn, ấm cúng, mang lại cảm giác thoải mái và dễ chịu nhất.",
        },
    ];

    return (
        <section className="about-section">
            <div className="about-container">
                <h2 className="about-title">Tại Sao Nên Chọn Rose Spa</h2>
                <div className="about-cards">
                    {data.map((item, index) => (
                        <div key={index} className="about-card">
                            <img src={item.img} alt={item.title} />
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
