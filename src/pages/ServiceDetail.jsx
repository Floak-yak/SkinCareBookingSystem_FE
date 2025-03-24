import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Carousel, Steps, message, Spin } from "antd";
import servicesDetailApi from "../api/servicesDetailApi";
import useAuth from "../hooks/useAuth";

import "../styles/ServiceDetail.css";

const { Step } = Steps;

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const carouselRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [serviceData, setServiceData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [imageMap, setImageMap] = useState({});

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [serviceResponse, stepsResponse] = await Promise.all([
          servicesDetailApi.getDetailById(id),
          servicesDetailApi.getDetailsByServiceId(id),
        ]);

        if (serviceResponse?.data?.success) {
          setServiceData(serviceResponse.data.data);
        } else {
          message.error("Không tìm thấy chi tiết dịch vụ!");
        }

        if (stepsResponse?.data?.success && Array.isArray(stepsResponse.data.data)) {
          setSteps(stepsResponse.data.data);
          await fetchStepImages(stepsResponse.data.data);
        } else {
          message.error("Không tìm thấy danh sách bước dịch vụ!");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        message.error("Lỗi tải dữ liệu dịch vụ. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    const fetchStepImages = async (steps) => {
      const imageDataMap = {};
      await Promise.all(
        steps.map(async (step) => {
          if (step.imageId) {
            try {
              const response = await fetch(`https://localhost:7101/api/Image/GetImageById?imageId=${step.imageId}`);
              const imageData = await response.json();
              console.log(`Ảnh bước ${step.id}:`, imageData);

              if (imageData?.bytes) {
                imageDataMap[step.id] = `data:image/png;base64,${imageData.bytes}`;
              }
            } catch (error) {
              console.error(`Lỗi khi tải ảnh cho bước ${step.id}:`, error);
            }
          }
        })
      );
      setImageMap((prev) => ({ ...prev, ...imageDataMap }));
    };

    fetchServiceDetails();
  }, [id]);

  if (loading) {
    return <Spin size="large" className="service-loading" />;
  }

  if (!serviceData) {
    return <div className="service-error">Dịch vụ không tồn tại hoặc đã bị xoá.</div>;
  }

  const handleBooking = () => {
    if (user) {
      navigate("/booking", {
        state: {
          serviceName: serviceData.title,
          duration: serviceData.duration,
          price: serviceData.price,
        },
      });
    } else {
      navigate("/login?redirect=/booking");
    }
  };

  return (
    <div className="service-detail">
      <div className="service-overview">
        <h1>Quy Trình Chăm Sóc Da Chuyên Nghiệp</h1>
        <p className="overview-description">
          Trải nghiệm quy trình chăm sóc da toàn diện với 6 bước chuẩn spa, giúp làn da của bạn được chăm sóc một cách khoa học và hiệu quả nhất.
        </p>
      </div>

      <div className="steps-carousel">
        <Carousel
          ref={carouselRef}
          afterChange={setCurrentStep}
          autoplay
          autoplaySpeed={5000}
          effect="fade"
          dots={true}
          arrows={true}
        >
          {steps.map((step, index) => (
            <div key={step.id} className="step-slide">
              <div className="step-content">
                <div className="step-image">
                  <img
                    src={imageMap[step.id] || "/images/default-placeholder.png"}
                    alt={step.title}
                  />
                </div>
                <div className="step-info">
                  <h2>{step.title}</h2>
                  <p className="step-description">{step.description}</p>
                  <p className="step-duration">Thời gian: {step.duration} phút</p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        <Steps current={currentStep} onChange={(index) => {
          setCurrentStep(index);
          carouselRef.current?.goTo(index);
        }} className="steps-progress">
          {steps.map((step, index) => (
            <Step key={step.id} title={`Bước ${index + 1}`} description={step.title} className="progress-step" />
          ))}
        </Steps>
      </div>

      <div className="service-benefits">
        <h2>Lợi Ích Của Liệu Trình</h2>
        <ul>
          {serviceData.benefits?.length > 0 ? (
            serviceData.benefits.map((benefit, index) => <li key={index}>{benefit}</li>)
          ) : (
            <li>Không có thông tin lợi ích.</li>
          )}
        </ul>
      </div>

      <div className="booking-section">
        <button className="booking-button" onClick={handleBooking}>Đặt Lịch Ngay</button>
        <p className="price-info">Giá: {serviceData.price ? `${serviceData.price.toLocaleString()} VND` : "Liên hệ"}</p>
      </div>
    </div>
  );
};

export default ServiceDetail;
