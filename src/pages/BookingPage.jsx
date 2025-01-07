import React from 'react';
import { Button, Card } from 'antd';

const BookingPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Booking Page</h1>
      <Card title="Facial Treatment" style={{ marginBottom: '20px' }}>
        <p>Deep cleansing facial to rejuvenate your skin.</p>
        <Button type="primary">Book Now</Button>
      </Card>
      <Card title="Acne Treatment">
        <p>Specialized treatment for acne-prone skin.</p>
        <Button type="primary">Book Now</Button>
      </Card>
    </div>
  );
};

export default BookingPage;
