// file: src/pages/OrderHistory.jsx
import React, { useEffect, useState } from "react";
import transactionApi from "../api/transactionApi";
import useAuth from "../hooks/useAuth";
import "../styles/OrderHistory.css";
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  // Hàm chuyển đổi trạng thái từ số sang chuỗi mô tả
  const getStatusLabel = (status) => {
    switch (status) {
      case -1:
        return <span className="status-cancelled">Cancelled</span>;
      case 0:
        return <span className="status-pending">Pending</span>;
      case 1:
        return <span className="status-success">Success</span>;
      default:
        return <span>Unknown</span>;
    }
  };

  useEffect(() => {
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
    fetchOrders();
  }, [user]);

  return (
    <div className="order-history-container">
      <h1 className="order-history-heading">Lịch sử mua hàng</h1>

      {orders.length === 0 ? (
        <p>Chưa có giao dịch nào.</p>
      ) : (
        <ul className="order-history-list">
          {orders.map((order) => (
            <li key={order.id} className="order-history-item">
              <strong>Mã giao dịch:</strong> {order.id} <br />
              <strong>Ngày tạo:</strong> {new Date(order.createdDate).toLocaleString("vi-VN")} <br />
              <strong>Tổng tiền:</strong> {order.totalMoney.toLocaleString()} VND <br />
              <strong>Trạng thái:</strong> {getStatusLabel(order.tranctionStatus)}
              <br />
              <strong>Loại booking:</strong> {order.bookingType} <br />
              <hr />

              {/* Hiển thị danh sách sản phẩm đã đặt */}
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;
