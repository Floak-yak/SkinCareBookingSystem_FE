import axios from 'axios';
import apiClient from './apiClient';

const surveyApi = {
  // File-based survey endpoints
  getQuestion: (questionId) => {
    console.log("Getting question:", questionId);
    return apiClient.get(`/api/Survey/question/${questionId}`);
  },

  getAllQuestions: () => {
    console.log("Fetching all questions with updated endpoint");
    // Thay đổi từ /api/Survey/questions sang /api/Survey/admin/questions để phù hợp với cấu trúc API mới
    return apiClient.get('/api/Survey/admin/questions')
      .catch(error => {
        console.warn("Failed to fetch questions from updated endpoint, trying fallbacks:", error);
        // Thử với endpoint cũ nếu endpoint mới thất bại
        return apiClient.get('/api/Survey/questions')
          .catch(fallbackError => {
            console.warn("All endpoints failed, using mock data:", fallbackError);
            // Tạo dữ liệu mẫu nếu tất cả API calls đều thất bại
            return {
              data: [
                {
                  id: "Q1",
                  questionText: "Loại da của bạn là gì?",
                  options: [
                    { id: 1, text: "Da dầu" },
                    { id: 2, text: "Da khô" },
                    { id: 3, text: "Da hỗn hợp" },
                    { id: 4, text: "Da thường" }
                  ]
                },
                {
                  id: "Q2",
                  questionText: "Vấn đề da bạn đang gặp phải là gì?",
                  options: [
                    { id: 5, text: "Mụn" },
                    { id: 6, text: "Nám, tàn nhang" },
                    { id: 7, text: "Lão hóa" },
                    { id: 8, text: "Thâm mụn" }
                  ]
                }
              ]
            };
          });
      });
  },

  getNextQuestion: (currentQuestionId, optionIndex) => {
    return apiClient.get(`/api/Survey/next`, {
      params: { currentQuestionId, optionIndex },
    });
  },

  addQuestion: (newQuestion) => {
    return apiClient.post('/api/Survey/question', newQuestion);
  },

  updateQuestion: (updatedQuestion) => {
    return apiClient.post(`/api/Survey/update`, updatedQuestion);
  },

  deleteQuestion: (questionId) => {
    return apiClient.delete(`/api/Survey/question/${questionId}`);
  },

  // Database-backed survey endpoints
  startDatabaseSurvey: () => {
    console.log("Calling /api/Survey/start endpoint");
    return new Promise((resolve, reject) => {
      apiClient.get('/api/Survey/start')
        .then(response => {
          console.log("Survey start API response:", response);
          
          // If API returns success but empty options, add default options
          if (response?.data && (!response.data.options || !Array.isArray(response.data.options) || response.data.options.length === 0)) {
            console.log("API returned empty or invalid options, adding default options");
            
            // Add default options to the response
            response.data.options = [
              { id: 1, text: "Da dầu" },
              { id: 2, text: "Da khô" },
              { id: 3, text: "Da hỗn hợp" },
              { id: 4, text: "Da thường" }
            ];
          }
          
          resolve(response);
        })
        .catch(error => {
          console.error("Error in startDatabaseSurvey:", error);
          
          // Create mock response
          const mockResponse = {
            data: {
              sessionId: "mock-session-" + Math.random().toString(36).substr(2, 9),
              questionId: "Q1",
              question: "Loại da của bạn là gì?",
              options: [
                { id: 1, text: "Da dầu" },
                { id: 2, text: "Da khô" },
                { id: 3, text: "Da hỗn hợp" },
                { id: 4, text: "Da thường" }
              ]
            }
          };
          
          console.log("Using mock survey data due to API error:", mockResponse);
          resolve(mockResponse);
        });
    });
  },

  answerQuestion: (sessionId, questionId, optionId) => {
    console.log("Submitting answer:", { sessionId, questionId, optionId });
    
    // Sửa tên tham số từ selectedOptionId thành optionId theo yêu cầu của API
    const payload = {
      sessionId: sessionId,
      questionId: questionId,
      optionId: optionId
    };
    
    console.log("Final payload being sent to API:", payload);
    
    return apiClient.post('/api/Survey/answer', payload);
  },

  getSurveyResults: (sessionId) => {
    console.log("Getting results for session:", sessionId);
    return apiClient.get(`/api/Survey/results/${sessionId}`);
  },

  getUserSurveyHistory: () => {
    return apiClient.get('/api/Survey/db/user-history');
  },

  verifySurveyEligibility: () => {
    return apiClient.get('/api/Survey/db/verify');
  },

  // Admin endpoints
  getDatabaseQuestions: () => {
    console.log("Fetching admin questions from updated endpoint");
    return apiClient.get('/api/Survey/admin/questions');
  },

  getDatabaseQuestionById: (id) => {
    console.log(`Fetching admin question with ID ${id} from updated endpoint`);
    return apiClient.get(`/api/Survey/admin/question/${id}`);
  },

  addDatabaseQuestion: (question) => {
    console.log("Adding question via updated endpoint:", question);
    return apiClient.post('/api/Survey/admin/question', question);
  },

  updateDatabaseQuestion: (id, question) => {
    console.log(`Updating question ${id} via updated endpoint:`, question);
    return apiClient.put(`/api/Survey/admin/question/${id}`, question);
  },

  deleteDatabaseQuestion: (id) => {
    console.log(`Deleting question ${id} via updated endpoint`);
    return apiClient.delete(`/api/Survey/admin/question/${id}`);
  },

  getAllResults: () => {
    console.log("Fetching all survey results from updated endpoint");
    return apiClient.get('/api/Survey/admin/results');
  },

  addResult: (resultData) => {
    console.log("Adding result via available endpoint:", resultData);
    
    // Đảm bảo có ID (ngay cả khi là 0 cho kết quả mới)
    const dataWithId = {
      ...resultData,
      id: resultData.id || 0
    };
    
    // API chỉ hỗ trợ PUT /api/Survey/admin/results/{id} cho cả cập nhật và thêm mới
    // Khi id=0, nó sẽ tạo mới kết quả khảo sát
    console.log(`Using PUT /api/Survey/admin/results/${dataWithId.id} for adding new result`);
    return apiClient.put(`/api/Survey/admin/results/${dataWithId.id}`, dataWithId)
      .then(response => {
        console.log("Successfully added/updated result:", response);
        return response;
      })
      .catch(error => {
        console.error("Error adding result:", error);
        throw error;
      });
  },

  getSurveyResultDetails: (surveyId) => {
    console.log(`Fetching survey result details for ${surveyId} from updated endpoint`);
    return apiClient.get(`/api/Survey/results/${surveyId}`);
  },

  addRecommendedService: (service) => {
    console.log("Adding recommended service via updated endpoint:", service);
    // Thay đổi từ /api/Survey/db/admin/recommended-service sang /api/Survey/admin/recommended-service
    return apiClient.post('/api/Survey/admin/recommended-service', service)
      .catch(error => {
        console.warn("Failed with new endpoint, trying fallbacks:", error);
        
        // Thử với endpoint cũ nếu endpoint mới thất bại
        return apiClient.post('/api/Survey/db/admin/recommended-service', service)
          .catch(fallbackError => {
            console.warn("Failed with old endpoint, trying SurveyResults endpoint:", fallbackError);
            
            // Thử với endpoint khác nếu endpoint cũ cũng thất bại
            return apiClient.post('/api/SurveyResults/recommended-service', service);
          });
      });
  },

  getRecommendedServices: () => {
    console.log("Fetching recommended services from API");
    return apiClient.get('/api/SurveyResults/recommended-service')
      .then(response => {
        console.log("Raw API response:", response.data);
        if (response.data && response.data.data) {
          // Log the structure of the first item for debugging
          if (response.data.data.length > 0) {
            console.log("First recommendation structure:", JSON.stringify(response.data.data[0], null, 2));
            console.log("Service structure inside first item:", 
              response.data.data[0].service ? JSON.stringify(response.data.data[0].service, null, 2) : "No service data");
          }
        }
        return response;
      });
  },

  // Debug function to log existing recommendation data
  checkRecommendations: async () => {
    try {
      console.log("Fetching all recommended services...");
      const response = await apiClient.get('/api/SurveyResults/recommended-service');
      
      if (response.data && response.data.data) {
        const recommendations = response.data.data;
        console.log("Total recommendations:", recommendations.length);
        
        if (recommendations.length > 0) {
          console.log("=============================================");
          console.log("RECOMMENDED SERVICES DATA STRUCTURE:");
          console.log("=============================================");
          
          // Group by result ID for better visibility
          const byResult = {};
          recommendations.forEach(rec => {
            const resultId = rec.surveyResultId;
            if (!byResult[resultId]) {
              byResult[resultId] = [];
            }
            byResult[resultId].push(rec);
          });
          
          // Log data by result
          Object.keys(byResult).forEach(resultId => {
            console.log(`\nRESULT ID: ${resultId} - Has ${byResult[resultId].length} recommendations`);
            byResult[resultId].forEach((rec, index) => {
              console.log(`\n  RECOMMENDATION #${index + 1}:`);
              console.log(`  • Recommendation ID: ${rec.id}`);
              console.log(`  • Service ID: ${rec.serviceId}`);
              console.log(`  • Priority: ${rec.priority}`);
              
              if (rec.service) {
                console.log(`  • Service details:`);
                console.log(`    - Name: ${rec.service.name || "Unknown"}`);
                console.log(`    - Description: ${rec.service.description ? rec.service.description.substring(0, 50) + "..." : "None"}`);
                console.log(`    - Price: ${rec.service.price || 0} VND`);
              } else {
                console.log(`  • Service details: None (service data missing)`);
              }
            });
          });
          
          console.log("\n=============================================");
          console.log("END OF RECOMMENDATIONS DATA");
          console.log("=============================================");
        } else {
          console.log("No recommendations found in the database.");
        }
      }
      
      return response;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      throw error;
    }
  },

  deleteRecommendedService: (serviceId) => {
    // IMPORTANT: This function now uses serviceId for deletion, NOT recommendationId
    // Ensure serviceId is a valid number
    const id = Number(serviceId);
    if (isNaN(id)) {
      console.error(`Invalid service ID: ${serviceId}`);
      return Promise.reject(new Error(`Invalid service ID: ${serviceId}`));
    }
    
    console.log(`Making DELETE request to /api/SurveyResults/recommended-service/${id}`);
    console.log(`IMPORTANT: Using SERVICE ID (${id}) for deletion, not recommendation ID`);
    
    return apiClient.delete(`/api/SurveyResults/recommended-service/${id}`)
      .then(response => {
        console.log(`Successfully deleted service ${id}:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`Error deleting service ${id}:`, error);
        // Add more details to the error message for easier debugging
        if (error.response && error.response.status === 404) {
          throw new Error(`Service with ID ${id} not found. Check that you're using the correct service ID.`);
        }
        throw error;
      });
  },

  updateResult: async (resultData) => {
    console.log(`Updating result ${resultData.id} via updated endpoint:`, resultData);
    return await apiClient.put(`/api/Survey/admin/results/${resultData.id}`, resultData);
  },

  // Return raw recommendation data for debugging
  getRawRecommendations: async () => {
    try {
      console.log("Getting raw recommendation data directly from API");
      const response = await apiClient.get('/api/SurveyResults/recommended-service');
      console.log("FULL RAW RESPONSE:", response);
      
      // Show the exact data structure we're working with
      if (response.data && response.data.data && response.data.data.length > 0) {
        const firstItem = response.data.data[0];
        console.log("RAW DATA STRUCTURE OF FIRST ITEM:");
        console.log(JSON.stringify(firstItem, null, 2));
        console.log("EXAMPLE VALUES:");
        Object.keys(firstItem).forEach(key => {
          console.log(`${key}: ${JSON.stringify(firstItem[key])}`);
        });
      }
      
      return response;
    } catch (error) {
      console.error("Error in getRawRecommendations:", error);
      throw error;
    }
  },

  // Sửa lại API endpoint để phù hợp với backend mới
  startSurvey: () => {
    return apiClient.get('/api/Survey/start');
  },
  
  // Bổ sung các phương thức khác theo endpoints
  submitAnswer: (data) => {
    console.log("Submitting answer with flexible payload:", data);
    
    // Make a direct API call with the provided payload
    return apiClient.post('/api/Survey/answer', data);
  },
  
  getResults: (sessionId) => apiClient.get(`/api/Survey/results/${sessionId}`),
  
  getUserHistory: () => apiClient.get("/api/Survey/user-history"),
  
  verifySession: () => apiClient.get("/api/Survey/verify"),
  
  getSession: (sessionId) => {
    console.log("Getting session data:", sessionId);
    return apiClient.get(`/api/Survey/session/${sessionId}`);
  },
  
  // Admin APIs
  getAdminQuestions: () => apiClient.get("/api/Survey/admin/questions"),
  
  getAdminQuestion: (id) => apiClient.get(`/api/Survey/admin/question/${id}`),
  
  updateAdminQuestion: (id, data) => apiClient.put(`/api/Survey/admin/question/${id}`, data),
  
  deleteAdminQuestion: (id) => apiClient.delete(`/api/Survey/admin/question/${id}`),
  
  createAdminQuestion: (data) => apiClient.post("/api/Survey/admin/question", data),
  
  getAdminResults: () => apiClient.get("/api/Survey/admin/results"),
  
  createRecommendedService: (data) => apiClient.post("/api/Survey/admin/recommended-service", data),
  
  updateResults: (id, data) => apiClient.put(`/api/Survey/admin/results/${id}`, data),

  // Thêm fallbacks dùng mocks khi API không có sẵn
  getMockSurvey: () => {
    return {
      data: {
        sessionId: "mock-session-" + Math.random().toString(36).substr(2, 9),
        questions: [
          {
            id: 1,
            text: "Loại da của bạn là gì?",
            options: [
              { id: 1, text: "Da dầu" },
              { id: 2, text: "Da khô" },
              { id: 3, text: "Da hỗn hợp" },
              { id: 4, text: "Da thường" }
            ]
          },
          {
            id: 2,
            text: "Vấn đề da bạn đang gặp phải là gì?",
            options: [
              { id: 5, text: "Mụn" },
              { id: 6, text: "Nám, tàn nhang" },
              { id: 7, text: "Lão hóa" },
              { id: 8, text: "Thâm mụn" }
            ]
          },
          {
            id: 3,
            text: "Độ tuổi của bạn?",
            options: [
              { id: 9, text: "Dưới 20" },
              { id: 10, text: "20-30" },
              { id: 11, text: "30-40" },
              { id: 12, text: "Trên 40" }
            ]
          }
        ]
      }
    };
  },

  // Mock functions for fallback
  getMockQuestion: (questionId) => {
    const mockQuestions = {
      "Q1": {
        questionId: "Q1",
        question: "Loại da của bạn là gì?",
        options: [
          { id: 1, text: "Da dầu" },
          { id: 2, text: "Da khô" },
          { id: 3, text: "Da hỗn hợp" },
          { id: 4, text: "Da thường" }
        ]
      },
      "Q2": {
        questionId: "Q2",
        question: "Vấn đề da bạn đang gặp phải là gì?",
        options: [
          { id: 1, text: "Mụn" },
          { id: 2, text: "Nám, tàn nhang" },
          { id: 3, text: "Lão hóa" },
          { id: 4, text: "Thâm mụn" }
        ]
      },
      "Q3": {
        questionId: "Q3",
        question: "Độ tuổi của bạn?",
        options: [
          { id: 1, text: "Dưới 20" },
          { id: 2, text: "20-30" },
          { id: 3, text: "30-40" },
          { id: 4, text: "Trên 40" }
        ]
      }
    };
    
    return Promise.resolve({
      data: mockQuestions[questionId] || mockQuestions["Q1"]
    });
  },

  // Thêm hàm để lấy hình ảnh theo ID
  getImageById: (imageId) => {
    console.log(`Fetching image with ID: ${imageId}`);
    return apiClient.get(`/api/Image/GetImageById`, {
      params: { imageId }
    }).catch(error => {
      console.warn(`Error fetching image ID ${imageId}:`, error);
      throw error;
    });
  },

  // Thêm các phương thức dự phòng để đảm bảo khả năng tương thích ngược
  // Các phương thức này sẽ thử gọi API mới, nếu thất bại sẽ thử API cũ
  getQuestions: async () => {
    console.log("Attempting to fetch questions with fallbacks");
    try {
      // Thử gọi API mới trước
      const response = await apiClient.get('/api/Survey/admin/questions');
      return response;
    } catch (error) {
      console.warn("Failed with new endpoint, trying old endpoint");
      try {
        // Thử gọi API cũ nếu API mới thất bại
        const fallbackResponse = await apiClient.get('/api/Survey/db/admin/questions');
        return fallbackResponse;
      } catch (fallbackError) {
        console.warn("Failed with old admin endpoint, trying general endpoint");
        // Thử gọi endpoint questions thông thường
        return apiClient.get('/api/Survey/questions');
      }
    }
  },
};

export default surveyApi;
