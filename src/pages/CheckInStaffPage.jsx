// src/pages/CheckInStaffPage.jsx
import React, { useEffect, useState } from 'react';
import bookingApi from '../api/bookingApi';
import scheduleApi from '../api/scheduleApi';

const CheckInStaffPage = () => {
  const [bookings, setBookings] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // Fetch danh sách booking cho staff (giả sử chỉ lấy những booking chưa CheckIn - status = 0)
  const fetchBookings = async () => {
    try {
      const res = await bookingApi.getAllBookings();
      const filtered = res.data.filter(booking =>
        booking.skintherapistName?.toLowerCase() === currentUser.fullName.toLowerCase() &&
        booking.status === 0
      );
      setBookings(filtered);
    } catch (error) {
      console.error('Lỗi tải danh sách booking:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  // Hàm xử lý CheckIn
  const handleCheckIn = async (booking) => {
    try {
      const therapistId = currentUser.userId;
      // Gọi API lấy schedule của chuyên viên
      const scheduleResponse = await scheduleApi.getByTherapistId(therapistId);

      const eventStartTime = new Date(booking.date);
      const eventStartTimeLocal = eventStartTime
        .toLocaleString('sv', { timeZone: 'Asia/Bangkok' })
        .replace(' ', 'T');

      let scheduleLogId;
      // Tìm scheduleLog phù hợp dựa vào thời gian
      const matchingDay = scheduleResponse.data.find(day => day.dateWork === eventStartTimeLocal);
      if (matchingDay) {
        const matchingLog = matchingDay.scheduleLogs.find(log => log.timeStartShift === eventStartTimeLocal);
        if (matchingLog) {
          scheduleLogId = matchingLog.id;
        }
      }
      if (!scheduleLogId) {
        throw new Error('Không tìm thấy scheduleLog phù hợp để CheckIn');
      }

      // Gọi API CheckIn (giả lập, vì BE chưa có API thực sự)
      // await bookingApi.CheckIn(therapistId, scheduleLogId);
      console.log('Gọi API CheckIn với:', therapistId, scheduleLogId);
      alert('CheckIn thành công (giả lập)!');

      // Refresh danh sách booking
      fetchBookings();
    } catch (error) {
      console.error('Lỗi khi CheckIn:', error);
      alert('Có lỗi xảy ra khi CheckIn. Vui lòng thử lại.');
    }
  };

  return (
    <div className="checkin-page">
      <h1>Trang CheckIn cho Staff</h1>
      {bookings.length === 0 ? (
        <p>Không có booking nào cần CheckIn.</p>
      ) : (
        <div className="booking-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-item">
              <p>
                <strong>Dịch vụ:</strong> {booking.serviceName}
              </p>
              <p>
                <strong>Thời gian:</strong> {new Date(booking.date).toLocaleString()}
              </p>
              <button onClick={() => handleCheckIn(booking)}>CheckIn</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckInStaffPage;
