import React, { useState, useEffect, useRef } from 'react';
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
  const { user } = useAuth();
  const fetchingRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    if (fetchingRef.current) return;

    const fetchResults = async () => {
      try {
        fetchingRef.current = true;
        
        const params = new URLSearchParams(location.search);
        const surveyId = params.get('id');

        if (!surveyId) {
          setError("Survey ID not found. Please complete the survey first.");
          setLoading(false);
          return;
        }

        console.log(`Attempting to fetch survey results (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
        
        // First explicitly ensure the survey is completed
        try {
          console.log('Making sure the survey is properly completed...');
          await surveyApi.completeSurvey(surveyId);
          console.log('Survey completion status updated successfully');
        } catch (completeError) {
          console.warn('Error completing survey:', completeError.message);
          // Continue anyway - it might already be completed
        }
        
        // Now fetch the results
        const response = await surveyApi.getSurveyResultDetails(surveyId);

        if (!response || !response.data) {
          throw new Error("Invalid response from server");
        }

        // Check if using default data (fallback case)
        if (response.statusText === 'OK (Generated)') {
          console.log('Warning: Using default survey data. This is fallback data, not real API results.');
        }

        // Process recommended services data
        const enrichedData = {
          ...response.data,
          recommendedServices: response.data.recommendedServices.map(service => ({
            id: service.id,
            name: service.name || 'Unknown Service',
            description: service.description || 'No description available',
            price: service.price || 0
          }))
        };

        setSurveyData(enrichedData);
        
        // Save the fact that the user has completed a survey
        localStorage.setItem("hasCompletedSurvey", "true");
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching survey results:", err);
        
        // If we haven't hit max retries yet, try again 
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying in 2 seconds... (${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchingRef.current = false;
          }, 2000);
          return;
        }
        
        setError("Failed to load survey results. Please try again later.");
        setLoading(false);
      } finally {
        fetchingRef.current = false;
      }
    };

    fetchResults();

    // Cleanup function
    return () => {
      fetchingRef.current = false;
    };
  }, [location.search, retryCount]);

  const handleBackToSurvey = () => {
    navigate('/survey');
  };

  const handleBookConsultation = () => {
    if (!user) {
      navigate('/login', { state: { from: '/services' } });
    } else {
      navigate('/services');
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    fetchingRef.current = false;
  };

  // Render the service card 
  const renderServiceCard = (service, index) => {
    return (
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
    );
  };

  if (loading) {
    return (
      <div className="survey-result-loading">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Đang phân tích kết quả...</p>
        {retryCount > 0 && <p>Đang thử lại lần {retryCount}/{MAX_RETRIES}...</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="survey-result-error">
        <FaExclamationTriangle size={50} />
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button className="primary-button" onClick={handleRetry}>
            Thử lại
          </button>
          <button className="secondary-button" onClick={handleBackToSurvey}>
            Quay lại khảo sát
          </button>
        </div>
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
              surveyData.recommendedServices.map((service, index) => renderServiceCard(service, index))
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