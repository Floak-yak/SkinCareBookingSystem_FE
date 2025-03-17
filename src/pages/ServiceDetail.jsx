import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import '../styles/ServiceDetail.css';
import bookingApi from "../api/bookingApi"; // Import the booking API

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [serviceData, setServiceData] = useState(null);
  const carouselRef = React.useRef(null);

  useEffect(() => {
    fetch('/data/services.json')
      .then(response => response.json())
      .then(data => {
        if (data.services[id]) {
          setServiceData(data.services[id]);
        }
      })
      .catch(error => console.error('Error loading service data:', error));
  }, [id]);

  if (!serviceData) {
    return <div>Loading...</div>;
  }

  const handleBooking = async () => {
    try {
      await bookingApi.bookService(id);
      navigate('/booking', { 
        state: {
          serviceName: serviceData.serviceName,
          duration: serviceData.duration,
          price: serviceData.price
        }
      });
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error);
    }
  };

  const handleStepClick = (index) => {
    setCurrentStep(index);
    carouselRef.current.goTo(index);
  };

  return (
    <div className="service-detail">
      <div className="service-overview">
        <h1>Quy Trình Chăm Sóc Da Chuyên Nghiệp</h1>
        <p className="overview-description">
          Trải nghiệm quy trình chăm sóc da toàn diện với 6 bước chuẩn spa, 
          giúp làn da của bạn được chăm sóc một cách khoa học và hiệu quả nhất.
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
          prevArrow={<LeftOutlined />}
          nextArrow={<RightOutlined />}
        >
          {serviceData.steps.map((step, index) => (
            <div key={index} className="step-slide">
              <div className="step-content">
                <div className="step-image">
                  <img src={step.image} alt={step.title} />
                </div>
                <div className="step-info">
                  <h2>{step.title}</h2>
                  <p className="step-description">{step.description}</p>
                  <p className="step-duration">⏱ Thời gian: {step.duration}</p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <div className="steps-progress">
        {serviceData.steps.map((step, index) => (
          <div 
            key={index} 
            className={`progress-step ${index === currentStep ? 'active' : ''} 
              ${index < currentStep ? 'completed' : ''}`}
            onClick={() => handleStepClick(index)}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">
              <div>Bước {index + 1}</div>
              <div>{step.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="service-benefits">
        <h2>Lợi Ích Của Liệu Trình</h2>
        <ul>
          {serviceData.benefits.map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
      </div>

      <div className="booking-section">
        <button className="booking-button" onClick={handleBooking}>
          Đặt Lịch Ngay
        </button>
        <p className="price-info">
          Giá: {serviceData.price}
        </p>
      </div>
    </div>
  );
};

export default ServiceDetail;