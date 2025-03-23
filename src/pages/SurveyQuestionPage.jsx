import React, { useEffect, useState } from 'react';
import surveyApi from '../api/surveyApi';
import "../styles/SurveyQuestionPage.css";

const SurveyQuestionPage = () => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(''); // lưu mã câu hỏi hiện tại
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finished, setFinished] = useState(false);
  const [resultData, setResultData] = useState(null); // lưu dữ liệu kết luận

  // Lấy câu hỏi đầu tiên khi component mount
  useEffect(() => {
    const fetchInitialQuestion = async () => {
      try {
        const response = await surveyApi.startSurvey();
        setQuestionText(response.data.question);
        setOptions(response.data.options);
        // Giả sử câu hỏi đầu tiên luôn là Q1
        setCurrentQuestionId('Q1'); 
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialQuestion();
  }, []);

  // Xử lý khi người dùng chọn một option
  const handleOptionClick = async (index) => {
    try {
      setLoading(true);
      // Gọi API lấy câu hỏi tiếp theo dựa trên currentQuestionId và optionIndex
      const nextResponse = await surveyApi.getNextQuestion(currentQuestionId, index);
      const nextQuestionId = nextResponse.data.nextQuestionId;
      console.log('Current question ID:', currentQuestionId);
      
      // Nếu nextQuestionId bắt đầu bằng "RESULT_", coi đó là kết quả bài test
      if (nextQuestionId.startsWith("RESULT_")) {
        // Gọi API lấy kết luận chi tiết dựa trên nextQuestionId
        const conclusionResponse = await surveyApi.getQuestion(nextQuestionId);
        setResultData(conclusionResponse.data);
        setFinished(true);
      } else {
        // Nếu chưa kết thúc, lấy chi tiết câu hỏi tiếp theo
        const questionResponse = await surveyApi.getQuestion(nextQuestionId);
        setQuestionText(questionResponse.data.question);
        setOptions(questionResponse.data.options);
        setCurrentQuestionId(nextQuestionId);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Khi người dùng nhấn nút "Hoàn thành", reload trang
  const handleFinish = () => {
    window.location.reload();
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!questionText) {
    return <div>No question found.</div>;
  }

  return (
    <div className="survey-question-page">
      <h2>{questionText}</h2>
      <div className="options">
        {options.map((option, index) => {
          return (
            <button key={index} onClick={() => handleOptionClick(index)}>
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Popup kết quả xuất hiện khi survey hoàn thành */}
      {finished && resultData && (
        <div className="popup-overlay">
          <div className="popup">
            {/* Sử dụng white-space: pre-wrap để hiển thị \n dưới dạng ngắt dòng */}
            <p style={{ whiteSpace: 'pre-wrap' }}>{resultData.question.replace(/\\n/g, "\n")}</p>
            <div className="options">
              {resultData.options.map((option, index) => (
                <button key={index} onClick={handleFinish}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyQuestionPage;
