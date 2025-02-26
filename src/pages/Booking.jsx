import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  useEffect(() => {
    // Load current user và tự động điền số điện thoại
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
      if (user.PhoneNumber) {
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

  const handleBooking = async () => {
    try {
      let errors = [];
      if (!selectedService) errors.push("Vui lòng chọn dịch vụ.");
      if (!selectedDate || !selectedTime) errors.push("Vui lòng chọn ngày và giờ.");
      if (!name.trim()) errors.push("Vui lòng nhập tên khách hàng.");
      if (!phone) errors.push("Vui lòng nhập số điện thoại.");
      if (phone && !validatePhone(phone)) errors.push("Số điện thoại không hợp lệ.");

      // Kiểm tra xem thời gian đã được đặt chưa
      if (selectedStaff && isTimeSlotBooked(selectedDate, selectedTime, selectedStaff)) {
        errors.push("Thời gian này đã được đặt cho nhân viên này. Vui lòng chọn thời gian khác hoặc nhân viên khác.");
      }

      if (errors.length > 0) {
        errors.forEach(err => toast.error(err));
        return;
      }

      setIsLoading(true);
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Nếu khách không chọn nhân viên, hệ thống sẽ tự động chọn ngẫu nhiên
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

      // Tạo đối tượng booking mới
      const newBooking = {
        id: Date.now(),
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
        staff: finalStaff,
        customerName: name,
        phone: phone,
        status: 'pending' // pending, confirmed, cancelled
      };

      // Cập nhật localStorage và state
      const updatedAppointments = [...bookedAppointments, newBooking];
      setBookedAppointments(updatedAppointments);
      localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));

      setError("");
      setQrCode("https://th.bing.com/th/id/OIP.yBVcQn2EXjmzi8z3jq49IAHaHa?w=168&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7");
      setBookingConfirmed(true);
      toast.success("Đặt lịch thành công!");
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
    setName("");
    setPhone("");
    setPaymentStatus("pending");
    toast.info("Đã hủy đặt lịch thành công!");
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

  // Thêm hàm xóa lịch đã đặt
  const handleDeleteBooking = (bookingToDelete) => {
    try {
      // Lọc ra các lịch đặt khác, loại bỏ lịch cần xóa
      const updatedAppointments = bookedAppointments.filter(
        appointment => appointment.id !== bookingToDelete.id
      );
      
      // Cập nhật state và localStorage
      setBookedAppointments(updatedAppointments);
      localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));
      
      toast.success("Đã xóa lịch đặt thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa lịch đặt!");
    }
  };

  // Thêm hàm getCurrentUserBookings
  const getCurrentUserBookings = () => {
    if (!currentUser) return [];
    return bookedAppointments.filter(booking => booking.phone === currentUser.PhoneNumber);
  };

  return (
    <div style={{ display: "flex", width: "90%", margin: "auto", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", background: "#fff" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ flex: 2, marginRight: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Đặt lịch dịch vụ</h2>
        
        {!bookingConfirmed ? (
          <>
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "10px" }}>Chọn dịch vụ:</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "16px" }}
              >
                <option value="">Chọn dịch vụ</option>
                {services.map((service, index) => (
                  <option key={index} value={service.name}>{service.name} ({service.duration})</option>
                ))}
              </select>
            </div>
            {selectedService && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "10px" }}>Chọn ngày và giờ:</label>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <button
                    onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
                    style={{ padding: "10px", border: "none", background: "#28a745", color: "#fff", borderRadius: "5px", cursor: "pointer" }}
                  >
                    &lt;
                  </button>
                  <div style={{ flex: 1, margin: "0 10px", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
                      <thead>
                        <tr style={{ background: "#f8f9fa" }}>
                          <th style={{ padding: "10px", border: "1px solid #ddd" }}>Giờ</th>
                          {weeks[currentWeek].map((d, index) => (
                            <th key={index} style={{ padding: "10px", border: "1px solid #ddd" }}>
                              {new Date(d).toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" })}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {services.find(service => service.name === selectedService).times.map((time, rowIndex) => (
                          <tr key={rowIndex}>
                            <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold" }}>{time}</td>
                            {weeks[currentWeek].map((d, colIndex) => {
                              const isBooked = isTimeSlotBooked(d, time, selectedStaff);
                              return (
                                <td key={colIndex} style={{ padding: "10px", border: "1px solid #ddd" }}>
                                  <button
                                    onClick={() => handleSelectDateTime(d, time)}
                                    disabled={isBooked}
                                    style={{
                                      padding: "10px",
                                      border: "1px solid #28a745",
                                      borderRadius: "5px",
                                      background: isBooked ? "#ddd" : selectedDate === d && selectedTime === time ? "#28a745" : "#fff",
                                      color: isBooked ? "#888" : selectedDate === d && selectedTime === time ? "#fff" : "#28a745",
                                      cursor: isBooked ? "not-allowed" : "pointer",
                                      width: "100%"
                                    }}
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
                    style={{ padding: "10px", border: "none", background: "#28a745", color: "#fff", borderRadius: "5px", cursor: "pointer" }}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
            {selectedTime && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "10px" }}>Chọn nhân viên:</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "16px" }}
                >
                  <option value="">Chọn nhân viên</option>
                  {staffList.map((staff, index) => (
                    <option key={index} value={staff}>{staff}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "10px" }}>Tên khách hàng:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "16px" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "10px" }}>Số điện thoại:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "16px" }}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleBooking}
                disabled={isLoading}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  background: "#28a745",
                  color: "white",
                  marginRight: "10px",
                  fontSize: "16px",
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
              </button>
            </div>
            
            {/* Danh sách lịch đã đặt */}
            {currentUser && (
              <div style={{ marginTop: "30px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
                <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Lịch đã đặt của bạn</h3>
                {getCurrentUserBookings().length === 0 ? (
                  <p style={{ textAlign: "center" }}>Bạn chưa có lịch đặt nào</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {getCurrentUserBookings().map((booking) => (
                      <div
                        key={booking.id}
                        style={{
                          padding: "15px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          backgroundColor: "#f8f9fa"
                        }}
                      >
                        <p><strong>Dịch vụ:</strong> {booking.service}</p>
                        <p><strong>Ngày:</strong> {new Date(booking.date).toLocaleDateString("vi-VN")}</p>
                        <p><strong>Giờ:</strong> {booking.time}</p>
                        <p><strong>Nhân viên:</strong> {booking.staff}</p>
                        <p><strong>Trạng thái:</strong> {booking.status}</p>
                        <button
                          onClick={() => handleDeleteBooking(booking)}
                          style={{
                            marginTop: "10px",
                            padding: "8px 15px",
                            border: "none",
                            borderRadius: "5px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            cursor: "pointer"
                          }}
                        >
                          Hủy lịch
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: "20px" }}>
            <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Thông tin đặt lịch</h3>
            <div style={{ marginBottom: "20px" }}>
              <p><strong>Dịch vụ:</strong> {selectedService}</p>
              <p><strong>Ngày:</strong> {new Date(selectedDate).toLocaleDateString("vi-VN")}</p>
              <p><strong>Giờ:</strong> {selectedTime}</p>
              <p><strong>Nhân viên:</strong> {selectedStaff}</p>
              <p><strong>Tên khách hàng:</strong> {name}</p>
              <p><strong>Số điện thoại:</strong> {phone}</p>
            </div>
            {qrCode && (
              <div style={{ textAlign: "center" }}>
                <img src={qrCode} alt="QR Code" style={{ width: "200px", height: "200px" }} />
                {isLoading ? (
                  <p>Đang xử lý thanh toán...</p>
                ) : paymentStatus === "success" ? (
                  <p style={{ color: "#28a745", marginTop: "10px" }}>Thanh toán thành công!</p>
                ) : paymentStatus === "failed" ? (
                  <div>
                    <p style={{ color: "#dc3545", marginTop: "10px" }}>Thanh toán thất bại</p>
                    <button
                      onClick={handleQRScanned}
                      style={{
                        padding: "8px 15px",
                        border: "none",
                        borderRadius: "5px",
                        background: "#28a745",
                        color: "white",
                        marginTop: "10px",
                        cursor: "pointer"
                      }}
                    >
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleQRScanned}
                    style={{
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "5px",
                      background: "#28a745",
                      color: "white",
                      marginTop: "10px",
                      cursor: "pointer"
                    }}
                  >
                    Quét mã QR để thanh toán
                  </button>
                )}
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  background: "#dc3545",
                  color: "white",
                  cursor: "pointer"
                }}
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