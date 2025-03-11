import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/booking.css";

const services = [
  { name: "Chăm sóc da cơ bản", duration: "1 giờ", times: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"] },
  { name: "Trị mụn chuyên sâu", duration: "1.5 giờ", times: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"] },
  { name: "Massage thư giãn", duration: "1 giờ", times: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"] },
  { name: "Liệu trình trẻ hóa da", duration: "2 giờ", times: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"] }
];

const staffList = ["Nguyễn Văn A", "Trần Thị B", "Lê C"];

const generateWeeks = (start) => {
  const weeks = [];
  for (let i = 0; i < 2; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i * 7 + j);
      week.push(date.toISOString().split("T")[0]);
    }
    weeks.push(week);
  }
  return weeks;
};

const BookingPage = () => {
  const today = new Date();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [weeks, setWeeks] = useState(generateWeeks(today));
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    // Load current user và tự động điền số điện thoại
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
      if (user.PhoneNumber || user.FullName) {
        setName(user.FullName);
        setPhone(user.PhoneNumber);
      }
    }

    // Load booked appointments
    const savedAppointments = localStorage.getItem('bookedAppointments');
    if (savedAppointments) {
      setBookedAppointments(JSON.parse(savedAppointments));
    }
  }, []);

  // Thêm useEffect để lắng nghe thay đổi đăng nhập/đăng xuất
  useEffect(() => {
    const handleStorageChange = () => {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        if (user.PhoneNumber) {
          setPhone(user.PhoneNumber);
        }
      } else {
        setCurrentUser(null);
        setPhone('');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleStorageChange);
    };
  }, []);

  const validatePhone = (phone) => {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
  };

  // Kiểm tra xem thời gian đã được đặt chưa
  const isTimeSlotBooked = (date, time, staff) => {
    return bookedAppointments.some(appointment =>
      appointment.date === date &&
      appointment.time === time &&
      appointment.staff === staff
    );
  };

  // Sửa lại hàm kiểm tra thời gian
  const checkBookingTime = (bookingDate, bookingTime) => {
    const now = new Date();
    const [hours, minutes] = bookingTime.split(':').map(Number);

    // Tạo datetime chính xác của lịch hẹn
    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    // Tính số giờ chênh lệch
    const hoursDiff = (bookingDateTime - now) / (1000 * 60 * 60);
    return hoursDiff >= 24; // true nếu còn từ 24h trở lên
  };

  const handleBooking = async () => {
    try {
      let errors = [];
      if (!selectedService) errors.push("Vui lòng chọn dịch vụ.");
      if (!selectedDate || !selectedTime) errors.push("Vui lòng chọn ngày và giờ.");
      if (!name.trim()) errors.push("Vui lòng nhập tên khách hàng.");
      if (!phone) errors.push("Vui lòng nhập số điện thoại.");
      if (phone && !validatePhone(phone)) errors.push("Số điện thoại không hợp lệ.");

      if (selectedStaff && isTimeSlotBooked(selectedDate, selectedTime, selectedStaff)) {
        errors.push("Thời gian này đã được đặt cho nhân viên này. Vui lòng chọn thời gian khác hoặc nhân viên khác.");
      }

      if (errors.length > 0) {
        errors.forEach(err => toast.error(err));
        return;
      }

      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      let finalStaff = selectedStaff;
      if (!selectedStaff) {
        const availableStaff = staffList.filter(staff =>
          !isTimeSlotBooked(selectedDate, selectedTime, staff)
        );
        if (availableStaff.length === 0) {
          toast.error("Không có nhân viên trống lịch vào thời gian này.");
          return;
        }
        finalStaff = availableStaff[Math.floor(Math.random() * availableStaff.length)];
        setSelectedStaff(finalStaff);
      }

      const newBooking = {
        id: Date.now(),
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
        staff: finalStaff,
        customerName: name,
        phone: phone,
        status: 'pending'
      };

      const updatedAppointments = [...bookedAppointments, newBooking];
      setBookedAppointments(updatedAppointments);
      localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));

      setError("");

      // Chỉ hiện QR code nếu không phải đang dời lịch
      if (!isRescheduling) {
        setQrCode("https://th.bing.com/th/id/OIP.yBVcQn2EXjmzi8z3jq49IAHaHa?w=168&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7");
      }

      setBookingConfirmed(true);
      toast.success(isRescheduling ? "Dời lịch thành công!" : "Đặt lịch thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScanned = async () => {
    try {
      setIsLoading(true);
      // Giả lập quá trình thanh toán
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentStatus("success");
      toast.success("Thanh toán thành công!");

      // Đợi cho toast hiển thị xong (3 giây) rồi mới reset form
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Reset tất cả các trường về trạng thái ban đầu
      setBookingConfirmed(false);
      setQrCode("");
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setSelectedStaff("");
      setPaymentStatus("pending");

      // Giữ lại thông tin người dùng nếu đã đăng nhập
      if (currentUser) {
        setName(currentUser.FullName || "");
        setPhone(currentUser.PhoneNumber || "");
      } else {
        setName("");
        setPhone("");
      }
    } catch (error) {
      setPaymentStatus("failed");
      toast.error("Thanh toán thất bại. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Xóa booking khỏi localStorage
    const updatedAppointments = bookedAppointments.filter(
      appointment => !(
        appointment.date === selectedDate &&
        appointment.time === selectedTime &&
        appointment.staff === selectedStaff
      )
    );
    setBookedAppointments(updatedAppointments);
    localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));

    // Đặt lại các trạng thái
    setBookingConfirmed(false);
    setQrCode("");
    setSelectedService("");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedStaff("");

    // Kiểm tra và điền lại thông tin từ currentUser
    if (currentUser) {
      setName(currentUser.FullName || "");
      setPhone(currentUser.PhoneNumber || "");
    } else {
      setName("");
      setPhone("");
    }

    setPaymentStatus("pending");
    toast.info("Đã hủy đặt lịch thành công!");
    setIsRescheduling(false);
  };

  const handleSelectDateTime = (date, time) => {
    // Kiểm tra xem khung giờ đã được đặt chưa
    const isBooked = bookedSlots.some(slot => slot.date === date && slot.time === time);
    if (isBooked) return; // Nếu đã được đặt, không cho phép chọn

    if (selectedDate === date && selectedTime === time) {
      // Nếu đã chọn rồi, hủy chọn
      setSelectedDate("");
      setSelectedTime("");
    } else {
      // Nếu chưa chọn, chọn mới
      setSelectedDate(date);
      setSelectedTime(time);
    }
  };

  // Cập nhật hàm handleDeleteBooking
  const handleDeleteBooking = (booking) => {
    try {
      const canReschedule = checkBookingTime(booking.date, booking.time);

      if (canReschedule) {
        // Đánh dấu là đang dời lịch
        setIsRescheduling(true);

        // Hiển thị modal hoặc chuyển sang form đặt lại lịch
        setSelectedService(booking.service);
        setName(booking.customerName);
        setPhone(booking.phone);
        setSelectedStaff(booking.staff);

        // Xóa lịch cũ
        const updatedAppointments = bookedAppointments.filter(
          appointment => appointment.id !== booking.id
        );
        setBookedAppointments(updatedAppointments);
        localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));

        toast.info("Vui lòng chọn thời gian mới cho lịch đặt của bạn");
      } else {
        // Xử lý hủy lịch như cũ
        const updatedAppointments = bookedAppointments.filter(
          appointment => appointment.id !== booking.id
        );
        setBookedAppointments(updatedAppointments);
        localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));

        toast.warning("Lịch đặt đã bị hủy do thời gian còn lại dưới 24 giờ");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xử lý lịch đặt!");
    }
  };

  // Thêm hàm getCurrentUserBookings
  const getCurrentUserBookings = () => {
    if (!currentUser) return [];
    return bookedAppointments.filter(booking => booking.phone === currentUser.PhoneNumber);
  };

  // Sửa lại hàm handleDirectBooking
  const handleDirectBooking = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPaymentStatus("success");
      toast.success("Đặt lịch thành công!");

      // Đợi cho toast hiển thị xong (3 giây) rồi mới reset form
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Reset tất cả các trường về trạng thái ban đầu
      setBookingConfirmed(false);
      setQrCode("");
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setSelectedStaff("");
      setPaymentStatus("pending");
      setIsRescheduling(false);

      // Giữ lại thông tin người dùng nếu đã đăng nhập
      if (currentUser) {
        setName(currentUser.FullName || "");
        setPhone(currentUser.PhoneNumber || "");
      } else {
        setName("");
        setPhone("");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div style={{ flex: 2, marginRight: "20px" }}>
        <h2 className="booking-title">Đặt Lịch Dịch Vụ</h2>

        {!bookingConfirmed ? (
          <>
            {/* Form đặt lịch */}
            <div>
              <div className="form-group">
                <label className="form-label">Chọn dịch vụ:</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="form-select"
                >
                  <option value="">Chọn dịch vụ</option>
                  {services.map((service, index) => (
                    <option key={index} value={service.name}>
                      {service.name} ({service.duration})
                    </option>
                  ))}
                </select>
              </div>

              {/* Calendar section with improved styling */}
              {selectedService && (
                <div className="calendar-section">
                  <label className="form-label">Chọn ngày và giờ:</label>
                  <div className="calendar-controls">
                    <button
                      onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
                      className="calendar-button"
                    >
                      &lt;
                    </button>
                    <div className="calendar-container">
                      <table className="calendar-table">
                        <thead>
                          <tr className="calendar-header">
                            <th className="calendar-header-cell">Giờ</th>
                            {weeks[currentWeek].map((d, index) => (
                              <th key={index} className="calendar-header-cell">
                                {new Date(d).toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" })}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {services.find(service => service.name === selectedService).times.map((time, rowIndex) => (
                            <tr key={rowIndex}>
                              <td className="calendar-cell calendar-time">{time}</td>
                              {weeks[currentWeek].map((d, colIndex) => {
                                const isBooked = isTimeSlotBooked(d, time, selectedStaff);
                                const buttonClass = `time-slot-button ${isBooked
                                  ? 'time-slot-button-booked'
                                  : selectedDate === d && selectedTime === time
                                    ? 'time-slot-button-selected'
                                    : 'time-slot-button-available'
                                  }`;

                                return (
                                  <td key={colIndex} className="calendar-cell">
                                    <button
                                      onClick={() => handleSelectDateTime(d, time)}
                                      disabled={isBooked}
                                      className={buttonClass}
                                    >
                                      {isBooked ? "Đã đặt" : selectedDate === d && selectedTime === time ? "✔" : "Chọn"}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={() => setCurrentWeek(Math.min(weeks.length - 1, currentWeek + 1))}
                      className="calendar-button"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}

              {/* Staff selection */}
              {selectedTime && (
                <div className="form-group">
                  <label className="form-label">Chọn nhân viên:</label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Chọn nhân viên</option>
                    {staffList.map((staff, index) => (
                      <option key={index} value={staff}>{staff}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Customer info section */}
              <div className="form-group">
                <label className="form-label">Tên khách hàng:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Submit button */}
              <div className="submit-button-container">
                <button
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="submit-button"
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                </button>
              </div>

              {/* Booked appointments section */}
              {currentUser && (
                <div className="booked-section">
                  <h3 className="booked-title">Lịch đã đặt của bạn</h3>
                  {getCurrentUserBookings().length === 0 ? (
                    <p className="no-bookings">Bạn chưa có lịch đặt nào</p>
                  ) : (
                    <div className="bookings-list">
                      {getCurrentUserBookings().map((booking) => (
                        <div key={booking.id} className="booking-card">
                          <p className="booking-detail"><strong>Dịch vụ:</strong> {booking.service}</p>
                          <p className="booking-detail"><strong>Ngày:</strong> {new Date(booking.date).toLocaleDateString("vi-VN")}</p>
                          <p className="booking-detail"><strong>Giờ:</strong> {booking.time}</p>
                          <p className="booking-detail"><strong>Nhân viên:</strong> {booking.staff}</p>
                          <p className="booking-detail"><strong>Trạng thái:</strong> {booking.status}</p>

                          {checkBookingTime(booking.date, booking.time) ? (
                            <>
                              <button
                                onClick={() => handleDeleteBooking(booking)}
                                className="reschedule-button"
                              >
                                Dời lịch
                              </button>
                              <p className="booking-message reschedule-message">
                                Có thể dời lịch (còn trên 24 giờ)
                              </p>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleDeleteBooking(booking)}
                                className="cancel-button"
                              >
                                Hủy lịch
                              </button>
                              <p className="booking-message cancel-message">
                                Chỉ có thể hủy lịch (còn dưới 24 giờ)
                              </p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          // Confirmation and payment section
          <div className="confirmation-container">
            <h3 className="confirmation-title">Thông tin đặt lịch</h3>
            <div className="booking-info">
              <p className="booking-info-item"><strong>Dịch vụ:</strong> {selectedService}</p>
              <p className="booking-info-item"><strong>Ngày:</strong> {new Date(selectedDate).toLocaleDateString("vi-VN")}</p>
              <p className="booking-info-item"><strong>Giờ:</strong> {selectedTime}</p>
              <p className="booking-info-item"><strong>Nhân viên:</strong> {selectedStaff}</p>
              <p className="booking-info-item"><strong>Tên khách hàng:</strong> {name}</p>
              <p className="booking-info-item"><strong>Số điện thoại:</strong> {phone}</p>
            </div>

            {/* QR Code section */}
            {isRescheduling ? (
              <div className="qr-container">
                <button
                  onClick={handleDirectBooking}
                  disabled={isLoading}
                  className="submit-button"
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                </button>
              </div>
            ) : (
              qrCode && (
                <div className="qr-container">
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="qr-code"
                  />
                  {isLoading ? (
                    <p>Đang xử lý thanh toán...</p>
                  ) : paymentStatus === "success" ? (
                    <p className="payment-success">Thanh toán thành công!</p>
                  ) : paymentStatus === "failed" ? (
                    <div>
                      <p className="payment-failed">Thanh toán thất bại</p>
                      <button
                        onClick={handleQRScanned}
                        className="try-again-button"
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleQRScanned}
                      className="qr-button"
                    >
                      Quét mã QR để thanh toán
                    </button>
                  )}
                </div>
              )
            )}

            {/* Cancel button */}
            <div className="cancel-container">
              <button
                onClick={handleCancel}
                className="cancel-final-button"
              >
                Hủy đặt lịch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;