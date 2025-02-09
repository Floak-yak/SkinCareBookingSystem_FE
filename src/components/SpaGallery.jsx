
import React, { useState } from "react";

const SpaGallery = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const images = [
        {
            src: "https://idealtop.vn/wp-content/uploads/2021/08/nhung-yeu-to-quan-trong-khi-thiet-ke-khong-gian-spa-dep-chuyen-nghiep-3.jpg",
            title: "Không gian thư giãn 1",
            description: "Không gian yên tĩnh, thiết kế tinh tế với ánh sáng dịu nhẹ.",
        },
        {
            src: "https://images.unsplash.com/photo-1583416750470-965b2707b355?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzV8fGtoJUMzJUI0bmclMjBnaWFuJTIwc3BhfGVufDB8fDB8fHww",
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

    const galleryStyles = {
        display: "flex",
        gap: "10px",
        width: "90%",
        height: "500px",
        overflow: "hidden",
        margin: "0 auto 20px"
    };

    const itemStyles = (isHovered, isShrink) => ({
        flex: isHovered ? 7 : isShrink ? 1 : 4,
        transition: "flex 0.3s ease, transform 0.3s ease",
        borderRadius: "10px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        opacity: isShrink ? 0.6 : 1,
    });

    const imgStyles = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "transform 0.3s ease",
    };
    const overlayStyles = (isHovered) => ({
        position: "absolute",
        bottom: "0",
        left: "0",
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "10px",
        transition: "opacity 0.3s ease",
        opacity: isHovered ? 1 : 0,
    });

    const hoveredImgStyles = {
        transform: "scale(1.2)",
    };

    return (
        <div style={galleryStyles}>
            {images.map((item, index) => {
                const isHovered = hoveredIndex === index;
                const isShrink = hoveredIndex !== null && hoveredIndex !== index;

                return (
                    <div
                        key={index}
                        style={itemStyles(isHovered, isShrink)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <img
                            src={item.src}
                            alt={item.title}
                            style={{ ...imgStyles, ...(isHovered ? hoveredImgStyles : {}) }}
                        />
                        <div style={overlayStyles(isHovered)}>
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
