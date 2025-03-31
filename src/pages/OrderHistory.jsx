import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import transactionApi from "../api/transactionApi";
import useAuth from "../hooks/useAuth";
import "../styles/OrderHistory.css";

// Hàm chuyển đổi trạng thái giao dịch thành text
const getStatusText = (status) => {
  if (status === 0 || status === "PENDING") return "Pending";
  if (status === 1 || status === "SUCCESS") return "Success";
  if (status === -1 || status === "CANCEL" || status === "CANCELLED") return "Cancelled";
  return "Unknown";
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  const { user } = useAuth();

  // Lấy danh sách đơn hàng của user
  const fetchOrders = async () => {
    if (user && user.userId) {
      try {
        const response = await transactionApi.getByUserId(user.userId);
        setOrders(response.data);
      } catch (error) {
        console.error("Lỗi lấy lịch sử giao dịch:", error);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Tách đơn hàng Pending và các đơn hàng khác
  const pendingOrders = orders.filter(
    (order) =>
      order.tranctionStatus === 0 || order.tranctionStatus === "PENDING"
  );
  const completedOrders = orders.filter(
    (order) =>
      order.tranctionStatus !== 0 && order.tranctionStatus !== "PENDING"
  );

  // Xử lý "Thanh toán lại" cho đơn hàng Pending
  const handlePayAgain = async (order) => {
    const txId = order.transactionId || order.id;
    try {
      const response = await transactionApi.getById(txId);
      const createPaymentResult = response.data.createPaymentResult;
      const qr = createPaymentResult?.qrCode;
      if (qr) {
        setQrCode(qr);
        setCurrentTransactionId(txId);
        setQrModalVisible(true);
      } else {
        alert("Không lấy được mã QR từ giao dịch này.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin giao dịch:", error);
      alert("Không thể lấy thông tin giao dịch.");
    }
  };

  // Xử lý "Hủy đơn hàng" cho đơn hàng Pending
  const handleCancelOrder = async (order) => {
    const txId = order.transactionId || order.id;
    try {
      await transactionApi.cancel(txId);
      alert("Đơn hàng đã được hủy.");
      fetchOrders();
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert("Không thể hủy đơn hàng.");
    }
  };

  // Đóng modal mã QR
  const handleCloseQrModal = () => {
    setQrModalVisible(false);
    setQrCode("");
    setCurrentTransactionId(null);
  };

  return (
    <div className="order-history-container">
      <h1 className="order-history-heading">Lịch sử mua hàng</h1>

      {/* Phần đơn hàng Pending nằm ở trên cùng */}
      {pendingOrders.length > 0 && (
        <div className="pending-orders-section">
          <h2>Đơn hàng chờ thanh toán</h2>
          {pendingOrders.map((order) => (
            <div key={order.id} className="pending-order-item">
              <p>
                <strong>Mã giao dịch:</strong> {order.id} <br />
                <strong>Ngày tạo:</strong>{" "}
                {new Date(order.createdDate).toLocaleString("vi-VN")} <br />
                <strong>Tổng tiền:</strong> {order.totalMoney.toLocaleString()} VND <br />
                <strong>Trạng thái:</strong> {getStatusText(order.tranctionStatus)}
              </p>
              <div className="pending-order-actions">
                <button className="btn-pay-again" onClick={() => handlePayAgain(order)}>
                  Thanh toán lại
                </button>
                <button className="btn-cancel-order" onClick={() => handleCancelOrder(order)}>
                  Hủy đơn hàng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Phần lịch sử giao dịch (các đơn hàng không Pending) */}
      <div className="completed-orders-section">
        <h2>Lịch sử giao dịch</h2>
        {completedOrders.length === 0 ? (
          <p>Chưa có giao dịch nào.</p>
        ) : (
          <div className="completed-orders-grid">
            {completedOrders.map((order) => (
              <div key={order.id} className="completed-order-item">
                <p>
                  <strong>Mã giao dịch:</strong> {order.id} <br />
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(order.createdDate).toLocaleString("vi-VN")} <br />
                  <strong>Tổng tiền:</strong> {order.totalMoney.toLocaleString()} VND <br />
                  <strong>Trạng thái:</strong> {getStatusText(order.tranctionStatus)}
                </p>
                {order.products && order.products.length > 0 && (
                  <div className="order-products">
                    <strong>Chi tiết sản phẩm:</strong>
                    <ul>
                      {order.products.map((product) => (
                        <li key={product.id}>
                          <span>
                            <strong>{product.productName}</strong> - Giá:{" "}
                            {product.price.toLocaleString()} VND
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal hiển thị mã QR khi "Thanh toán lại" */}
      {qrModalVisible && (
        <div className="qr-modal-overlay" onClick={handleCloseQrModal}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thanh toán lại đơn hàng</h2>
            {qrCode ? (
              <div style={{ textAlign: "center" }}>
                <QRCodeCanvas value={qrCode} size={256} />
                <p>Quét mã QR để thanh toán lại đơn hàng.</p>
              </div>
            ) : (
              <p>Đang tải mã QR...</p>
            )}
            <button className="btn-close-modal" onClick={handleCloseQrModal}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
