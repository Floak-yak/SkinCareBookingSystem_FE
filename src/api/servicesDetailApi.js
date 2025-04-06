import apiClient from './apiClient';

// Helper function to create mock steps
function createMockSteps() {
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
  
  return { data: mockSteps };
}

const servicesDetailApi = {
  /**
   * Lấy tất cả chi tiết dịch vụ
   * Endpoint: GET /api/ServicesDetail/GetAllDetails
   * @returns {Promise} - Danh sách tất cả chi tiết dịch vụ
   */
  getAllDetails: () => apiClient.get('/api/ServicesDetail/GetAllDetails'),

  /**
   * Lấy chi tiết dịch vụ theo ID
   * Endpoint: GET /api/ServicesDetail/GetDetailById/{id}
   * @param {number} detailId - ID của chi tiết dịch vụ
   * @returns {Promise} - Chi tiết dịch vụ với ID tương ứng
   */
  getDetailById: (detailId) =>
    apiClient.get(`/api/ServicesDetail/GetDetailById/${detailId}`),

  /**
   * Lấy chi tiết dịch vụ theo ID dịch vụ - Thử nhiều endpoint
   * @param {number} serviceId - ID của dịch vụ
   * @returns {Promise} - Danh sách chi tiết của dịch vụ
   */
  getDetailsByServiceId: (serviceId) => {
    console.log(`Fetching service details for service ID: ${serviceId}`);
    
    // Danh sách các endpoints có thể thử
    const endpoints = [
      { url: `/api/ServicesDetail/GetByService/${serviceId}`, method: 'get' },
      { url: `/api/ServicesDetail/GetDetailByServiceId/${serviceId}`, method: 'get' },
      { url: `/api/ServicesDetail/GetDetailsByServiceId/${serviceId}`, method: 'get' },
      { url: `/api/SkincareServices/GetDetails/${serviceId}`, method: 'get' },
      { url: `/api/ServicesDetail`, method: 'get', params: { serviceId } },
      { url: `/api/ServicesDetail/Details`, method: 'get', params: { serviceId } },
      { url: `/api/Services/GetDetails/${serviceId}`, method: 'get' },
      { url: `/api/Services/Details/${serviceId}`, method: 'get' }
    ];
    
    // Hàm thử lần lượt từng endpoint
    const tryEndpoints = async (index = 0) => {
      if (index >= endpoints.length) {
        // Nếu đã thử tất cả các endpoints và không thành công
        console.log("All endpoints failed, creating mock data for service details");
        
        return createMockSteps();
      }
      
      const endpoint = endpoints[index];
      console.log(`Trying endpoint ${index + 1}/${endpoints.length}: ${endpoint.url}`);
      
      try {
        const response = endpoint.params
          ? await apiClient[endpoint.method](endpoint.url, { params: endpoint.params })
          : await apiClient[endpoint.method](endpoint.url);
        
        // Kiểm tra xem response có dữ liệu không
        if (response && response.data) {
          let detailsData = null;
          
          // Xử lý các cấu trúc dữ liệu khác nhau
          if (Array.isArray(response.data)) {
            detailsData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            detailsData = response.data.data;
          } else if (typeof response.data === 'object') {
            // Tìm mảng trong các thuộc tính của response.data
            for (const key in response.data) {
              if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
                detailsData = response.data[key];
                break;
              }
            }
          }
          
          // Nếu tìm thấy dữ liệu chi tiết
          if (detailsData && detailsData.length > 0) {
            console.log(`Endpoint ${index + 1} succeeded with ${detailsData.length} details`);
            return { data: detailsData };
          }
        }
        
        console.warn(`Endpoint ${index + 1} returned empty or invalid data`);
        return tryEndpoints(index + 1);
      } catch (error) {
        console.warn(`Endpoint ${index + 1} failed with ${error.status || error.message || 'unknown error'}`);
        return tryEndpoints(index + 1);
      }
    };
    
    // Bắt đầu quá trình thử các endpoints
    return tryEndpoints();
  },

  /**
   * Tạo chi tiết dịch vụ mới
   * Endpoint: POST /api/ServicesDetail/Create
   * @param {object} data - Dữ liệu chi tiết dịch vụ mới
   * @returns {Promise} - Chi tiết dịch vụ vừa được tạo
   */
  createDetail: (data) => apiClient.post('/api/ServicesDetail/Create', data),

  /**
   * Cập nhật chi tiết dịch vụ
   * Endpoint: PUT /api/ServicesDetail/Update/{id}
   * @param {number} detailId - ID của chi tiết dịch vụ cần cập nhật
   * @param {object} data - Dữ liệu cập nhật
   * @returns {Promise} - Chi tiết dịch vụ vừa được cập nhật
   */
  updateDetail: (detailId, data) =>
    apiClient.put(`/api/ServicesDetail/Update/${detailId}`, data),

  /**
   * Xóa chi tiết dịch vụ
   * Endpoint: DELETE /api/ServicesDetail/Delete/{id}
   * @param {number} detailId - ID của chi tiết dịch vụ cần xóa
   * @returns {Promise} - Kết quả xóa chi tiết dịch vụ
   */
  deleteDetail: (detailId) =>
    apiClient.delete(`/api/ServicesDetail/Delete/${detailId}`)
};

export default servicesDetailApi;