import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bookingApi from "../../api/bookingApi";
import { toast, ToastContainer } from "react-toastify";
import "../../styles/BookingHistory.css";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { message, Modal, Button } from 'antd';
import ImageManagerForTransaction from "../../components/ImageManagerForTransaction";
import imageApi from "../../api/imageApi";

export default function ManageCancelBookingPage() {

    const [AllBookedAppointments, setAllBookedAppointments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPage2, setCurrentPage2] = useState(1);
    const [currentPage3, setCurrentPage3] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showImageUploadModal, setShowImageUploadModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [getPayBackCancelBookings, setGetPayBackCancelBookings] = useState([]);
    const [getPaidCancelBookings, setGetPaidCancelBookings] = useState([]);

    // Thêm hàm xử lý hoàn tiền
    const handleConfirmRefund = async () => {
        if (!selectedBooking?.id) {
            message.error("Không tìm thấy thông tin đặt chỗ!");
            return;
        }
        console.log("Xác nhận hoàn tiền cho booking ID:", selectedBooking.id);
        try {
            setIsLoading(true);
            await bookingApi.completePayment(selectedBooking.id);
            console.log("Xác nhận hoàn tiền thành công:", selectedBooking.id);
            message.success("Xác nhận hoàn tiền thành công!");

            // Cập nhật trạng thái booking
            const updatedBookings = AllBookedAppointments.map(booking =>
                booking.id === selectedBooking.id
                    ? { ...booking, status: "refunded" }
                    : booking
            );
            setAllBookedAppointments(updatedBookings);
            localStorage.setItem("AllBookedAppointments", JSON.stringify(updatedBookings));
        } catch (error) {
            console.error("Lỗi xác nhận hoàn tiền:", error);
            message.error("Xác nhận hoàn tiền thất bại!");
        } finally {
            setIsLoading(false);
            setShowImageUploadModal(false);
        }
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
        const savedAppointments = localStorage.getItem("AllBookedAppointments");
        if (savedAppointments) {
            setAllBookedAppointments(JSON.parse(savedAppointments));
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

                    setAllBookedAppointments(transformedBookings);
                    localStorage.setItem(
                        "AllBookedAppointments",
                        JSON.stringify(transformedBookings)
                    );
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
                toast.error("Không thể tải danh sách lịch đặt");
            }
        };

        fetchBookings();
    }, [currentUser]);

    useEffect(() => {
        const fetchGetPayBack = async () => {
            try {
                const response = await bookingApi.getPayBackCancelBookings();
                console.log("GetPayBackCancelBookings response:", response);
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
                            id: booking.bookingId,
                            fullName: booking.fullName,
                            email: booking.email,
                            phone: booking.phoneNumber,
                            date: formattedDate,
                            time: formattedTime,
                            paymentMethod: booking.paymentMethod,
                            paymentNumber: booking.paymentNumber,
                            totalAmount: booking.totalAmount || 0,
                        };
                    });
                    console.log("Transformed bookings cancel pay back:", transformedBookings);
                    setGetPayBackCancelBookings(transformedBookings);
                }
            } catch (error) {
                console.error("Error fetching GetPayBackCancelBookings:", error);
                toast.error("Không thể tải danh sách lịch đặt");
            }
        };
        fetchGetPayBack();
    }, [currentUser]);

    useEffect(() => {
        const fetchGetPaid = async () => {
            try {
                const response = await bookingApi.getPaidCancelBookings();
                console.log("GetPaidCancelBookings response:", response);
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
                            fullName: booking.fullName,
                            email: booking.email,
                            phone: booking.phoneNumber,
                            date: formattedDate,
                            time: formattedTime,
                            paymentMethod: booking.paymentMethod,
                            paymentNumber: booking.paymentNumber,
                            totalAmount: booking.totalAmount || 0,
                            imageId: booking.imageId,
                        };
                    });
                    console.log("Transformed bookings get paid:", transformedBookings);
                    setGetPaidCancelBookings(transformedBookings);
                }
            } catch (error) {
                console.error("Error fetching GetPaidCancelBookings:", error);
                toast.error("Không thể tải danh sách lịch đặt");
            }
        };
        fetchGetPaid();
    }, [currentUser]);

    const sortedAppointments = [...AllBookedAppointments].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB; // Sắp xếp tăng dần theo ngày và giờ
    });
    console.log("Sorted appointments:", sortedAppointments);

    // Tính toán dữ liệu phân trang
    const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
    const currentItems = sortedAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages2 = Math.ceil(getPayBackCancelBookings.length / itemsPerPage);
    const currentItems2 = getPayBackCancelBookings.slice(
        (currentPage2 - 1) * itemsPerPage,
        currentPage2 * itemsPerPage
    );

    const totalPages3 = Math.ceil(getPaidCancelBookings.length / itemsPerPage);
    const currentItems3 = getPaidCancelBookings.slice(
        (currentPage3 - 1) * itemsPerPage,
        currentPage3 * itemsPerPage
    );

    const BookingTable2 = ({ bookings }) => {
        return (
            <div className="booking-table-container">
                <table className="booking-table">
                    <thead>
                        <tr>
                            <th>Tên khách hàng</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Ngày/Giờ</th>
                            <th>Giá</th>
                            <th>NH: STK</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, index) => {
                            const booking = bookings[index];
                            return (
                                <tr
                                    key={booking?.id || `empty-${index}`}
                                    className={`table-row`}
                                >
                                    <td>{booking?.fullName || '-'}</td>
                                    <td>{booking?.email || '-'}</td>
                                    <td>{booking?.phone || '-'}</td>
                                    <td>{booking ? new Date(booking.date).toLocaleDateString("vi-VN") : '-'} : {booking?.time}</td>
                                    <td>{booking?.totalAmount?.toLocaleString("vi-VN") + 'đ' || '-'}</td>
                                    <td>
                                        {booking?.paymentMethod || '-'} : {booking?.paymentNumber || '-'}
                                    </td>
                                    <td>
                                        {booking ? (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setShowImageUploadModal(true);
                                                    }}
                                                    className="table-button confirm-refund"
                                                >
                                                    Xác nhận hoàn tiền
                                                </button>
                                                <ImageManagerForTransaction
                                                    visible={showImageUploadModal}
                                                    onClose={() => setShowImageUploadModal(false)}
                                                    onSelectImage={handleConfirmRefund}
                                                    bookingId={selectedBooking?.id}
                                                />
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

    const BookingTable3 = ({ bookings }) => {
        const [imagesMap, setImagesMap] = useState({});
        const [loadingMap, setLoadingMap] = useState({});
        const [visibleModal, setVisibleModal] = useState(false);
        const [selectedImages, setSelectedImages] = useState([]);

        const fetchImagesbyId = async (bookingId) => {
            try {
                setLoadingMap((prev) => ({ ...prev, [bookingId]: true }));
                const res = await imageApi.getImageById(bookingId);
                console.log(`Dữ liệu trả về cho booking ${bookingId}:`, res.data);

                if (res.data && res.data.bytes) {
                    const imageUrl = `data:image/jpeg;base64,${res.data.bytes}`;
                    setImagesMap((prev) => ({ ...prev, [bookingId]: [imageUrl] }));
                } else {
                    console.warn(`Không tìm thấy dữ liệu ảnh cho booking ${bookingId}`);
                    setImagesMap((prev) => ({ ...prev, [bookingId]: [] }));
                }
            } catch (error) {
                console.error(`Lỗi khi tải ảnh cho booking ${bookingId}:`, error);
                message.error(`Lỗi khi tải ảnh cho booking ${bookingId}!`);
                setImagesMap((prev) => ({ ...prev, [bookingId]: [] }));
            } finally {
                setLoadingMap((prev) => ({ ...prev, [bookingId]: false }));
            }
        };

        // Gọi API cho từng booking khi component mount
        useEffect(() => {
            bookings.forEach((booking) => {
                if (booking?.imageId) {
                    fetchImagesbyId(booking.imageId);
                }
            });
        }, [bookings]);

        const showImageModal = (bookingId) => {
            const images = imagesMap[bookingId] || [];
            setSelectedImages(images);
            setVisibleModal(true);
        };

        const handleCloseModal = () => {
            setVisibleModal(false);
            setSelectedImages([]);
        };
        return (
            <div className="booking-table-container">
                <table className="booking-table">
                    <thead>
                        <tr>
                            <th>Tên khách hàng</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Ngày/Giờ</th>
                            <th>Giá</th>
                            <th>NH: STK</th>
                            <th>Hình ảnh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, index) => {
                            const booking = bookings[index];
                            return (
                                <tr
                                    key={booking?.id || `empty-${index}`}
                                    className={`table-row`}
                                >
                                    <td>{booking?.fullName || '-'}</td>
                                    <td>{booking?.email || '-'}</td>
                                    <td>{booking?.phone || '-'}</td>
                                    <td>{booking ? new Date(booking.date).toLocaleDateString("vi-VN") : '-'} : {booking?.time}</td>
                                    <td>{booking?.totalAmount?.toLocaleString("vi-VN") + 'đ' || '-'}</td>
                                    <td>
                                        {booking?.paymentMethod || '-'} : {booking?.paymentNumber || '-'}
                                    </td>
                                    <td>
                                        {loadingMap[booking?.imageId] ? (
                                            <div>Đang tải...</div>
                                        ) : imagesMap[booking?.imageId]?.length > 0 ? (
                                            <Button
                                                // type="primary"
                                                onClick={() => showImageModal(booking?.imageId)}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        ) : (
                                            <div>Không có ảnh</div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {/* Modal để hiển thị ảnh */}
                <Modal
                    title="Hình ảnh chi tiết"
                    open={visibleModal}
                    onCancel={handleCloseModal}
                    footer={[
                        <Button key="close" onClick={handleCloseModal}>
                            Đóng
                        </Button>,
                    ]}
                >
                    {selectedImages.length > 0 ? (
                        selectedImages.map((imageUrl, imgIndex) => (
                            <img
                                key={imgIndex}
                                src={imageUrl}
                                alt={`Ảnh ${imgIndex + 1}`}
                                style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
                            />
                        ))
                    ) : (
                        <div>Không có ảnh để hiển thị</div>
                    )}
                </Modal>
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
                    <h2 className="page-title">Lịch sử hủy lịch</h2>
                    <p className="page-subtitle">Quản lý các lịch đã hủy của SPA</p>
                </div>

                {AllBookedAppointments.length === 0 ? (
                    <div className="empty-state">
                        <img src="/images/empty-booking.svg" alt="No bookings" className="empty-image" />
                        <h3>Không có lịch huuyr nào trong hệ thống</h3>
                        <p>Hãy đặt lịch ngay để trải nghiệm dịch vụ của chúng tôi</p>
                        <button className="primary-button">Đặt lịch ngay</button>
                    </div>
                ) : (
                    <div className="bookings-tabs">
                        {/* Phần: Tất cả lịch đã hủy */}
                        <div className="booking-section all-bookings-section">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <FiCalendar className="section-icon" />
                                    Lịch hủy chưa hoàn tiền
                                    <span className="pagination-info">
                                        (Trang {currentPage2}/{totalPages2})
                                    </span>
                                </h3>
                            </div>

                            {/* Luôn hiển thị bảng */}
                            <BookingTable2 bookings={currentItems2} />
                            <Pagination
                                currentPage={currentPage2}
                                totalPages={totalPages2}
                                onPageChange={(page) => setCurrentPage2(page)}
                            />

                            <div className="section-header">
                                <h3 className="section-title">
                                    <FiCalendar className="section-icon" />
                                    Lịch hủy đã hoàn tiền
                                    <span className="pagination-info">
                                        (Trang {currentPage3}/{totalPages3})
                                    </span>
                                </h3>
                            </div>

                            <BookingTable3 bookings={currentItems3} />
                            <Pagination
                                currentPage={currentPage3}
                                totalPages={totalPages3}
                                onPageChange={(page) => setCurrentPage3(page)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
