import React, { useState } from "react";

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
  const [bookedSlots, setBookedSlots] = useState([]); // Lưu trữ các khung giờ đã được đặt

  const handleBooking = () => {
    let errors = [];
    if (!selectedService || !selectedDate || !selectedTime || !name || !phone) {
      errors.push("Vui lòng nhập đầy đủ thông tin.");
    }
    if (!/^[0-9]{10,11}$/.test(phone)) {
      errors.push("Số điện thoại không hợp lệ.");
    }
    if (errors.length > 0) {
      setError(errors.join(" "));
      return;
    }

    // Nếu khách không chọn nhân viên, hệ thống sẽ tự động chọn ngẫu nhiên
    if (!selectedStaff) {
      const randomStaff = staffList[Math.floor(Math.random() * staffList.length)];
      setSelectedStaff(randomStaff);
    }

    // Đánh dấu khung giờ đã được đặt
    setBookedSlots([...bookedSlots, { date: selectedDate, time: selectedTime }]);

    setError("");
    setQrCode("https://th.bing.com/th/id/OIP.yBVcQn2EXjmzi8z3jq49IAHaHa?w=168&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7");
    setBookingConfirmed(true);
  };

  const handleCancel = () => {
    // Xóa khung giờ đã đặt khỏi danh sách bookedSlots
    const updatedBookedSlots = bookedSlots.filter(
      slot => !(slot.date === selectedDate && slot.time === selectedTime)
    );
    setBookedSlots(updatedBookedSlots);

    // Đặt lại các trạng thái
    setBookingConfirmed(false);
    setQrCode("");
    setSelectedService("");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedStaff("");
    setName("");
    setPhone("");
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

  return (
    <div style={{ display: "flex", width: "90%", margin: "auto", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", background: "#fff" }}>
      {/* Phần form đặt lịch */}
      <div style={{ flex: 2, marginRight: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Đặt lịch dịch vụ</h2>
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
                          const isBooked = bookedSlots.some(slot => slot.date === d && slot.time === time);
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
                                {isBooked ? "X" : selectedDate === d && selectedTime === time ? "✔" : "Chọn"}
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
        {selectedService && selectedDate && selectedTime && selectedStaff && name && phone && !bookingConfirmed && (
          <p style={{ textAlign: "center", color: "#28a745", cursor: "pointer" }} onClick={handleBooking}>Xác nhận đặt lịch</p>
        )
        }
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleBooking}
            style={{ padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", background: "#28a745", color: "white", marginRight: "10px", fontSize: "16px" }}
          >
            Xác nhận đặt lịch
          </button>
          {bookingConfirmed && (
            <button
              onClick={handleCancel}
              style={{ padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", background: "#dc3545", color: "white", fontSize: "16px" }}
            >
              Hủy đặt lịch
            </button>
          )}
        </div>
      </div>

      {/* Phần hiển thị thông tin đặt lịch và QR code */}
      {bookingConfirmed && (
        <div style={{ flex: 1, padding: "20px", borderLeft: "1px solid #ddd", marginLeft: "20px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Thông tin đặt lịch</h3>
          <div style={{ marginBottom: "20px" }}>
            <p><strong>Dịch vụ:</strong> {selectedService}</p>
            <p><strong>Ngày:</strong> {new Date(selectedDate).toLocaleDateString("vi-VN")}</p>
            <p><strong>Giờ:</strong> {selectedTime}</p>
            <p><strong>Nhân viên:</strong> {selectedStaff}</p>
            <p><strong>Tên khách hàng:</strong> {name}</p>
            <p><strong>Số điện thoại:</strong> {phone}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <img src={qrCode} alt="QR Code" style={{ width: "200px", height: "200px" }} />
            <p style={{ marginTop: "10px" }}>Quét mã QR để xác nhận đặt lịch.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;