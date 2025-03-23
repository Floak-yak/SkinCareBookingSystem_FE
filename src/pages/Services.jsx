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
          console.error(" API không trả về mảng:", response.data);
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

  return (
    <div className="services-page">
      <h1 className="title">Dịch Vụ Của Chúng Tôi</h1>
      <div className="services-container">
        {services.map((service) => (
          <div
            key={service.id}
            className="service-item"
            onClick={() => handleCardClick(service.id)}
          >
            <img
              src={imageMap[service.id] || "/images/default-placeholder.png"}
              alt={service.serviceName}
              className="service-image"
              onError={(e) => (e.target.src = "/images/default-placeholder.png")}
            />
            <h3 className="service-name">{service.serviceName}</h3>
            <p className="service-description">{service.serviceDescription}</p>
            <p className="service-price">
              Giá: {service.price?.toLocaleString() || "Liên hệ"} VND
            </p>
            <p className="service-duration">
              Thời gian: {service.workTime || "Không xác định"} phút
            </p>
            <button className="book-service-btn" onClick={handleBooking}>
              Đặt lịch
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
