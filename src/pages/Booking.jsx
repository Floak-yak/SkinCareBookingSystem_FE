import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/booking.css";
import bookingApi from "../api/bookingApi";
import serviceApi from "../api/servicesApi";
import doctorApi from "../api/doctorApi";
import categoryApi from "../api/categoryApi";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { FiX, FiCheckCircle, FiXCircle, FiSmartphone, FiAlertTriangle, FiCreditCard } from "react-icons/fi";
import Swal from 'sweetalert2';
import transactionApi from "../api/transactionApi";
import { message, Modal } from "antd";

// Thời gian mặc định cho tất cả các dịch vụ
const defaultTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00",];

const generateWeeks = (start) => {
  const weeks = [];
  start.setDate(start.getDate() + 1);
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
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [filteredStaffList, setFilteredStaffList] = useState([]);
  const [orderCode, setOrderCode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [allBooking, setAllBooking] = useState([]);
  const [hasTwoUnpaid, setHasTwoUnpaid] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentBookingData, setCurrentBookingData] = useState(null);
  let latestId = null;

  // Xử lý khi nhận được state từ HistoryBooking
  useEffect(() => {
    if (location.state?.isRescheduling && location.state?.bookingData) {
      const { bookingData } = location.state;

      // Set state cho chế độ dời lịch
      setIsRescheduling(true);
      setCurrentBookingData(bookingData);
      // Pre-fill form với dữ liệu cũ
      setSelectedCategory(bookingData.categoryId);
      setSelectedService(bookingData.serviceName);
      setSelectedDate(bookingData.date);
      setSelectedTime(bookingData.time);
      setCurrentBookingId(bookingData.id);

      // Hiển thị form đặt lịch để chọn thời gian mới
      setBookingConfirmed(false);
      window.scrollTo(0, 0);
      toast.info("Vui lòng chọn thời gian mới cho lịch đặt của bạn");
    }
  }, [location.state]);

  useEffect(() => {
    if (currentBookingData && staffList.length > 0) {
      const therapist = staffList.find(
        s => s.fullName === currentBookingData.skinTherapistName
      );
      if (therapist) {
        setSelectedStaff(therapist.id);
        console.log("Therapist ID set:", therapist.id);
      } else {
        console.warn("Không tìm thấy therapist trong staffList");
      }
    }
  }, [currentBookingData, staffList]);

  useEffect(() => {
    console.log("Updated currentBookingData:", currentBookingData);
  }, [currentBookingData]);

  useEffect(() => {
    const unpaidCount = bookedAppointments.filter(b => b.status === 0).length;

    if (unpaidCount >= 2) {
      setHasTwoUnpaid(true);
    }
  }, [bookedAppointments]);

  // Fetch services and staff when component mounts
  useEffect(() => {
    const fetchServicesAndStaff = async () => {
      try {
        const [servicesResponse, staffResponse] = await Promise.all([
          serviceApi.getAllServices(),
          doctorApi.getAllDoctors(),
        ]);

        setServices(servicesResponse.data);
        console.log("Services response:", servicesResponse.data);
        setStaffList(staffResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải thông tin dịch vụ và nhân viên");
      }
    };

    fetchServicesAndStaff();
  }, []);

  useEffect(() => {
    // Load current user
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
    }

    try {
      const saved = localStorage.getItem("bookedAppointments");
      if (saved) {
        const parsed = JSON.parse(saved);
        setBookedAppointments(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu từ localStorage:", error);
      setBookedAppointments([]);
    }
  }, []);

  // Thêm useEffect để lắng nghe thay đổi đăng nhập/đăng xuất
  useEffect(() => {
    const handleStorageChange = () => {
      const userJson = localStorage.getItem("currentUser");
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("logout", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("logout", handleStorageChange);
    };
  }, []);

  // Add this useEffect for fetching categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        const categoriesData = response.data.data || [];
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Không thể tải danh sách loại dịch vụ");
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchStaffByCategory = async () => {
        try {
          const response = await doctorApi.getDoctorByCategoryId(
            selectedCategory
          );
          console.log("Staff response:", response.data);
          setFilteredStaffList(response.data);
        } catch (error) {
          console.error("Error fetching staff:", error);
          toast.error("Không thể tải danh sách nhân viên");
          setFilteredStaffList([]);
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
          setAllBooking(response.data);

          if (response.data) {
            // Transform the API response to match our local format
            const transformedBookings = response.data.map((booking) => {
              // Format the date string
              const dateObj = new Date(booking.date);
              const formattedDate = dateObj.toISOString().split("T")[0];
              const dateTimeObj = booking.date ? new Date(booking.date) : null;
              const formattedTime = dateTimeObj
                ? dateTimeObj.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "Chưa có thông tin";

              return {
                id: booking.id,
                userId: booking.user?.id,
                serviceName: booking.serviceName,
                date: formattedDate,
                time: formattedTime,
                skinTherapistName: booking.skintherapistName,
                categoryId: booking.categoryId,
                customerName: booking.user?.fullName || "Chưa xác định",
                email: booking.user?.email || "",
                status: (() => {
                  switch (booking.status) {
                    case -1: return -1;
                    case 0: return 0;
                    case 1: return 1;
                    case 2: return 2;
                    default: return "unknown";
                  }
                })(),
                totalPrice: booking.totalPrice || 0,
              };
            });

            // Filter bookings for current user
            const userBookings = transformedBookings.filter(
              (booking) => booking.userId === currentUser.userId
            );

            setBookedAppointments(userBookings);
            localStorage.setItem(
              "bookedAppointments",
              JSON.stringify(userBookings)
            );
          }
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Không thể tải danh sách lịch đặt");
      }
    };

    fetchBookings();
  }, [currentUser]);

  const isTimeSlotBooked = (selectedDate, selectedTime, selectedStaff) => {
    return allBooking.some(booking => {
      // Tách ngày và giờ từ trường date
      const [bookingDate, bookingTime] = booking.date.split('T');
      const formattedTime = bookingTime.substring(0, 5); // Lấy HH:mm từ chuỗi ISO

      // Tìm ID của bác sĩ từ danh sách staffList
      const therapist = staffList.find(
        s => s.fullName === booking.skintherapistName
      );

      // So sánh với các giá trị đang chọn
      return (
        bookingDate === selectedDate &&
        formattedTime === selectedTime &&
        therapist?.id === parseInt(selectedStaff) &&
        (booking.status === 0 || booking.status === 2)
      );
    });
  };

  const autoSelectStaff = (date, time) => {
    if (!selectedCategory || filteredStaffList.length === 0) return null;

    // Lấy danh sách booking cho ngày được chọn
    const dailyBookings = allBooking.filter(
      booking => booking.date.split('T')[0] === date
    );

    // Tìm bác sĩ có ít lịch nhất
    const staffBookingsCount = filteredStaffList.map(staff => {
      const count = dailyBookings.filter(
        booking => booking.skinTherapistId === staff.id
      ).length;
      return { ...staff, bookings: count };
    });

    const sortedStaff = staffBookingsCount.sort((a, b) => a.bookings - b.bookings);
    const availableStaff = sortedStaff.find(staff =>
      !isTimeSlotBooked(date, time, staff.id)
    );

    return availableStaff ? availableStaff.id : null;
  };

  const handleBooking = async () => {
    try {
      if (!currentUser) {
        toast.error("Vui lòng đăng nhập để đặt lịch");
        return;
      }

      let errors = [];
      if (!selectedService) errors.push("Vui lòng chọn dịch vụ.");
      if (!selectedDate || !selectedTime)
        errors.push("Vui lòng chọn ngày và giờ.");

      let finalStaffId = selectedStaff;
      console.log("finalStaffId before: ", finalStaffId);
      if (!finalStaffId) {
        const autoStaffId = autoSelectStaff(selectedDate, selectedTime);
        if (!autoStaffId) {
          throw new Error("Hiện không có bác sĩ nào rảnh khung giờ này. Vui lòng chọn khung giờ khác.");
        }
        finalStaffId = autoStaffId;
        setSelectedStaff(autoStaffId);
        toast.info("Hệ thống đã tự động chọn bác sĩ cho bạn");
      }

      console.log("finalStaffId after: ", finalStaffId);

      if (
        selectedStaff &&
        isTimeSlotBooked(selectedDate, selectedTime, selectedStaff)
      ) {
        errors.push(
          "Thời gian này đã được đặt cho bác sĩ này. Vui lòng chọn thời gian khác hoặc bác sĩ khác."
        );
      }

      if (errors.length > 0) {
        errors.forEach((err) => toast.error(err));
        return;
      }

      setIsLoading(true);

      // Tìm thông tin service được chọn
      const selectedServiceInfo = services.find(
        (s) => s.id === parseInt(selectedService)
      );

      // Chuẩn bị dữ liệu cho API
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        serviceName: selectedServiceInfo?.serviceName || "",
        userId: currentUser.userId,
        skinTherapistId: parseInt(finalStaffId),
        categoryId: parseInt(selectedCategory),
      };

      // Gọi API tạo booking
      const response = await bookingApi.createBooking(bookingData);
      console.log("Full API BOOKING: ", response);
      if (response.data && response.data.createPaymentResult?.qrCode) {
        setQrCode(response.data.createPaymentResult.qrCode);
        setOrderCode(response.data.createPaymentResult.orderCode);
        setTransactionId(response.data.transactionId);
        setBookingConfirmed(true);
        toast.success("Đặt lịch thành công! Vui lòng quét mã QR để thanh toán");

        const res = await bookingApi.getAllBookings();
        console.log("Bookign ne: ", res.data);
        // Kiểm tra xem có dữ liệu không
        if (res.data && res.data.length > 0) {
          // Sắp xếp giảm dần theo ID và lấy phần tử đầu tiên
          const latestBooking = res.data.sort((a, b) => b.id - a.id)[0];
          latestId = latestBooking.id;
          console.log("Booking mới nhất:", latestBooking.id);
        } else {
          console.log("Không có dữ liệu booking");
        }

        // Cập nhật danh sách lịch đặt
        const newBooking = {
          id: latestId,
          userId: currentUser.userId,
          serviceId: parseInt(selectedService),
          serviceName: selectedServiceInfo?.serviceName || "",
          date: selectedDate,
          time: selectedTime,
          skinTherapistId: parseInt(finalStaffId),
          skinTherapistName:
            filteredStaffList.find((s) => s.id === parseInt(finalStaffId))
              ?.fullName || "",
          customerName: currentUser.fullName,
          email: currentUser.email,
          status: 0,
        };

        const updatedAppointments = [...bookedAppointments, newBooking];
        setBookedAppointments(updatedAppointments);
        localStorage.setItem(
          "bookedAppointments",
          JSON.stringify(updatedAppointments)
        );
        console.log("bookedapp: ", bookedAppointments);
      } else {
        throw new Error("Không nhận được mã QR từ server");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        error.message || "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayLater = () => {
    return (
      <Link to="/">Thanh Toán Sau</Link>
    );
  }

  const handleQRScanned = async () => {
    if (!orderCode) {
      message.error("Không có giao dịch nào được tạo.");
      return;
    }
    try {
      setIsLoading(true);
      const { data } = await transactionApi.checkTransaction(orderCode);
      console.log("Respone data OrderCode: ", data);
      // Nếu data là string, lấy luôn giá trị đó, nếu là object thì lấy data.status
      const status = typeof data === "string" ? data : data.status;

      if (status === "PAID") {
        window.location.href = `${window.location.origin}/success.html?transactionId=${transactionId}`;
      } else if (status === "CANCEL") {
        window.location.href = `${window.location.origin}/cancel.html?transactionId=${transactionId}`;
      } else if (status === "PENDING") {
        Modal.confirm({
          title: "Giao dịch đang chờ xử lý",
          content:
            "Giao dịch của bạn đang ở trạng thái PENDING. Bạn có muốn thanh toán sau không?",
          okText: "Thanh toán sau",
          cancelText: "Thử lại",
          onOk: () => {
            handlePayLater();
          },
          onCancel: () => {
            message.info("Vui lòng thử xác nhận lại giao dịch sau ít phút.");
          },
        });
      } else {
        message.error("Trạng thái giao dịch không xác định!");
      }
    } catch (error) {
      console.error(
        "Lỗi xác nhận giao dịch:",
        error.response?.data || error.message
      );
      message.error("Xác nhận thanh toán thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      if (!selectedDate || !selectedTime || !selectedStaff) {
        toast.error("Vui lòng chọn đủ thông tin lịch hẹn để hủy");
        return;
      }

      // Tìm booking đang được chọn hiện tại
      const bookingToCancel = bookedAppointments.find(booking => {
        const dateMatch = booking.date === selectedDate;
        const timeMatch = booking.time.slice(0, 5) === selectedTime.slice(0, 5);
        const staffMatch =
          booking.skinTherapistId === parseInt(selectedStaff) ||
          booking.skinTherapistName === filteredStaffList.find(s => s.id === parseInt(selectedStaff))?.fullName;

        return dateMatch && timeMatch && staffMatch;
      });

      // Xử lý khi không tìm thấy
      if (!bookingToCancel) {
        toast.error("Không tìm thấy lịch hẹn phù hợp");
        console.error("Booking không khớp", {
          selectedDate,
          selectedTime,
          selectedStaff,
          availableBookings: bookedAppointments
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Xác nhận hủy lịch?',
        html: `<div>
          <p>Bạn sắp hủy lịch:</p>
          <p><strong>Dịch vụ:</strong> ${bookingToCancel.serviceName}</p>
          <p><strong>Ngày:</strong> ${new Date(bookingToCancel.date).toLocaleDateString('vi-VN')}</p>
          <p><strong>Giờ:</strong> ${bookingToCancel.time}</p>
        </div>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Đồng ý hủy',
        cancelButtonText: 'Giữ lại lịch',
        customClass: {
          confirmButton: 'swal-confirm-button',
          cancelButton: 'swal-cancel-button'
        },
        buttonsStyling: false
      });
      if (!result.isConfirmed) return;

      // Gọi API hủy lịch
      await bookingApi.cancelBooking(bookingToCancel.id, currentUser.userId);

      // Cập nhật UI
      const updatedAppointments = bookedAppointments.filter(
        b => b.id !== bookingToCancel.id
      );
      setBookedAppointments(updatedAppointments);
      localStorage.setItem("bookedAppointments", JSON.stringify(updatedAppointments));

      // Reset form
      setBookingConfirmed(false);
      setQrCode("");
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setSelectedStaff("");
      setPaymentStatus("pending");

      toast.success("Đã hủy lịch thành công!");

    } catch (error) {
      console.error("Lỗi khi hủy lịch:", error);
      toast.error(error.response?.data?.message || "Hủy lịch thất bại");
    }
  };

  const handleSelectDateTime = (date, time) => {
    // Kiểm tra xem khung giờ đã được đặt chưa
    const isBooked = bookedSlots.some(
      (slot) => slot.date === date && slot.time === time
    );
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

  // Thêm hàm xử lý cập nhật lịch
  const handleUpdateBooking = async () => {
    try {
      if (!selectedDate || !selectedTime || !selectedStaff) {
        toast.error("Vui lòng chọn đầy đủ thông tin ngày, giờ và bác sĩ");
        return;
      }

      console.log("date: ", selectedDate);
      console.log("time: ", selectedTime);
      console.log("staff: ", selectedStaff);

      setIsLoading(true);

      // Chuẩn bị dữ liệu cho API
      const updateData = {
        bookingId: currentBookingId,
        date: selectedDate,
        time: selectedTime,
        skinTherapistId: parseInt(selectedStaff),
      };

      // Gọi API cập nhật booking
      const response = await bookingApi.updateBookingDate(updateData);
      console.log("Update response:", response); // Log response từ API

      // Cập nhật danh sách đặt lịch
      const updatedAppointments = bookedAppointments.map((booking) =>
        booking.id === currentBookingId
          ? {
            ...booking,
            date: selectedDate,
            time: selectedTime,
            skinTherapistId: parseInt(selectedStaff),
            // skinTherapistName: staffList.find(s => s.id === parseInt(selectedStaff))?.fullName || "Chưa xác định"
            skinTherapistName:
              filteredStaffList.find((s) => s.id === parseInt(selectedStaff))
                ?.fullName || "Chưa xác định",
          }
          : booking
      );

      setBookedAppointments(updatedAppointments);
      localStorage.setItem(
        "bookedAppointments",
        JSON.stringify(updatedAppointments)
      );

      // Reset các state
      setIsRescheduling(false);
      setCurrentBookingId(null);
      setSelectedDate("");
      setSelectedTime("");
      setSelectedStaff("");

      toast.success("Dời lịch thành công!");
      setTimeout(() => {
        navigate('/booking-history');
      }, 2000);
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật lịch!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Sửa lại hàm handleDirectBooking
  const handleDirectBooking = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPaymentStatus("success");
      toast.success("Đặt lịch thành công!");

      await new Promise((resolve) => setTimeout(resolve, 3000));

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
    return services.filter(
      (service) => service.categoryId === parseInt(categoryId)
    );
  };

  return (
    <div className="booking-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div style={{ flex: 2, marginRight: "20px" }}>
        <h2 className="booking-title">Đặt Lịch Dịch Vụ</h2>

        <div className="booking-page">
          {hasTwoUnpaid ? (
            <div className="unpaid-blocker">
              <div className="unpaid-message">
                <FiAlertTriangle className="warning-icon" />
                <h3>Bạn đang có hơn 2 lịch chưa thanh toán</h3>
                <p>Vui lòng thanh toán các lịch hiện có trước khi đặt thêm</p>
                <button
                  onClick={() => navigate('/booking-history')}
                  className="payment-button"
                >
                  <FiCreditCard /> Thanh toán ngay
                </button>
              </div>
            </div>
          ) : (
            <>
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
                        {/* {selectedCategory && ( */}
                        <div className="form-group">
                          <label className="form-label">Chọn dịch vụ:</label>
                          <select
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="form-select"
                          >
                            <option value="">Chọn dịch vụ</option>
                            {getServicesByCategory(selectedCategory).map(
                              (service) => (
                                <option key={service.id} value={service.id}>
                                  {service.serviceName} ({service.workTime} phút)
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        {/* )} */}


                        {/* Staff selection - Show when either date/time is selected or rescheduling */}
                        {/* {(selectedService || isRescheduling) && ( */}
                        <div className="form-group">
                          <label className="form-label">
                            Chọn bác sĩ{isRescheduling ? " mới" : ""}:
                          </label>
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
                        {/* )} */}
                      </>
                    )}
                    {/* calendar-booking section - Show when either selecting new booking or rescheduling */}
                    {/* {(selectedStaff || isRescheduling) && ( */}
                    <div className="calendar-booking-section">
                      <label className="form-label">
                        Chọn ngày và giờ{isRescheduling ? " mới" : ""}:
                      </label>
                      <div className="calendar-booking-controls">
                        <button
                          onClick={() =>
                            setCurrentWeek(Math.max(0, currentWeek - 1))
                          }
                          className="calendar-booking-button"
                        >
                          &lt;
                        </button>
                        <div className="calendar-booking-container">
                          <table className="calendar-booking-table">
                            <thead>
                              <tr className="calendar-booking-header">
                                <th className="calendar-booking-header-cell">Giờ</th>
                                {weeks[currentWeek].map((d, index) => (
                                  <th key={index} className="calendar-booking-header-cell">
                                    {new Date(d).toLocaleDateString("vi-VN", {
                                      weekday: "short",
                                      day: "numeric",
                                      month: "numeric",
                                    })}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {defaultTimes.map((time, rowIndex) => (
                                <tr key={rowIndex}>
                                  <td className="calendar-booking-cell calendar-booking-time-cell">  {/* Thêm class mới */}
                                    <span className="calendar-booking-time">{time}</span>   {/* Bọc trong span */}
                                  </td>
                                  {weeks[currentWeek].map((d, colIndex) => {
                                    const isBooked = isTimeSlotBooked(
                                      d,
                                      time,
                                      selectedStaff
                                    );
                                    const buttonClass = `time-slot-button ${isBooked
                                      ? "time-slot-button-booked"
                                      : selectedDate === d &&
                                        selectedTime === time
                                        ? "time-slot-button-selected"
                                        : "time-slot-button-available"
                                      }`;

                                    return (
                                      <td key={colIndex} className="calendar-booking-cell">
                                        <button
                                          onClick={() =>
                                            handleSelectDateTime(d, time)
                                          }
                                          disabled={isBooked}
                                          className={buttonClass}
                                        >
                                          {isBooked
                                            ? "Đã đặt"
                                            : selectedDate === d &&
                                              selectedTime === time
                                              ? "✔"
                                              : "Chọn"}
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
                          onClick={() =>
                            setCurrentWeek(
                              Math.min(weeks.length - 1, currentWeek + 1)
                            )
                          }
                          className="calendar-booking-button"
                        >
                          &gt;
                        </button>
                      </div>
                    </div>
                    {/* )} */}

                    {/* Submit button */}
                    <div className="submit-button-container">
                      {isRescheduling ? (
                        <>
                          <button
                            onClick={handleUpdateBooking}
                            disabled={
                              isLoading ||
                              !selectedDate ||
                              !selectedTime
                            }
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
                            style={{ marginLeft: "10px" }}
                          >
                            Hủy dời lịch
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleBooking}
                          disabled={
                            isLoading ||
                            !currentUser ||
                            !selectedService ||
                            !selectedDate ||
                            !selectedTime
                          }
                          className="submit-button"
                        >
                          {!currentUser
                            ? "Vui lòng đăng nhập để đặt lịch"
                            : isLoading
                              ? "Đang xử lý..."
                              : "Xác nhận đặt lịch"}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                // Confirmation and payment section
                <div className="confirmation-container">
                  {/* Layout 2 cột */}
                  <div className="confirmation-grid">
                    {/* Cột trái - Thông tin đặt lịch */}
                    <div className="confirmation-info">
                      <h3 className="confirmation-title">Thông tin đặt lịch</h3>
                      <div className="booking-info">
                        <div className="booking-info-item">
                          <strong>Dịch vụ:</strong>
                          <span>
                            {services.find((s) => s.id === parseInt(selectedService))?.serviceName}
                          </span>
                        </div>
                        <div className="booking-info-item">
                          <strong>Ngày:</strong>
                          <span>{new Date(selectedDate).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div className="booking-info-item">
                          <strong>Giờ:</strong>
                          <span>{selectedTime}</span>
                        </div>
                        <div className="booking-info-item">
                          <strong>Bác sĩ:</strong>
                          <span>
                            {filteredStaffList.find((s) => s.id === parseInt(selectedStaff))?.fullName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cột phải - Mã QR và nút bấm */}
                    <div className="confirmation-actions">
                      {isRescheduling ? (
                        <div className="reschedule-confirm">
                          <button
                            onClick={handleDirectBooking}
                            disabled={isLoading}
                            className="confirm-button"
                          >
                            {isLoading ? "Đang xử lý..." : "Xác nhận dời lịch"}
                          </button>
                        </div>
                      ) : (
                        qrCode && (
                          <div className="qr-section">
                            <div className="qr-card">
                              <QRCodeSVG
                                value={qrCode}
                                size={220}
                                level="H"
                                includeMargin={true}
                                className="qr-code"
                              />
                              <p className="payment-instruction">Quét mã QR để hoàn tất thanh toán</p>

                              {isLoading ? (
                                <div className="payment-status loading">
                                  <div className="spinner"></div>
                                  <span>Đang xử lý thanh toán...</span>
                                </div>
                              ) : paymentStatus === "success" ? (
                                <div className="payment-status success">
                                  <FiCheckCircle className="status-icon" />
                                  <span>Thanh toán thành công!</span>
                                </div>
                              ) : paymentStatus === "failed" ? (
                                <div className="payment-status error">
                                  <FiXCircle className="status-icon" />
                                  <span>Thanh toán thất bại</span>
                                  <button onClick={handleQRScanned} className="try-again-button">
                                    Thử lại
                                  </button>
                                </div>
                              ) : (
                                <button onClick={handleQRScanned} className="qr-button">
                                  <FiSmartphone className="button-icon" />
                                  Quét mã QR thanh toán
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      )}

                      <div className="cancel-section">
                        <button onClick={handleCancel} className="cancel-button">
                          <FiX className="button-icon" />
                          Hủy đặt lịch
                        </button>
                      </div>
                    </div>
                  </div>
                  <Link to="/" className="payment-late-button">Thanh Toán Sau</Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div >
  );
};

export default BookingPage;
