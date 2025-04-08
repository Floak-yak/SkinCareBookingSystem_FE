import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Card, Button, Result, List, Typography, Avatar } from 'antd';
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

  // Start a new survey session
  const startSurvey = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await surveyApi.startSurvey();
      console.log('Survey API response:', response.data);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      // Handle the API response based on actual API structure
      if (response.data.sessionId && response.data.nextQuestionData) {
        // API format with nextQuestionData structure
        setSessionId(response.data.sessionId);
        const questionData = response.data.nextQuestionData;
        
        setCurrentQuestionId(questionData.questionId);
        setQuestionText(questionData.questionText);
        setOptions(questionData.options?.map(o => ({
          id: o.id,
          text: o.text
        })) || []);
        
        console.log('Using API format with sessionId and nextQuestionData');
      } else if (response.data.sessionId) {
        // Alternative database format
        setSessionId(response.data.sessionId);
        setCurrentQuestionId(response.data.questionId || response.data.id);
        setQuestionText(response.data.question || response.data.questionText);
        setOptions(response.data.options?.map(o => ({
          id: o.id,
          text: o.text || o.optionText
        })) || []);
        
        console.log('Using alternative database format');
      } else {
        // File-based survey (legacy format)
        setQuestionText(response.data.question);
        setOptions(response.data.options?.map((option, index) => ({
          id: index,
          text: option.label
        })) || []);
        setCurrentQuestionId('Q1');
        
        console.log('Using legacy file-based format');
      }
    } catch (err) {
      console.error('Error starting survey:', err);
      // Attempt to retry up to 2 times
      if (retryCount < 2) {
        console.log(`Retrying survey start (attempt ${retryCount + 1})...`);
        setTimeout(() => startSurvey(retryCount + 1), 1000);
        return;
      }
      setError('Could not start the survey. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle when user selects an option
  const handleOptionClick = async (optionId, optionIndex) => {
    try {
      setLoading(true);
      
      if (sessionId) {
        // Use database-backed API
        // Determine if this might be the last question by checking response structure
        const isLastQuestionPayload = response => {
          return (response.data.nextQuestionData && response.data.nextQuestionData.isResult) || 
                 (response.data.isResult === true);
        };
        
        // First make a GET request to check if this would be the last question
        let isLast = false;
        try {
          // We can use the session endpoint to check the next question without answering
          const checkResponse = await surveyApi.getSession(sessionId);
          isLast = checkResponse.data.isLastQuestion || 
                   checkResponse.data.nextIsResult || 
                   (checkResponse.data.currentQuestionIndex >= checkResponse.data.totalQuestions - 1);
        } catch (checkError) {
          console.log('Could not determine if this is the last question:', checkError);
          // Continue anyway, assume it might be the last one
        }
        
        console.log('Is this potentially the last question?', isLast);
        
        // Submit the answer, indicating if it might be the last one
        const response = await surveyApi.answerQuestion(sessionId, currentQuestionId, optionId, isLast);
        console.log('Answer API response:', response.data);
        
        // If the response indicates this is the last question/survey is complete
        const isComplete = (response.data.isResult === true) || 
                          (response.data.nextQuestionData && response.data.nextQuestionData.isResult) ||
                          (response.data.isEnd === true) ||
                          (response.data.message?.includes('completed'));
        
        if (isComplete) {
          // Explicitly complete the survey to ensure proper database updating
          try {
            console.log('Explicitly completing the survey...');
            await surveyApi.completeSurvey(sessionId);
          } catch (completeError) {
            console.warn('Error explicitly completing survey:', completeError);
            // Continue even if this fails - the backend might have already completed it
          }
        }
        
        // Now check the response to determine what to do next
        if (response.data.nextQuestionData) {
          // Format with nextQuestionData
          const questionData = response.data.nextQuestionData;
          
          if (questionData.isResult) {
            // Survey complete - get the results
            const resultsResponse = await surveyApi.getSurveyResults(sessionId);
            console.log('Results API response:', resultsResponse.data);
            
            if (resultsResponse.data && resultsResponse.data.result) {
              setResultData(resultsResponse.data.result);
              setRecommendedServices(resultsResponse.data.recommendedServices || []);
              setFinished(true);
              navigate(`/survey-results?id=${sessionId}`);
            } else {
              throw new Error('Invalid results data structure');
            }
          } else {
            // Next question
            setCurrentQuestionId(questionData.questionId);
            setQuestionText(questionData.questionText);
            setOptions(questionData.options.map(o => ({
              id: o.id,
              text: o.text
            })));
          }
        } else if (response.data.isResult !== undefined) {
          // Alternative format with direct isResult flag
          if (response.data.isResult) {
            // Survey is finished - get results
            const resultsResponse = await surveyApi.getSurveyResults(sessionId);
            
            if (resultsResponse.data && resultsResponse.data.result) {
              setResultData(resultsResponse.data.result);
              setRecommendedServices(resultsResponse.data.recommendedServices || []);
              setFinished(true);
              navigate(`/survey-results?id=${sessionId}`);
            } else {
              throw new Error('Invalid results data');
            }
          } else {
            // We have another question from the new format
            setCurrentQuestionId(response.data.questionId);
            setQuestionText(response.data.questionText);
            setOptions(response.data.options.map(o => ({
              id: o.id,
              text: o.text
            })));
          }
        } else {
          // Legacy format
          if (response.data.isResult) {
            setResultData(response.data.result);
            setRecommendedServices(response.data.recommendedServices || []);
            setFinished(true);
            navigate(`/survey-results?id=${sessionId}`);
          } else {
            setCurrentQuestionId(response.data.questionId);
            setQuestionText(response.data.question);
            setOptions(response.data.options.map(o => ({
              id: o.id,
              text: o.optionText || o.text
            })));
          }
        }
      } else {
        // Use file-based API
        const nextResponse = await surveyApi.getNextQuestion(currentQuestionId, optionIndex);
        const nextQuestionId = nextResponse.data.nextQuestionId;
        
        if (nextQuestionId.startsWith("RESULT_")) {
          // This is a result
          const conclusionResponse = await surveyApi.getQuestion(nextQuestionId);
          setResultData(conclusionResponse.data);
          setFinished(true);
          navigate('/survey-results');
        } else {
          // This is another question
          const questionResponse = await surveyApi.getQuestion(nextQuestionId);
          setQuestionText(questionResponse.data.question);
          setOptions(questionResponse.data.options.map((option, index) => ({
            id: index,
            text: option.label
          })));
          setCurrentQuestionId(nextQuestionId);
        }
      }
    } catch (err) {
      console.error('Error processing answer:', err);
      setError('Could not process your answer. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <div className="loading-container">
        <Spin size="large" tip="Loading survey..."/>
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
