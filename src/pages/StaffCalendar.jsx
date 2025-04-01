import React, { useEffect, useState } from 'react';
import Calendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bookingApi from '../api/bookingApi';
import '../styles/StaffCalendar.css';
import scheduleApi from '../api/scheduleApi';

const StaffCalendar = () => {
    const [events, setEvents] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Load user từ localStorage
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('currentUser'));
        if (userData) setCurrentUser(userData);
    }, []);

    // Fetch bookings
    const fetchBookings = async () => {
        try {
            const res = await bookingApi.getAllBookings();
            const filtered = res.data.filter(booking =>
                booking.skintherapistName?.toLowerCase() === currentUser.fullName.toLowerCase()
                && (booking.status === 0 || booking.status === 2)
            );

            setEvents(filtered.map(booking => ({
                id: booking.id,
                title: booking.serviceName,
                start: booking.date,
                end: new Date(new Date(booking.date).getTime() + 3600000),
                // color: booking.status === 1 ? '#38a169' : '#dd6b20',
                status: booking.status,
                skintherapistName: booking.skintherapistName,
                extendedProps: {
                    customer: booking.user?.fullName || 'Khách',
                    phone: booking.user?.phoneNumber
                }
            })));
        } catch (error) {
            console.error('Lỗi tải lịch:', error);
        }
    };

    useEffect(() => {
        if (!currentUser) return;
        fetchBookings();
    }, [currentUser]);

    const handleCheckout = async () => {
        if (!selectedEvent || !currentUser) {
            console.error("Không có sự kiện hoặc người dùng để checkout");
            return;
        }

        try {
            // Bước 1: Lấy scheduleLogId từ API dùng id của chuyên viên
            const therapistId = currentUser.userId; // Giả định currentUser có id
            console.log("therapistId: ", therapistId);
            const scheduleResponse = await scheduleApi.getByTherapistId(therapistId);
            console.log("scheduleRes: ", scheduleResponse);

            const eventStartTime = new Date(selectedEvent.start);
            const eventStartTimeLocal = eventStartTime.toLocaleString('sv', { timeZone: 'Asia/Bangkok' }).replace(' ', 'T');

            console.log("eventStartTimeLocal: ", eventStartTimeLocal);
            let scheduleLogId;

            // Tìm ngày khớp với eventStartTime
            const matchingDay = scheduleResponse.data.find(day =>
                day.dateWork === eventStartTimeLocal
            );

            console.log("matchingDay: ", matchingDay);

            if (matchingDay) {
                const matchingLog = matchingDay.scheduleLogs.find(log =>
                    log.timeStartShift === eventStartTimeLocal
                );
                if (matchingLog) {
                    scheduleLogId = matchingLog.id;
                }
                console.log("matchingLog: ", matchingLog);
            }

            if (!scheduleLogId) {
                throw new Error("Không tìm thấy scheduleLog phù hợp với sự kiện được chọn");
            }

            // Bước 2: Gọi API checkout với scheduleLogId
            const bookingId = selectedEvent.id;
            console.log("selectedEvent: ", bookingId);
            console.log("therapistId: ", therapistId);
            console.log("scheduleLogId: ", scheduleLogId);
            await bookingApi.CheckOut(therapistId, scheduleLogId);

            await fetchBookings();

            setIsModalOpen(false);
            alert("Checkout thành công!");
        } catch (error) {
            console.error("Lỗi khi checkout:", error);
            alert("Đã có lỗi xảy ra khi checkout. Vui lòng thử lại.");
        }
    };

    if (!currentUser) return <div className="login-message">Vui lòng đăng nhập</div>;

    return (
        <>
            {currentUser?.role === "SkinTherapist" ? (
                <div className="spa-calendar">
                    <div className="calendar-header">
                        <div className="user-greeting">
                            <h1>Lịch làm việc</h1>
                            <div className="user-info">
                                <span className="welcome">Xin chào,</span>
                                <span className="user-name">{currentUser.fullName}</span>
                            </div>
                        </div>
                        <div className="work-hours">
                            <span>Khung giờ: 9:00 - 12:00 | 13:00 - 16:00</span>
                        </div>
                    </div>

                    <div className="calendar-wrapper">
                        <Calendar
                            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                            initialView="timeGridDay"
                            headerToolbar={{
                                start: 'title',
                                center: 'dayGridMonth,timeGridWeek,timeGridDay',
                                end: 'today prev,next'
                            }}
                            views={{
                                timeGridWeek: {
                                    slotDuration: '01:00:00',
                                    slotLabelFormat: {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        omitZeroMinute: true,
                                        hour12: false,
                                        meridiem: false
                                    }
                                },
                                dayGridMonth: {
                                    titleFormat: { year: 'numeric', month: 'long' },
                                    dayMaxEvents: 3,
                                    dayMaxEventRows: 3,
                                    moreLinkClick: "popover",
                                    dayCellClassNames: 'fixed-day-cell'
                                }
                            }}
                            slotMinTime="09:00:00"
                            slotMaxTime="17:00:00"
                            allDaySlot={false}
                            height="auto"
                            slotDuration="01:00:00"
                            slotLabelFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                omitZeroMinute: true,
                                hour12: false,
                                meridiem: false
                            }}
                            dayHeaderFormat={{ weekday: 'long' }}
                            events={events}
                            eventContent={(eventInfo) => (
                                <div className="booking-event">
                                    {eventInfo.view.type === 'dayGridMonth' ? (
                                        <div className="event-month">
                                            {eventInfo.event.title} - {eventInfo.event.extendedProps.customer}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="event-service">{eventInfo.event.title}</div>
                                            <div className="event-customer">{eventInfo.event.extendedProps.customer}</div>
                                            {/* <div className="event-time">{eventInfo.timeText}</div> */}
                                        </>
                                    )}
                                </div>
                            )}
                            eventClick={(info) => {
                                setSelectedEvent(info.event);
                                setIsModalOpen(true);
                            }}
                        />
                    </div>
                    {isModalOpen && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <div className="modal-content">
                                    <h2>Thông tin đặt lịch</h2>
                                    <p><strong>Dịch vụ:</strong> {selectedEvent.title}</p>
                                    <p><strong>Khách hàng:</strong> {selectedEvent.extendedProps.customer}</p>
                                    <p><strong>Số điện thoại:</strong> {selectedEvent.extendedProps.phone || '---'}</p>
                                    <p><strong>Thời gian:</strong> {selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p><strong>Trạng thái:</strong> {(selectedEvent.extendedProps.status === 0 ||
                                        selectedEvent.extendedProps.status === 2) ? 'Đang chờ' : 'Đã hoàn thành'}</p>

                                    <div className="modal-actions">
                                        {(selectedEvent.extendedProps.status === 0 ||
                                            selectedEvent.extendedProps.status === 2) ? (
                                            <button className="checkout-button" onClick={handleCheckout}>
                                                Checkout
                                            </button>
                                        ) : (
                                            <p className="completed-message">Đã hoàn thành</p>
                                        )}
                                        <button className="close-button" onClick={() => setIsModalOpen(false)}>
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ color: "red", fontSize: "100px" }}>
                    Bạn không phải là nhân viên nên không thể xem lịch ?????????????
                </div>
            )}
        </>
    );
};

export default StaffCalendar;