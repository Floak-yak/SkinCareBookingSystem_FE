import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/SurveyResultPage.css';
import { FaCheck, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';
import surveyApi from '../api/surveyApi';
import useAuth from '../hooks/useAuth';

const SurveyResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [imageMap, setImageMap] = useState({});
  const { user } = useAuth(); // Use the authenticated user from context

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const surveyId = params.get('id');

        if (!surveyId) {
          setError("Survey ID not found. Please complete the survey first.");
          setLoading(false);
          return;
        }

        const response = await surveyApi.getSurveyResultDetails(surveyId);

        // Ensure recommended services are fully populated
        const enrichedData = {
          ...response.data,
          recommendedServices: response.data.recommendedServices.map(service => ({
            id: service.id,
            name: service.name || 'Unknown Service',
            description: service.description || 'No description available',
            price: service.price || 0,
            imageId: service.imageId || service.id // Use imageId if available, fallback to id
          }))
        };

        setSurveyData(enrichedData);
        
        // Save the fact that the user has completed a survey
        localStorage.setItem("hasCompletedSurvey", "true");
        console.log("Survey completion status saved to localStorage");
        
        // Fetch images for each recommended service
        fetchServiceImages(enrichedData.recommendedServices);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching survey results:", err);
        setError("Failed to load survey results. Please try again later.");
        setLoading(false);
      }
    };
    
    const fetchServiceImages = async (services) => {
      const imageDataMap = {};
      await Promise.all(
        services.map(async (service) => {
          if (service.imageId) {
            try {
              const response = await fetch(
                `https://localhost:7101/api/Image/GetImageById?imageId=${service.imageId}`
              );
              // Only try to parse JSON if response is ok
              if (response.ok) {
                try {
                  const imageData = await response.json();
                  if (imageData?.bytes) {
                    imageDataMap[service.id] = `data:image/png;base64,${imageData.bytes}`;
                  }
                } catch (jsonError) {
                  console.error(`Invalid JSON for service ${service.id}:`, jsonError);
                }
              } else {
                console.warn(`Error fetching image for service ${service.id}: Status ${response.status}`);
              }
            } catch (error) {
              console.error(`Error loading image for service ${service.id}:`, error);
            }
          }
        })
      );
      setImageMap((prev) => ({ ...prev, ...imageDataMap }));
    };

    fetchResults();
  }, [location.search]);

  const handleBackToSurvey = () => {
    navigate('/survey');
  };

  const handleBookConsultation = () => {
    if (!user) {
      // If user is not logged in, redirect to login page with return URL
      navigate('/login', { state: { from: '/services' } });
    } else {
      // If user is logged in, proceed to services page
      navigate('/services');
    }
  };

  if (loading) {
    return (
      <div className="survey-result-loading">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Đang phân tích kết quả...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="survey-result-error">
        <FaExclamationTriangle size={50} />
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button className="primary-button" onClick={handleBackToSurvey}>
          Quay lại khảo sát
        </button>
      </div>
    );
  }

  return (
    <div className="survey-result-container">
      <button className="back-button" onClick={handleBackToSurvey}>
        <FaArrowLeft /> Quay lại khảo sát
      </button>
      
      <div className="result-header">
        <h2>Kết Quả Phân Tích Da Của Bạn</h2>
        <p>Dựa trên câu trả lời của bạn, chúng tôi đã phân tích và đưa ra kết luận sau:</p>
      </div>
      
      <div className="result-card">
        <div className="skin-type-section">
          <h3>Loại Da Của Bạn</h3>
          <div className="skin-type-result">
            <div className="skin-type-icon">
              <FaCheck className="skin-type-check" />
            </div>
            <div className="skin-type-details">
              <h4>{surveyData?.result?.skinType}</h4>
              <p>{surveyData?.result?.resultText}</p>
            </div>
          </div>
        </div>

        <div className="recommendations-section">
          <h3>Khuyến Nghị Chăm Sóc Da</h3>
          <p className="recommendation-text">{surveyData?.result?.recommendationText}</p>
          
          <h3>Dịch Vụ Được Đề Xuất</h3>
          <div className="services-container">
            {surveyData?.recommendedServices && surveyData.recommendedServices.length > 0 ? (
              surveyData.recommendedServices.map((service, index) => (
                <div 
                  key={index} 
                  className="service-item"
                  onClick={() => {
                    if (!user) {
                      navigate('/login', { state: { from: `/servicesDetail/${service.id}` } });
                    } else {
                      navigate(`/servicesDetail/${service.id}`);
                    }
                  }}
                >
                  <div className="service-info">
                    <h3 className="service-title">{service.name}</h3>
                    <p className="service-description">{service.description}</p>
                    <p className="service-price">
                      Giá: {service.price?.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <div className="service-actions">
                    <button 
                      className="book-service-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!user) {
                          navigate('/login', { state: { from: '/booking' } });
                        } else {
                          navigate('/booking');
                        }
                      }}
                    >
                      Đặt lịch
                    </button>
                    <button 
                      className="view-details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!user) {
                          navigate('/login', { state: { from: `/servicesDetail/${service.id}` } });
                        } else {
                          navigate(`/servicesDetail/${service.id}`);
                        }
                      }}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-services">
                <p>Hiện tại chưa có dịch vụ được đề xuất cho loại da của bạn.</p>
                <p>Vui lòng đặt lịch tư vấn để nhận được gợi ý phù hợp nhất.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="book-consultation">
          <h3>Bạn Muốn Được Tư Vấn Chi Tiết Hơn?</h3>
          <p>Đặt lịch tư vấn với chuyên gia của chúng tôi để nhận được phương pháp điều trị phù hợp nhất.</p>
          <button 
            className="consultation-btn"
            onClick={handleBookConsultation}
          >
            Đặt Lịch Ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyResultPage;