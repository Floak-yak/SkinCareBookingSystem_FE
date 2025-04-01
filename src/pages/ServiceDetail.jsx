import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Carousel, Steps, message, Spin } from "antd";
import servicesDetailApi from "../api/servicesDetailApi";
import servicesApi from "../api/servicesApi";
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
  const [mainServiceImage, setMainServiceImage] = useState(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        console.log('Fetching service details for ID:', id);
        let serviceInfo = null;
        
        // First, try to get the main service data by ID
        try {
          // For numeric IDs, use the standard lookup
          console.log(`Making API request to: https://localhost:7101/api/SkincareServices/GetServiceById?id=${id}`);
          const serviceResponse = await servicesApi.getServiceById(id);
          console.log('Main service response:', serviceResponse);
          
          // Check if we have valid data in the response
          if (serviceResponse?.data) {
            // Sometimes the data may be directly in the response.data object
            if (serviceResponse.data.id || serviceResponse.data.serviceName || serviceResponse.data.name) {
              console.log('Service found directly in response.data:', serviceResponse.data);
              serviceInfo = {
                ...serviceResponse.data,
                price: typeof serviceResponse.data.price === 'number' 
                  ? serviceResponse.data.price 
                  : 0
              };
            }
            // Check if the data is nested in response.data.data (common pattern in APIs)
            else if (serviceResponse.data.data) {
              console.log('Service found in response.data.data:', serviceResponse.data.data);
              serviceInfo = {
                ...serviceResponse.data.data,
                price: typeof serviceResponse.data.data.price === 'number' 
                  ? serviceResponse.data.data.price 
                  : 0
              };
            }
            // If we have success flag but still can't find data in expected places
            else if (serviceResponse.data.success === false) {
              console.error('Service not found by ID:', serviceResponse?.data);
              await tryFallbackApis();
            }
            
            if (serviceInfo) {
              console.log('Properly formatted service data with price:', serviceInfo);
              setServiceData(serviceInfo);
              
              // Also fetch the image if available
              if (serviceInfo.imageId) {
                fetchServiceImage(serviceInfo.imageId);
              }
            }
          } else {
            console.error('Service response has no data:', serviceResponse);
            await tryFallbackApis();
          }
        } catch (serviceError) {
          console.error('Error loading main service:', serviceError);
          message.warning('Đang thử phương thức khác...');
          await tryFallbackApis();
        }
        
        // Helper function to try fallback APIs
        async function tryFallbackApis() {
          try {
            console.log('Trying to use the existing service data to display available information');
            
            // Since the fallback APIs are returning 404 errors, let's check if we already have some data
            // from the main API call that we can work with
            const mainResponse = await servicesApi.getServiceById(id);
            
            if (mainResponse?.data) {
              console.log('Re-checking main API response:', mainResponse.data);
              
              // The logs show we're getting data but incorrectly interpreting it as "not found"
              // Let's extract whatever data we can from the response
              let extractedData = null;
              
              // Try to get data directly from response.data
              if (mainResponse.data.id || mainResponse.data.serviceName || mainResponse.data.name) {
                extractedData = mainResponse.data;
              }
              // If not there, check response.data.data
              else if (mainResponse.data.data) {
                extractedData = mainResponse.data.data;
              }
              
              if (extractedData) {
                serviceInfo = {
                  ...extractedData,
                  price: typeof extractedData.price === 'number' 
                    ? extractedData.price 
                    : 0
                };
                
                console.log('Extracted service data:', serviceInfo);
                setServiceData(serviceInfo);
                
                if (serviceInfo.imageId) {
                  fetchServiceImage(serviceInfo.imageId);
                }
                
                return; // Exit the fallback function since we found data
              }
            }
            
            // If we couldn't extract data, inform the user
            console.error('No service data could be extracted');
            message.error('Không thể tìm thấy thông tin dịch vụ');
            setServiceData(null);
          } catch (fallbackError) {
            console.error('Error in fallback approach:', fallbackError);
            message.error('Không thể tải dữ liệu dịch vụ!');
            setServiceData(null);
          }
        }
        
        // Once we have attempted to load the service data, get the steps if we haven't already
        if (serviceInfo !== null && steps.length === 0) {
          try {
            const stepsResponse = await servicesDetailApi.getDetailsByServiceId(
              // Use serviceInfo.id for detail links, or the original id parameter for direct service IDs
              serviceInfo.id || id
            );
            console.log('Steps response:', stepsResponse);
            
            if (stepsResponse?.data?.success && Array.isArray(stepsResponse.data.data)) {
              setSteps(stepsResponse.data.data);
              await fetchStepImages(stepsResponse.data.data);
            } else {
              console.warn('No steps found or invalid steps data:', stepsResponse?.data);
              setSteps([]);
            }
          } catch (stepsError) {
            console.error('Error loading steps:', stepsError);
            message.warning('Không thể tải các bước dịch vụ.');
            setSteps([]);
          }
        }
      } catch (error) {
        console.error('Error loading service details:', error);
        message.error('Lỗi tải dữ liệu dịch vụ. Vui lòng thử lại!');
        setServiceData(null);
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
  }, [id, steps.length]);

  if (loading) {
    return <Spin size="large" className="service-loading" />;
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

  return (
    <div className="service-detail">
      {steps.length > 0 ? (
        <>
          <div className="steps-section">
            <h2 className="section-title">Quy Trình Thực Hiện</h2>
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
                          onError={(e) => e.target.src = "/images/default-placeholder.png"}
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
              {serviceData.benefits?.length > 0 ? (
                serviceData.benefits.map((benefit, index) => (
                  <li key={index} className="benefit-item">{benefit}</li>
                ))
              ) : (
                <li className="benefit-item">Giúp làn da được chăm sóc toàn diện và chuyên nghiệp.</li>
              )}
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
          <h2>Không có thông tin chi tiết về quy trình</h2>
          <p>Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết.</p>
          <div className="booking-action centered">
            <button className="booking-button" onClick={handleBooking}>
              Đặt Lịch Ngay
            </button>
            <p className="service-price">
              <strong>Giá:</strong> {getPrice()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
