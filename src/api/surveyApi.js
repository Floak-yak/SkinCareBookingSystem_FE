import apiClient from './apiClient';

const surveyApi = {
  // File-based survey endpoints
  getQuestion: (questionId) => {
    return apiClient.get(`/api/Survey/question/${questionId}`);
  },

  getNextQuestion: (currentQuestionId, optionIndex) => {
    return apiClient.get(`/api/Survey/next`, {
      params: { currentQuestionId, optionIndex },
    });
  },

  updateQuestion: (updatedQuestion) => {
    return apiClient.post(`/api/Survey/update`, updatedQuestion);
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

  getSurveyResultDetails: (surveyId) => {
    return apiClient.get(`/api/Survey/db/results/${surveyId}`);
  },

  addRecommendedService: (service) => {
    return apiClient.post('/api/Survey/db/admin/recommended-service', service);
  },

  deleteRecommendedService: (id) => {
    return apiClient.delete(`/api/Survey/db/admin/recommended-service/${id}`);
  }
};

export default surveyApi;
