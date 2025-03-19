import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spin } from "antd"; 
import servicesApi from "../api/servicesApi";
import "../styles/services.css";
import useAuth from "../hooks/useAuth";

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBooking = (e) => {
    e.stopPropagation();
    if (user) {
      navigate("/booking");
    } else {
      navigate("/login?redirect=/booking");
    }
  };

  const handleCardClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Hàm tiện ích lấy URL ảnh từ service:
   * - Ưu tiên service.imageBase64
   * - Tiếp đến service.image hoặc service.imageUrl
   * - Cuối cùng fallback "default-placeholder.png"
   */
  const getImageUrl = (service) => {
    if (service.imageBase64) {
      return `data:image/png;base64,${service.imageBase64}`;
    }

    if (service.image) {
      return service.image;
    }
    if (service.imageUrl) {
      return service.imageUrl;
    }
    return "/images/default-placeholder.png";
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await servicesApi.getAllServices();
        console.log("Dữ liệu API:", response.data); // 🟢 Debug toàn bộ dữ liệu

        // Nếu BE trả về dạng { success: true, data: [...] }
        // => setServices(response.data.data || []);
        // Nếu trả về mảng trực tiếp => setServices(response.data || []);
        setServices(response.data || []);
      } catch (err) {
        console.error("Lỗi tải dịch vụ:", err);
        setError("Không thể tải danh sách dịch vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // 1) Loading UI
  if (loading) {
    return (
      <div className="loading-container">
        <Spin tip="Đang tải dịch vụ..." />
      </div>
    );
  }

  // 2) Error UI
  if (error) {
    return <p className="error-message">{error}</p>;
  }

  // 3) Không có dịch vụ
  if (!services.length) {
    return <p className="no-services">Không có dịch vụ nào.</p>;
  }

  // 4) Hiển thị danh sách dịch vụ
  return (
    <div className="services-page">
      <h1 className="title">Dịch Vụ Của Chúng Tôi</h1>
      <div className="services-container">
        {services.map((service) => {
          const imageUrl = getImageUrl(service);

          return (
            <div
              key={service.id}
              className="service-item"
              onClick={() => navigate(`/services/${service.id}`)}
            >
              <img
                src={imageUrl}
                alt={service.serviceName}
                className="service-image"
                onError={(e) => {
                  // Nếu ảnh lỗi => hiển thị placeholder
                  e.target.onerror = null;
                  e.target.src = "/images/default-placeholder.png";
                }}
              />
              <h3 className="service-name">{service.serviceName}</h3>
              <p className="service-description">
                {service.serviceDescription}
              </p>
              <p className="service-price">
                Giá: {service.price?.toLocaleString() || "Liên hệ"} VND
              </p>
              <p className="service-duration">
                Thời gian: {service.workTime || "Không xác định"} phút
              </p>
              <button
                className="book-service-btn"
                onClick={(e) => {
                  // Chặn event nổi bọt để không trigger onClick của div
                  e.stopPropagation();
                  navigate(`/booking`);
                }}
              >
                Đặt lịch
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Services;
