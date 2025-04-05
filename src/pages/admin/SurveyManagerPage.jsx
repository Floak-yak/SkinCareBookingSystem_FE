import React, { useEffect, useState } from 'react';
import { Tabs, Button, Table, Form, Input, Select, Modal, message, Card, Divider, List, Space, Tag, Alert, Collapse, Badge, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import surveyApi from '../../api/surveyApi';
import servicesApi from '../../api/servicesApi';
import '../../styles/SurveyManagerPage.css';

const { Option } = Select;
const { TextArea } = Input;

const SurveyManagerPage = () => {
  // State for questions management
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionForm] = Form.useForm();
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  
  // State for results management
  const [surveyResults, setSurveyResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultForm] = Form.useForm();
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [showManageServicesModal, setShowManageServicesModal] = useState(false);
  
  // State for services recommendation
  const [skinCareServices, setSkinCareServices] = useState([]);
  const [resultServicesModalVisible, setResultServicesModalVisible] = useState(false);
  
  // Add this state for the debug modal and info
  const [isDebugModalVisible, setIsDebugModalVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    loading: false,
    data: null,
    error: null
  });
  
  // Load data when component mounts
  useEffect(() => {
    fetchQuestions();
    fetchResults();
    fetchServices();
  }, []);

  // Fetch questions from both file-based and database systems
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let questionList = [];
      
      try {
        // Try database questions first
        const dbResponse = await surveyApi.getDatabaseQuestions();
        if (dbResponse.data && Array.isArray(dbResponse.data)) {
          questionList = dbResponse.data.map(q => ({
            id: q.id,
            questionId: q.questionId,
            question: q.questionText,
            options: q.options || [],
            isDatabase: true
          }));
        }
      } catch (dbError) {
        console.warn('Database questions not available, falling back to file-based', dbError);
      }
      
      try {
        // Add file-based questions
        const fileResponse = await surveyApi.getAllQuestions();
        const fileQuestions = Object.entries(fileResponse.data).map(([key, data]) => ({
          id: key,
          questionId: key,
          question: data.question,
          options: data.options,
          isDatabase: false
        }));
        
        questionList = [...questionList, ...fileQuestions];
      } catch (fileError) {
        console.error('Error fetching file-based questions:', fileError);
      }
      
      setQuestions(questionList);
    } catch (err) {
      setError('Failed to load questions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch survey results
  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await surveyApi.getAllResults();
      if (response.data) {
        console.log('Fetched raw results:', response.data);
        
        // Process the results data using our helper function
        const processedResults = processResultsData(response.data);
        console.log('Processed results with recommendations:', processedResults);
        
        setSurveyResults(processedResults);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      message.error('Failed to load survey results');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available services for recommendation
  const fetchServices = async () => {
    try {
      const response = await servicesApi.getAllServices();
      if (response.data) {
        // Handle different response structures
        const services = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);
        
        // Filter out any invalid service entries and ensure all have proper data
        const validServices = services
          .filter(service => service && service.id)
          .map(service => ({
            ...service,
            serviceName: service.serviceName || service.name || `Service ${service.id}`,
            serviceDescription: service.serviceDescription || service.description || "",
            price: typeof service.price === 'number' ? service.price : 0
          }));
        
        setSkinCareServices(validServices);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      message.error('Failed to load services. Please try again later.');
    }
  };

  // Handle editing a question
  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    
    if (question.isDatabase) {
      // Format for database question
      questionForm.setFieldsValue({
        id: question.id,
        questionId: question.questionId,
        questionText: question.question,
        options: question.options.map(opt => ({
          optionText: opt.optionText,
          nextQuestionId: opt.nextQuestionId
        }))
      });
    } else {
      // Format for file-based question
      questionForm.setFieldsValue({
        id: question.id,
        questionText: question.question,
        options: question.options.map(opt => ({
          optionText: opt.label,
          nextQuestionId: opt.nextId
        }))
      });
    }
    
    setShowQuestionModal(true);
  };

  // Handle creating a new question
  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    questionForm.resetFields();
    questionForm.setFieldsValue({
      options: [{ optionText: '', nextQuestionId: '' }]
    });
    setShowQuestionModal(true);
  };

  // Save a question (create or update)
  const handleSaveQuestion = async (values) => {
    try {
      // Determine if it's a database or file-based question
      const isDatabase = selectedQuestion?.isDatabase || true; // Default to database for new questions
      
      if (isDatabase) {
        // Format for database API
        const questionData = {
          id: selectedQuestion?.id || 0,
          questionId: values.questionId,
          questionText: values.questionText,
          options: values.options.map(opt => ({
            optionText: opt.optionText,
            nextQuestionId: opt.nextQuestionId
          }))
        };
        console.log('Request body for updateDatabaseQuestion:', questionData);
        if (selectedQuestion) {
          await surveyApi.updateDatabaseQuestion(selectedQuestion.id, questionData);
          message.success('Question updated successfully');
        } else {
          await surveyApi.addDatabaseQuestion(questionData);
          message.success('Question created successfully');
        }
      } else {
        // Format for file-based API
        const fileQuestion = {
          id: values.id,
          content: values.questionText,
          choices: {}
        };
        
        values.options.forEach(opt => {
          fileQuestion.choices[opt.optionText] = opt.nextQuestionId;
        });
        
        if (selectedQuestion) {
          await surveyApi.updateQuestion(fileQuestion);
          message.success('Question updated successfully');
        } else {
          await surveyApi.addQuestion(fileQuestion);
          message.success('Question created successfully');
        }
      }
      
      setShowQuestionModal(false);
      fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
      message.error('Failed to save question');
    }
  };

  // Delete a question
  const handleDeleteQuestion = async (question) => {
    try {
      if (window.confirm('Are you sure you want to delete this question?')) {
        if (question.isDatabase) {
          await surveyApi.deleteDatabaseQuestion(question.id);
        } else {
          await surveyApi.deleteQuestion(question.id);
        }
        message.success('Question deleted successfully');
        fetchQuestions();
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      message.error('Failed to delete question');
    }
  };

  // Edit result
  const handleEditResult = (result) => {
    setSelectedResult(result);
    resultForm.setFieldsValue({
      id: result.id,
      resultId: result.resultId,
      skinType: result.skinType,
      resultText: result.resultText,
      recommendationText: result.recommendationText
    });
    setShowResultModal(true);
  };

  // Save result
  const handleSaveResult = async (values) => {
    try {
      const resultData = {
        id: selectedResult?.id || 0,
        resultId: values.resultId,
        skinType: values.skinType,
        resultText: values.resultText,
        recommendationText: values.recommendationText
      };
      
      if (selectedResult) {
        // Update existing result
        await surveyApi.updateResult(resultData);
        message.success('Survey result updated successfully');
      } else {
        // Create new result
        await surveyApi.addResult(resultData);
        message.success('Survey result created successfully');
      }
      
      setShowResultModal(false);
      fetchResults();
    } catch (err) {
      console.error('Error saving result:', err);
      message.error('Failed to save survey result');
    }
  };

  // Manage recommended services for a result
  const handleManageServices = (resultId) => {
    setSelectedResultId(resultId);
    setShowManageServicesModal(true);
  };

  // Process API results to ensure proper data structure
  const processResultsData = (results) => {
    if (!results) return [];
    
    return results.map(result => {
      // Handle recommendedServices if they exist
      let processedServices = [];
      if (result.recommendedServices && Array.isArray(result.recommendedServices)) {
        processedServices = result.recommendedServices
          .map(item => {
            // Check if we have a direct service item (instead of recommendation)
            const isDirectService = item.serviceName !== undefined && !item.service;
            
            if (isDirectService) {
              // This is a direct service object, not a recommendation
              return {
                id: item.id || 0,
                serviceId: item.id, // Use the item ID as the service ID
                priority: 1,
                service: {
                  id: item.id || 0,
                  name: item.serviceName || item.name || `Service ${item.id}`,
                  description: item.serviceDescription || item.description || "",
                  price: typeof item.price === 'number' ? item.price : 0
                }
              };
            } else {
              // Regular recommendation object with service property
              const serviceId = item.serviceId || item.id;
              
              // Process service object to ensure valid data
              let serviceData = null;
              
              if (item.service) {
                // Only include services with valid data
                serviceData = {
                  id: item.service.id || 0,
                  name: item.service.name || item.service.serviceName || `Service ${serviceId}`,
                  description: item.service.description || item.service.serviceDescription || "",
                  price: typeof item.service.price === 'number' ? item.service.price : 0
                };
              } else if (serviceId) {
                // Create minimal service data if missing
                serviceData = {
                  id: serviceId,
                  name: `Service ${serviceId}`,
                  description: "",
                  price: 0
                };
              }
              
              return {
                id: item.id || 0,
                serviceId: serviceId, // Use item.id as fallback
                priority: item.priority || 1,
                service: serviceData
              };
            }
          })
          .filter(item => item.serviceId > 0 && item.service !== null); // Keep only valid items
      }
      
      // Return processed result
      return {
        ...result,
        recommendedServices: processedServices
      };
    });
  };

  // Add a service recommendation
  const addServiceRecommendation = async (serviceId) => {
    try {
      if (!selectedResult) {
        message.error('No survey result selected.');
        return;
      }
      
      if (!serviceId) {
        message.error('Invalid service selected.');
        return;
      }

      message.loading({ content: 'Adding service recommendation...', key: 'addRecommendation' });
      
      const data = {
        surveyResultId: selectedResult.id,
        serviceId: serviceId,
        priority: 1
      };
      
      // Log the request for debugging
      console.log('Adding recommendation:', data);
      
      const response = await surveyApi.addRecommendedService(data);

      if (response.status === 200) {
        message.success({ 
          content: 'Service recommendation added successfully.', 
          key: 'addRecommendation',
          duration: 2
        });
        
        // First, get the updated list of all recommendations
        await surveyApi.checkRecommendations();
        
        // Then fetch all results data
        const resultsResponse = await surveyApi.getAllResults();
        if (resultsResponse.data) {
          // Process the results to ensure proper data structure
          const processedResults = processResultsData(resultsResponse.data);
          setSurveyResults(processedResults);
          
          // Update the selected result
          if (selectedResult) {
            const freshResult = processedResults.find(r => r.id === selectedResult.id);
            if (freshResult) {
              console.log('Updated selected result with fresh data:', freshResult);
              setSelectedResult(freshResult);
            }
          }
        }
      } else {
        throw new Error('Server returned an unsuccessful status code');
      }
    } catch (err) {
      console.error('Error adding service recommendation:', err);
      message.error({ 
        content: 'Failed to add service recommendation. Please try again.', 
        key: 'addRecommendation',
        duration: 3
      });
    }
  };

  // Remove a service recommendation
  const removeServiceRecommendation = async (serviceId) => {
    if (!serviceId) {
      message.error('Invalid service ID');
      return;
    }
    
    // Make sure serviceId is a number
    const idToDelete = Number(serviceId);
    if (isNaN(idToDelete)) {
      message.error(`Invalid service ID format: ${serviceId}`);
      return;
    }
    
    // Debug logging
    console.log("Starting deletion process");
    console.log("Selected result:", selectedResult);
    
    // First verify if this ID exists in the recommendations
    if (selectedResult?.recommendedServices) {
      // Check both id and serviceId to see what's in the data
      const allIds = selectedResult.recommendedServices.map(r => r.id);
      const allServiceIds = selectedResult.recommendedServices.map(r => r.serviceId);
      console.log("All recommendation IDs in selected result:", allIds);
      console.log("All service IDs in selected result:", allServiceIds);
      
      const targetRec = selectedResult.recommendedServices.find(r => r.serviceId === idToDelete);
      
      if (targetRec) {
        console.log("Found recommendation to delete (by service ID):", targetRec);
      } else {
        // If recommendation ID matches but service ID doesn't, we found the problem
        const matchingIdRec = selectedResult.recommendedServices.find(r => r.id === idToDelete);
        if (matchingIdRec) {
          const errorMsg = `Cannot delete using recommendation ID (${idToDelete}). You need to use service ID (${matchingIdRec.serviceId})`;
          console.error(errorMsg);
          message.error(errorMsg);
          return;
        }
        
        console.warn(`Warning: Service with ID ${idToDelete} not found in current selected result`);
      }
    }
    
    console.log(`Proceeding to delete service ID: ${idToDelete}`);
    
    try {
      message.loading({ content: 'Removing recommendation...', key: 'removeRecommendation' });
      
      const response = await surveyApi.deleteRecommendedService(idToDelete);
      
      // Log the delete response
      console.log("Delete response:", response);
      
      if (response && response.data && response.data.success) {
        message.success({ 
          content: response.data.message || 'Service recommendation removed successfully', 
          key: 'removeRecommendation',
          duration: 2
        });
        
        // First, get the updated list of all recommendations
        await surveyApi.checkRecommendations();
        
        // Then fetch all results data
        const resultsResponse = await surveyApi.getAllResults();
        if (resultsResponse.data) {
          // Process the results to ensure proper data structure
          const processedResults = processResultsData(resultsResponse.data);
          setSurveyResults(processedResults);
          
          // Update the selected result
          if (selectedResult) {
            const freshResult = processedResults.find(r => r.id === selectedResult.id);
            if (freshResult) {
              console.log('Updated selected result with fresh data:', freshResult);
              setSelectedResult(freshResult);
            }
          }
        }
      } else {
        throw new Error(response?.data?.message || 'Server returned an unsuccessful response');
      }
    } catch (err) {
      console.error('Error removing service recommendation:', err);
      message.error({ 
        content: err.message || 'Failed to remove service recommendation. Please try again.', 
        key: 'removeRecommendation',
        duration: 3 
      });
    }
  };

  // Function to handle managing services for a survey result
  const handleManageResultServices = async (record) => {
    // Ensure record has the necessary properties before setting state
    if (!record || !record.id) {
      console.error('Invalid record passed to handleManageResultServices:', record);
      message.error('Invalid data. Please try again.');
      return;
    }
    
    try {
      // Show loading state
      message.loading({ content: 'Loading recommendations...', key: 'loadingResult' });
      
      // Get fresh data for this result to ensure we have the latest recommendations
      const response = await surveyApi.getAllResults();
      if (response.data) {
        // Process the results with our helper function
        const processedResults = processResultsData(response.data);
        
        // Find the selected result with the processed data
        const updatedResult = processedResults.find(r => r.id === record.id);
        
        if (updatedResult) {
          console.log('Setting selected result with processed data:', updatedResult);
          
          // Check if recommendedServices is properly populated
          if (updatedResult.recommendedServices && updatedResult.recommendedServices.length > 0) {
            console.log('Recommendation IDs in selected result:', 
              updatedResult.recommendedServices.map(r => `ID: ${r.id}, Service ID: ${r.serviceId}`).join(', '));
          } else {
            console.log('No recommendations found for this result');
          }
          
          // Set the processed result in state
          setSelectedResult(updatedResult);
          setResultServicesModalVisible(true);
          
          message.success({ 
            content: `Loaded ${updatedResult.recommendedServices?.length || 0} recommendations`, 
            key: 'loadingResult', 
            duration: 2 
          });
        } else {
          throw new Error('Result not found in refreshed data');
        }
      } else {
        throw new Error('Failed to refresh data');
      }
    } catch (error) {
      console.error('Error loading result details:', error);
      message.error({ 
        content: 'Failed to load result details. Please try again.', 
        key: 'loadingResult' 
      });
    }
  };

  // Columns for questions table
  const questionColumns = [
    {
      title: 'ID',
      dataIndex: 'questionId',
      key: 'questionId',
      render: (text, record) => (
        <span>
          {text} 
          {record.isDatabase && <Tag color="green" style={{ marginLeft: 8 }}>DB</Tag>}
          {!record.isDatabase && <Tag color="blue" style={{ marginLeft: 8 }}>File</Tag>}
        </span>
      )
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: 'Options',
      dataIndex: 'options',
      key: 'options',
      render: (options) => (
        <ul className="options-list">
          {options && options.map((opt, idx) => (
            <li key={idx}>
              {opt.label || opt.optionText} → {opt.nextId || opt.nextQuestionId}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEditQuestion(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteQuestion(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Columns for results table
  const resultColumns = [
    {
      title: 'Mã kết quả',
      dataIndex: 'resultId',
      key: 'resultId',
    },
    {
      title: 'Loại da',
      dataIndex: 'skinType',
      key: 'skinType',
    },
    {
      title: 'Mô tả',
      dataIndex: 'resultText',
      key: 'resultText',
      ellipsis: true,
    },
    {
      title: 'Dịch vụ đề xuất',
      dataIndex: 'recommendedServices',
      key: 'recommendedServices',
      render: (_, record) => {
        const services = record.recommendedServices || [];
        return (
          <div>
            {services.length ? (
              <Tag color="blue">{services.length} dịch vụ</Tag>
            ) : (
              <Tag color="red">Chưa có dịch vụ</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEditResult(record)}
          >
            Sửa
          </Button>
          <Button 
            icon={<PlusOutlined />} 
            onClick={() => handleManageResultServices(record)}
          >
            Quản lý dịch vụ
          </Button>
        </Space>
      ),
    },
  ];

  // Add this function to render debug information
  const renderDebugInfo = () => {
    if (debugInfo.loading) {
      return <Spin tip="Loading recommendation data..." />;
    }
    
    if (debugInfo.error) {
      return <Alert type="error" message="Error" description={debugInfo.error} />;
    }
    
    if (!debugInfo.data || debugInfo.data.totalCount === 0) {
      return <Alert type="info" message="No recommendations found in the database." />;
    }
    
    const { totalCount, byResultId } = debugInfo.data;
    
    return (
      <div className="debug-info">
        <Alert 
          type="info" 
          message={`Total Recommendations: ${totalCount}`} 
          description="Recommendations grouped by Survey Result ID"
          showIcon
        />
        
        <Collapse className="mt-3">
          {Object.keys(byResultId).map(resultId => (
            <Collapse.Panel 
              key={resultId} 
              header={`Result ID: ${resultId} - ${byResultId[resultId].length} recommendations`}
            >
              <List
                dataSource={byResultId[resultId]}
                renderItem={(rec, index) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div>
                          <Badge status="processing" text={`Recommendation #${index + 1}`} />
                          <Tag color="red">Rec ID: {rec.id}</Tag>
                          {rec.serviceId && <Tag color="blue">Service ID: {rec.serviceId}</Tag>}
                          {rec.priority && <Tag color="green">Priority: {rec.priority}</Tag>}
                        </div>
                      }
                      description={
                        <div>
                          {rec.service ? (
                            <div>
                              <div><strong>Service Name:</strong> {rec.service.name || "Unknown"}</div>
                              {rec.service.description && (
                                <div><strong>Description:</strong> {rec.service.description.length > 100 ? 
                                  `${rec.service.description.substring(0, 100)}...` : 
                                  rec.service.description}
                                </div>
                              )}
                              {rec.service.price && (
                                <div><strong>Price:</strong> {rec.service.price} VND</div>
                              )}
                            </div>
                          ) : (
                            <Alert 
                              type="warning" 
                              message="Service data is missing" 
                              description="This recommendation references a service that doesn't exist or wasn't returned by the API."
                              showIcon
                            />
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    );
  };

  const handleCheckRecommendations = async () => {
    setIsDebugModalVisible(true);
    setDebugInfo({
      loading: true,
      data: null,
      error: null
    });
    
    try {
      const response = await surveyApi.checkRecommendations();
      
      if (response.data && response.data.data) {
        // Process and format the data for better readability
        const recommendations = response.data.data;
        const byResult = {};
        
        recommendations.forEach(rec => {
          const resultId = rec.surveyResultId;
          if (!byResult[resultId]) {
            byResult[resultId] = [];
          }
          byResult[resultId].push(rec);
        });
        
        setDebugInfo({
          loading: false,
          data: {
            totalCount: recommendations.length,
            byResultId: byResult
          },
          error: null
        });
      } else {
        setDebugInfo({
          loading: false,
          data: { totalCount: 0, byResultId: {} },
          error: null
        });
      }
    } catch (error) {
      console.error("Error checking recommendations:", error);
      setDebugInfo({
        loading: false,
        data: null,
        error: error.message || "Failed to check recommendations"
      });
    }
  };

  return (
    <div className="survey-manager-page">
      <h1>Survey Management System</h1>
      
      <Tabs defaultActiveKey="questions" items={[
        {
          key: "questions",
          label: "Câu hỏi khảo sát",
          children: (
            <>
              <div className="tab-header">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddQuestion}
                >
                  Thêm Câu Hỏi Mới
                </Button>
              </div>
              
              <Table 
                columns={questionColumns} 
                dataSource={questions} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
              
              <Modal
                title={selectedQuestion ? "Edit Question" : "Add New Question"}
                open={showQuestionModal}
                onCancel={() => setShowQuestionModal(false)}
                footer={null}
                width={700}
              >
                <Form
                  form={questionForm}
                  layout="vertical"
                  onFinish={handleSaveQuestion}
                >
                  <Form.Item
                    name="questionId"
                    label="Question ID"
                    rules={[{ required: true, message: 'Please enter a question ID' }]}
                  >
                    <Input placeholder="e.g., Q1, Q2, RESULT_1, etc." />
                  </Form.Item>
                  
                  <Form.Item
                    name="questionText"
                    label="Question Text"
                    rules={[{ required: true, message: 'Please enter the question text' }]}
                  >
                    <TextArea rows={4} placeholder="Enter the question text" />
                  </Form.Item>
                  
                  <Divider>Options</Divider>
                  
                  <Form.List name="options">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <Form.Item
                              {...restField}
                              name={[name, 'optionText']}
                              style={{ marginRight: 8, width: '60%' }}
                              rules={[{ required: true, message: 'Option text required' }]}
                            >
                              <Input placeholder="Option text" />
                            </Form.Item>
                            
                            <Form.Item
                              {...restField}
                              name={[name, 'nextQuestionId']}
                              style={{ width: '30%' }}
                              rules={[{ required: true, message: 'Next step required' }]}
                            >
                              <Input placeholder="Next question ID" />
                            </Form.Item>
                            
                            {fields.length > 1 && (
                              <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                                onClick={() => remove(name)} 
                                style={{ marginLeft: 8 }}
                              />
                            )}
                          </div>
                        ))}
                        
                        <Form.Item>
                          <Button 
                            type="dashed" 
                            onClick={() => add()} 
                            block 
                            icon={<PlusOutlined />}
                          >
                            Add Option
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                  
                  <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
                    <Button 
                      style={{ marginRight: 8 }} 
                      onClick={() => setShowQuestionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />}
                    >
                      Save Question
                    </Button>
                  </Form.Item>
                </Form>
              </Modal>
            </>
          )
        },
        {
          key: "results",
          label: "Kết quả khảo sát",
          children: (
            <>
              <div className="tab-header">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => {
                    setSelectedResult(null);
                    resultForm.resetFields();
                    setShowResultModal(true);
                  }}
                >
                  Thêm kết quả mới
                </Button>
              </div>
              
              <Table 
                columns={resultColumns} 
                dataSource={surveyResults} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
              />
              
              <Modal
                title={selectedResult ? "Chỉnh sửa kết quả khảo sát" : "Thêm kết quả khảo sát mới"}
                open={showResultModal}
                onCancel={() => setShowResultModal(false)}
                footer={null}
                width={700}
              >
                <Form
                  form={resultForm}
                  layout="vertical"
                  onFinish={handleSaveResult}
                >
                  <Form.Item
                    name="resultId"
                    label="Mã kết quả"
                    rules={[{ required: true, message: 'Vui lòng nhập mã kết quả' }]}
                  >
                    <Input placeholder="VD: RESULT_1, RESULT_DRY_SKIN, v.v." />
                  </Form.Item>
                  
                  <Form.Item
                    name="skinType"
                    label="Loại da"
                    rules={[{ required: true, message: 'Vui lòng chọn loại da' }]}
                  >
                    <Select placeholder="Chọn loại da">
                      <Option value="Oily">Da dầu</Option>
                      <Option value="Dry">Da khô</Option>
                      <Option value="Combination">Da hỗn hợp</Option>
                      <Option value="Normal">Da thường</Option>
                      <Option value="Sensitive">Da nhạy cảm</Option>
                      <Option value="Acne-Prone">Da mụn</Option>
                      <Option value="Aging">Da lão hóa</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="resultText"
                    label="Mô tả kết quả"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả kết quả' }]}
                  >
                    <TextArea rows={4} placeholder="Mô tả chi tiết về kết quả phân tích da" />
                  </Form.Item>
                  
                  <Form.Item
                    name="recommendationText"
                    label="Khuyến nghị chung"
                    rules={[{ required: true, message: 'Vui lòng nhập các khuyến nghị' }]}
                  >
                    <TextArea rows={4} placeholder="Khuyến nghị chăm sóc da chung" />
                  </Form.Item>
                  
                  <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
                    <Button 
                      style={{ marginRight: 8 }} 
                      onClick={() => setShowResultModal(false)}
                    >
                      Hủy
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />}
                    >
                      Lưu kết quả
                    </Button>
                  </Form.Item>
                </Form>
              </Modal>
              
              <Modal
                title="Quản lý dịch vụ đề xuất"
                open={resultServicesModalVisible}
                onCancel={() => setResultServicesModalVisible(false)}
                footer={null}
                width={800}
              >
                {selectedResult && (
                  <div>
                    <Card title="Các dịch vụ đã đề xuất" style={{ marginBottom: 16 }}>
                      <Button 
                        onClick={handleCheckRecommendations}
                        style={{ display: 'none', marginBottom: 16, marginRight: 8 }}
                        type="primary"
                        ghost
                        icon={<SearchOutlined />}
                      >
                        Xem tất cả đề xuất
                      </Button>

                      <Button 
                        onClick={async () => {
                          try {
                            await surveyApi.getRawRecommendations();
                            message.info('Xem chi tiết dữ liệu trong console');
                          } catch (err) {
                            console.error('Debug check failed:', err);
                            message.error('Không thể lấy thông tin đề xuất');
                          }
                        }}
                        style={{ display: 'none', marginBottom: 16 }}
                      >
                        Xem dữ liệu gốc
                      </Button>

                      {selectedResult.recommendedServices?.length > 0 ? (
                        <List
                          itemLayout="horizontal"
                          dataSource={selectedResult.recommendedServices}
                          renderItem={(item) => {
                            if (!item || !item.service) {
                              return null;
                            }
                            
                            const service = item.service;
                            const serviceId = item.serviceId || service.id;
                            
                            return (
                              <List.Item
                                actions={[
                                  <Button 
                                    danger 
                                    icon={<DeleteOutlined />} 
                                    onClick={() => {
                                      Modal.confirm({
                                        title: 'Xóa dịch vụ',
                                        content: (
                                          <div>
                                            <p>Bạn có chắc chắn muốn xóa dịch vụ đề xuất này không?</p>
                                            <p>Tên dịch vụ: {service.name}</p>
                                            <p>Mã dịch vụ: {serviceId}</p>
                                          </div>
                                        ),
                                        okText: 'Xóa',
                                        okType: 'danger',
                                        cancelText: 'Hủy',
                                        onOk: () => {
                                          removeServiceRecommendation(serviceId);
                                        }
                                      });
                                    }}
                                  >
                                    Xóa
                                  </Button>
                                ]}
                              >
                                <List.Item.Meta
                                  title={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <span style={{ marginRight: '10px' }}>{service.name}</span>
                                      <Tag color="blue">Mã: {serviceId}</Tag>
                                    </div>
                                  }
                                  description={
                                    <>
                                      {service.description && <div>{service.description}</div>}
                                      {service.price > 0 && <div>Giá: {service.price.toLocaleString()} VNĐ</div>}
                                    </>
                                  }
                                />
                              </List.Item>
                            );
                          }}
                        />
                      ) : (
                        <div>Chưa có dịch vụ nào được đề xuất</div>
                      )}
                    </Card>
                    
                    <Card title="Các dịch vụ có sẵn">
                      <List
                        itemLayout="horizontal"
                        dataSource={(skinCareServices || [])
                          .filter(service => service && service.id && service.serviceName)}
                        renderItem={(service) => (
                          <List.Item
                            actions={[
                              <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={() => addServiceRecommendation(service.id)}
                              >
                                Thêm
                              </Button>
                            ]}
                          >
                            <List.Item.Meta
                              title={<span>{service.serviceName}</span>}
                              description={
                                <>
                                  {service.serviceDescription && <div>{service.serviceDescription}</div>}
                                  {service.price > 0 && <div>Giá: {service.price.toLocaleString()} VNĐ</div>}
                                </>
                              }
                            />
                          </List.Item>
                        )}
                        pagination={{ pageSize: 5 }}
                      />
                    </Card>
                  </div>
                )}
              </Modal>
            </>
          )
        }
      ]} />
      
      <Modal
        title="Recommendation Data Debug"
        open={isDebugModalVisible}
        onCancel={() => setIsDebugModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDebugModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {renderDebugInfo()}
      </Modal>
    </div>
  );
};

export default SurveyManagerPage;
