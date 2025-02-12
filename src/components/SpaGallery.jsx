
import React, { useState } from "react";
import "../styles/SpaGallery.css";

const SpaGallery = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const images = [
        {
            src: "https://idealtop.vn/wp-content/uploads/2021/08/nhung-yeu-to-quan-trong-khi-thiet-ke-khong-gian-spa-dep-chuyen-nghiep-3.jpg",
            title: "Không gian thư giãn 1",
            description: "Không gian yên tĩnh, thiết kế tinh tế với ánh sáng dịu nhẹ.",
        },
        {
            src: "https://img.freepik.com/premium-photo/large-white-vase-with-white-flowers-room-with-fireplace_1064589-258585.jpg?w=1060",
            title: "Không gian thư giãn 2",
            description: "Được trang trí với hoa và mùi hương dễ chịu.",
        },
        {
            src: "https://bongspa.vn/wp-content/uploads/2022/07/hinh-canh-spa-sang-trong-5okok.jpg",
            title: "Không gian thư giãn 3",
            description: "Phòng spa hiện đại, trang thiết bị cao cấp.",
        },
        {
            src: "https://gaspa.vn/wp-content/uploads/2021/11/web-3.jpg",
            title: "Không gian thư giãn 4",
            description: "Không gian riêng tư, lý tưởng để nghỉ ngơi và thư giãn.",
        },
    ];

    return (
        <div className="gallery">
            {images.map((item, index) => {
                const isHovered = hoveredIndex === index;
                const isShrink = hoveredIndex !== null && hoveredIndex !== index;

                return (
                    <div
                        key={index}
                        className={`gallery-item ${isHovered ? "expand" : isShrink ? "shrink" : "normal"}`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <img src={item.src} alt={item.title} />
                        <div className="overlay">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SpaGallery;
