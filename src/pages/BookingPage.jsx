import React from 'react';
import { Form, DatePicker, Select, Button, Typography } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const BookingPage = () => {
  const onFinish = (values) => {
    console.log('Booking Details:', values);
    // Chuyển sang PaymentPage
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <Title level={3}>Book Your Service</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="service" label="Select Service" rules={[{ required: true, message: 'Please select a service!' }]}>
          <Select placeholder="Choose a service">
            <Option value="facial">Facial</Option>
            <Option value="peel">Chemical Peel</Option>
            <Option value="massage">Massage</Option>
          </Select>
        </Form.Item>

        <Form.Item name="date" label="Choose Date" rules={[{ required: true, message: 'Please select a date!' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Button type="primary" htmlType="submit">Book Now</Button>
      </Form>
    </div>
  );
};

export default BookingPage;
