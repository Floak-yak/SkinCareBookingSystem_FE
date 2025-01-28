import React from 'react';
import { Form, Radio, Button, Typography } from 'antd';

const { Title } = Typography;

const TestingPage = () => {
  const onFinish = (values) => {
    console.log('Quiz Results:', values);
    // Chuyển sang BookingPage
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <Title level={3}>Skincare Quiz</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="skinType" label="What is your skin type?" rules={[{ required: true, message: 'Please select one!' }]}>
          <Radio.Group>
            <Radio value="dry">Dry</Radio>
            <Radio value="oily">Oily</Radio>
            <Radio value="combination">Combination</Radio>
            <Radio value="normal">Normal</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="skinConcern" label="What is your main skin concern?" rules={[{ required: true, message: 'Please select one!' }]}>
          <Radio.Group>
            <Radio value="acne">Acne</Radio>
            <Radio value="aging">Aging</Radio>
            <Radio value="hydration">Hydration</Radio>
            <Radio value="sensitivity">Sensitivity</Radio>
          </Radio.Group>
        </Form.Item>

        <Button type="primary" htmlType="submit">Submit</Button>
      </Form>
    </div>
  );
};

export default TestingPage;
