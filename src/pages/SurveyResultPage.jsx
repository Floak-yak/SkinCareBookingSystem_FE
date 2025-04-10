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

  // Process service recommendations to handle different data structures
  const processServiceRecommendations = (recommendations) => {
    if (!recommendations || !Array.isArray(recommendations)) return [];
    
    return recommendations
      .map(item => {
        // Check if we have a direct service item (instead of recommendation)
        const isDirectService = item.serviceName !== undefined && !item.service;
        
        if (isDirectService) {
          // This is a direct service object, not a recommendation
          return {
            id: item.id || 0,
            name: item.serviceName || item.name || `Service ${item.id}`,
            description: item.serviceDescription || item.description || "",
            price: typeof item.price === 'number' ? item.price : 0,
            imageId: item.imageId || item.id // Use imageId if available, fallback to id
          };
        } else {
          // Regular recommendation object with service property
          const serviceId = item.serviceId || item.id;
          
          // Process service object to ensure valid data
          if (item.service) {
            // Extract service data from recommendation
            return {
              id: serviceId || 0,
              name: item.service.name || item.service.serviceName || `Service ${serviceId}`,
              description: item.service.description || item.service.serviceDescription || "",
              price: typeof item.service.price === 'number' ? item.service.price : 0,
              imageId: item.service.imageId || serviceId
            };
          } else {
            // If no service object, use the item itself as service
            return {
              id: serviceId || 0,
              name: item.name || `Service ${serviceId}`,
              description: item.description || "",
              price: typeof item.price === 'number' ? item.price : 0,
              imageId: item.imageId || serviceId
            };
          }
        }
      })
      .filter(item => item && item.id > 0); // Keep only valid items
  };

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

        console.log("Fetching survey results with ID:", surveyId);
        let surveyResultData = null;
        let errorOccurred = false;
        
        // Try the primary endpoint
        try {
          const response = await surveyApi.getSurveyResults(surveyId); // Updated to use the new logic
          console.log("Survey results successfully retrieved:", response.data);
          surveyResultData = response.data;
        } catch (mainError) {
          console.error("Error with main endpoint:", mainError);
          errorOccurred = true;
          
          // Try the fallback endpoint
          try {
            console.log("Trying alternative endpoint with getSurveyResultDetails");
            const fallbackResponse = await surveyApi.getSurveyResultDetails(surveyId);
            console.log("Fallback survey results retrieved:", fallbackResponse.data);
            surveyResultData = fallbackResponse.data;
            errorOccurred = false;
          } catch (fallbackError) {
            console.error("Both endpoints failed:", fallbackError);
            throw new Error("Could not retrieve survey results from any endpoint");
          }
        }
        
        // Process the recommended services using our helper function
        const processedServices = processServiceRecommendations(
          surveyResultData?.recommendedServices || []
        );
        console.log("Processed recommended services:", processedServices);
        
        // Ensure recommended services are fully populated
        const enrichedData = {
          ...surveyResultData,
          recommendedServices: processedServices
        };

        // If there are no recommended services yet, add default ones based on skin type
        if (!enrichedData.recommendedServices || enrichedData.recommendedServices.length === 0) {
          const skinType = enrichedData.result?.skinType || "Không xác định";
          console.log("No recommended services found, adding default services for:", skinType);
          
          try {
            // Get default services using the enhanced function that will try multiple endpoints
            const defaultServices = await surveyApi.getDefaultServicesForSkinType(skinType);
            
            // Process these services through the same function to ensure consistent format
            enrichedData.recommendedServices = processServiceRecommendations(defaultServices);
            console.log("Added fallback services:", enrichedData.recommendedServices);
          } catch (servicesError) {
            console.error("Failed to get default services:", servicesError);
            
            // As a last resort, add some hardcoded services
            enrichedData.recommendedServices = [
              {
                id: 1,
                name: "Chăm sóc da cơ bản",
                description: "Liệu trình làm sạch và dưỡng ẩm cho mọi loại da",
                price: 450000,
                imageId: 1
              },
              {
                id: 2,
                name: `Liệu trình dành cho ${skinType}`,
                description: `Phương pháp điều trị phù hợp với ${skinType}`,
                price: 650000,
                imageId: 2
              }
            ];
            console.log("Added hardcoded services as last resort");
          }
        }

        setSurveyData(enrichedData);
        
        // Save the fact that the user has completed a survey
        localStorage.setItem("hasCompletedSurvey", "true");
        console.log("Survey completion status saved to localStorage");
        
        // Fetch images for each recommended service
        if (enrichedData.recommendedServices && enrichedData.recommendedServices.length > 0) {
          fetchServiceImages(enrichedData.recommendedServices);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching survey results:", err);
        setError("Failed to load survey results. Please try again later.");
        setLoading(false);
        
        // Hiển thị kết quả mặc định nếu không thể lấy được kết quả từ API
        showDefaultResults();
      }
    };
    
    const fetchServiceImages = async (services) => {
      const imageDataMap = {};
      
      try {
        await Promise.all(
          services.map(async (service) => {
            if (service.imageId) {
              try {
                console.log(`Fetching image for service ${service.id} with imageId ${service.imageId}`);
                
                // Sử dụng apiClient thay vì fetch API trực tiếp
                try {
                  const response = await surveyApi.getImageById(service.imageId);
                  
                  // Kiểm tra nếu response có định dạng đúng
                  if (response?.data?.bytes) {
                    imageDataMap[service.id] = `data:image/png;base64,${response.data.bytes}`;
                    console.log(`Successfully loaded image for service ${service.id}`);
                  } else {
                    console.warn(`Image data missing for service ${service.id}:`, response?.data);
                    // Sử dụng hình ảnh mặc định khi không có dữ liệu hình ảnh
                    imageDataMap[service.id] = '/assets/default-placeholder.png';
                  }
                } catch (apiError) {
                  console.warn(`Error using apiClient for service ${service.id}, trying direct fetch:`, apiError);
                  
                  // Dự phòng sử dụng fetch API
                  const fetchResponse = await fetch(
                    `https://localhost:7101/api/Image/GetImageById?imageId=${service.imageId}`,
                    {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                      },
                      // Thêm thời gian chờ tối đa để tránh request treo
                      signal: AbortSignal.timeout(5000)
                    }
                  );
                  
                  if (fetchResponse.ok) {
                    try {
                      // Đọc response text trước khi parse JSON để kiểm tra xem có dữ liệu không
                      const text = await fetchResponse.text();
                      
                      // Chỉ parse JSON nếu có dữ liệu
                      if (text && text.trim().length > 0) {
                        try {
                          const imageData = JSON.parse(text);
                          if (imageData?.bytes) {
                            imageDataMap[service.id] = `data:image/png;base64,${imageData.bytes}`;
                            console.log(`Successfully loaded image for service ${service.id} via fetch`);
                          } else {
                            console.warn(`Image bytes missing for service ${service.id}`);
                            imageDataMap[service.id] = '/assets/default-placeholder.png';
                          }
                        } catch (jsonError) {
                          console.error(`Invalid JSON for service ${service.id}:`, jsonError);
                          imageDataMap[service.id] = '/assets/default-placeholder.png';
                        }
                      } else {
                        console.warn(`Empty response for service ${service.id}`);
                        imageDataMap[service.id] = '/assets/default-placeholder.png';
                      }
                    } catch (textError) {
                      console.error(`Error reading response text for service ${service.id}:`, textError);
                      imageDataMap[service.id] = '/assets/default-placeholder.png';
                    }
                  } else {
                    console.warn(`Error fetching image for service ${service.id}: Status ${fetchResponse.status}`);
                    imageDataMap[service.id] = '/assets/default-placeholder.png';
                  }
                }
              } catch (error) {
                console.error(`Error loading image for service ${service.id}:`, error);
                imageDataMap[service.id] = '/assets/default-placeholder.png';
              }
            } else {
              console.warn(`No imageId provided for service ${service.id}`);
              imageDataMap[service.id] = '/assets/default-placeholder.png';
            }
          })
        );
      } catch (overallError) {
        console.error('Error in overall fetchServiceImages process:', overallError);
      }
      
      setImageMap((prev) => ({ ...prev, ...imageDataMap }));
    };

    // Hàm hiển thị kết quả mặc định khi không lấy được kết quả từ API
    const showDefaultResults = () => {
      const defaultData = {
        result: {
          skinType: "Da hỗn hợp",
          resultText: "Không thể tải kết quả từ server. Đây là kết quả mặc định, có thể không chính xác. Làn da của bạn có vẻ thuộc loại da hỗn hợp.",
          recommendationText: "Bạn nên sử dụng các sản phẩm dành cho da hỗn hợp và chăm sóc đặc biệt cho vùng chữ T."
        },
        recommendedServices: [
          {
            id: 1,
            name: "Điều trị da hỗn hợp",
            description: "Liệu pháp đặc biệt dành cho da hỗn hợp",
            price: 750000
          },
          {
            id: 2,
            name: "Chăm sóc da cơ bản",
            description: "Quy trình làm sạch và dưỡng ẩm cho mọi loại da",
            price: 500000
          }
        ]
      };
      
      setSurveyData(defaultData);
      console.log("Showing default survey results due to API error");
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
                          // Lưu URL hiện tại vào localStorage để sau khi đăng nhập có thể quay lại
                          const redirectUrl = `/servicesDetail/${service.id}`;
                          localStorage.setItem('authRedirectUrl', redirectUrl);
                          
                          // Chuyển hướng đến trang đăng nhập với state chứa URL cần chuyển hướng
                          navigate('/login', { 
                            state: { from: redirectUrl }
                          });
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