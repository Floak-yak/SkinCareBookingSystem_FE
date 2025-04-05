import axios from 'axios';
import apiClient from './apiClient';

const surveyApi = {
  // File-based survey endpoints
  getQuestion: (questionId) => {
    return apiClient.get(`/api/Survey/question/${questionId}`);
  },

  getAllQuestions: () => {
    return apiClient.get('/api/Survey/questions');
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
    return apiClient.get('/api/Survey/db/start');
  },

  answerQuestion: (sessionId, questionId, optionId) => {
    return apiClient.post('/api/Survey/db/answer', {
      sessionId,
      questionId,
      optionId
    });
  },

  getSurveyResults: (sessionId) => {
    return apiClient.get(`/api/Survey/db/results/${sessionId}`);
  },

  getUserSurveyHistory: () => {
    return apiClient.get('/api/Survey/db/user-history');
  },

  verifySurveyEligibility: () => {
    return apiClient.get('/api/Survey/db/verify');
  },

  // Admin endpoints
  getDatabaseQuestions: () => {
    return apiClient.get('/api/Survey/db/admin/questions');
  },

  getDatabaseQuestionById: (id) => {
    return apiClient.get(`/api/Survey/db/admin/question/${id}`);
  },

  addDatabaseQuestion: (question) => {
    return apiClient.post('/api/Survey/db/admin/question', question);
  },

  updateDatabaseQuestion: (id, question) => {
    return apiClient.put(`/api/Survey/db/admin/question/${id}`, question);
  },

  deleteDatabaseQuestion: (id) => {
    return apiClient.delete(`/api/Survey/db/admin/question/${id}`);
  },

  getAllResults: () => {
    return apiClient.get('/api/Survey/db/admin/results');
  },

  addResult: (resultData) => {
    return apiClient.post('/api/Survey/db/admin/results', resultData);
  },

  getSurveyResultDetails: (surveyId) => {
    return apiClient.get(`/api/Survey/db/results/${surveyId}`);
  },

  addRecommendedService: (service) => {
    return apiClient.post('/api/Survey/db/admin/recommended-service', service);
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
    return await axios.put(`/api/Survey/db/admin/results/${resultData.id}`, resultData);
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
};

export default surveyApi;
