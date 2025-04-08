import React, { useState, useEffect } from 'react';
import { Card, Avatar, Row, Col, Typography, Spin, Empty, Button } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const SpecialistList = () => {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load specialists when component mounts
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      setLoading(true);
      // You'll need to create or use an existing API endpoint for this
      const response = await apiClient.get('/api/Specialists');
      setSpecialists(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching specialists:', err);
      setError('Could not load specialists. Please try again later.');
      // Add some dummy data for development
      setSpecialists([
        {
          id: 1,
          name: 'Dr. Jane Smith',
          title: 'Senior Skin Therapist',
          description: 'Specialized in acne treatment and anti-aging procedures with over 10 years of experience.',
          imageUrl: '/images/specialists/jane-smith.jpg',
          phone: '+84 123 456 789',
          email: 'jane.smith@skincare.com',
          specialties: ['Acne Treatment', 'Anti-aging']
        },
        {
          id: 2,
          name: 'Dr. John Davis',
          title: 'Dermatologist',
          description: 'Board-certified dermatologist with expertise in skin cancer screening and treatment.',
          imageUrl: '/images/specialists/john-davis.jpg',
          phone: '+84 987 654 321',
          email: 'john.davis@skincare.com',
          specialties: ['Skin Cancer Screening', 'Medical Dermatology']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Loading specialists..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Empty description={error} />
        <Button type="primary" onClick={fetchSpecialists} style={{ marginTop: '20px' }}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="specialist-list-container" style={{ padding: '40px 20px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
        Our Skin Therapy Specialists
      </Title>
      <Paragraph style={{ textAlign: 'center', marginBottom: '30px', maxWidth: '800px', margin: '0 auto' }}>
        Meet our team of highly qualified skin care specialists who are dedicated to helping you achieve your skin goals.
      </Paragraph>

      <Row gutter={[24, 24]} style={{ marginTop: '30px' }}>
        {specialists.map((specialist) => (
          <Col xs={24} sm={12} md={8} key={specialist.id}>
            <Card
              hoverable
              cover={
                <div style={{ height: '250px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    alt={specialist.name} 
                    src={specialist.imageUrl || '/images/specialist-default.jpg'} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      objectPosition: 'center top'
                    }} 
                  />
                </div>
              }
              style={{ height: '100%' }}
            >
              <Meta
                title={<Title level={4}>{specialist.name}</Title>}
                description={
                  <div>
                    <Text strong>{specialist.title}</Text>
                    <Paragraph style={{ marginTop: '10px' }}>{specialist.description}</Paragraph>
                    
                    {specialist.specialties && specialist.specialties.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <Text strong>Specialties:</Text>
                        <div>
                          {specialist.specialties.map((specialty, index) => (
                            <span 
                              key={index} 
                              style={{ 
                                display: 'inline-block',
                                background: '#f0f2f5',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                margin: '4px 4px 4px 0',
                                fontSize: '12px'
                              }}
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ marginTop: '15px' }}>
                      {specialist.phone && (
                        <div style={{ marginBottom: '5px' }}>
                          <PhoneOutlined style={{ marginRight: '8px' }} />
                          <Text>{specialist.phone}</Text>
                        </div>
                      )}
                      {specialist.email && (
                        <div>
                          <MailOutlined style={{ marginRight: '8px' }} />
                          <Text>{specialist.email}</Text>
                        </div>
                      )}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SpecialistList;
