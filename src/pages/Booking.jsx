import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/booking.css';

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const serviceInfo = location.state;
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    note: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tại đây bạn có thể thêm logic gửi dữ liệu đến server
    setShowSuccess(true);
    
    // Tăng thời gian chờ lên 30 giây
    setTimeout(() => {
      navigate('/');
    }, 30000); // 30 giây
  };

  if (showSuccess) {
    // Format lại ngày tháng cho đẹp
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const handleBackHome = () => {
      navigate('/');
    };

    return (
      <div className="booking-success">
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h2>Đặt Lịch Thành Công!</h2>
          <div className="booking-details">
            <div className="customer-info">
              <h3>Thông Tin Khách Hàng</h3>
              <p><strong>Họ và tên:</strong> {formData.name}</p>
              <p><strong>Số điện thoại:</strong> {formData.phone}</p>
            </div>

            <div className="appointment-info">
              <h3>Chi Tiết Lịch Hẹn</h3>
              <div className="confirmation-details">
                <p><strong>Dịch vụ:</strong> {serviceInfo.serviceName}</p>
                <p><strong>Thời gian điều trị:</strong> {serviceInfo.duration}</p>
                <p><strong>Giá dịch vụ:</strong> {serviceInfo.price}</p>
                <p><strong>Ngày hẹn:</strong> {formatDate(formData.date)}</p>
                <p><strong>Giờ hẹn:</strong> {formData.time}</p>
                {formData.note && (
                  <div className="note-section">
                    <p><strong>Ghi chú:</strong></p>
                    <p className="note-content">{formData.note}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="contact-info">
              <p><i className="info-icon">ℹ️</i> Chúng tôi sẽ liên hệ với bạn qua số điện thoại {formData.phone} để xác nhận lịch hẹn</p>
              
            </div>
          </div>
          <div className="success-footer">
            <p className="thank-you">Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi!</p>
            <div className="action-buttons">
              <button 
                className="back-home-btn"
                onClick={handleBackHome}
              >
                <i className="home-icon">🏠</i>
                Trở Về Trang Chủ
              </button>
              <p className="redirect-message">
                (Tự động chuyển về trang chủ sau 30 giây)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-header">
        <h1>Đặt Lịch Dịch Vụ</h1>
        <p>Vui lòng điền thông tin để đặt lịch</p>
      </div>

      <div className="booking-container">
        <div className="service-summary">
          <h2>Thông Tin Dịch Vụ</h2>
          <div className="summary-details">
            <p><strong>Dịch vụ:</strong> {serviceInfo.serviceName}</p>
            <p><strong>Thời gian:</strong> {serviceInfo.duration}</p>
            <p><strong>Giá:</strong> {serviceInfo.price}</p>
          </div>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Họ và tên</label>
            <input 
              type="text" 
              id="name" 
              required 
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input 
              type="tel" 
              id="phone" 
              required 
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Ngày hẹn</label>
            <input 
              type="date" 
              id="date" 
              required 
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Giờ hẹn</label>
            <select 
              id="time" 
              required
              value={formData.time}
              onChange={handleChange}
            >
              <option value="">Chọn giờ</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="note">Ghi chú</label>
            <textarea 
              id="note" 
              rows="3"
              value={formData.note}
              onChange={handleChange}
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">
            Xác Nhận Đặt Lịch
          </button>
        </form>
      </div>
    </div>
  );
}

export default Booking; 