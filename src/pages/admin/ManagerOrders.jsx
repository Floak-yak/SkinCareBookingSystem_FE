// file: src/pages/manager/ManagerOrders.jsx
import React, { useEffect, useState } from "react";
import transactionApi from "../../api/transactionApi";
import "../../styles/ManagerOrders.css";

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

const ManagerOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        const response = await transactionApi.getAll();
        console.log("Danh sách giao dịch:", response.data);
        setOrders(response.data);
      } catch (error) {
        console.error("Lỗi lấy tất cả giao dịch:", error);
      }
    };
    fetchAllTransactions();
  }, []);

  return (
    <div className="manager-orders-container">
      <h1 className="manager-orders-heading">Quản lý đơn hàng</h1>

      {orders.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        <table className="manager-orders-table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Ngày tạo</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Người dùng</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                {/* Dòng thông tin đơn hàng */}
                <tr>
                  <td>{order.id}</td>
                  <td>{new Date(order.createdDate).toLocaleString("vi-VN")}</td>
                  <td>{order.totalMoney.toLocaleString()} VND</td>
                  <td>{getStatusLabel(order.tranctionStatus)}</td>
                  <td>
                    {order.user ? (
                      <>
                        <strong>{order.user.fullName}</strong> <br />
                        {order.user.email} <br />
                        {order.user.phoneNumber}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>

                {/* Dòng hiển thị sản phẩm (nếu có) */}
                {order.products && order.products.length > 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="manager-orders-products">
                        <strong>Chi tiết sản phẩm:</strong>
                        <ul>
                          {order.products.map((prod) => (
                            <li key={prod.id}>
                              {prod.productName} -{" "}
                              {prod.price?.toLocaleString() || 0} VND
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManagerOrders;
