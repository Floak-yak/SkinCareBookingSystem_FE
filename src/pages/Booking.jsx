import React, { useState, useEffect, use } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/booking.css";
import bookingApi from '../api/bookingApi';
import serviceApi from '../api/servicesApi';
import doctorApi from '../api/doctorApi';
import categoryApi from '../api/categoryApi';
import { QRCodeSVG } from 'qrcode.react';

// Thời gian mặc định cho tất cả các dịch vụ
const defaultTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedServiceData, setSelectedServiceData] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [filteredStaffList, setFilteredStaffList] = useState([]);


  // Fetch services and staff when component mounts
  useEffect(() => {
    const fetchServicesAndStaff = async () => {
      try {
        const [servicesResponse, staffResponse] = await Promise.all([
          serviceApi.getAllServices(),
          doctorApi.getAllDoctors()
        ]);

        setServices(servicesResponse.data);
        setStaffList(staffResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải thông tin dịch vụ và nhân viên');
      }
    };

    fetchServicesAndStaff();
  }, []);

  useEffect(() => {
    // Load current user
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
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
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleStorageChange);
    };
  }, []);

  // Add this useEffect for fetching categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        console.log('Categories response:', response.data);
        // Lấy mảng categories từ response.data.data
        const categoriesData = response.data.data || [];
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Không thể tải danh sách loại dịch vụ');
        setCategories([]); // Set empty array on error
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchStaffByCategory = async () => {
        try {
          const response = await doctorApi.getDoctorByCategoryId(selectedCategory);
          console.log('Staff response:', response.data);
          setFilteredStaffList(response.data);
        } catch (error) {
          console.error('Error fetching staff:', error);
          toast.error('Không thể tải danh sách nhân viên');
          setFilteredStaffList([]); // Set empty array on error
        }
      };

      fetchStaffByCategory();
    }
  }, [selectedCategory]);

  // Add this after the other useEffect hooks
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (currentUser) {
          const response = await bookingApi.getAllBookings();
          console.log('Bookings response:', response); // For debugging

          if (response.data) {
            // Transform the API response to match our local format
            const transformedBookings = response.data.map(booking => {
              // Format the date string
              const dateObj = new Date(booking.date);
              const formattedDate = dateObj.toISOString().split('T')[0];

              // const dateTimeObj = booking.createdTime ? new Date(booking.createdTime) : null;
              // const formattedTime = dateTimeObj
              //   ? dateTimeObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
              //   : "Chưa có thông tin";
              const dateTimeObj = booking.date ? new Date(booking.date) : null;
              const formattedTime = dateTimeObj
                ? dateTimeObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                : "Chưa có thông tin";

              return {
                id: booking.id,
                userId: booking.user?.id,
                serviceName: booking.serviceName,
                date: formattedDate,
                time: formattedTime,
                skinTherapistName: booking.skintherapistName,
                // skinTherapistId: booking.skinTherapistId,
                // skinTherapistName: staffList.find(s => s.id === booking.skinTherapistId)?.fullName || "Chưa xác định",
                categoryId: booking.categoryId,
                customerName: booking.user?.fullName || "Chưa xác định",
                email: booking.user?.email || "",
                status: booking.status === 1 ? 'pending' : 'completed',
                totalPrice: booking.totalPrice || 0
              };
            });

            console.log('Transformed bookings:', transformedBookings); // For debugging

            // Filter bookings for current user
            const userBookings = transformedBookings.filter(
              booking => booking.userId === currentUser.userId
            );

            setBookedAppointments(userBookings);
            localStorage.setItem('bookedAppointments', JSON.stringify(userBookings));
          }
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Không thể tải danh sách lịch đặt');
      }
    };

    fetchBookings();
    // }, [currentUser, staffList]);
  }, [currentUser]);

  const validatePhone = (phone) => {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
  };

  // Kiểm tra xem thời gian đã được đặt chưa
  const isTimeSlotBooked = (date, time, staffId) => {
    if (!staffId) return false;
    return bookedAppointments.some(appointment =>
      appointment.date === date &&
      appointment.time === time &&
      appointment.skinTherapistId === parseInt(staffId)
    );
  };

  // Sửa lại hàm kiểm tra thời gian
  const checkBookingTime = (bookingDate, bookingTime) => {
    try {
      if (!bookingDate || !bookingTime) return false;

      const now = new Date();
      const [hours, minutes] = bookingTime.split(':').map(Number);

      // Tạo datetime chính xác của lịch hẹn
      const bookingDateTime = new Date(bookingDate);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      // Tính số giờ chênh lệch
      const hoursDiff = (bookingDateTime - now) / (1000 * 60 * 60);
      return hoursDiff >= 24; // true nếu còn trên 24h
    } catch (error) {
      console.error('Error in checkBookingTime:', error);
      return false;
    }
  };

  const handleBooking = async () => {
    try {
      if (!currentUser) {
        toast.error("Vui lòng đăng nhập để đặt lịch");
        return;
      }

      let errors = [];
      if (!selectedService) errors.push("Vui lòng chọn dịch vụ.");
      if (!selectedDate || !selectedTime) errors.push("Vui lòng chọn ngày và giờ.");
      if (!selectedStaff) errors.push("Vui lòng chọn bác sĩ.");

      if (selectedStaff && isTimeSlotBooked(selectedDate, selectedTime, selectedStaff)) {
        errors.push("Thời gian này đã được đặt cho bác sĩ này. Vui lòng chọn thời gian khác hoặc bác sĩ khác.");
      }

      if (errors.length > 0) {
        errors.forEach(err => toast.error(err));
        return;
      }

      setIsLoading(true);

      // Tìm thông tin service được chọn
      const selectedServiceInfo = services.find(s => s.id === parseInt(selectedService));

      // Chuẩn bị dữ liệu cho API
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        serviceName: selectedServiceInfo?.serviceName || "",
        userId: currentUser.userId,
        skinTherapistId: parseInt(selectedStaff),
        categoryId: parseInt(selectedCategory)
      };

      // Gọi API tạo booking
      const response = await bookingApi.createBooking(bookingData);

      if (response.data && response.data.qrCode) {
        setQrCode(response.data.qrCode);
        setBookingConfirmed(true);
        toast.success("Đặt lịch thành công! Vui lòng quét mã QR để thanh toán");

        // Cập nhật danh sách lịch đặt
        const newBooking = {
          id: response.data.orderCode,
          userId: currentUser.userId,
          serviceId: parseInt(selectedService),
          serviceName: selectedServiceInfo?.serviceName || "",
          date: selectedDate,
          time: selectedTime,
          skinTherapistId: parseInt(selectedStaff),
          // skinTherapistName: staffList.find(s => s.id === parseInt(selectedStaff))?.fullName || "",
          skinTherapistName: filteredStaffList.find(s => s.id === parseInt(selectedStaff))?.fullName || "",
          customerName: currentUser.fullName,
          email: currentUser.email,
          status: 'pending'
        };

        const updatedAppointments = [...bookedAppointments, newBooking];
        setBookedAppointments(updatedAppointments);
        localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));
      } else {
        throw new Error("Không nhận được mã QR từ server");
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.message || "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setSelectedService(serviceId);

    // Lấy thông tin dịch vụ được chọn
    const selectedServiceInfo = services.find(s => s.id === parseInt(serviceId));
    if (selectedServiceInfo) {
      setSelectedServiceData(selectedServiceInfo);
    }
  };

  const handleQRScanned = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentStatus("success");
      toast.success("Thanh toán thành công!");

      await new Promise(resolve => setTimeout(resolve, 3000));

      resetBookingForm();
    } catch (error) {
      setPaymentStatus("failed");
      toast.error("Thanh toán thất bại. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const resetBookingForm = () => {
    setBookingConfirmed(false);
    setQrCode("");
    setSelectedService("");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedStaff("");
    setPaymentStatus("pending");
  };

  // const handleCancel = () => {
  //   const updatedAppointments = bookedAppointments.filter(
  //     appointment => !(
  //       appointment.date === selectedDate &&
  //       appointment.time === selectedTime &&
  //       appointment.staff === selectedStaff
  //     )
  //   );
  //   setBookedAppointments(updatedAppointments);
  //   localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));

  //   setBookingConfirmed(false);
  //   setQrCode("");
  //   setSelectedService("");
  //   setSelectedDate("");
  //   setSelectedTime("");
  //   setSelectedStaff("");
  //   setPaymentStatus("pending");
  //   setIsRescheduling(false);
  // };
  const handleCancel = async () => {
    try {
      if (!selectedDate || !selectedTime || !selectedStaff) {
        toast.error("Vui lòng chọn lịch hẹn để hủy.");
        return;
      }

      // Tìm lịch hẹn cần hủy
      const bookingToCancel = bookedAppointments.find(
        appointment =>
          appointment.date === selectedDate &&
          appointment.time === selectedTime &&
          appointment.skinTherapistId === parseInt(selectedStaff)
      );

      if (!bookingToCancel) {
        toast.error("Không tìm thấy lịch hẹn để hủy.");
        return;
      }

      // Gọi API để hủy lịch trên server
      await bookingApi.cancelBooking(bookingToCancel.id, currentUser.userId);

      // Cập nhật danh sách lịch đặt trên UI
      const updatedAppointments = bookedAppointments.filter(
        appointment => appointment.id !== bookingToCancel.id
      );
      setBookedAppointments(updatedAppointments);
      localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));

      // Reset giao diện
      setBookingConfirmed(false);
      setQrCode("");
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setSelectedStaff("");
      setPaymentStatus("pending");
      setIsRescheduling(false);

      toast.success("Hủy lịch thành công!");
    } catch (error) {
      console.error("Lỗi khi hủy lịch:", error);
      toast.error("Không thể hủy lịch. Vui lòng thử lại!");
    }
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
  const handleDeleteBooking = async (booking) => {
    try {
      const canReschedule = checkBookingTime(booking.date, booking.time);

      if (canReschedule) {
        // Đánh dấu là đang dời lịch và lưu thông tin booking hiện tại
        setIsRescheduling(true);
        setSelectedService(booking.serviceId?.toString() || "");
        setSelectedStaff(booking.skinTherapistId?.toString() || "");
        setSelectedCategory(booking.categoryId?.toString() || "");


        // const categoryId = services.find(s => s.id === booking.serviceId)?.categoryId || null;
        // if (categoryId) {
        //   setSelectedCategory(categoryId); // Cập nhật category
        //   const filteredStaff = staffList.filter(staff => staff.categoryId === categoryId);
        //   setFilteredStaffList(filteredStaff);
        // } else {
        //   setFilteredStaffList([]); // Tránh lỗi nếu categoryId không tìm thấy
        // }
        // const filteredStaff = staffList.filter(staff => staff.categoryId === selectedCategory);
        // setFilteredStaffList(filteredStaff);
        // Lưu ID booking cần update
        setCurrentBookingId(booking.id);

        // Hiển thị form đặt lịch để chọn thời gian mới
        setBookingConfirmed(false);
        window.scrollTo(0, 0);
        toast.info("Vui lòng chọn thời gian mới cho lịch đặt của bạn");
      } else {
        // Xử lý hủy lịch
        if (window.confirm("Bạn có chắc chắn muốn hủy lịch này không?")) {
          await bookingApi.cancelBooking(booking.id, currentUser.userId);

          // Cập nhật state sau khi hủy
          const updatedAppointments = bookedAppointments.filter(
            appointment => appointment.id !== booking.id
          );
          setBookedAppointments(updatedAppointments);
          localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));

          toast.success("Hủy lịch thành công");
        }
      }
    } catch (error) {
      console.error('Error handling booking:', error);
      toast.error("Có lỗi xảy ra khi xử lý lịch đặt!");
    }
  };

  // Thêm hàm xử lý cập nhật lịch
  const handleUpdateBooking = async () => {
    try {
      if (!selectedDate || !selectedTime || !selectedStaff) {
        toast.error("Vui lòng chọn đầy đủ thông tin ngày, giờ và bác sĩ");
        return;
      }

      setIsLoading(true);

      // Chuẩn bị dữ liệu cho API
      const updateData = {
        // bookingId: currentBookingId,
        // newDate: selectedDate,
        // newTime: selectedTime,
        // newSkinTherapistId: parseInt(selectedStaff)
        bookingId: currentBookingId,
        date: selectedDate,
        time: selectedTime,
        skinTherapistId: parseInt(selectedStaff)
      };

      console.log('Update data being sent:', updateData); // Log dữ liệu gửi đi

      // Gọi API cập nhật booking
      const response = await bookingApi.updateBookingDate(updateData);
      console.log('Update response:', response); // Log response từ API

      // Cập nhật danh sách đặt lịch
      const updatedAppointments = bookedAppointments.map(booking =>
        booking.id === currentBookingId
          ? {
            ...booking,
            date: selectedDate,
            time: selectedTime,
            skinTherapistId: parseInt(selectedStaff),
            // skinTherapistName: staffList.find(s => s.id === parseInt(selectedStaff))?.fullName || "Chưa xác định"
            skinTherapistName: filteredStaffList.find(s => s.id === parseInt(selectedStaff))?.fullName || "Chưa xác định"
          }
          : booking
      );

      setBookedAppointments(updatedAppointments);
      localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));

      // Reset các state
      setIsRescheduling(false);
      setCurrentBookingId(null);
      setSelectedDate("");
      setSelectedTime("");
      setSelectedStaff("");

      toast.success("Dời lịch thành công!");
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật lịch!");
    } finally {
      setIsLoading(false);
    }
  };

  // Thêm hàm getCurrentUserBookings
  const getCurrentUserBookings = () => {
    if (!currentUser) return [];
    return bookedAppointments.filter(booking => booking.userId === currentUser.userId);
  };

  // Sửa lại hàm handleDirectBooking
  const handleDirectBooking = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPaymentStatus("success");
      toast.success("Đặt lịch thành công!");

      await new Promise(resolve => setTimeout(resolve, 3000));

      setBookingConfirmed(false);
      setQrCode("");
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setSelectedStaff("");
      setPaymentStatus("pending");
      setIsRescheduling(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to filter services by category
  const getServicesByCategory = (categoryId) => {
    if (!categoryId) return [];
    return services.filter(service => service.categoryId === parseInt(categoryId));
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
              {/* Category and Service selection - Only show when not rescheduling */}
              {!isRescheduling && (
                <>
                  {/* Category selection */}
                  <div className="form-group">
                    <label className="form-label">Chọn loại dịch vụ:</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedService(""); // Reset selected service when category changes
                      }}
                      className="form-select"
                    >
                      <option value="">Chọn loại dịch vụ</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Service selection */}
                  {selectedCategory && (
                    <div className="form-group">
                      <label className="form-label">Chọn dịch vụ:</label>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Chọn dịch vụ</option>
                        {getServicesByCategory(selectedCategory).map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.serviceName} ({service.workTime} phút)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Calendar section - Show when either selecting new booking or rescheduling */}
              {(selectedService || isRescheduling) && (
                <div className="calendar-section">
                  <label className="form-label">Chọn ngày và giờ{isRescheduling ? ' mới' : ''}:</label>
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
                          {defaultTimes.map((time, rowIndex) => (
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

              {/* Staff selection - Show when either date/time is selected or rescheduling */}
              {(selectedTime || isRescheduling) && (
                <div className="form-group">
                  <label className="form-label">Chọn bác sĩ{isRescheduling ? ' mới' : ''}:</label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Chọn bác sĩ</option>
                    {/* {staffList.map((staff) => ( */}
                    {filteredStaffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit button */}
              <div className="submit-button-container">
                {isRescheduling ? (
                  <>
                    <button
                      onClick={handleUpdateBooking}
                      disabled={isLoading || !selectedDate || !selectedTime || !selectedStaff}
                      className="submit-button"
                    >
                      {isLoading ? "Đang xử lý..." : "Xác nhận dời lịch"}
                    </button>
                    <button
                      onClick={() => {
                        setIsRescheduling(false);
                        setCurrentBookingId(null);
                        setSelectedDate("");
                        setSelectedTime("");
                        setSelectedStaff("");
                      }}
                      className="cancel-button"
                      style={{ marginLeft: '10px' }}
                    >
                      Hủy dời lịch
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleBooking}
                    disabled={isLoading || !currentUser || !selectedService || !selectedDate || !selectedTime || !selectedStaff}
                    className="submit-button"
                  >
                    {!currentUser
                      ? "Vui lòng đăng nhập để đặt lịch"
                      : isLoading
                        ? "Đang xử lý..."
                        : "Xác nhận đặt lịch"
                    }
                  </button>
                )}
              </div>

              {/* Booked appointments section */}
              {currentUser && (
                <div className="booked-section">
                  <h3 className="booked-title">Lịch đã đặt của bạn</h3>
                  {bookedAppointments.length === 0 ? (
                    <p className="no-bookings">Bạn chưa có lịch đặt nào</p>
                  ) : (
                    <div className="bookings-list">
                      {bookedAppointments.map((booking) => (
                        <div key={booking.id} className="booking-card">
                          <p className="booking-detail"><strong>Dịch vụ:</strong> {booking.serviceName}</p>
                          <p className="booking-detail"><strong>Ngày:</strong> {new Date(booking.date).toLocaleDateString("vi-VN")}</p>
                          <p className="booking-detail"><strong>Giờ:</strong> {booking.time}</p>
                          <p className="booking-detail"><strong>Bác sĩ:</strong> {booking.skinTherapistName}</p>
                          <p className="booking-detail"><strong>Trạng thái:</strong> {booking.status === 'pending' ? 'Chờ xác nhận' : 'Đã hoàn thành'}</p>
                          <p className="booking-detail"><strong>Giá:</strong> {booking.totalPrice?.toLocaleString('vi-VN')}đ</p>

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
              <p className="booking-info-item"><strong>Dịch vụ:</strong> {services.find(s => s.id === parseInt(selectedService))?.serviceName}</p>
              <p className="booking-info-item"><strong>Ngày:</strong> {new Date(selectedDate).toLocaleDateString("vi-VN")}</p>
              <p className="booking-info-item"><strong>Giờ:</strong> {selectedTime}</p>
              {/* <p className="booking-info-item"><strong>Bác sĩ:</strong> {staffList.find(s => s.id === parseInt(selectedStaff))?.fullName}</p> */}
              <p className="booking-info-item"><strong>Bác sĩ:</strong> {filteredStaffList.find(s => s.id === parseInt(selectedStaff))?.fullName}</p>
              <p className="booking-info-item"><strong>Giá:</strong> {selectedServiceData?.price?.toLocaleString('vi-VN')}đ</p>
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
                  {/* <Link id="payos-checkout" to={qrCode} target="_blank" className="qr-code">
                    <img src={qrCode} alt="QR Code" />
                  </Link> */}
                  <QRCodeSVG
                    value={qrCode}
                    size={256}
                    level="H"
                    includeMargin={true}
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