import apiClient from "./apiClient";
import surveyApi from './surveyApi';

const servicesApi = {
  getAllServices: () => apiClient.get('/api/SkincareServices/GetServices'),
  
  getServiceById: (id) => {
    console.log(`Fetching service details for ID: ${id}`);
    
    // Danh sách các endpoints có thể
    const endpoints = [
      // Thử format ID phía parameter
      { url: `/api/SkincareServices/GetServiceById`, params: { id } },
      // Thử format ID phía URL
      { url: `/api/SkincareServices/${id}`, params: null },
      // Thử endpoint Services
      { url: `/api/Services/${id}`, params: null },
      // Thử endpoint thuần
      { url: `/api/Services`, params: { id } },
      // Thử endpoint SkincareServices thuần
      { url: `/api/SkincareServices`, params: { id } }
    ];
    
    // Hàm thử lần lượt từng endpoint
    const tryEndpoints = async (index = 0) => {
      if (index >= endpoints.length) {
        // Nếu đã thử tất cả endpoints và không thành công
        console.warn(`All endpoint attempts failed for service ID: ${id}`);
        
        // Nếu đây là ID từ danh sách dịch vụ khuyến nghị trong khảo sát
        // Có thể đó là một dịch vụ mẫu không có trong DB
        if (id >= 100 && id < 1000) {
          console.log(`ID ${id} appears to be a survey recommendation template ID. Using mock data.`);
          
          // Tìm dịch vụ mẫu từ tất cả các loại da
          const skinTypes = ["Da dầu", "Da khô", "Da hỗn hợp", "Da thường", "Da nhạy cảm", "Không xác định"];
          let mockService = null;
          
          for (const skinType of skinTypes) {
            const services = surveyApi.getDefaultServicesForSkinType(skinType);
            mockService = services.find(s => s.id == id); // Dùng == để so sánh khi id có thể là chuỗi
            if (mockService) break;
          }
          
          if (mockService) {
            console.log(`Found matching mock service for ID ${id}:`, mockService);
            return Promise.resolve({ data: mockService });
          }
        }
        
        // Nếu không tìm được dịch vụ mẫu, tạo một dịch vụ giả
        const mockService = {
          id: Number(id),
          name: `Dịch vụ #${id}`,
          description: "Không tìm thấy thông tin chi tiết. Vui lòng liên hệ nhân viên để biết thêm.",
          price: 0,
          imageId: null
        };
        
        console.log("Creating fallback mock service:", mockService);
        return Promise.resolve({ data: mockService });
      }
      
      const endpoint = endpoints[index];
      console.log(`Trying endpoint ${index + 1}/${endpoints.length}: ${endpoint.url}`);
      
      try {
        const response = endpoint.params 
          ? await apiClient.get(endpoint.url, { params: endpoint.params })
          : await apiClient.get(endpoint.url);
        
        console.log(`Endpoint ${index + 1} succeeded:`, response.data);
        return response;
      } catch (error) {
        console.warn(`Endpoint ${index + 1} failed with ${error.status || error.message || 'unknown error'}`);
        // Try the next endpoint
        return tryEndpoints(index + 1);
      }
    };
    
    // Bắt đầu quá trình thử các endpoints
    return tryEndpoints();
  },
  
  getServiceByName: (name) => apiClient.get(`/api/SkincareServices/GetServiceByName`, {
    params: { name }
  }),

  createService: (formData) =>
    apiClient.post("/api/SkincareServices/Create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  updateService: (id, formData) =>
    apiClient.put(`/api/SkincareServices/Update?id=${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteService: (id) => apiClient.delete(`/api/SkincareServices/Delete?id=${id}`),
  
  getImageById: (imageId) => {
    // Handle special case when imageId is a string identifier rather than a numeric ID
    if (typeof imageId === 'string' && isNaN(Number(imageId))) {
      console.log(`Image ID "${imageId}" is a string identifier, not an actual image ID.`);
      
      // Return a placeholder response that won't cause errors
      return Promise.resolve({
        data: {
          id: imageId,
          // No bytes, so the caller will use default images instead
          contentType: "image/jpeg",
          name: imageId
        }
      });
    }
    
    // Regular numeric imageId handling
    return apiClient.get(`/api/Image/GetImageById?imageId=${imageId}`)
      .catch(error => {
        console.warn(`Failed to load image ${imageId}:`, error);
        return Promise.resolve({ data: null }); // Return null data instead of throwing
      });
  }
};

export default servicesApi;
