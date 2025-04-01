import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Modal, Button, Checkbox } from "antd";
import { RocketOutlined, ArrowRightOutlined } from '@ant-design/icons';
import servicesApi from "../api/servicesApi";
import surveyApi from "../api/surveyApi";
import "../styles/services.css";
import useAuth from "../hooks/useAuth";

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGoToTop, setShowGoToTop] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Check if we should show the survey popup when user auth state changes
  useEffect(() => {
    // Skip if already checking or user data isn't loaded
    if (checkingStatus) return;
    
    const checkSurveyStatus = async () => {
      try {
        setCheckingStatus(true);
        
        // First check if user has explicitly asked not to be reminded
        const dontRemind = localStorage.getItem("hideTestReminder");
        if (dontRemind === "true") {
          console.log("User opted out of survey reminders");
          return;
        }

        // Check local storage for a record of completed survey
        const hasTakenSurvey = localStorage.getItem("hasCompletedSurvey");
        if (hasTakenSurvey === "true") {
          console.log("User has completed survey according to local storage");
          return;
        }

        // Only check survey history if user is logged in
        if (user && user.token) {
          try {
            console.log("User is logged in, checking survey history");
            // Try the user history endpoint first
            try {
              const historyResponse = await surveyApi.getUserSurveyHistory();
              
              // If user has survey history, don't show the popup and record this
              if (historyResponse.data && historyResponse.data.length > 0) {
                console.log("User has completed survey before. Not showing popup.");
                localStorage.setItem("hasCompletedSurvey", "true");
                return;
              }
            } catch (historyError) {
              console.warn("Could not fetch survey history directly:", historyError);
              
              // Fallback: try to verify eligibility which is a less restricted endpoint
              try {
                const eligibilityResponse = await surveyApi.verifySurveyEligibility();
                if (eligibilityResponse.data && eligibilityResponse.data.hasTakenSurvey) {
                  console.log("User has taken survey according to eligibility check");
                  localStorage.setItem("hasCompletedSurvey", "true");
                  return;
                }
              } catch (eligibilityError) {
                console.warn("Could not verify survey eligibility:", eligibilityError);
              }
            }
          } catch (error) {
            // Only log the error, don't disrupt user experience
            console.warn("Survey status check failed:", error);
            
            // If we get a 401, token is invalid or expired - don't show popup
            if (error.response && error.response.status === 401) {
              return;
            }
          }
        }

        // If we passed all checks, show the popup
        console.log("Showing survey prompt popup");
        setShowPopup(true);
      } catch (error) {
        console.error("Error checking survey status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    // Only run if we have definitive information about the user's authentication state
    if (user !== undefined) {
      checkSurveyStatus();
    }
  }, [user]);

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await servicesApi.getAllServices();
        if (response.data?.success && Array.isArray(response.data.data)) {
          setServices(response.data.data);
          fetchServiceImages(response.data.data);
        } else if (Array.isArray(response.data)) {
          setServices(response.data);
          fetchServiceImages(response.data);
        } else {
          setError("Dữ liệu không hợp lệ.");
        }
      } catch (err) {
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

    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowGoToTop(true);
      } else {
        setShowGoToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBooking = (e) => {
    e.stopPropagation();
    navigate(user ? "/booking" : "/login?redirect=/booking");
  };

  const handleCardClick = (serviceId) => {
    navigate(`/servicesDetail/${serviceId}`);
  };

  const handleSkinCheck = () => {
    navigate("/survey");
  };

  const handleGoToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    if (dontShowAgain) {
      localStorage.setItem("hideTestReminder", "true");
    }
  };
  
  const handleStartTest = () => {
    handleClosePopup();
    navigate("/survey");
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

  const categoryNames = ["Dịch vụ cơ bản", "Dịch vụ nâng cao", "Chăm sóc đặc biệt", "Dịch vụ VIP"];
  const groupedServices = [];
  for (let i = 0; i < services.length; i += 3) {
    groupedServices.push(services.slice(i, i + 3));
  }

  return (
    <div className="services-page">
      {showPopup && (
        <Modal
          title="Nhắc nhở làm bài test da"
          open={showPopup}
          footer={null}
          onCancel={handleClosePopup}
          centered
        >
          <p>Hãy làm bài test da để nhận tư vấn tốt nhất cho bạn!</p>
          <div style={{ marginTop: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <Checkbox 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              >
                Không nhắc lại
              </Checkbox>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Button onClick={handleClosePopup}>Bỏ qua</Button>
              <Button type="primary" onClick={handleStartTest}>Bắt đầu</Button>
            </div>
          </div>
        </Modal>
      )}

      <div className="services-header">
        <h1>Dịch Vụ Của Chúng Tôi</h1>
        <p>Khám phá các dịch vụ chăm sóc da chuyên nghiệp của chúng tôi.</p>
      </div>

      <div className="survey-banner" onClick={handleSkinCheck}>
        <div className="banner-content">
          <div className="banner-icon">
            <RocketOutlined />
          </div>
          <h2>Khám Phá Làn Da Của Bạn</h2>
          <p>Chỉ mất 2 phút để hiểu rõ làn da của bạn và nhận tư vấn liệu trình phù hợp từ chuyên gia.</p>
          <div className="banner-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Phân tích chuyên sâu</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Tư vấn cá nhân hóa</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Giải pháp tối ưu</span>
            </div>
          </div>
          <button className="start-survey-btn">
            Bắt đầu ngay
            <ArrowRightOutlined className="btn-icon" />
          </button>
        </div>
        <div className="banner-image-container">
          <img 
            src="/images/skin-survey-banner.jpg" 
            alt="Khám phá làn da của bạn" 
            className="banner-image" 
          />
          <div className="image-overlay"></div>
        </div>
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

      {showGoToTop && (
        <div id="gototop" title="Lên đầu trang" onClick={handleGoToTop}>
          <span className="arrow-up">↑</span>
        </div>
      )}
    </div>
  );
};

export default Services;