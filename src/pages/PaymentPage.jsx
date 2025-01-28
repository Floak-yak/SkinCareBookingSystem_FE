import React from 'react';
import { Typography, Button, Select } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const PaymentPage = () => {
  const handlePayment = () => {
    console.log('Payment Successful');
    // Chuyển về HomePage hoặc ConfirmationPage
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
      <Title level={3}>Payment</Title>
      <p>Service: Facial</p>
      <p>Date: 2025-01-10</p>
      <p>Total: $100</p>
      
      <Select placeholder="Choose Payment Method" style={{ width: '100%', marginBottom: '20px' }}>
        <Option value="credit_card">Credit Card</Option>
        <Option value="paypal">PayPal</Option>
        <Option value="cash">Cash</Option>
      </Select>

      <Button type="primary" onClick={handlePayment}>Pay Now</Button>
    </div>
  );
};

export default PaymentPage;
