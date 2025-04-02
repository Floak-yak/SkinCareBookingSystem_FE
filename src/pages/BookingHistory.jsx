import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bookingApi from "../api/bookingApi";
import { toast, ToastContainer } from "react-toastify";
import "../styles/BookingHistory.css";
import { FiCalendar, FiClock, FiUser, FiDollarSign, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import transactionApi from "../api/transactionApi";
import { message, Modal, Spin, Button } from 'antd';
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

export default function BookingHistory() {

    const [bookedAppointments, setBookedAppointments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();
    const [qrCode, setQrCode] = useState("");
    const [orderCode, setOrderCode] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [showQRModal, setShowQRModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
                console.log("Bookings response:", response);

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

                    console.log("Transformed bookings:", transformedBookings);

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
            const { data } = await transactionApi.checkTransaction(orderCode);
            console.log("Respone data OrderCode: ", data);
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

    const handlePaymentLate = async (booking) => {
        try {
            setIsLoading(true);
            const respone = await transactionApi.getByBookingId(booking.id);
            const data = respone.data;
            if (data.qrCode) {
                setQrCode(data.qrCode);
                setOrderCode(data.orderCode);
                setTransactionId(data.id);
                setShowQRModal(true);
            } else {
                throw new Error("Không tìm thấy mã QR");
            }
        } catch (error) {
            console.error("Error handling booking:", error);
            toast.error("Có lỗi xảy ra khi xử lý lịch đặt!");
        } finally {
            setIsLoading(false);
        }
    };

    const QRPaymentModal = () => (
        <Modal
            title="Quét mã QR thanh toán"
            open={showQRModal}
            onCancel={() => setShowQRModal(false)}
            footer={[
                <Button key="cancel" onClick={() => setShowQRModal(false)}>
                    Đóng
                </Button>,
                <Button
                    key="confirm"
                    type="primary"
                    onClick={handleQRScanned}
                    loading={isLoading}
                >
                    Đã quét mã
                </Button>
            ]}
        >
            {isLoading ? (
                <Spin tip="Đang tải mã QR..." />
            ) : (
                qrCode && (
                    <div className="qr-container">
                        <QRCodeSVG
                            value={qrCode}
                            size={220}
                            level="H"
                            includeMargin={true}
                            className="qr-code"
                        />
                        <div className="payment-info">
                            <p>Mã đơn hàng: {orderCode}</p>
                            <p>Mã giao dịch: {transactionId}</p>
                        </div>
                    </div>
                )
            )}
        </Modal>
    );

    const handleDeleteBooking = async (booking) => {
        try {
            if (window.confirm("Bạn có chắc chắn muốn hủy lịch này không?")) {
                setIsLoading(true);
                const response = await bookingApi.cancelBooking(booking.id, currentUser.userId);

                const updatedAppointments = bookedAppointments.map((appointment) =>
                    appointment.id === booking.id
                        ? { ...appointment, status: response.data?.status || "cancel" }
                        : appointment
                );
                setBookedAppointments(updatedAppointments);
                localStorage.setItem(
                    "bookedAppointments",
                    JSON.stringify(updatedAppointments)
                );

                toast.success("Hủy lịch thành công");
            }
            // }
        } catch (error) {
            console.error("Error handling booking:", error);
            toast.error("Có lỗi xảy ra khi xử lý lịch đặt!");
        } finally {
            setIsLoading(false);
        }
    };

    const pendingAppointments = sortedAppointments.filter(booking => booking.status === "pending");

    const BookingCard = ({ booking }) => {
        const canReschedule = checkBookingTime(booking.date, booking.time);

        return (
            <div className={`booking-card ${booking.status}`}>
                <div className="booking-header">
                    <h4 className="service-name">{booking.serviceName}</h4>
                    <span className={`status-badge ${booking.status}`}>
                        {booking.status === "pending" ? "Chưa thanh toán"
                            : booking.status === "waiting" ? "Đang chờ"
                                : booking.status === "completed" ? "Đã hoàn thành"
                                    : booking.status === "cancel" ? "Đã hủy"
                                        : "Không xác định"}
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
                    {booking.status === "pending" && (
                        <>
                            <button
                                onClick={() => handleDeleteBooking(booking)}
                                className="action-button cancel">
                                Hủy lịch
                            </button>
                            <button onClick={() => handlePaymentLate(booking)}
                                className="action-button view">
                                Thanh Toán
                            </button>
                            <QRPaymentModal />
                        </>
                    )}
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
                        {Array.from({ length: 5 }).map((_, index) => {
                            const booking = bookings[index];

                            return (
                                <tr
                                    key={booking?.id || `empty-${index}`}
                                    className={`table-row ${booking?.status || 'empty'}`}
                                >
                                    <td>{booking?.serviceName || '-'}</td>
                                    <td>{booking ? new Date(booking.date).toLocaleDateString("vi-VN") : '-'}</td>
                                    <td>{booking?.time || '-'}</td>
                                    <td>{booking?.skinTherapistName || '-'}</td>
                                    <td>{booking?.totalPrice?.toLocaleString("vi-VN") + 'đ' || '-'}</td>
                                    <td>
                                        {booking ? (
                                            <span className={`status-badge ${booking.status}`}>
                                                {booking.status === "pending" ? "Chưa thanh toán"
                                                    : booking.status === "waiting" ? "Đang chờ"
                                                        : booking.status === "completed" ? "Đã hoàn thành"
                                                            : booking.status === "cancel" ? "Đã hủy"
                                                                : "Không xác định"}
                                            </span>
                                        ) : (
                                            <span className="status-badge empty">-</span>
                                        )}
                                    </td>
                                    <td>
                                        {booking ? (
                                            <>
                                                {booking.status === "waiting" && (
                                                    <>
                                                        {checkBookingTime(booking.date, booking.time) && (
                                                            <button
                                                                onClick={() => handleRescheduleClick(booking)}
                                                                className="table-button reschedule"
                                                            >
                                                                Dời lịch
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteBooking(booking)}
                                                            className="table-button cancel"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </>
                                                )}

                                                {booking.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handlePaymentLate(booking)}
                                                            className="table-button view"
                                                        >
                                                            Payment
                                                        </button>
                                                        <QRPaymentModal />
                                                        <button
                                                            onClick={() => handleDeleteBooking(booking)}
                                                            className="table-button cancel"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <span className="empty-action">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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
