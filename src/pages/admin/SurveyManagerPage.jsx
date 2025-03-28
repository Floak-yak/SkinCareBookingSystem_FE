import React, { useEffect, useState } from 'react';
import { Tabs, Button, Table, Form, Input, Select, Modal, message, Card, Divider, List, Space, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import surveyApi from '../../api/surveyApi';
import servicesApi from '../../api/servicesApi';
import '../../styles/SurveyManagerPage.css';

const { TabPane } = Tabs;
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
  
  // State for services recommendation
  const [skinCareServices, setSkinCareServices] = useState([]);
  const [resultServicesModalVisible, setResultServicesModalVisible] = useState(false);
  
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
      const response = await surveyApi.getAllResults();
      if (response.data) {
        setSurveyResults(response.data);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  // Fetch available services for recommendation
  const fetchServices = async () => {
    try {
      const response = await servicesApi.getAllServices();
      if (response.data) {
        const services = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);
          
        setSkinCareServices(services);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
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
  const handleManageResultServices = (result) => {
    setSelectedResult(result);
    setResultServicesModalVisible(true);
  };

  // Add a service recommendation
  const addServiceRecommendation = async (serviceId) => {
    try {
      if (!selectedResult) return;
      
      await surveyApi.addRecommendedService({
        surveyResultId: selectedResult.id,
        serviceId: serviceId,
        priority: 1
      });
      
      message.success('Service recommendation added');
      fetchResults();
    } catch (err) {
      console.error('Error adding service recommendation:', err);
      message.error('Failed to add service recommendation');
    }
  };

  // Remove a service recommendation
  const removeServiceRecommendation = async (recommendationId) => {
    try {
      await surveyApi.deleteRecommendedService(recommendationId);
      message.success('Service recommendation removed');
      fetchResults();
    } catch (err) {
      console.error('Error removing service recommendation:', err);
      message.error('Failed to remove service recommendation');
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
      title: 'ID',
      dataIndex: 'resultId',
      key: 'resultId',
    },
    {
      title: 'Skin Type',
      dataIndex: 'skinType',
      key: 'skinType',
    },
    {
      title: 'Description',
      dataIndex: 'resultText',
      key: 'resultText',
      ellipsis: true,
    },
    {
      title: 'Recommended Services',
      dataIndex: 'recommendedServices',
      key: 'recommendedServices',
      render: (_, record) => {
        const services = record.recommendedServices || [];
        return (
          <div>
            {services.length ? (
              <Tag color="blue">{services.length} services</Tag>
            ) : (
              <Tag color="red">No services</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEditResult(record)}
          >
            Edit
          </Button>
          <Button 
            icon={<PlusOutlined />} 
            onClick={() => handleManageResultServices(record)}
          >
            Manage Services
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="survey-manager-page">
      <h1>Survey Management System</h1>
      
      <Tabs defaultActiveKey="questions">
        <TabPane tab="Survey Questions" key="questions">
          <div className="tab-header">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddQuestion}
            >
              Add New Question
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
            visible={showQuestionModal}
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
        </TabPane>
        
        <TabPane tab="Survey Results" key="results">
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
              Add New Result
            </Button>
          </div>
          
          <Table 
            columns={resultColumns} 
            dataSource={surveyResults} 
            rowKey="id" 
            pagination={{ pageSize: 10 }}
          />
          
          <Modal
            title={selectedResult ? "Edit Survey Result" : "Add New Survey Result"}
            visible={showResultModal}
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
                label="Result ID"
                rules={[{ required: true, message: 'Please enter a result ID' }]}
              >
                <Input placeholder="e.g., RESULT_1, RESULT_DRY_SKIN, etc." />
              </Form.Item>
              
              <Form.Item
                name="skinType"
                label="Skin Type"
                rules={[{ required: true, message: 'Please enter the skin type' }]}
              >
                <Select placeholder="Select skin type">
                  <Option value="Oily">Oily Skin</Option>
                  <Option value="Dry">Dry Skin</Option>
                  <Option value="Combination">Combination Skin</Option>
                  <Option value="Normal">Normal Skin</Option>
                  <Option value="Sensitive">Sensitive Skin</Option>
                  <Option value="Acne-Prone">Acne-Prone Skin</Option>
                  <Option value="Aging">Aging Skin</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="resultText"
                label="Result Description"
                rules={[{ required: true, message: 'Please enter the result description' }]}
              >
                <TextArea rows={4} placeholder="Detailed description of the skin analysis result" />
              </Form.Item>
              
              <Form.Item
                name="recommendationText"
                label="General Recommendations"
                rules={[{ required: true, message: 'Please enter recommendations' }]}
              >
                <TextArea rows={4} placeholder="General skin care recommendations" />
              </Form.Item>
              
              <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
                <Button 
                  style={{ marginRight: 8 }} 
                  onClick={() => setShowResultModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                >
                  Save Result
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          
          <Modal
            title="Manage Recommended Services"
            visible={resultServicesModalVisible}
            onCancel={() => setResultServicesModalVisible(false)}
            footer={null}
            width={800}
          >
            {selectedResult && (
              <div>
                <Card title="Current Recommendations" style={{ marginBottom: 16 }}>
                  {selectedResult.recommendedServices?.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={selectedResult.recommendedServices}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => removeServiceRecommendation(item.id)}
                            >
                              Remove
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={item.skincareService.serviceName}
                            description={`Price: ${item.skincareService.price} VND`}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div>No services recommended yet</div>
                  )}
                </Card>
                
                <Card title="Available Services">
                  <List
                    itemLayout="horizontal"
                    dataSource={skinCareServices}
                    renderItem={service => (
                      <List.Item
                        actions={[
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => addServiceRecommendation(service.id)}
                          >
                            Add
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={service.serviceName}
                          description={
                            <>
                              <div>{service.serviceDescription}</div>
                              <div>Price: {service.price} VND</div>
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
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SurveyManagerPage;
