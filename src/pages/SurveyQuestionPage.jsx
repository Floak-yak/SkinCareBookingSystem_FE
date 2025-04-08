import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Card, Button, Result, List, Typography, Avatar, message } from 'antd';
import { CheckCircleOutlined, RightOutlined } from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import surveyApi from '../api/surveyApi';
import "../styles/SurveyQuestionPage.css";

const { Title, Paragraph, Text } = Typography;

const SurveyQuestionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // General state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Question flow state
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([]);
  
  // Result state
  const [finished, setFinished] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [recommendedServices, setRecommendedServices] = useState([]);

  // Start survey when component mounts
  useEffect(() => {
    startSurvey();
  }, []);

  // Sửa lại hàm startSurvey() tại dòng 43 để xử lý dữ liệu mock đúng cách

const startSurvey = async (retryCount = 0) => {
  try {
    setLoading(true);
    setError(null);
    
    // Gọi API để bắt đầu khảo sát
    try {
      const response = await surveyApi.startDatabaseSurvey();
      console.log("Survey API response:", response);
      console.log("Full API response data:", JSON.stringify(response.data));
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      // Cập nhật state với dữ liệu nhận được
      setSessionId(response.data.sessionId);
      
      // Xử lý cấu trúc nextQuestionData từ API version mới
      if (response.data.nextQuestionData) {
        setCurrentQuestionId(response.data.nextQuestionData.questionId);
        
        const questionTextValue = response.data.nextQuestionData.questionText || 
                               "Loại da của bạn là gì?";
        setQuestionText(questionTextValue);
        
        if (response.data.nextQuestionData.options && 
            Array.isArray(response.data.nextQuestionData.options) && 
            response.data.nextQuestionData.options.length > 0) {
          // Đảm bảo giữ nguyên ID option chính xác từ API
          const formattedOptions = response.data.nextQuestionData.options.map(o => ({
            id: o.id, // Giữ nguyên ID option từ API
            text: o.text
          }));
          
          console.log("Using exact option IDs from API:", formattedOptions);
          setOptions(formattedOptions);
        } else {
          console.warn("nextQuestionData contains no options, using defaults");
          setOptions([
            { id: 1, text: "Da dầu" },
            { id: 2, text: "Da khô" },
            { id: 3, text: "Da hỗn hợp" },
            { id: 4, text: "Da thường" }
          ]);
        }
      }
      // Fallback to direct options in the response
      else if (response.data.options && Array.isArray(response.data.options) && response.data.options.length > 0) {
        const formattedOptions = response.data.options.map(o => ({
          id: o.id, // Giữ nguyên ID option từ API
          text: o.text || o.optionText || o.label || "Option"
        }));
        
        console.log("Formatted options with exact IDs from API:", formattedOptions);
        setOptions(formattedOptions);
        
        // Cập nhật ID câu hỏi và nội dung
        setCurrentQuestionId(response.data.questionId || 1);
        
        const questionTextValue = response.data.question || 
                              response.data.questionText || 
                              response.data.text || 
                              "Loại da của bạn là gì?";
        setQuestionText(questionTextValue);
      } else {
        console.warn("API returned empty options or options in unexpected format");
        
        // Use default options when API doesn't provide any
        const defaultOptions = [
          { id: 1, text: "Da dầu" },
          { id: 2, text: "Da khô" },
          { id: 3, text: "Da hỗn hợp" },
          { id: 4, text: "Da thường" }
        ];
        
        console.log("Using default options:", defaultOptions);
        setOptions(defaultOptions);
        setCurrentQuestionId(1);
        setQuestionText("Loại da của bạn là gì?");
      }
      
      console.log("Current question ID set to:", response.data.nextQuestionData ? response.data.nextQuestionData.questionId : (response.data.questionId || 1));
    } catch (dbError) {
      console.warn('API error, using file-based fallback:', dbError);
      
      // Nếu API lỗi, sử dụng dữ liệu mock từ một hàm khác
      const mockData = {
        question: "Loại da của bạn là gì?",
        options: [
          { id: 1, text: "Da dầu" },
          { id: 2, text: "Da khô" },
          { id: 3, text: "Da hỗn hợp" },
          { id: 4, text: "Da thường" }
        ],
        questionId: "Q1"
      };
      
      setQuestionText(mockData.question);
      setOptions(mockData.options);
      setCurrentQuestionId(mockData.questionId || "Q1");
      setSessionId("mock-session-" + Math.random().toString(36).substr(2, 9));
    }
  } catch (err) {
    console.error('Error starting survey:', err);
    setError('Không thể bắt đầu khảo sát. Vui lòng thử lại sau.');
  } finally {
    setLoading(false);
  }
};

// Thay thế hàm handleOptionClick hiện tại:

const handleOptionClick = async (optionId, optionIndex) => {
  try {
    setLoading(true);
    
    // Khai báo biến response ở đây - đây là phần quan trọng để sửa lỗi
    let response = null;
    
    if (sessionId) {
      // Ghi log dữ liệu đang gửi đi để debug
      console.log('Sending answer to API:', {
        sessionId,
        questionId: currentQuestionId,
        optionId: optionId // Sử dụng đúng ID option từ API
      });
      
      try {
        // Gọi API answer với optionId chính xác từ API
        response = await surveyApi.answerQuestion(sessionId, currentQuestionId, optionId);
        console.log('API answer response:', response.data);
      } catch (firstAttemptError) {
        console.error('Lỗi khi gửi payload đầu tiên:', firstAttemptError);
        
        // Thử với định dạng payload thay thế
        try {
          console.log('Thử với format payload thứ hai (optionId)...');
          response = await surveyApi.submitAnswer({
            sessionId: sessionId,
            questionId: currentQuestionId,
            optionId: optionId // Giữ nguyên ID chính xác
          });
          console.log('API answer response (lần thử 2):', response.data);
        } catch (secondAttemptError) {
          console.error('Lỗi khi gửi payload thứ hai:', secondAttemptError);
          
          // Thử với định dạng string IDs
          try {
            console.log('Thử với IDs dạng string...');
            response = await surveyApi.submitAnswer({
              sessionId: sessionId.toString(),
              questionId: currentQuestionId.toString(),
              selectedOptionId: optionId.toString()
            });
            console.log('API answer response (lần thử 3):', response.data);
          } catch (thirdAttemptError) {
            console.error('Tất cả các lần thử đều thất bại:', thirdAttemptError);
            throw thirdAttemptError;
          }
        }
      }
      
      // Nếu đến đây thì API đã trả về response thành công
      if (response && response.data) {
        // Kiểm tra nếu khảo sát đã hoàn thành (isCompleted hoặc isResult = true)
        if (response.data.isCompleted || response.data.isResult) {
          console.log('Khảo sát đã hoàn thành, đang lấy kết quả...');
          
          try {
            // Lấy kết quả khảo sát từ API results
            const resultsResponse = await surveyApi.getSurveyResults(sessionId);
            console.log('Kết quả khảo sát:', resultsResponse.data);
            
            // Cập nhật state với kết quả
            if (resultsResponse.data.result) {
              setResultData({
                skinType: resultsResponse.data.result.skinType || "Không xác định",
                resultText: resultsResponse.data.result.resultText || "Không đủ dữ liệu để phân tích loại da.",
                recommendationText: resultsResponse.data.result.recommendationText || "Vui lòng liên hệ với chúng tôi để được tư vấn cụ thể hơn."
              });
              
              // Lấy thông tin về các dịch vụ đề xuất (nếu có)
              if (resultsResponse.data.recommendedServices) {
                setRecommendedServices(resultsResponse.data.recommendedServices);
              }
            } else {
              console.warn('Không tìm thấy kết quả trong response');
              throw new Error('Không có kết quả khảo sát');
            }
            
            setFinished(true);
            
            // Thông báo cho người dùng trước khi chuyển trang
            message.success('Khảo sát đã hoàn thành. Đang chuyển đến trang kết quả...', 2, () => {
              // Chuyển trang sau khi hiện thông báo
              navigate(`/survey-results?id=${sessionId}`);
            });
          } catch (resultsError) {
            console.error('Lỗi khi lấy kết quả khảo sát:', resultsError);
            
            // Hiện cảnh báo và không chuyển trang ngay
            message.warning('Không thể tải kết quả khảo sát. Đang thử phương pháp khác...', 2);
            
            // Thử với session API
            setTimeout(async () => {
              try {
                const sessionResponse = await surveyApi.getSession(sessionId);
                console.log('Session data:', sessionResponse.data);
                
                // Tìm loại da có điểm cao nhất
                if (sessionResponse.data.skinTypeScores && 
                    Array.isArray(sessionResponse.data.skinTypeScores) && 
                    sessionResponse.data.skinTypeScores.length > 0) {
                  
                  let maxScore = -1;
                  let dominantSkinType = "normal";
                  
                  sessionResponse.data.skinTypeScores.forEach(item => {
                    if (item.score > maxScore) {
                      maxScore = item.score;
                      dominantSkinType = item.skinTypeId;
                    }
                  });
                  
                  // Chuyển skinTypeId sang tên thân thiện hơn
                  const skinTypeMap = {
                    oily: "Da dầu",
                    dry: "Da khô",
                    normal: "Da thường",
                    combination: "Da hỗn hợp", 
                    sensitive: "Da nhạy cảm"
                  };
                  
                  setResultData({
                    skinType: skinTypeMap[dominantSkinType] || dominantSkinType,
                    resultText: `Dựa trên câu trả lời của bạn, chúng tôi đánh giá bạn có ${skinTypeMap[dominantSkinType] || dominantSkinType}.`,
                    recommendationText: "Hãy tham khảo các dịch vụ phù hợp với loại da của bạn."
                  });
                  
                  setFinished(true);
                  navigate(`/survey-results?id=${sessionId}`);
                } else {
                  throw new Error('Không có dữ liệu điểm số trong session');
                }
              } catch (sessionError) {
                console.error('Lỗi khi lấy dữ liệu session:', sessionError);
                showMockResults();
              }
            }, 1000);
          }
        } else {
          // Đây không phải là câu hỏi cuối, hiển thị câu hỏi tiếp theo
          console.log('Hiển thị câu hỏi tiếp theo từ response:', response.data);
          
          // Cập nhật ID câu hỏi hiện tại (nếu có)
          if (response.data.questionId) {
            setCurrentQuestionId(response.data.questionId);
          } 
          
          // Cập nhật nội dung câu hỏi (nếu có)
          if (response.data.questionText) {
            setQuestionText(response.data.questionText);
          }
          
          // Cập nhật các lựa chọn (nếu có)
          if (response.data.options && Array.isArray(response.data.options)) {
            // Đảm bảo giữ nguyên ID option chính xác từ API
            const formattedOptions = response.data.options.map(o => ({
              id: o.id, // Giữ nguyên ID chính xác
              text: o.text || o.optionText || o.label || "Option"
            }));
            
            console.log('Các lựa chọn cho câu hỏi tiếp theo với ID chính xác:', formattedOptions);
            setOptions(formattedOptions);
          } else {
            console.warn('Không tìm thấy options trong response:', response.data);
            message.warning('Không tìm thấy các lựa chọn cho câu hỏi tiếp theo');
          }
        }
      } else {
        console.warn('Response không hợp lệ hoặc không có dữ liệu:', response);
        message.warning('Phản hồi không hợp lệ từ máy chủ. Vui lòng thử lại.');
      }
    } else {
      // Không có sessionId, sử dụng dữ liệu mock
      console.warn('Không có sessionId, sử dụng dữ liệu mock');
      message.warning('Đang sử dụng dữ liệu mẫu do không có kết nối đến máy chủ', 2);
      
      setTimeout(() => {
        showNextMockQuestion(currentQuestionId, optionId);
      }, 1000);
    }
  } catch (err) {
    console.error('Lỗi xử lý câu trả lời:', err);
    setError('Không thể xử lý câu trả lời. Vui lòng thử lại.');
  } finally {
    setLoading(false);
  }
};

// Thêm hàm phụ trợ để hiển thị câu hỏi mock tiếp theo
const showNextMockQuestion = (currentId, optionId) => {
  // Dữ liệu mock cho các câu hỏi
  const mockQuestions = {
    "Q1": {
      questionId: "Q2",
      question: "Vấn đề da bạn đang gặp phải là gì?",
      options: [
        { id: 1, text: "Mụn" },
        { id: 2, text: "Nám, tàn nhang" },
        { id: 3, text: "Lão hóa" },
        { id: 4, text: "Thâm mụn" }
      ]
    },
    "Q2": {
      questionId: "Q3",
      question: "Độ tuổi của bạn?",
      options: [
        { id: 1, text: "Dưới 20" },
        { id: 2, text: "20-30" },
        { id: 3, text: "30-40" },
        { id: 4, text: "Trên 40" }
      ]
    },
    "Q3": {
      isCompleted: true
    }
  };
  
  const nextQuestion = mockQuestions[currentId];
  
  if (!nextQuestion) {
    // Không tìm thấy câu hỏi tiếp theo - kết thúc khảo sát
    showMockResults();
    return;
  }
  
  if (nextQuestion.isCompleted) {
    // Đây là kết quả - hiển thị kết quả
    showMockResults();
  } else {
    // Hiển thị câu hỏi tiếp theo
    setCurrentQuestionId(nextQuestion.questionId);
    setQuestionText(nextQuestion.question);
    setOptions(nextQuestion.options);
  }
};

// Đây là định nghĩa hàm mới thay thế useMockResults
const showMockResults = () => {
  // Tạo kết quả mặc định
  const mockResult = {
    skinType: "Da hỗn hợp",
    resultText: "Dựa trên câu trả lời của bạn, chúng tôi đánh giá bạn có da hỗn hợp.",
    recommendationText: "Bạn nên sử dụng các sản phẩm dành cho da hỗn hợp và chăm sóc đặc biệt cho vùng chữ T."
  };
  
  const mockServices = [
    {
      id: 1,
      name: "Điều trị da hỗn hợp",
      description: "Liệu pháp đặc biệt dành cho da hỗn hợp",
      price: 750000,
      imageUrl: "/images/service-default.png"
    },
    {
      id: 2,
      name: "Chăm sóc da cơ bản",
      description: "Quy trình làm sạch và dưỡng ẩm cho mọi loại da",
      price: 500000,
      imageUrl: "/images/service-default.png"
    }
  ];
  
  setResultData(mockResult);
  setRecommendedServices(mockServices);
  setFinished(true);
  
  // Lưu vào localStorage để hiển thị sau
  localStorage.setItem('surveyResults', JSON.stringify(mockResult));
  localStorage.setItem('recommendedServices', JSON.stringify(mockServices));
  
  // Chuyển hướng đến trang kết quả
  navigate('/survey-results');
};

  // Handle "Done" button click
  const handleFinish = () => {
    navigate('/services');
  };

  // View a recommended service
  const viewService = (serviceId) => {
    navigate(`/servicesDetail/${serviceId}`);
  };

  // Book a recommended service
  const bookService = () => {
    navigate('/booking');
  };

  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '50px',
        height: '300px'
      }}>
        <Spin size="large" /> {/* Bỏ tip để loại bỏ warning */}
        <div style={{ marginLeft: '10px', marginTop: '10px' }}>
          Đang tải khảo sát...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Survey Error"
        subTitle={error}
        extra={<Button type="primary" onClick={startSurvey}>Try Again</Button>}
      />
    );
  }

  if (finished && resultData) {
    return (
      <div className="survey-result-page">
        <Result
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="Survey Completed!"
          subTitle="Thank you for taking the survey. Here are your results."
        />
        
        <Card className="result-card">
          <Title level={3}>Your Skin Analysis</Title>
          
          {sessionId ? (
            // Display database-backed result
            <>
              <Paragraph>
                <Text strong>Skin Type:</Text> {resultData.skinType}
              </Paragraph>
              <Paragraph>{resultData.resultText}</Paragraph>
              <Paragraph>
                <Text strong>Recommendations:</Text>
              </Paragraph>
              <Paragraph>{resultData.recommendationText}</Paragraph>
            </>
          ) : (
            // Display file-based result
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {typeof resultData.question === 'string' 
                ? resultData.question.replace(/\\n/g, "\n") 
                : resultData.question}
            </Paragraph>
          )}
        </Card>
        
        {recommendedServices.length > 0 && (
          <Card title="Recommended Services For You" className="recommended-services-card">
            <List
              itemLayout="horizontal"
              dataSource={recommendedServices}
              renderItem={service => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      onClick={() => viewService(service.id)}
                      icon={<RightOutlined />}
                    >
                      View
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={service.imageUrl || '/images/service-default.png'} />}
                    title={service.name}
                    description={
                      <>
                        <Paragraph ellipsis={{ rows: 2 }}>{service.description}</Paragraph>
                        <Text type="secondary">Price: {service.price?.toLocaleString() || 'Contact us'} VND</Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
            
            <div className="action-buttons">
              <Button type="primary" size="large" onClick={bookService}>
                Book a Service
              </Button>
              <Button size="large" onClick={handleFinish}>
                Done
              </Button>
            </div>
          </Card>
        )}
        
        {!recommendedServices.length && (
          <div className="action-buttons">
            <Button type="primary" size="large" onClick={bookService}>
              Book a Service
            </Button>
            <Button size="large" onClick={handleFinish}>
              Done
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="survey-question-page">
      <Card className="question-card">
        <Title level={3}>{questionText}</Title>
        <div className="options">
          {options.map((option, index) => (
            <Button 
              key={index} 
              onClick={() => handleOptionClick(option.id, index)}
              size="large"
              className="option-button"
            >
              {option.text}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SurveyQuestionPage;
