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
};

export default surveyApi;
