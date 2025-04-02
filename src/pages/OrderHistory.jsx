import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FiCalendar, FiDollarSign } from "react-icons/fi";
import { Modal, Spin, Button } from "antd";
import { toast, ToastContainer } from "react-toastify";
import transactionApi from "../api/transactionApi";
import useAuth from "../hooks/useAuth";
import "../styles/BookingHistory.css"; 

const getStatusText = (status) => {
  if (status === 0 || status === "PENDING") return "Chưa thanh toán";
  if (status === 1 || status === "PAID") return "Đã thanh toán";
  if (status === -1 || status === "CANCEL" || status === "CANCELLED")
    return "Đã hủy";
  return "Không xác định";
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [currentTransactionId, setCurrentTransactionId] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Lấy danh sách đơn hàng của user
  const fetchOrders = async () => {
    if (user && user.userId) {
      try {
        const response = await transactionApi.getByUserId(user.userId);
        // Lọc ra các đơn hàng mua sản phẩm
        const productOrders = response.data.filter(
          (order) => order.bookingType === "Order's transaction"
        );
        setOrders(productOrders);
      } catch (error) {
        console.error("Lỗi lấy lịch sử giao dịch:", error);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Tách đơn hàng theo trạng thái
  const pendingOrders = orders.filter(
    (order) =>
      order.tranctionStatus === 0 || order.tranctionStatus === "PENDING"
  );
  const completedOrders = orders.filter(
    (order) =>
      order.tranctionStatus !== 0 && order.tranctionStatus !== "PENDING"
  );

  // Thanh toán lại
  const handlePayAgain = async (order) => {
    const txId = order.id;
    try {
      setIsLoading(true);
      const response = await transactionApi.getById(txId);
      const transactionData = response.data;
      const qr = transactionData.qrCode;
      const order_Code = transactionData.orderCode;
      if (qr && order_Code) {
        setQrCode(qr);
        setCurrentTransactionId(txId); 
        setOrderCode(order_Code);      
        setQrModalVisible(true);
      } else {
        toast.error("Không lấy được mã QR từ giao dịch này.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin giao dịch:", error);
      toast.error("Không thể lấy thông tin giao dịch.");
    } finally {
      setIsLoading(false);
    }
  };

  // Xài orderCode để check trạng thái giao dịch
  const handleConfirmPayment = async () => {
    if (!orderCode) {
      toast.error("Không có giao dịch nào được tạo.");
      return;
    }
    try {
      setIsLoading(true);
      const { data } = await transactionApi.checkTransaction(orderCode);
      console.log("Response data:", data);
      const status = typeof data === "string" ? data : data.status;
      if (status === "PAID") {
        window.location.href = `${window.location.origin}/success.html?transactionId=${currentTransactionId}`;
      } else if (status === "CANCEL") {
        window.location.href = `${window.location.origin}/cancel.html?transactionId=${currentTransactionId}`;
      } else if (status === "PENDING") {
        Modal.confirm({
          title: "Giao dịch đang chờ xử lý",
          content:
            "Giao dịch của bạn đang ở trạng thái PENDING. Bạn có muốn thanh toán sau không?",
          okText: "Thanh toán sau",
          cancelText: "Thử lại",
          onOk: () => handlePayLater(),
          onCancel: () =>
            toast.info("Vui lòng thử xác nhận lại giao dịch sau ít phút."),
        });
      } else {
        toast.error("Trạng thái giao dịch không xác định!");
      }
    } catch (error) {
      console.error("Lỗi xác nhận giao dịch:", error);
      toast.error("Xác nhận thanh toán thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Hủy thanh toán từ modal: sử dụng transactionId
  const handleCancelPayment = () => {
    if (!currentTransactionId) {
      toast.error("Không có giao dịch nào được tạo.");
      return;
    }
    window.location.href = `${window.location.origin}/cancel.html?transactionId=${currentTransactionId}`;
  };

  // Thanh toán sau: ẩn modal và thông báo cho người dùng
  const handlePayLater = () => {
    setQrModalVisible(false);
    toast.info("Bạn chọn thanh toán sau. Vui lòng hoàn tất sau.");
  };

  // Đóng modal (không thực hiện hành động)
  const handleCloseQrModal = () => {
    setQrModalVisible(false);
    setQrCode("");
    setCurrentTransactionId("");
    setOrderCode("");
  };

  return (
    <div className="booking-history-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="booking-history-header">
        <h2 className="page-title">Lịch sử mua hàng</h2>
        <p className="page-subtitle">Quản lý các đơn hàng của bạn</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>Bạn chưa có đơn hàng nào</h3>
          <p>Hãy mua sắm ngay để có được những ưu đãi tốt nhất!</p>
          <button className="primary-button">Mua sắm ngay</button>
        </div>
      ) : (
        <div className="bookings-sections">
          {pendingOrders.length > 0 && (
            <div className="booking-section pending-section">
              <h3 className="section-title">Đơn hàng chưa thanh toán</h3>
              <div className="bookings-grid">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="booking-card pending">
                    <div className="booking-header">
                      <h4 className="service-name">
                        Mã đơn: {order.orderCode ? order.orderCode : order.id}
                      </h4>
                      <span className="status-badge pending">
                        {getStatusText(order.tranctionStatus)}
                      </span>
                    </div>
                    <div className="booking-details">
                      <div className="detail-item">
                        <FiCalendar className="detail-icon" />
                        <span>
                          {new Date(order.createdDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="detail-item">
                        <FiDollarSign className="detail-icon" />
                        <span>{order.totalMoney.toLocaleString()} VND</span>
                      </div>
                    </div>
                    <div className="booking-actions">
                      <button
                        className="action-button view"
                        onClick={() => handlePayAgain(order)}
                      >
                        Thanh toán lại
                      </button>
                      <button
                        className="action-button cancel"
                        // Ở đây, dùng order.transactionId nếu có, nếu không có thì có thể dùng order.id
                        onClick={() =>
                          window.location.href = `${window.location.origin}/cancel.html?transactionId=${order.transactionId || order.id}`
                        }
                      >
                        Hủy đơn hàng
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="booking-section all-bookings-section">
            <div className="section-header">
              <h3 className="section-title">Lịch sử đơn hàng</h3>
            </div>
            <div className="bookings-grid">
              {completedOrders.map((order) => {
                const isCancelled =
                  order.tranctionStatus === -1 ||
                  order.tranctionStatus === "CANCEL";
                return (
                  <div
                    key={order.id}
                    className={`booking-card ${isCancelled ? "cancel" : "completed"}`}
                  >
                    <div className="booking-header">
                      <h4 className="service-name">
                        Mã đơn: {order.orderCode ? order.orderCode : order.id}
                      </h4>
                      <span className={`status-badge ${isCancelled ? "cancel" : "completed"}`}>
                        {getStatusText(order.tranctionStatus)}
                      </span>
                    </div>
                    <div className="booking-details">
                      <div className="detail-item">
                        <FiCalendar className="detail-icon" />
                        <span>
                          {new Date(order.createdDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="detail-item">
                        <FiDollarSign className="detail-icon" />
                        <span>{order.totalMoney.toLocaleString()} VND</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal hiển thị form thanh toán lại */}
      {qrModalVisible && (
        <Modal
          title="Quét mã QR thanh toán lại"
          open={qrModalVisible}
          onCancel={handleCloseQrModal}
          footer={[
            <Button
              key="confirm"
              type="primary"
              onClick={handleConfirmPayment}
              loading={isLoading}
            >
              Xác nhận thanh toán
            </Button>,
            <Button key="cancel" danger onClick={handleCancelPayment}>
              Hủy thanh toán
            </Button>,
            <Button key="later" onClick={handlePayLater}>
              Thanh toán sau
            </Button>,
          ]}
        >
          {isLoading ? (
            <div style={{ textAlign: "center", minHeight: "250px" }}>
              <Spin tip="Đang tải mã QR..." />
            </div>
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
                  <p>Mã giao dịch: {currentTransactionId}</p>
                </div>
              </div>
            )
          )}
        </Modal>
      )}

      <ToastContainer />
    </div>
  );
};

export default OrderHistory;
