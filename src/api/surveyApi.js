import axios from 'axios';
import apiClient from './apiClient';

// Hàm trợ giúp để lấy danh sách dịch vụ đề xuất mặc định dựa trên loại da
const getDefaultServicesForSkinType = (skinType) => {
  const defaultServices = {
    "Da dầu": [
      {
        id: 101,
        name: "Điều trị da dầu chuyên sâu",
        description: "Liệu trình giảm dầu nhờn, se khít lỗ chân lông và ngăn ngừa mụn",
        price: 650000,
        imageId: "default-oily-skin"
      },
      {
        id: 102,
        name: "Mặt nạ than hoạt tính",
        description: "Giúp hút dầu thừa, làm sạch sâu và thu nhỏ lỗ chân lông",
        price: 350000,
        imageId: "charcoal-mask"
      }
    ],
    "Da khô": [
      {
        id: 201,
        name: "Liệu pháp cấp ẩm chuyên sâu",
        description: "Phục hồi hàng rào bảo vệ da và cung cấp độ ẩm lâu dài",
        price: 700000,
        imageId: "default-dry-skin"
      },
      {
        id: 202,
        name: "Điều trị da khô nứt nẻ",
        description: "Nuôi dưỡng và phục hồi da bị tổn thương do thiếu ẩm",
        price: 450000,
        imageId: "hydration-therapy"
      }
    ],
    "Da hỗn hợp": [
      {
        id: 301,
        name: "Cân bằng da hỗn hợp",
        description: "Điều tiết vùng chữ T và cấp ẩm cho vùng da khô",
        price: 650000,
        imageId: "default-combination-skin"
      },
      {
        id: 302,
        name: "Mặt nạ cân bằng độ ẩm",
        description: "Phù hợp cho da hỗn hợp, cân bằng dầu và nước",
        price: 400000,
        imageId: "balance-mask"
      }
    ],
    "Da thường": [
      {
        id: 401,
        name: "Chăm sóc da cơ bản",
        description: "Duy trì làn da khỏe mạnh và ngăn ngừa lão hóa sớm",
        price: 550000,
        imageId: "default-normal-skin"
      },
      {
        id: 402,
        name: "Massage mặt thư giãn",
        description: "Kích thích tuần hoàn máu và làm săn chắc da mặt",
        price: 450000,
        imageId: "face-massage"
      }
    ],
    "Da nhạy cảm": [
      {
        id: 501,
        name: "Điều trị da nhạy cảm",
        description: "Sử dụng các sản phẩm dịu nhẹ, giảm kích ứng và đỏ da",
        price: 800000,
        imageId: "default-sensitive-skin"
      },
      {
        id: 502,
        name: "Liệu pháp làm dịu da",
        description: "Phục hồi hàng rào bảo vệ da và giảm thiểu các phản ứng mẫn cảm",
        price: 550000,
        imageId: "soothing-therapy"
      },
      {
        id: 503,
        name: "Tư vấn chăm sóc da nhạy cảm",
        description: "Tư vấn cá nhân hóa về cách chăm sóc và bảo vệ da nhạy cảm",
        price: 300000,
        imageId: "sensitive-consultation"
      }
    ],
    "Không xác định": [
      {
        id: 901,
        name: "Kiểm tra và phân tích da",
        description: "Đánh giá chuyên sâu về loại da và các vấn đề da mặt",
        price: 250000,
        imageId: "skin-analysis"
      },
      {
        id: 902,
        name: "Tư vấn dịch vụ phù hợp",
        description: "Tư vấn chuyên nghiệp về quy trình chăm sóc da phù hợp",
        price: 200000,
        imageId: "skin-consultation"
      }
    ]
  };

  // Trả về danh sách dịch vụ theo loại da hoặc mặc định nếu không tìm thấy
  return defaultServices[skinType] || defaultServices["Không xác định"];
};

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
      .then(response => {
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
          
          // Tạo danh sách dịch vụ đề xuất mặc định dựa trên loại da
          const defaultServices = getDefaultServicesForSkinType(friendlySkinType);
          
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
              recommendedServices: defaultServices
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
      } else {
        console.log("No recommendations found in the database.");
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
      .catch(error => {
        console.error("Both endpoints failed for session results, using fallback:", error);
        
        // Nếu cả hai phương thức đều thất bại, cố gắng lấy dữ liệu session trực tiếp
        return apiClient.get(`/api/Survey/session/${sessionId}`)
          .then(sessionResponse => {
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
              
              // Tạo danh sách dịch vụ đề xuất mặc định dựa trên loại da
              const defaultServices = getDefaultServicesForSkinType(skinType);
              
              return {
                data: {
                  sessionId: sessionResponse.data.sessionId,
                  result: {
                    skinType: skinType,
                    resultText: `Loại da của bạn: ${skinType}`,
                    recommendationText: "Dưới đây là các dịch vụ được đề xuất phù hợp với loại da của bạn."
                  },
                  recommendedServices: defaultServices
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
  getDefaultServicesForSkinType
};

export default surveyApi;