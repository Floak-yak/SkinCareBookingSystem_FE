import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bookingApi from "../api/bookingApi";
import { toast, ToastContainer } from "react-toastify";
import "../styles/BookingHistory.css";
import { FiCalendar, FiClock, FiUser, FiDollarSign, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function BookingHistory() {

    const [bookedAppointments, setBookedAppointments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    const handleRescheduleClick = (booking) => {
        navigate('/booking', {
            state: {
                isRescheduling: true,
                bookingData: booking
            }
        });
    };

    useEffect(() => {
        const userJson = localStorage.getItem("currentUser");
        console.log("LocalStorage currentUser:", userJson);

        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                if (user?.userId) {
                    setCurrentUser(user);
                    console.log("User loaded successfully:", user);
                } else {
                    console.warn("User object is missing userId:", user);
                }
            } catch (error) {
                console.error("Error parsing currentUser from localStorage:", error);
            }
        } else {
            console.warn("No currentUser found in localStorage.");
        }

        // Load booked appointments
        const savedAppointments = localStorage.getItem("bookedAppointments");
        if (savedAppointments) {
            setBookedAppointments(JSON.parse(savedAppointments));
        }
    }, []);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await bookingApi.getAllBookings();
                console.log("Bookings response:", response); // For debugging

                if (response.data) {
                    const transformedBookings = response.data.map((booking) => {
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
                                    case -1: return "cancel";
                                    case 0: return "pending";
                                    case 1: return "completed";
                                    case 2: return "waiting";
                                    default: return "unknown";
                                }
                            })(),
                            totalPrice: booking.totalPrice || 0,
                        };
                    });

                    console.log("Transformed bookings:", transformedBookings); // For debugging

                    // Filter bookings for current user
                    // const userBookings = transformedBookings.filter(
                    //     (booking) => booking.userId === currentUser.userId
                    // );
                    const userBookings =
                        currentUser && currentUser.userId
                            ? transformedBookings.filter((booking) => booking.userId === currentUser.userId)
                            : [];

                    setBookedAppointments(userBookings);
                    localStorage.setItem(
                        "bookedAppointments",
                        JSON.stringify(userBookings)
                    );
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
                toast.error("Không thể tải danh sách lịch đặt");
            }
        };

        fetchBookings();
    }, [currentUser]);

    const checkBookingTime = (bookingDate, bookingTime) => {
        try {
            if (!bookingDate || !bookingTime) return false;

            const now = new Date();
            const [hours, minutes] = bookingTime.split(":").map(Number);

            // Tạo datetime chính xác của lịch hẹn
            const bookingDateTime = new Date(bookingDate);
            bookingDateTime.setHours(hours, minutes, 0, 0);

            // Tính số giờ chênh lệch
            const hoursDiff = (bookingDateTime - now) / (1000 * 60 * 60);
            return hoursDiff >= 24; // true nếu còn trên 24h
        } catch (error) {
            console.error("Error in checkBookingTime:", error);
            return false;
        }
    };

    const sortedAppointments = [...bookedAppointments].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB; // Sắp xếp tăng dần theo ngày và giờ
    });

    const handleDeleteBooking = async (booking) => {
        try {
            const canReschedule = checkBookingTime(booking.date, booking.time);

            if (canReschedule) {
                // // Đánh dấu là đang dời lịch và lưu thông tin booking hiện tại
                // setIsRescheduling(true);
                // setSelectedService(booking.serviceId?.toString() || "");
                // setSelectedStaff(booking.skinTherapistId?.toString() || "");
                // setSelectedCategory(booking.categoryId?.toString() || "");
                // setCurrentBookingId(booking.id);
                // // Hiển thị form đặt lịch để chọn thời gian mới
                // setBookingConfirmed(false);
                // window.scrollTo(0, 0);
                // toast.info("Vui lòng chọn thời gian mới cho lịch đặt của bạn");
            } else {
                // Xử lý hủy lịch
                if (window.confirm("Bạn có chắc chắn muốn hủy lịch này không?")) {
                    await bookingApi.cancelBooking(booking.id, currentUser.userId);

                    // Cập nhật state sau khi hủy
                    const updatedAppointments = bookedAppointments.filter(
                        (appointment) => appointment.id !== booking.id
                    );
                    setBookedAppointments(updatedAppointments);
                    localStorage.setItem(
                        "bookedAppointments",
                        JSON.stringify(updatedAppointments)
                    );

                    toast.success("Hủy lịch thành công");
                }
            }
        } catch (error) {
            console.error("Error handling booking:", error);
            toast.error("Có lỗi xảy ra khi xử lý lịch đặt!");
        }
    };

    const pendingAppointments = sortedAppointments.filter(booking => booking.status === "pending");
    const paidAppointments = sortedAppointments.filter(booking => booking.status === "paid" || booking.status === "completed");
    const completedAppointments = sortedAppointments.filter(booking => booking.status === "completed");

    const BookingCard = ({ booking }) => {
        const canReschedule = checkBookingTime(booking.date, booking.time);

        return (
            <div className={`booking-card ${booking.status}`}>
                <div className="booking-header">
                    <h4 className="service-name">{booking.serviceName}</h4>
                    <span className={`status-badge ${booking.status}`}>
                        {booking.status === "pending" ? "Chưa thanh toán" :
                            booking.status === "paid" ? "Đã thanh toán" : "Đã hoàn thành"}
                    </span>
                </div>

                <div className="booking-details">
                    <div className="detail-item">
                        <FiCalendar className="detail-icon" />
                        <span>{new Date(booking.date).toLocaleDateString("vi-VN")}</span>
                    </div>

                    <div className="detail-item">
                        <FiClock className="detail-icon" />
                        <span>{booking.time}</span>
                    </div>

                    <div className="detail-item">
                        <FiUser className="detail-icon" />
                        <span>{booking.skinTherapistName || "Chưa xác định"}</span>
                    </div>

                    <div className="detail-item">
                        <FiDollarSign className="detail-icon" />
                        <span>{booking.totalPrice?.toLocaleString("vi-VN")}đ</span>
                    </div>
                </div>

                <div className="booking-actions">
                    {/* {canReschedule && booking.status === "pending" && (
                        <button className="action-button reschedule">
                            Dời lịch
                        </button>
                    )} */}
                    {booking.status === "pending" && (
                        <>
                            <button
                                onClick={() => handleDeleteBooking(booking)}
                                className="action-button cancel">
                                Hủy lịch
                            </button>
                            <button className="action-button view">
                                Thanh Toán
                            </button>
                        </>
                    )}
                    {/* {booking.status === "paid" && (
                        <button className="action-button view">
                            Xem chi tiết
                        </button>
                    )} */}
                </div>
            </div>
        );
    };

    // Tính toán dữ liệu phân trang
    const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
    const currentItems = sortedAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const showAsTable = sortedAppointments.length >= 6;

    const BookingTable = ({ bookings }) => {
        return (
            <div className="booking-table-container">
                <table className="booking-table">
                    <thead>
                        <tr>
                            <th>Dịch vụ</th>
                            <th>Ngày</th>
                            <th>Giờ</th>
                            <th>Bác sĩ</th>
                            <th>Giá</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.id} className={`table-row ${booking.status}`}>
                                <td>{booking.serviceName}</td>
                                <td>{new Date(booking.date).toLocaleDateString("vi-VN")}</td>
                                <td>{booking.time}</td>
                                <td>{booking.skinTherapistName || "Chưa xác định"}</td>
                                <td>{booking.totalPrice?.toLocaleString("vi-VN")}đ</td>
                                <td>
                                    {/* <span className={`status-badge ${booking.status}`}>
                                        {booking.status === "pending" ? "Chưa thanh toán" :
                                            booking.status === "paid" ? "Đã thanh toán" : "Đã xử lý"}
                                    </span> */}
                                    <span className={`status-badge ${booking.status}`}>
                                        {booking.status === "pending"
                                            ? "Chưa thanh toán"
                                            : booking.status === "waiting"
                                                ? "Đang chờ"
                                                : booking.status === "completed"
                                                    ? "Đã hoàn thành"
                                                    : booking.status === "cancel"
                                                        ? "Đã hủy"
                                                        : "Không xác định"}
                                    </span>

                                </td>
                                <td>
                                    {booking.status === "waiting" && (
                                        <>
                                            {checkBookingTime(booking.date, booking.time) && (
                                                <button onClick={() => handleRescheduleClick(booking)}
                                                    className="table-button reschedule">
                                                    Dời lịch
                                                </button>
                                            )}
                                            <button onClick={() => handleDeleteBooking(booking)}
                                                className="table-button cancel">
                                                Hủy
                                            </button>
                                        </>
                                    )}
                                    {(booking.status === "pending") && (
                                        <button onClick={() => handleDeleteBooking(booking)}
                                            className="table-button cancel">
                                            Hủy
                                        </button>
                                    )}
                                    {(booking.status === "completed") && (
                                        <button className="table-button view">
                                            Xem
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Phân trang */}
                {/* <div className="pagination">
                    <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <FiChevronLeft />
                    </button>

                    <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`page-number ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <FiChevronRight />
                    </button>
                </div> */}
            </div>
        );
    };

    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 4; // Số trang hiển thị tối đa

            if (totalPages <= maxVisiblePages + 2) {
                // Hiển thị tất cả trang nếu ít
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Logic hiển thị ...
                if (currentPage <= maxVisiblePages - 1) {
                    // Trang đầu (hiển thị 1 2 3 4 ... cuối)
                    for (let i = 1; i <= maxVisiblePages; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                } else if (currentPage >= totalPages - maxVisiblePages + 2) {
                    // Trang cuối (hiển thị đầu ... 5 6 7 8)
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
                        pages.push(i);
                    }
                } else {
                    // Trang giữa (hiển thị đầu ... 3 4 5 6 ... cuối)
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 2; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                }
            }

            return pages;
        };

        return (
            <div className="pagination">
                <button
                    className="pagination-button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <FiChevronLeft />
                </button>

                <div className="page-numbers">
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
                        ) : (
                            <button
                                key={page}
                                className={`page-number ${currentPage === page ? 'active' : ''}`}
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                <button
                    className="pagination-button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <FiChevronRight />
                </button>
            </div>
        );
    };


    return (
        <>
            <div className="booking-history-container">
                <ToastContainer position="top-right" autoClose={3000} />

                <div className="booking-history-header">
                    <h2 className="page-title">Lịch sử đặt hẹn</h2>
                    <p className="page-subtitle">Quản lý các lịch hẹn của bạn</p>
                </div>

                {bookedAppointments.length === 0 ? (
                    <div className="empty-state">
                        <img src="/images/empty-booking.svg" alt="No bookings" className="empty-image" />
                        <h3>Bạn chưa có lịch hẹn nào</h3>
                        <p>Hãy đặt lịch ngay để trải nghiệm dịch vụ của chúng tôi</p>
                        <button className="primary-button">Đặt lịch ngay</button>
                    </div>
                ) : (
                    <div className="bookings-tabs">
                        {/* Phần 1: Chỉ hiển thị lịch chưa thanh toán (luôn dạng card) */}
                        {pendingAppointments.length > 0 && (
                            <div className="booking-section pending-section">
                                <h3 className="section-title">
                                    <FiClock className="section-icon" />
                                    Lịch chưa thanh toán
                                </h3>
                                <div className="bookings-grid">
                                    {pendingAppointments.map(booking => (
                                        <BookingCard key={booking.id} booking={booking} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Phần 2: Tất cả lịch đã đặt */}
                        <div className="booking-section all-bookings-section">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <FiCalendar className="section-icon" />
                                    Tất cả lịch đã đặt
                                    {showAsTable && (
                                        <span className="pagination-info">
                                            (Trang {currentPage}/{totalPages})
                                        </span>
                                    )}
                                </h3>
                            </div>

                            {showAsTable ? (
                                <>
                                    <BookingTable bookings={currentItems} />
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={(page) => setCurrentPage(page)}
                                    />
                                </>
                            ) : (
                                <div className="bookings-grid">
                                    {sortedAppointments.map(booking => (
                                        <BookingCard key={booking.id} booking={booking} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
