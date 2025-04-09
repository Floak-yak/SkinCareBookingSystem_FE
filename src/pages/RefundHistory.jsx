import React, { useState, useEffect } from "react";
import bookingApi from "../api/bookingApi";
import { toast, ToastContainer } from "react-toastify";
import "../styles/BookingHistory.css";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function RefundHistory() {

    const [bookedAppointments, setBookedAppointments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [cancelledBookings, setCancelledBookings] = useState([]);
    const itemsPerPage = 5;

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
                const response = await bookingApi.getPayBackCancelBookingsByUserId(currentUser?.userId);
                console.log("Bookings response cancel:", response);

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
                            serviceName: booking.serviceName,
                            date: formattedDate,
                            time: formattedTime,
                            status: (() => {
                                if (booking.status === true) return "completed";
                                if (booking.status === false) return "pending";
                                return "unknown";
                            })(),
                            totalPrice: booking.totalPrice || 0,
                        };
                    });

                    console.log("Transformed bookings:", transformedBookings);
                    setCancelledBookings(transformedBookings);

                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
                toast.error("Không thể tải danh sách lịch đặt");
            }
        };

        fetchBookings();
    }, [currentUser]);

    const sortedAppointments = [...cancelledBookings].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB; // Sắp xếp tăng dần theo ngày và giờ
    });

    // Tính toán dữ liệu phân trang
    const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
    const currentItems = sortedAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const BookingTable = ({ bookings }) => {
        return (
            <div className="booking-table-container">
                <table className="booking-table">
                    <thead>
                        <tr>
                            <th>Dịch vụ</th>
                            <th>Ngày</th>
                            <th>Giờ</th>
                            <th>Giá</th>
                            <th>Trạng thái</th>
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
                                    <td>{booking?.totalPrice?.toLocaleString("vi-VN") + 'đ' || '-'}</td>
                                    <td>
                                        {booking ? (
                                            <span className={`status-badge ${booking.status}`}>
                                                {booking.status === "pending" ? "Chưa hoàn tiền"
                                                    : booking.status === "completed" ? "Đã hoàn tiền"
                                                        : "Không xác định"}
                                            </span>
                                        ) : (
                                            <span className="status-badge empty">-</span>
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
                    <h2 className="page-title">Lịch sử hoàn tiền</h2>
                    <p className="page-subtitle">các lịch đã và chưa được hoàn tiền</p>
                </div>

                {cancelledBookings.length === 0 ? (
                    <div className="empty-state">
                        <img src="/images/empty-booking.svg" alt="No bookings" className="empty-image" />
                        <h3>Không có lịch hủy nào trong hệ thống</h3>
                    </div>
                ) : (
                    <div className="bookings-tabs">
                        {/* Phần: Tất cả lịch đã hủy */}
                        <div className="booking-section all-bookings-section">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <FiCalendar className="section-icon" />
                                    Trạng thái các lịch đã hủy
                                    <span className="pagination-info">
                                        (Trang {currentPage}/{totalPages})
                                    </span>
                                </h3>
                            </div>

                            {/* Luôn hiển thị bảng */}
                            <BookingTable bookings={currentItems} />
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
