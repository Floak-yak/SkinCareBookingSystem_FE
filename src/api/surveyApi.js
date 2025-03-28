import apiClient from './apiClient';

const surveyApi = {
  // Lấy câu hỏi dựa trên questionId
  getQuestion: (questionId) => {
    return apiClient.get(`/Survey/question/${questionId}`);
  },

  // Lấy câu hỏi tiếp theo dựa trên câu trả lời hiện tại
  getNextQuestion: (currentQuestionId, optionIndex) => {
    return apiClient.get(`/Survey/next`, {
      params: { currentQuestionId, optionIndex },
    });
  },

  // Kiểm tra xem câu hỏi có phải là câu hỏi cuối không
  isEndQuestion: (questionId) => {
    return apiClient.get(`/Survey/isEndQuestion/${questionId}`);
  },

  // Lấy tất cả các câu hỏi trong survey
  getAllQuestions: () => {
    return apiClient.get(`/Survey/all`);
  },

  // Cập nhật câu hỏi (sửa câu hỏi)
  updateQuestion: (updatedQuestion) => {
    return apiClient.put(`/Survey/update`, updatedQuestion);
  },

  // Thêm một câu hỏi mới
  addQuestion: (newQuestion) => {
    return apiClient.post(`/Survey/add`, newQuestion);
  },

  // Xóa một câu hỏi dựa trên questionId
  deleteQuestion: (questionId) => {
    return apiClient.delete(`/Survey/delete/${questionId}`);
  },

  // Bắt đầu survey (lấy câu hỏi đầu tiên)
  startSurvey: () => {
    return apiClient.get(`/Survey/start`);
  },

  // Bắt đầu survey (lấy câu hỏi đầu tiên) từ database
  startDatabaseSurvey: () => {
    return apiClient.get('/Survey/db/start');
  },

  // Trả lời câu hỏi trong survey từ database
  answerQuestion: (sessionId, questionId, optionId) => {
    return apiClient.post('/Survey/db/answer', {
      sessionId,
      questionId,
      optionId
    });
  },

  // Lấy kết quả survey từ database
  getSurveyResults: (sessionId) => {
    return apiClient.get(`/Survey/db/results/${sessionId}`);
  },

  // Lấy lịch sử survey của người dùng từ database
  getUserSurveyHistory: () => {
    return apiClient.get('/Survey/db/user-history');
  },

  // Lấy tất cả các câu hỏi từ database
  getDatabaseQuestions: () => {
    return apiClient.get('/Survey/db/admin/questions');
  },

  // Lấy câu hỏi từ database dựa trên id
  getDatabaseQuestionById: (id) => {
    return apiClient.get(`/Survey/db/admin/question/${id}`);
  },

  // Thêm câu hỏi mới vào database
  addDatabaseQuestion: (question) => {
    return apiClient.post('/Survey/db/admin/question', question);
  },

  // Cập nhật câu hỏi trong database
  updateDatabaseQuestion: (id, question) => {
    return apiClient.put(`/Survey/db/admin/question/${id}`, question);
  },

  // Xóa câu hỏi trong database dựa trên id
  deleteDatabaseQuestion: (id) => {
    return apiClient.delete(`/Survey/db/admin/question/${id}`);
  },

  // Lấy tất cả kết quả survey từ database
  getAllResults: () => {
    return apiClient.get('/Survey/db/admin/results');
  },

  // Lấy kết quả chi tiết cho trang kết quả survey
  getSurveyResultDetails: (surveyId) => {
    return apiClient.get(`/Survey/db/results/${surveyId}`);
  },

  // Lấy các sản phẩm được đề xuất dựa trên loại da
  getRecommendedProducts: (skinType) => {
    return apiClient.get(`/products/recommendations`, {
      params: { skinType }
    });
  },

  // Thêm dịch vụ được đề xuất mới vào database
  addRecommendedService: (service) => {
    return apiClient.post('/Survey/db/admin/recommended-service', service);
  },

  // Xóa dịch vụ được đề xuất trong database dựa trên id
  deleteRecommendedService: (id) => {
    return apiClient.delete(`/Survey/db/admin/recommended-service/${id}`);
  }
};

export default surveyApi;
