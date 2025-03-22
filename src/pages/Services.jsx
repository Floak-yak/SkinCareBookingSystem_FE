import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import servicesApi from "../api/servicesApi";
import "../styles/services.css";
import useAuth from "../hooks/useAuth";

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await servicesApi.getAllServices();
        console.log("Dữ liệu API:", response.data);

        if (response.data?.success && Array.isArray(response.data.data)) {
          setServices(response.data.data);
          fetchServiceImages(response.data.data);
        } else if (Array.isArray(response.data)) {
          setServices(response.data);
          fetchServiceImages(response.data);
        } else {
          console.error("API không trả về mảng:", response.data);
          setError("Dữ liệu không hợp lệ.");
        }
      } catch (err) {
        console.error("Lỗi tải dịch vụ:", err);
        setError("Không thể tải danh sách dịch vụ.");
      } finally {
        setLoading(false);
      }
    };

    const fetchServiceImages = async (servicesList) => {
      const imageDataMap = {};
      await Promise.all(
        servicesList.map(async (service) => {
          if (service.imageId) {
            try {
              const response = await fetch(
                `https://localhost:7101/api/Image/GetImageById?imageId=${service.imageId}`
              );
              const imageData = await response.json();
              console.log(`Ảnh dịch vụ ${service.id}:`, imageData);

              if (imageData?.bytes) {
                imageDataMap[service.id] = `data:image/png;base64,${imageData.bytes}`;
              }
            } catch (error) {
              console.error(`Lỗi khi tải ảnh dịch vụ ${service.id}:`, error);
            }
          }
        })
      );
      setImageMap((prev) => ({ ...prev, ...imageDataMap }));
    };

    fetchServices();
  }, []);

  const handleBooking = (e) => {
    e.stopPropagation();
    navigate(user ? "/booking" : "/login?redirect=/booking");
  };

  const handleCardClick = (serviceId) => {
    console.log(`Chuyển đến chi tiết dịch vụ ID: ${serviceId}`);
    navigate(`/servicesDetail/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin tip="Đang tải dịch vụ...">
          <div style={{ minHeight: "200px" }}></div>
        </Spin>
      </div>
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!services.length) {
    return <p className="no-services">Không có dịch vụ nào.</p>;
  }

  // Chia dịch vụ thành 4 nhóm và đặt tên
  const categoryNames = ["Dịch vụ cơ bản", "Dịch vụ nâng cao", "Chăm sóc đặc biệt", "Dịch vụ VIP"];
  const groupedServices = [];
  for (let i = 0; i < services.length; i += 3) {
    groupedServices.push(services.slice(i, i + 3));
  }

  return (
    <div className="services-page">
      <div className="services-header">
        <h1>Dịch Vụ Của Chúng Tôi</h1>
        <p>Khám phá các dịch vụ chăm sóc da chuyên nghiệp của chúng tôi.</p>
      </div>
      {groupedServices.map((group, index) => (
        <div key={index} className="service-category">
          <h2 className="category-title">{categoryNames[index] || `Nhóm ${index + 1}`}</h2>
          <div className="services-container">
            {group.map((service) => (
              <div
                key={service.id}
                className={`service-item ${service.isPopular ? "popular" : ""}`}
                onClick={() => handleCardClick(service.id)}
              >
                {service.isPopular && <div className="popular-tag">Phổ Biến</div>}
                <img
                  src={imageMap[service.id] || "/images/default-placeholder.png"}
                  alt={service.serviceName}
                  className="service-image"
                  onError={(e) => (e.target.src = "/images/default-placeholder.png")}
                />
                <div className="service-info">
                  <h3 className="service-title">{service.serviceName}</h3>
                  <p className="service-description">{service.serviceDescription}</p>
                  <p className="service-price">
                    Giá: {service.price?.toLocaleString() || "Liên hệ"} VND
                  </p>
                  <p className="service-duration">
                    Thời gian: {service.workTime || "Không xác định"} phút
                  </p>
                </div>
                <div className="service-actions">
                  <button className="book-service-btn" onClick={handleBooking}>
                    Đặt lịch
                  </button>
                  <a href={`/servicesDetail/${service.id}`} className="view-details-btn">
                    Xem chi tiết
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Services;
