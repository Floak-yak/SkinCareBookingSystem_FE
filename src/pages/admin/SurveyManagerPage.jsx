import React, { useEffect, useState } from 'react';
import surveyApi from '../../api/surveyApi';
import '../../styles/SurveyManagerPage.css';

const SurveyManagerPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    question: '',
    options: ''
  });

  // Lấy toàn bộ câu hỏi khi component mount
  useEffect(() => {
    fetchAllQuestions();
  }, []);

  const fetchAllQuestions = async () => {
    try {
      setLoading(true);
      const response = await surveyApi.getAllQuestions();
      const data = response.data;
      const questionArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      setQuestions(questionArray);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Xóa câu hỏi
  const handleDelete = async (questionId) => {
    if(window.confirm("Bạn có chắc muốn xóa câu hỏi này?")){
      try {
        await surveyApi.deleteQuestion(questionId);
        fetchAllQuestions();
      } catch(err) {
        console.error(err);
        alert("Có lỗi xảy ra khi xóa câu hỏi.");
      }
    }
  };

  // Chọn để sửa câu hỏi
  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setFormData({
      id: question.id,
      question: question.question,
      // Giả sử options được lưu dưới dạng mảng, chuyển thành chuỗi với định dạng: "Label1:NextId1, Label2:NextId2, ..."
      options: question.options.map(opt => `${opt.label}:${opt.nextId}`).join(', ')
    });
  };

  // Chuẩn bị form cho câu hỏi mới
  const handleAddNew = () => {
    setSelectedQuestion(null);
    setFormData({
      id: '',
      question: '',
      options: ''
    });
  };

  // Xử lý thay đổi form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý gửi form (thêm mới hoặc cập nhật)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chuyển chuỗi options thành mảng đối tượng
      // Giả sử format: "Option1:Q2A, Option2:Q2B, Option3:Q2C"
      const optionsArray = formData.options.split(',').map(item => {
        const parts = item.split(':');
        return {
          label: parts[0].trim(),
          nextId: parts[1].trim()
        };
      });
      const payload = {
        id: formData.id,
        question: formData.question,
        options: optionsArray
      };

      if(selectedQuestion) {
        // Cập nhật câu hỏi
        await surveyApi.updateQuestion(payload);
      } else {
        // Thêm câu hỏi mới
        await surveyApi.addQuestion(payload);
      }
      fetchAllQuestions();
      handleAddNew(); // Reset form
    } catch(err) {
      console.error(err);
      alert("Có lỗi xảy ra khi lưu câu hỏi.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="survey-manager-page">
      <h1>Quản Lý Câu Hỏi Survey</h1>
      <button onClick={handleAddNew}>Thêm Câu Hỏi Mới</button>
      
      <table className="questions-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nội Dung Câu Hỏi</th>
            <th>Đáp Án</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(q => (
            <tr key={q.id}>
              <td>{q.id}</td>
              <td>{q.question}</td>
              <td>
                {q.options && q.options.map((opt, idx) => (
                  <div key={idx}>
                    {opt.label} → {opt.nextId}
                  </div>
                ))}
              </td>
              <td>
                <button onClick={() => handleEdit(q)}>Sửa</button>
                <button onClick={() => handleDelete(q.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="question-form">
        <h2>{selectedQuestion ? "Chỉnh Sửa Câu Hỏi" : "Thêm Câu Hỏi Mới"}</h2>
        <form onSubmit={handleFormSubmit}>
          <div>
            <label>ID:</label>
            <input 
              type="text"
              name="id"
              value={formData.id}
              onChange={handleFormChange}
              disabled={selectedQuestion ? true : false}  // Không cho sửa ID khi đang cập nhật
              required
            />
          </div>
          <div>
            <label>Nội dung câu hỏi:</label>
            <input 
              type="text"
              name="question"
              value={formData.question}
              onChange={handleFormChange}
              required
            />
          </div>
          <div>
            <label>Đáp án (định dạng: Label:NextId, cách nhau bằng dấu phẩy):</label>
            <input 
              type="text"
              name="options"
              value={formData.options}
              onChange={handleFormChange}
              placeholder="Ví dụ: A. Option1:Q2A, B. Option2:Q2B"
              required
            />
          </div>
          <button type="submit">{selectedQuestion ? "Cập Nhật" : "Thêm"}</button>
        </form>
      </div>
    </div>
  );
};

export default SurveyManagerPage;
