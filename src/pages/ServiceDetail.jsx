import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Carousel, Steps, message, Spin } from "antd";
import servicesDetailApi from "../api/servicesDetailApi";
import servicesApi from "../api/servicesApi";
import apiClient from "../api/apiClient";
import useAuth from "../hooks/useAuth";

import "../styles/ServiceDetail.css";

const { Step } = Steps;

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const carouselRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [imageMap, setImageMap] = useState({});
  const [mainServiceImage, setMainServiceImage] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [service, setService] = useState(null);

  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        // Thay đổi endpoint để kiểm tra API của chúng ta thay vì /api/health
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        // Dùng API đang hoạt động thay vì /api/health
        await fetch('https://localhost:7101/api/SkincareServices/GetServices', {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        setIsOfflineMode(false);
      } catch (error) {
        console.log('Server connection check failed:', error);
        setIsOfflineMode(true);
        message.warning('Đang hiển thị ở chế độ ngoại tuyến', 3);
      }
    };
    
    checkServerConnection();
    
    const fetchServiceDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Making API request to get service with ID: ${id}`);
        const serviceResponse = await servicesApi.getServiceById(id);
        
        if (serviceResponse && serviceResponse.data) {
          setService(serviceResponse.data);
          setServiceData(serviceResponse.data);
          console.log("Service data loaded successfully:", serviceResponse.data);
          
          // Tạo dữ liệu các bước giả lập nếu không có bước thật
          const mockSteps = [
            {
              id: 1,
              title: "Làm sạch da",
              description: "Rửa sạch da và loại bỏ bụi bẩn, bã nhờn và trang điểm",
              duration: 10,
              priority: 1
            },
            {
              id: 2,
              title: "Tẩy tế bào chết",
              description: "Loại bỏ tế bào chết trên da giúp da sáng mịn",
              duration: 15,
              priority: 2
            },
            {
              id: 3,
              title: "Đắp mặt nạ",
              description: "Đắp mặt nạ dưỡng chất phù hợp với loại da",
              duration: 20,
              priority: 3
            },
            {
              id: 4,
              title: "Massage mặt",
              description: "Massage mặt giúp thư giãn và cải thiện tuần hoàn máu",
              duration: 15,
              priority: 4
            },
            {
              id: 5,
              title: "Đắp serum đặc trị",
              description: "Sử dụng serum đặc trị cho từng vấn đề da cụ thể",
              duration: 10,
              priority: 5
            },
            {
              id: 6,
              title: "Thoa kem dưỡng và chống nắng",
              description: "Hoàn thiện quy trình với kem dưỡng ẩm và kem chống nắng",
              duration: 5,
              priority: 6
            }
          ];
          
          // Fetch service details/steps data
          try {
            console.log(`Fetching details for service ID: ${id}`);
            
            // Sửa đổi cách lấy chi tiết dịch vụ
            // Đầu tiên thử với servicesDetailApi
            try {
              console.log("Trying to use servicesDetailApi.getDetailsByServiceId");
              const detailsResponse = await servicesDetailApi.getDetailsByServiceId(id);
              
              if (detailsResponse?.data) {
                // Xử lý các cấu trúc dữ liệu khác nhau
                let detailsData = null;
                
                if (Array.isArray(detailsResponse.data)) {
                  detailsData = detailsResponse.data;
                } else if (detailsResponse.data.data && Array.isArray(detailsResponse.data.data)) {
                  detailsData = detailsResponse.data.data;
                }
                
                if (detailsData && detailsData.length > 0) {
                  console.log("Found service details data from API:", detailsData);
                  setSteps(detailsData);
                  fetchStepImages(detailsData);
                  return; // Exit the function if we found data
                }
              }
            } catch (apiError) {
              console.warn("Error using servicesDetailApi:", apiError);
            }
            
            // Thử lấy dữ liệu chi tiết dịch vụ trực tiếp từ dữ liệu dịch vụ
            // Một số API có thể trả về chi tiết dịch vụ trực tiếp trong trường details hoặc steps
            if (serviceResponse.data.details || serviceResponse.data.steps) {
              const directDetails = serviceResponse.data.details || serviceResponse.data.steps;
              if (Array.isArray(directDetails) && directDetails.length > 0) {
                console.log("Using embedded service details:", directDetails);
                setSteps(directDetails);
                fetchStepImages(directDetails);
                return;
              }
            }
            
            // Nếu không có dữ liệu chi tiết thật, sử dụng dữ liệu giả lập
            console.log("No real details found, using mock data for service:", serviceResponse.data.name || serviceResponse.data.serviceName);
            setSteps(mockSteps);
            
          } catch (detailsError) {
            console.error("Error fetching service details:", detailsError);
            // Nếu có lỗi, sử dụng dữ liệu giả lập
            console.log("Using mock steps data due to error");
            setSteps(mockSteps);
          }

          // Improve image handling to prevent flickering
          if (serviceResponse.data.imageId) {
            try {
              let imageId = serviceResponse.data.imageId;
              
              // Check if the imageId is a string that's not a number
              if (typeof imageId === 'string' && isNaN(Number(imageId))) {
                console.log(`Image ID is a string: "${imageId}". Using appropriate handling.`);
                
                // For specific preset string IDs, map to known images or use placeholder
                if (imageId === 'default-sensitive-skin') {
                  console.log("Using sensitive skin default image.");
                  setMainServiceImage("/images/skin-types/sensitive-skin.jpg");
                  return;
                } else if (imageId === 'soothing-therapy') {
                  console.log("Using soothing therapy default image.");
                  setMainServiceImage("/images/services/soothing-therapy.jpg");
                  return;
                } else if (imageId.startsWith('default-') || imageId.includes('-mask') || imageId.includes('-therapy') || imageId.includes('-consultation')) {
                  // For other known patterns, use a default image pattern
                  const imagePath = `/images/services/${imageId}.jpg`;
                  console.log(`Using mapped default image: ${imagePath}`);
                  setMainServiceImage(imagePath);
                  return;
                } else {
                  // Use a completely generic fallback
                  console.log("Using generic service image placeholder");
                  setMainServiceImage("/images/service-placeholder.jpg");
                  return;
                }
              }
              
              // Only try to fetch the image if it's a numeric ID
              if (!isNaN(Number(imageId))) {
                console.log(`Fetching image with numeric ID: ${imageId}`);
                fetchServiceImage(imageId);
              }
            } catch (imageError) {
              console.error("Error with image handling:", imageError);
              // Use a safe fallback
              setMainServiceImage("/images/service-placeholder.jpg");
            }
          }
        } else {
          throw new Error("Received empty response from service API");
        }
      } catch (error) {
        console.log("Error loading main service:", error);
        
        // Kiểm tra nếu có service đã được truyền qua location state
        if (location.state && location.state.service) {
          console.log("Using service data from navigation state:", location.state.service);
          setService(location.state.service);
          setServiceData(location.state.service);
        } else {
          console.log("No service data available from navigation state, showing error");
          setError("Không thể tải thông tin dịch vụ. Vui lòng thử lại sau.");
        }
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
              // Sử dụng apiClient thay vì hard-coded URL
              const response = await servicesApi.getImageById(step.imageId);
              
              console.log(`Ảnh bước ${step.id}:`, response?.data);
              
              if (response?.data?.bytes) {
                imageDataMap[step.id] = `data:image/png;base64,${response.data.bytes}`;
              }
            } catch (error) {
              console.error(`Lỗi khi tải ảnh cho bước ${step.id}:`, error);
            }
          }
        })
      );
      setImageMap((prev) => ({ ...prev, ...imageDataMap }));
    };

    // Function to fetch main service image
    const fetchServiceImage = async (imageId) => {
      if (!imageId) return;
      try {
        const response = await servicesApi.getImageById(imageId);
        if (response?.data?.bytes) {
          setMainServiceImage(`data:image/png;base64,${response.data.bytes}`);
        }
      } catch (error) {
        console.error('Error loading service image:', error);
      }
    };

    fetchServiceDetails();
  }, [id, location]);

  if (loading) {
    return (
      <div className="service-loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px' 
      }}>
        <Spin size="large" /> {/* Bỏ tip để tránh warning */}
      </div>
    );
  }

  if (!serviceData) {
    return <div className="service-error">Dịch vụ không tồn tại hoặc đã bị xoá.</div>;
  }

  // Log the service data for debugging
  console.log('Rendering service data:', serviceData);
  console.log('Steps data:', steps);

  const handleBooking = () => {
    if (user) {
      // Extract data using helper functions to ensure we get the right values
      navigate("/booking", {
        state: {
          serviceName: getServiceName(),
          duration: getServiceDuration(),
          price: serviceData.price || 0,
        },
      });
    } else {
      navigate("/login?redirect=/booking"); 
    }
  };

  // Helper function to get service name based on data structure
  const getServiceName = () => {
    // Check for all possible field names
    if (serviceData.title) {
      return serviceData.title;
    } else if (serviceData.serviceName) {
      return serviceData.serviceName;
    } else if (serviceData.name) {
      return serviceData.name;
    }
    return "Dịch vụ chăm sóc da";
  };

  // Helper function to get service description
  const getServiceDescription = () => {
    // Check for all possible field names
    if (serviceData.description) {
      return serviceData.description;
    } else if (serviceData.serviceDescription) {
      return serviceData.serviceDescription;
    } else if (serviceData.detail) {
      return serviceData.detail;
    }
    return "Trải nghiệm quy trình chăm sóc da toàn diện với các bước chuẩn spa, giúp làn da của bạn được chăm sóc một cách khoa học và hiệu quả nhất.";
  };

  // Helper function to get service duration
  const getServiceDuration = () => {
    // Check for all possible field names
    if (serviceData.duration) {
      return serviceData.duration;
    } else if (serviceData.workTime) {
      return serviceData.workTime;
    } else if (serviceData.time) {
      return serviceData.time;
    }
    return ""; // If no duration available
  };

  // Helper function to get price - enhanced to handle all possible data formats
  const getPrice = () => {
    // Check if price exists and is a valid number
    if (serviceData) {
      const price = serviceData.price;
      
      // Make sure we log the price for debugging
      console.log('Raw price data:', price, typeof price);
      
      // Handle all possible cases
      if (price === null || price === undefined) {
        return `0 VNĐ`;
      } else if (typeof price === 'number') {
        return `${price.toLocaleString('vi-VN')} VNĐ`;
      } else if (typeof price === 'string' && !isNaN(Number(price))) {
        // If price is a numeric string, convert to number first
        return `${Number(price).toLocaleString('vi-VN')} VNĐ`;
      } else {
        // Fallback
        return `0 VNĐ`;
      }
    }
    return `0 VNĐ`;
  };

  // Helper function to get service benefits as an array
  const getServiceBenefits = () => {
    if (!serviceData) return [];
    
    // Check if benefits exists and is an array
    if (serviceData.benefits && Array.isArray(serviceData.benefits)) {
      return serviceData.benefits;
    } 
    
    // Check if benefits exists as a string (could be a JSON string)
    if (serviceData.benefits && typeof serviceData.benefits === 'string') {
      try {
        const parsedBenefits = JSON.parse(serviceData.benefits);
        if (Array.isArray(parsedBenefits)) {
          return parsedBenefits;
        }
      } catch (e) {
        // If it's not valid JSON, split by commas or new lines
        if (serviceData.benefits.includes(',')) {
          return serviceData.benefits.split(',').map(item => item.trim());
        } else if (serviceData.benefits.includes('\n')) {
          return serviceData.benefits.split('\n').map(item => item.trim());
        }
        // If it's just a single string, return it as a single-item array
        return [serviceData.benefits];
      }
    }  
    
    // Default benefits
    return [
      "Giúp làn da được chăm sóc toàn diện và chuyên nghiệp",
      "Loại bỏ bụi bẩn và tế bào chết trên da",
      "Cung cấp dưỡng chất thiết yếu cho da",
      "Cải thiện kết cấu và độ đàn hồi của da"
    ];
  };

  return (
    <div className="service-detail">
      {isOfflineMode && (
        <div className="offline-notice" style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ marginRight: '10px' }}>⚠️</span>
          Đang hiển thị ở chế độ ngoại tuyến. Một số thông tin có thể không đầy đủ.
        </div>
      )}

      {/* Thêm phần overview hiển thị thông tin chung về dịch vụ nhưng bỏ hình ảnh lớn */}
      <div className="service-overview">
        <h1>{getServiceName()}</h1>
        <p className="overview-description">{getServiceDescription()}</p>
        {/* Xóa bỏ đoạn code hiển thị hình ảnh mainServiceImage */}
      </div>

      {steps.length > 0 ? (
        <>
          <div className="steps-section">
            <h2 className="section-title">Quy Trình Thực Hiện</h2>
            <div className="steps-carousel">
              <Carousel
                ref={carouselRef}
                afterChange={setCurrentStep}
                autoplay={false} // Disable autoplay to prevent image flickering
                autoplaySpeed={8000} // Increase the time between slides if autoplay is enabled
                effect="fade"
                dots={true}
                arrows={true}
                // Thêm cấu hình này để khắc phục vấn đề aria-hidden
                accessibility={false}
                lazyLoad="ondemand" // Add lazy loading for better performance
                pauseOnHover={true} // Pause on hover for better user experience
              >
                {steps.map((step, index) => (
                  <div key={step.id} className="step-slide">
                    <div className="step-content">
                      <div className="step-image">
                        <img
                          src={imageMap[step.id] || "/images/default-placeholder.png"}
                          alt={step.title}
                          onError={(e) => {
                            console.log(`Failed to load image for step ${step.id}, using fallback`);
                            e.target.src = "/images/default-placeholder.png";
                            e.target.onerror = null; // Prevent infinite error loops
                          }}
                          style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </div>
                      <div className="step-info">
                        <h3 className="step-title">{step.title}</h3>
                        <p className="step-description">{step.description}</p>
                        <p className="step-duration">
                          <strong>Thời gian:</strong> {step.duration} phút
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>

              <Steps 
                current={currentStep} 
                onChange={(index) => {
                  setCurrentStep(index);
                  carouselRef.current?.goTo(index);
                }} 
                className="steps-progress"
              >
                {steps.map((step, index) => (
                  <Step 
                    key={step.id} 
                    title={`Bước ${index + 1}`} 
                    description={step.title} 
                    className="progress-step" 
                  />
                ))}
              </Steps>
            </div>
          </div>

          <div className="service-benefits">
            <h2 className="section-title">Lợi Ích Của Liệu Trình</h2>
            <ul className="benefits-list">
              {getServiceBenefits().map((benefit, index) => (
                <li key={index} className="benefit-item">{benefit}</li>
              ))}
            </ul>
          </div>

          <div className="booking-info">
            <div className="service-meta">
              {getServiceDuration() && (
                <p className="service-duration">
                  <strong>Thời gian:</strong> {getServiceDuration()} phút
                </p>
              )}
              <p className="service-price">
                <strong>Giá:</strong> {getPrice()}
              </p>
            </div>
            <div className="booking-action">
              <button className="booking-button" onClick={handleBooking}>
                Đặt Lịch Ngay
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="no-steps-message">
          <h2>Thông tin dịch vụ</h2>
          <p>{getServiceDescription()}</p>
          <div className="service-benefits">
            <h2 className="section-title">Lợi Ích Của Liệu Trình</h2>
            <ul className="benefits-list">
              {getServiceBenefits().map((benefit, index) => (
                <li key={index} className="benefit-item">{benefit}</li>
              ))}
            </ul>
          </div>
          <div className="booking-action centered">
            <button className="booking-button" onClick={handleBooking}>
              Đặt Lịch Ngay
            </button>
            <p className="service-price">
              <strong>Giá:</strong> {getPrice()}
            </p>
            <p className="service-duration">
              <strong>Thời gian:</strong> {getServiceDuration() || 'Liên hệ để biết thêm chi tiết'} phút
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
