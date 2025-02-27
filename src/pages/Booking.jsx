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
    <div style={{ 
      maxWidth: "1200px", 
      margin: "40px auto", 
      padding: "30px",
      backgroundColor: "#fff",
      borderRadius: "15px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ flex: 2, marginRight: "20px" }}>
        <h2 style={{ 
          textAlign: "center", 
          marginBottom: "30px",
          color: "#2c3e50",
          fontSize: "28px",
          fontWeight: "600"
        }}>Đặt Lịch Dịch Vụ</h2>
        
        {!bookingConfirmed ? (
          <>
            {/* Form đặt lịch */}
            <div style={{ marginBottom: "30px" }}>
              <div style={{ marginBottom: "25px" }}>
                <label style={{ 
                  display: "block", 
                  fontWeight: "500", 
                  marginBottom: "10px",
                  color: "#34495e"
                }}>Chọn dịch vụ:</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                    backgroundColor: "#f8f9fa",
                    transition: "border-color 0.3s ease"
                  }}
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
                <div style={{ 
                  marginBottom: "25px",
                  backgroundColor: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "10px"
                }}>
                  <label style={{ 
                    display: "block", 
                    fontWeight: "500", 
                    marginBottom: "15px",
                    color: "#34495e"
                  }}>Chọn ngày và giờ:</label>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center"
                  }}>
                    <button
                      onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
                      style={{
                        padding: "10px 15px",
                        border: "none",
                        background: "#3498db",
                        color: "#fff",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background 0.3s ease"
                      }}
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
                      style={{
                        padding: "10px 15px",
                        border: "none",
                        background: "#3498db",
                        color: "#fff",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background 0.3s ease"
                      }}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}

              {/* Staff selection with new styling */}
              {selectedTime && (
                <div style={{ marginBottom: "25px" }}>
                  <label style={{ 
                    display: "block", 
                    fontWeight: "500", 
                    marginBottom: "10px",
                    color: "#34495e"
                  }}>Chọn nhân viên:</label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "16px",
                      backgroundColor: "#f8f9fa",
                      transition: "border-color 0.3s ease"
                    }}
                  >
                    <option value="">Chọn nhân viên</option>
                    {staffList.map((staff, index) => (
                      <option key={index} value={staff}>{staff}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Customer info section */}
              <div style={{ marginBottom: "25px" }}>
                <label style={{ 
                  display: "block", 
                  fontWeight: "500", 
                  marginBottom: "10px",
                  color: "#34495e"
                }}>Tên khách hàng:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                    backgroundColor: "#f8f9fa"
                  }}
                />
              </div>

              <div style={{ marginBottom: "30px" }}>
                <label style={{ 
                  display: "block", 
                  fontWeight: "500", 
                  marginBottom: "10px",
                  color: "#34495e"
                }}>Số điện thoại:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                    backgroundColor: "#f8f9fa"
                  }}
                />
              </div>

              {/* Submit button */}
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={handleBooking}
                  disabled={isLoading}
                  style={{
                    padding: "14px 30px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    background: "#2ecc71",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "500",
                    transition: "background 0.3s ease",
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                </button>
              </div>

              {/* Booked appointments section */}
              {currentUser && (
                <div style={{ 
                  marginTop: "40px", 
                  borderTop: "2px solid #eee", 
                  paddingTop: "30px"
                }}>
                  <h3 style={{ 
                    textAlign: "center", 
                    marginBottom: "25px",
                    color: "#2c3e50",
                    fontSize: "22px"
                  }}>Lịch đã đặt của bạn</h3>
                  {getCurrentUserBookings().length === 0 ? (
                    <p style={{ 
                      textAlign: "center",
                      color: "#7f8c8d"
                    }}>Bạn chưa có lịch đặt nào</p>
                  ) : (
                    <div style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "15px"
                    }}>
                      {getCurrentUserBookings().map((booking) => (
                        <div
                          key={booking.id}
                          style={{
                            padding: "20px",
                            border: "1px solid #e1e8ed",
                            borderRadius: "10px",
                            backgroundColor: "#f8f9fa",
                            transition: "transform 0.2s ease",
                            ':hover': {
                              transform: "translateY(-2px)"
                            }
                          }}
                        >
                          <p style={{ marginBottom: "8px" }}><strong>Dịch vụ:</strong> {booking.service}</p>
                          <p style={{ marginBottom: "8px" }}><strong>Ngày:</strong> {new Date(booking.date).toLocaleDateString("vi-VN")}</p>
                          <p style={{ marginBottom: "8px" }}><strong>Giờ:</strong> {booking.time}</p>
                          <p style={{ marginBottom: "8px" }}><strong>Nhân viên:</strong> {booking.staff}</p>
                          <p style={{ marginBottom: "12px" }}><strong>Trạng thái:</strong> {booking.status}</p>
                          <button
                            onClick={() => handleDeleteBooking(booking)}
                            style={{
                              padding: "10px 20px",
                              border: "none",
                              borderRadius: "6px",
                              backgroundColor: "#e74c3c",
                              color: "white",
                              cursor: "pointer",
                              transition: "background 0.3s ease",
                              fontSize: "14px",
                              fontWeight: "500"
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
            </div>
          </>
        ) : (
          // Confirmation and payment section
          <div style={{ 
            padding: "30px",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px"
          }}>
            <h3 style={{ 
              textAlign: "center", 
              marginBottom: "25px",
              color: "#2c3e50",
              fontSize: "24px"
            }}>Thông tin đặt lịch</h3>
            <div style={{ marginBottom: "30px" }}>
              <p style={{ marginBottom: "12px" }}><strong>Dịch vụ:</strong> {selectedService}</p>
              <p style={{ marginBottom: "12px" }}><strong>Ngày:</strong> {new Date(selectedDate).toLocaleDateString("vi-VN")}</p>
              <p style={{ marginBottom: "12px" }}><strong>Giờ:</strong> {selectedTime}</p>
              <p style={{ marginBottom: "12px" }}><strong>Nhân viên:</strong> {selectedStaff}</p>
              <p style={{ marginBottom: "12px" }}><strong>Tên khách hàng:</strong> {name}</p>
              <p style={{ marginBottom: "12px" }}><strong>Số điện thoại:</strong> {phone}</p>
            </div>
            
            {/* QR Code section */}
            {qrCode && (
              <div style={{ textAlign: "center" }}>
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  style={{ 
                    width: "200px", 
                    height: "200px",
                    marginBottom: "20px"
                  }} 
                />
                {isLoading ? (
                  <p>Đang xử lý thanh toán...</p>
                ) : paymentStatus === "success" ? (
                  <p style={{ 
                    color: "#27ae60", 
                    marginTop: "15px",
                    fontSize: "18px",
                    fontWeight: "500"
                  }}>Thanh toán thành công!</p>
                ) : paymentStatus === "failed" ? (
                  <div>
                    <p style={{ 
                      color: "#e74c3c", 
                      marginTop: "15px",
                      marginBottom: "15px"
                    }}>Thanh toán thất bại</p>
                    <button
                      onClick={handleQRScanned}
                      style={{
                        padding: "12px 25px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#3498db",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "16px"
                      }}
                    >
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleQRScanned}
                    style={{
                      padding: "14px 30px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#2ecc71",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "500"
                    }}
                  >
                    Quét mã QR để thanh toán
                  </button>
                )}
              </div>
            )}
            
            {/* Cancel button */}
            <div style={{ textAlign: "center", marginTop: "30px" }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: "12px 25px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#e74c3c",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "background 0.3s ease"
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