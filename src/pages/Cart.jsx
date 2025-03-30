import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, Button, message, Spin, Modal } from "antd";
import { QRCodeCanvas } from "qrcode.react";
import CartContext from "../context/CartContext";
import useAuth from "../hooks/useAuth";
import productApi from "../api/productApi";
import transactionApi from "../api/transactionApi";
import "../styles/cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, dispatch } = useContext(CartContext);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Hàm giảm số lượng sản phẩm trong giỏ
  const handleDecrease = (e, id, currentQty) => {
    e.stopPropagation();
    if (currentQty > 1) {
      dispatch({
        type: "UPDATE_ITEM",
        payload: { id, quantity: currentQty - 1 },
      });
    } else {
      dispatch({ type: "REMOVE_ITEM", payload: { id } });
    }
  };

  // Hàm tăng số lượng sản phẩm trong giỏ
  const handleIncrease = (e, id, currentQty) => {
    e.stopPropagation();
    dispatch({
      type: "UPDATE_ITEM",
      payload: { id, quantity: currentQty + 1 },
    });
  };

  // Hàm xóa sản phẩm khỏi giỏ
  const handleRemove = (e, id) => {
    e.stopPropagation();
    dispatch({ type: "REMOVE_ITEM", payload: { id } });
  };

  // Khi click vào sản phẩm: chuyển sang trang chi tiết sản phẩm
  const handleItemClick = (id) => {
    navigate(`/products/${id}`);
  };

  // Tính tổng số tiền
  const totalPrice = cart.items.reduce(
    (acc, item) => acc + ((item.price || 0) * item.quantity),
    0
  );

  // Khi nhấn "Thanh toán": tạo giao dịch, lấy mã QR từ createPaymentResult và định danh transactionId
  const handleCheckout = async () => {
    if (!user || !user.userId) {
      message.error("Bạn cần đăng nhập trước khi thanh toán!");
      return;
    }

    const checkoutProductInformation = cart.items.map((item) => ({
      id: item.id,
      amount: item.quantity,
    }));

    const checkoutData = {
      userId: user.userId,
      checkoutProductInformation,
      returnUrl: `${window.location.origin}/success.html`,
      cancelUrl: `${window.location.origin}/cancel.html`,
    };

    console.log("Checkout Data gửi lên:", checkoutData);

    try {
      setLoading(true);
      const res = await productApi.checkOut(checkoutData);
      console.log("✅ Tạo giao dịch thành công:", res.data);
      // Lấy thông tin từ createPaymentResult
      const createPaymentResult = res.data.createPaymentResult;
      const qr = createPaymentResult?.qrCode;
      // Lấy transactionId từ response (BE mới đã trả về trường này riêng)
      const txId = res.data.transactionId;
      if (qr && txId) {
        setQrCodeUrl(qr);
        setTransactionId(txId);
        setQrCodeVisible(true);
      } else {
        message.error("Lỗi khi nhận dữ liệu thanh toán!");
      }
    } catch (error) {
      console.error(
        "❌ Lỗi khi tạo giao dịch:",
        error.response?.data || error.message
      );
      message.error("Thanh toán thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận thanh toán: chỉ gọi API checkTransaction và chuyển trang tương ứng dựa trên kết quả
  const handleConfirmPayment = async () => {
    if (!transactionId) {
      message.error("Không có giao dịch nào được tạo.");
      return;
    }
    try {
      setLoading(true);
      const { data } = await transactionApi.checkTransaction(transactionId);
      console.log("Response data:", data);
      // Nếu data là string, lấy luôn giá trị đó, nếu là object thì lấy data.status
      const status = typeof data === "string" ? data : data.status;

      if (status === "SUCCESS") {
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
        "❌ Lỗi xác nhận giao dịch:",
        error.response?.data || error.message
      );
      message.error("Xác nhận thanh toán thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Hủy thanh toán: chuyển hướng đến trang cancel.html
  const handleCancelPayment = () => {
    if (!transactionId) {
      message.error("Không có giao dịch nào được tạo.");
      return;
    }
    window.location.href = `${window.location.origin}/cancel.html?transactionId=${transactionId}`;
  };

  // Thanh toán sau: ẩn khối QR code, cho phép hoàn tất thanh toán sau
  const handlePayLater = () => {
    setQrCodeVisible(false);
    message.info("Bạn chọn thanh toán sau. Vui lòng hoàn tất sau.");
  };

  return (
    <div className="cart-container">
      <h2>Giỏ hàng của bạn</h2>
      {cart.items.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <>
          <List
            itemLayout="horizontal"
            dataSource={cart.items}
            renderItem={(item) => (
              <List.Item
                onClick={() => handleItemClick(item.id)}
                actions={[
                  <Button onClick={(e) => handleDecrease(e, item.id, item.quantity)}>
                    -
                  </Button>,
                  <span style={{ width: 30, textAlign: "center" }}>{item.quantity}</span>,
                  <Button onClick={(e) => handleIncrease(e, item.id, item.quantity)}>
                    +
                  </Button>,
                  <Button danger onClick={(e) => handleRemove(e, item.id)}>
                    Xóa
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <img
                      src={
                        item.image && item.image.bytes
                          ? `data:image/${item.image.fileExtension.replace(".", "")};base64,${item.image.bytes}`
                          : "/images/default-placeholder.png"
                      }
                      alt={item.productName || "Không có tên"}
                      onError={(e) =>
                        (e.target.src = "/images/default-placeholder.png")
                      }
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 5,
                      }}
                    />
                  }
                  title={<strong>{item.productName || "Không có tên"}</strong>}
                  description={`${(item.price || 0).toLocaleString()} VND`}
                />
              </List.Item>
            )}
          />

          <div className="cart-footer">
            <div className="cart-total">
              <span>Tổng tiền: </span>
              <strong>{totalPrice.toLocaleString()} VND</strong>
            </div>
            {!qrCodeVisible && (
              <Button type="primary" onClick={handleCheckout} disabled={loading}>
                {loading ? <Spin /> : "Thanh toán"}
              </Button>
            )}
          </div>

          {qrCodeVisible && (
            <div
              className="qr-code-container"
              style={{ marginTop: "20px", textAlign: "center" }}
            >
              <h3>Quét mã QR để thanh toán</h3>
              <QRCodeCanvas value={qrCodeUrl} size={256} />
              <div className="qr-buttons" style={{ marginTop: "20px" }}>
                <Button
                  type="primary"
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  style={{ marginRight: "10px" }}
                >
                  {loading ? <Spin /> : "Xác nhận thanh toán"}
                </Button>
                <Button
                  danger
                  onClick={handleCancelPayment}
                  disabled={loading}
                  style={{ marginRight: "10px" }}
                >
                  {loading ? <Spin /> : "Hủy thanh toán"}
                </Button>
                <Button onClick={handlePayLater} disabled={loading}>
                  Thanh toán sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
