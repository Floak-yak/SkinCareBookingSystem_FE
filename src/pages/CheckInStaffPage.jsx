import React, { useState, useEffect } from "react";
import { Card, Button, message, Spin, DatePicker, Radio } from "antd";
import bookingApi from "../api/bookingApi";
import useAuth from "../hooks/useAuth";
import moment from "moment";
import "../styles/StaffCheckIn.css";

const StaffCheckIn = () => {
  const { user: currentUser } = useAuth();
  const [groupedBookings, setGroupedBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [filterType, setFilterType] = useState("day");

  const fetchBookingsForCheckIn = async () => {
    try {
      const res = await bookingApi.getAllBookings();
      let filtered = res.data.filter((booking) => {
        const bookingMoment = moment(booking.date);
        let dateMatches = false;
        if (filterType === "day") {
          dateMatches = bookingMoment.isSame(selectedDate, "day");
        } else if (filterType === "week") {
          dateMatches = bookingMoment.isSame(selectedDate, "week");
        } else if (filterType === "month") {
          dateMatches = bookingMoment.isSame(selectedDate, "month");
        }
        return (
          dateMatches &&
          (booking.status === 0 || booking.status === 2) &&
          booking.user 
        );
      });

      // Nhóm các booking theo khách hàng
      const groups = {};
      filtered.forEach((booking) => {
        const custId = booking.user.id;
        if (!custId) return;
        if (!groups[custId]) {
          groups[custId] = {
            customer: booking.user,
            bookings: [],
          };
        }
        groups[custId].bookings.push(booking);
      });
      setGroupedBookings(groups);
    } catch (error) {
      console.error("Error fetching bookings for checkin:", error);
      message.error("Lỗi tải lịch checkIn");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      fetchBookingsForCheckIn();
    }
  }, [currentUser, selectedDate, filterType]);

  const handleDateChange = (date, dateString) => {
    setSelectedDate(date || moment());
  };

  // Xử lý thay đổi loại lọc
  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  // check in cho khách 
  const handleGroupCheckIn = async (customerId) => {
    try {
      await bookingApi.SkinTherapistCheckin(customerId);
      message.success("CheckIn thành công cho khách hàng!");
      fetchBookingsForCheckIn();
    } catch (error) {
      message.error("Chưa đến ngày thực hiện dịch vụ.");
    }
  };

  if (!currentUser) {
    return <div>Vui lòng đăng nhập</div>;
  }

  if (loading) {
    return <Spin tip="Đang tải lịch" style={{ margin: "2rem" }} />;
  }

  // Chuyển đối tượng groupedBookings thành mảng để render
  const groupsArray = Object.values(groupedBookings);

  return (
    <div className="staff-checkin-container">
      <div className="staff-checkin-header">
        <h1>CheckIn Page</h1>
      </div>
  
      {/* Bộ chọn loại lọc */}
      <div className="staff-checkin-filter">
        <span>Loại lọc: </span>
        <Radio.Group onChange={handleFilterTypeChange} value={filterType}>
          <Radio.Button value="day">Theo ngày</Radio.Button>
          <Radio.Button value="week">Theo tuần</Radio.Button>
          <Radio.Button value="month">Theo tháng</Radio.Button>
        </Radio.Group>
      </div>
  
      {/* DatePicker để chọn ngày */}
      <div className="staff-checkin-datepicker">
        <span>Chọn ngày: </span>
        <DatePicker
          value={selectedDate}
          format="DD/MM/YYYY"
          onChange={handleDateChange}
        />
      </div>
  
      {groupsArray.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌟</div>
          <h2>Ngày {selectedDate.format("DD/MM/YYYY")} thật yên tĩnh!</h2>
          <p>Chưa có lịch đặt nào hôm nay. Hãy dành thời gian nghỉ ngơi hoặc lên kế hoạch cho những điều thú vị phía trước!</p>
        </div>
      ) : (
        groupsArray.map((group) => (
          <Card key={group.customer.id} className="staff-checkin-card">
            <h2>Khách hàng: {group.customer.fullName}</h2>
            <p>SĐT: {group.customer.phoneNumber || "N/A"}</p>
            <div>
              <strong>Danh sách lịch đặt:</strong>
              <ul>
                {group.bookings.map((booking) => (
                  <li key={booking.id}>
                    {moment(booking.date).format("DD/MM/YYYY HH:mm")} -{" "}
                    {booking.serviceName} - Trạng thái:{" "}
                    {(booking.status === 0 || booking.status === 2)
                      ? "Đang chờ"
                      : "Đã hoàn thành"}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              type="primary"
              onClick={() => handleGroupCheckIn(group.customer.id)}
              disabled={selectedDate.isAfter(moment(), "day")}
            >
              CheckIn cho cả ngày
            </Button>
          </Card>
        ))
      )}
    </div>
  );
};

export default StaffCheckIn;
