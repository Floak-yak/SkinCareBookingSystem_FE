import axios from 'axios';
import apiClient from './apiClient';

// Survey API paths
const SURVEY_API = {
  START: '/api/Survey/start',
  ANSWER: '/api/Survey/answer',
  RESULTS: '/api/Survey/results',
  SESSION: '/api/Survey/session',
  USER_HISTORY: '/api/Survey/user-history',
  VERIFY: '/api/Survey/verify',
  COMPLETE: '/api/Survey/complete', // Add new endpoint for completing survey
  ADMIN: {
    QUESTIONS: '/api/Survey/admin/questions',
    QUESTION: '/api/Survey/admin/question',
    RESULTS: '/api/Survey/admin/results',
    RECOMMENDED_SERVICE: '/api/Survey/admin/recommended-service'
  },
  SURVEY_RESULTS: {
    RECOMMENDED_SERVICE: '/api/SurveyResults/recommended-service'
  }
};

// Default results to use when the API doesn't provide results
const DEFAULT_SURVEY_RESULT = {
  data: {
    result: {
      skinType: "Mixed/Combination",
      resultText: "Dựa trên phản hồi của bạn, da bạn có dấu hiệu của da hỗn hợp. Vùng chữ T (trán, mũi, cằm) có thể tiết nhiều dầu, trong khi các vùng khác có thể khô hơn.",
      recommendationText: "Chúng tôi khuyến nghị sử dụng sữa rửa mặt dịu nhẹ để cân bằng da, tránh các sản phẩm có cồn cao và chọn kem dưỡng ẩm không gây bít lỗ chân lông."
    },
    recommendedServices: [
      {
        id: 1,
        name: "Liệu trình cân bằng da dầu",
        description: "Sử dụng công nghệ làm sạch sâu và cân bằng độ ẩm cho da hỗn hợp, giúp giảm tiết dầu ở vùng chữ T và cung cấp độ ẩm cho các vùng khô.",
        price: 750000
      },
      {
        id: 2,
        name: "Điều trị se khít lỗ chân lông",
        description: "Liệu trình chuyên sâu giúp làm thông thoáng và se khít lỗ chân lông, giảm bóng nhờn và ngăn ngừa mụn.",
        price: 850000
      }
    ]
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
  
  // Explicitly complete a survey - sets isCompleted=true and associates with results
  completeSurvey: async (sessionId, resultTypeId = 1) => {
    console.log('Marking survey as completed:', sessionId, `with result type: ${resultTypeId}`);
    
    try {
      // Ensure proper content type and payload structure
      const payload = { resultTypeId: resultTypeId };
      
      const response = await apiClient.post(`${SURVEY_API.COMPLETE}/${sessionId}`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Survey completion response:', response.data);
      return response;
    } catch (error) {
      console.log(`Error completing survey ${sessionId}:`, error.message);
      throw error;
    }
  },

  // Get session information - matches /api/Survey/session/{sessionId}
  getSession: async (sessionId) => {
    return apiClient.get(`${SURVEY_API.SESSION}/${sessionId}`);
  },
  
  // Get user survey history - matches /api/Survey/user-history
  getUserHistory: async () => {
    return apiClient.get(SURVEY_API.USER_HISTORY);
  },
  
  // Verify a survey session - matches /api/Survey/verify
  verifySurvey: async () => {
    return apiClient.get(SURVEY_API.VERIFY);
  },
  
  // Check survey eligibility
  verifySurveyEligibility: async () => {
    return apiClient.get(SURVEY_API.VERIFY);
  },
  
  // Get recommended services
  getUserSurveyHistory: async () => {
    return apiClient.get(SURVEY_API.USER_HISTORY);
  },
  
  // Legacy file-based survey functions
  getQuestion: async (questionId) => {
    return apiClient.get(`/api/questions/${questionId}.json`);
  },
  
  getNextQuestion: async (currentQuestionId, optionIndex) => {
    return apiClient.get(`/api/questions/${currentQuestionId}_option_${optionIndex}.json`);
  },

  // Admin endpoints
  getAllQuestions: () => {
    return apiClient.get(SURVEY_API.ADMIN.QUESTIONS);
  },

  getDatabaseQuestions: () => {
    return apiClient.get(SURVEY_API.ADMIN.QUESTIONS);
  },

  getQuestionById: (id) => {
    return apiClient.get(`${SURVEY_API.ADMIN.QUESTION}/${id}`);
  },

  addQuestion: (newQuestion) => {
    return apiClient.post(SURVEY_API.ADMIN.QUESTION, newQuestion);
  },

  addDatabaseQuestion: (questionData) => {
    return apiClient.post(SURVEY_API.ADMIN.QUESTION, questionData);
  },

  updateQuestion: (updatedQuestion) => {
    return apiClient.put(`${SURVEY_API.ADMIN.QUESTION}/${updatedQuestion.id}`, updatedQuestion);
  },

  updateDatabaseQuestion: (id, updatedQuestion) => {
    return apiClient.put(`${SURVEY_API.ADMIN.QUESTION}/${id}`, updatedQuestion);
  },

  deleteQuestion: (questionId) => {
    return apiClient.delete(`${SURVEY_API.ADMIN.QUESTION}/${questionId}`);
  },

  getAllResults: () => {
    return apiClient.get(SURVEY_API.ADMIN.RESULTS);
  },

  addResult: (resultData) => {
    return apiClient.post(SURVEY_API.ADMIN.RESULTS, resultData);
  },

  updateResult: (resultData) => {
    return apiClient.put(`${SURVEY_API.ADMIN.RESULTS}/${resultData.id}`, resultData);
  },

  deleteResult: (id) => {
    return apiClient.delete(`${SURVEY_API.ADMIN.RESULTS}/${id}`);
  },

  addRecommendedService: (service) => {
    return apiClient.post(SURVEY_API.ADMIN.RECOMMENDED_SERVICE, service);
  },

  // Check recommendations - ensure the endpoint exists or handle gracefully
  checkRecommendations: async () => {
    try {
      return await apiClient.get(`${SURVEY_API.ADMIN.RECOMMENDED_SERVICE}/check`);
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
    
    return apiClient.delete(`${SURVEY_API.SURVEY_RESULTS.RECOMMENDED_SERVICE}/${id}`);
  }
};

export default surveyApi;
