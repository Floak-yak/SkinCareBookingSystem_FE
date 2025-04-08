import axios from 'axios';
import apiClient from './apiClient';

// Updated the endpoint to use the correct URL with 'services' and dynamic skinType
const getDefaultServicesForSkinType = async (skinType) => {
  console.log(`Fetching recommended services for skin type: ${skinType}`);
  try {
    const skinTypeMap = {
      "Da dầu": "OILY",
      "Da khô": "DRY",
      "Da thường": "NORMAL",
      "Da hỗn hợp": "COMBINATION",
      "Da nhạy cảm": "SENSITIVE"
    };

    const skinTypeCode = skinTypeMap[skinType] || skinType;

    const response = await apiClient.get(`/api/SurveyResults/recommended-services/${skinTypeCode}`);

    // Check if response contains recommended services
    if (response.data && response.data.recommendedServices && Array.isArray(response.data.recommendedServices) && response.data.recommendedServices.length > 0) {
      return response.data.recommendedServices;
    }

    throw new Error("No recommended services found for the given skin type.");
  } catch (error) {
    console.error(`Error fetching services for skin type ${skinType}:`, error);
    return [];
  }
};

const surveyApi = {
  // File-based survey endpoints
  getQuestion: (questionId) => {
    console.log("Getting question:", questionId);
    return apiClient.get(`/api/Survey/question/${questionId}`);
  },
  SURVEY_RESULTS: {
    RECOMMENDED_SERVICE: '/api/SurveyResults/recommended-service'
  }
};

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
  status: 200,
  statusText: 'OK (Generated)'
};

const surveyApi = {
  // Start a new survey session - matches /api/Survey/start
  startSurvey: async () => {
    return apiClient.get(SURVEY_API.START);
  },
  
  // Answer a survey question - matches /api/Survey/answer
  answerQuestion: async (sessionId, questionId, optionId, isLastQuestion = false) => {
    console.log('Sending survey answer:', { sessionId, questionId, optionId, isLastQuestion });
    
    // Convert IDs to numbers if they're strings
    const payload = {
      sessionId: typeof sessionId === 'string' ? parseInt(sessionId, 10) : sessionId,
      questionId: typeof questionId === 'string' ? parseInt(questionId, 10) : questionId,
      optionId: typeof optionId === 'string' ? parseInt(optionId, 10) : optionId,
      isCompleted: isLastQuestion // Add completion flag for the last question
    };
    
    try {
      // Try with the converted numbers first
      return await apiClient.post(SURVEY_API.ANSWER, payload);
    } catch (error) {
      // If that fails, try with the original values
      if (error.response && error.response.status === 400) {
        console.log('First attempt failed, trying with original values');
        return apiClient.post(SURVEY_API.ANSWER, {
          sessionId,
          questionId,
          optionId,
          isCompleted: isLastQuestion // Include completion flag here too
        });
      }
      throw error;
    }
  },
  
  // Get survey results by session ID
  getSurveyResults: async (sessionId) => {
    console.log('Fetching survey results for session:', sessionId);
    
    try {
      // Try direct path with session ID first (most common API pattern)
      return await apiClient.get(`${SURVEY_API.RESULTS}/${sessionId}`);
    } catch (error) {
      console.log(`Error trying ${SURVEY_API.RESULTS}/${sessionId}:`, error.message);
      
      // If 404, endpoints don't exist - use default results
      if (error.response && (error.response.status === 404 || error.response.status === 400)) {
        console.log('Results endpoint not available, using default results');
        return DEFAULT_SURVEY_RESULT;
      }
      
      throw error;
    }
  },
  
  // Get detailed survey results for the results page
  getSurveyResultDetails: async (sessionId) => {
    console.log('Fetching detailed survey results for session:', sessionId);
    
    try {
      // First try to complete the survey if it's not already completed
      try {
        console.log('Attempting to mark survey as completed...');
        // Use the explicit completeSurvey function with proper headers
        await surveyApi.completeSurvey(sessionId);
        console.log('Survey marked as completed successfully');
      } catch (completeError) {
        // Log but continue - the survey might already be completed
        console.log('Note: Could not mark survey as completed:', completeError.message);
      }
      
      // Now try to get the results
      return await apiClient.get(`${SURVEY_API.RESULTS}/${sessionId}`);
    } catch (error) {
      console.log(`Error trying ${SURVEY_API.RESULTS}/${sessionId}:`, error.message);
      
      // Log more details about the error for debugging
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
      }
      
      // If 404 or 400, endpoints don't exist or there's an issue - use default results
      if (error.response && (error.response.status === 404 || error.response.status === 400)) {
        console.log('Results endpoint not available, using default results');
        return DEFAULT_SURVEY_RESULT;
      }
      
      throw error;
    }
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
    
    // Kiểm tra các tham số đầu vào và đảm bảo giá trị hợp lệ
    if (!sessionId) {
      console.error("Missing sessionId");
      return Promise.reject(new Error("Missing sessionId"));
    }
    
    if (questionId === undefined || questionId === null) {
      console.error("Missing questionId");
      return Promise.reject(new Error("Missing questionId"));
    }
    
    // Đảm bảo optionId không phải là undefined hoặc null
    if (optionId === undefined || optionId === null) {
      console.error("Missing optionId");
      return Promise.reject(new Error("Missing optionId"));
    }
    
    // Giữ nguyên giá trị optionId chính xác cho mỗi câu hỏi
    const payload = {
      sessionId: Number(sessionId),
      questionId: Number(questionId),
      optionId: optionId  // Giữ nguyên giá trị optionId
    };
    
    console.log("Sending answer with payload:", payload);
    return apiClient.post('/api/Survey/answer', payload)
      .catch(error => {
        console.error("Error submitting answer:", error);
        throw error;
      });
  },

  getSurveyResults: (sessionId) => {
    console.log("Getting results for session:", sessionId);
    return apiClient.get(`/api/Survey/session/${sessionId}`)
      .then(async response => {
        console.log("Session data received:", response.data);
        
        // Nếu session chưa hoàn thành nhưng có dữ liệu skinTypeScores, chuyển đổi thành định dạng kết quả
        if (response.data && response.data.skinTypeScores && Array.isArray(response.data.skinTypeScores) && response.data.skinTypeScores.length > 0) {
          console.log("Converting session data to results format");
          
          // Tìm loại da có điểm cao nhất
          let maxScore = -1;
          let dominantSkinType = "normal";
          
          response.data.skinTypeScores.forEach(item => {
            if (item.score > maxScore) {
              maxScore = item.score;
              dominantSkinType = item.skinTypeId;
            }
          });
          
          // Chuyển đổi skinTypeId thành tên người dùng thân thiện
          const skinTypeMap = {
            "OILY": "Da dầu",
            "DRY": "Da khô",
            "NORMAL": "Da thường",
            "COMBINATION": "Da hỗn hợp",
            "SENSITIVE": "Da nhạy cảm"
          };
          
          const friendlySkinType = skinTypeMap[dominantSkinType.toUpperCase()] || dominantSkinType;
          
          // Tạo danh sách dịch vụ đề xuất từ API dựa trên loại da
          const recommendedServices = await getDefaultServicesForSkinType(friendlySkinType);
          
          // Tạo đối tượng kết quả tự động từ dữ liệu phiên
          return {
            data: {
              sessionId: response.data.sessionId,
              completedDate: response.data.completedDate || new Date().toISOString(),
              result: {
                skinType: friendlySkinType,
                resultText: `Dựa trên câu trả lời của bạn, chúng tôi đánh giá bạn có ${friendlySkinType}.`,
                recommendationText: "Hãy tham khảo các dịch vụ phù hợp với loại da của bạn."
              },
              recommendedServices: recommendedServices
            }
          };
        }
        
        // Trả về dữ liệu phiên nguyên bản nếu không thể chuyển đổi
        return response;
      })
      .catch(error => {
        console.error("Error fetching session data:", error);
        // Thử lại với endpoint results nếu endpoint session không thành công
        return apiClient.get(`/api/Survey/results/${sessionId}`);
      });
  },

  getDatabaseQuestions: () => {
    return apiClient.get(SURVEY_API.ADMIN.QUESTIONS);
  },

  getQuestionById: (id) => {
    return apiClient.get(`${SURVEY_API.ADMIN.QUESTION}/${id}`);
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
    //return apiClient.get(`/api/SurveyResults/recommended-services/${skinType}`);
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

  addRecommendedService: (service) => {
    return apiClient.post(SURVEY_API.ADMIN.RECOMMENDED_SERVICE, service);
  },

  // Check recommendations - ensure the endpoint exists or handle gracefully
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
      } else {
        console.log("No recommendations found in the database.");
      }
      
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('Endpoint /api/Survey/admin/recommended-service/check not found. Skipping check.');
        return { message: 'Endpoint not found', status: 404 };
      }
      throw error;
    }
  },

  // Survey Results endpoints
  getRecommendedServices: () => {
    return apiClient.get(SURVEY_API.SURVEY_RESULTS.RECOMMENDED_SERVICE);
  },

  deleteRecommendedService: (serviceId) => {
    const id = Number(serviceId);
    if (isNaN(id)) {
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

  // Return raw recommendation data directly from API without manipulation
  getRawRecommendations: async () => {
    try {
      console.log("Getting raw recommendation data from API");
      const response = await apiClient.get('/api/SurveyResults/recommended-service');
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
    
    // Chuẩn hóa dữ liệu để đảm bảo định dạng đúng
    const normalizedData = {};
    
    // Copy dữ liệu ban đầu
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'optionId' && key !== 'selectedOptionId') {
        // Chuyển đổi sessionId và questionId sang số nếu có thể
        normalizedData[key] = !isNaN(Number(value)) && value !== '' ? Number(value) : value;
      } else {
        // Giữ nguyên giá trị optionId chính xác cho mỗi câu hỏi
        // Nhưng đảm bảo optionId là số hoặc chuỗi hợp lệ, không phải '0'
        normalizedData[key] = value === '0' ? 0 : value;
      }
    });
    
    console.log("Normalized payload for API:", normalizedData);
    
    // Tạo các phiên bản khác nhau của payload để thử
    const payloads = [
      // Payload chính với optionId nguyên gốc
      normalizedData,
      
      // Payload với sessionId và questionId là số, giữ nguyên optionId
      {
        sessionId: Number(normalizedData.sessionId),
        questionId: Number(normalizedData.questionId || normalizedData.question || 1),
        optionId: normalizedData.optionId || normalizedData.selectedOptionId
      },
      
      // Payload với trường selectedOptionId thay vì optionId
      {
        sessionId: Number(normalizedData.sessionId),
        questionId: Number(normalizedData.questionId || normalizedData.question || 1),
        selectedOptionId: normalizedData.optionId || normalizedData.selectedOptionId
      },
      
      // Thêm payload số 4 cho trường hợp optionId số
      {
        sessionId: Number(normalizedData.sessionId),
        questionId: Number(normalizedData.questionId || normalizedData.question || 1),
        optionId: Number(normalizedData.optionId || normalizedData.selectedOptionId || 0)
      }
    ];
    
    // Thử từng phiên bản payload một
    return new Promise((resolve, reject) => {
      const tryPayload = (index) => {
        if (index >= payloads.length) {
          // Trường hợp tất cả payload thất bại, thử gửi với optionId là 0 (số)
          const lastAttemptPayload = {
            sessionId: Number(normalizedData.sessionId),
            questionId: Number(normalizedData.questionId || normalizedData.question || 1),
            optionId: 0
          };
          
          console.log("Final attempt with optionId=0:", lastAttemptPayload);
          
          apiClient.post('/api/Survey/answer', lastAttemptPayload)
            .then(response => {
              console.log("Final attempt succeeded:", response.data);
              resolve(response);
            })
            .catch(finalError => {
              const errorMessage = "All payload formats failed for survey answer submission";
              console.error(errorMessage);
              reject(new Error(errorMessage));
            });
          return;
        }
        
        console.log(`Trying submitAnswer payload version ${index + 1}:`, payloads[index]);
        apiClient.post('/api/Survey/answer', payloads[index])
          .then(response => {
            console.log(`Payload version ${index + 1} succeeded:`, response.data);
            resolve(response);
          })
          .catch(error => {
            console.warn(`Payload version ${index + 1} failed:`, 
              error.response?.status, error.response?.data || error.message);
            tryPayload(index + 1);
          });
      };
      
      // Start trying payloads
      tryPayload(0);
    });
  },

  getResults: (sessionId) => {
    console.log("Fetching results with advanced error handling for session:", sessionId);
    
    // Thử phương thức đã được cải tiến
    return surveyApi.getSurveyResults(sessionId)
      .catch(async error => {
        console.error("Both endpoints failed for session results, using fallback:", error);
        
        // Nếu cả hai phương thức đều thất bại, cố gắng lấy dữ liệu session trực tiếp
        return apiClient.get(`/api/Survey/session/${sessionId}`)
          .then(async sessionResponse => {
            console.log("Retrieved raw session data:", sessionResponse.data);
            
            // Tạo đối tượng kết quả tối thiểu
            if (sessionResponse.data) {
              const skinTypeScores = sessionResponse.data.skinTypeScores || [];
              let skinType = "Không xác định";
              
              // Tìm loại da nếu có điểm số
              if (skinTypeScores.length > 0) {
                const maxScoreItem = skinTypeScores.reduce((max, item) => 
                  (item.score > max.score) ? item : max, { score: -1 });
                  
                const skinTypeMap = {
                  "OILY": "Da dầu",
                  "DRY": "Da khô", 
                  "NORMAL": "Da thường",
                  "COMBINATION": "Da hỗn hợp",
                  "SENSITIVE": "Da nhạy cảm"
                };
                
                skinType = skinTypeMap[maxScoreItem.skinTypeId?.toUpperCase()] || maxScoreItem.skinTypeId || "Không xác định";
              }
              
              // Tạo danh sách dịch vụ đề xuất từ API dựa trên loại da
              const recommendedServices = await getDefaultServicesForSkinType(skinType);
              
              return {
                data: {
                  sessionId: sessionResponse.data.sessionId,
                  result: {
                    skinType: skinType,
                    resultText: `Loại da của bạn: ${skinType}`,
                    recommendationText: "Dưới đây là các dịch vụ được đề xuất phù hợp với loại da của bạn."
                  },
                  recommendedServices: recommendedServices
                }
              };
            }
            
            throw new Error("Could not process session data");
          });
      });
  },

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

  // Export hàm getDefaultServicesForSkinType để có thể được sử dụng từ bên ngoài
  getDefaultServicesForSkinType,

  deleteOption: (questionId, optionId) => {
    console.log(`Deleting option with questionId: ${questionId}, optionId: ${optionId}`);
    return apiClient.delete(`/api/Survey/admin/question/${questionId}/option/${optionId}`);
  },
};

export default surveyApi;