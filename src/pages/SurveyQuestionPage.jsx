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
      
      // Try to use the new database-backed API
      try {
        const response = await surveyApi.startDatabaseSurvey();
        if (!response || !response.data) {
          throw new Error('Invalid response from server');
        }
        setSessionId(response.data.sessionId);
        setCurrentQuestionId(response.data.questionId);
        setQuestionText(response.data.question);
        setOptions(response.data.options?.map(o => ({
          id: o.id,
          text: o.text
        })) || []);
      } catch (dbError) {
        console.warn('Database survey not available, falling back to file-based survey', dbError);
        
        // Fall back to file-based API
        const response = await surveyApi.startSurvey();
        if (!response || !response.data) {
          throw new Error('Invalid response from file-based survey');
        }
        setQuestionText(response.data.question);
        setOptions(response.data.options?.map((option, index) => ({
          id: index,
          text: option.label
        })) || []);
        setCurrentQuestionId('Q1');
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
        const response = await surveyApi.answerQuestion(sessionId, currentQuestionId, optionId);
        
        if (response.data.isResult) {
          // We have a result
          setResultData(response.data.result);
          setRecommendedServices(response.data.recommendedServices || []);
          setFinished(true);
          
          // Navigate to the results page with the session ID
          navigate(`/survey-results?id=${sessionId}`);
        } else {
          // We have another question
          setCurrentQuestionId(response.data.questionId);
          setQuestionText(response.data.question);
          setOptions(response.data.options.map(o => ({
            id: o.id,
            text: o.optionText || o.text // Add fallback to o.text
          })));
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
          
          // For file-based surveys without sessions, still show the result page
          // but we'll need to temporarily store results in local storage
          try {
            localStorage.setItem('surveyResults', JSON.stringify(conclusionResponse.data));
            navigate('/survey-results');
          } catch (error) {
            console.warn('Error saving survey results to localStorage:', error);
            // Still navigate but we might not have results
            navigate('/survey-results');
          }
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
