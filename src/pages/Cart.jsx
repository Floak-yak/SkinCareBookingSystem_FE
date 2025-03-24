import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, Button, message, Modal, QRCode } from "antd";
import CartContext from "../context/CartContext";
import useAuth from "../hooks/useAuth";
import productApi from "../api/productApi";
import "../styles/cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, dispatch } = useContext(CartContext);
  const { user } = useAuth();
  const [checkoutURL, setCheckoutURL] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Giảm số lượng
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

  // Tăng số lượng
  const handleIncrease = (e, id, currentQty) => {
    e.stopPropagation();
    dispatch({
      type: "UPDATE_ITEM",
      payload: { id, quantity: currentQty + 1 },
    });
  };

  // Xóa sản phẩm
  const handleRemove = (e, id) => {
    e.stopPropagation();
    dispatch({ type: "REMOVE_ITEM", payload: { id } });
  };

  // Khi click vào sản phẩm => xem chi tiết
  const handleItemClick = (id) => {
    navigate(`/products/${id}`);
  };

  // Tính tổng số tiền
  const totalPrice = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  //Thanh toán
  const handleCheckout = async () => {
    if (!user || !user.userId) {
      message.error("Bạn cần đăng nhập trước khi thanh toán!");
      return;
    }
  
    // Chuẩn bị dữ liệu sản phẩm cần thanh toán
    const checkoutProductInformation = cart.items.map((item) => ({
      id: item.id,
      amount: item.quantity,
    }));
  
    // Cập nhật returnUrl và cancelUrl dựa trên domain hiện tại của web
    const checkoutData = {
      userId: user.userId,
      checkoutProductInformation,
      returnUrl: `${window.location.origin}/success.html`, // Redirect sau khi thanh toán thành công
      cancelUrl: `${window.location.origin}/cancel.html`,   // Redirect khi người dùng hủy hoặc thanh toán thất bại
    };
  
    console.log("Checkout Data gửi lên:", checkoutData); // Debug dữ liệu gửi lên BE
  
    try {
      const res = await productApi.checkOut(checkoutData);
      console.log("✅ Thanh toán thành công:", res.data);
      console.log("🔎 Toàn bộ response:", JSON.stringify(res.data, null, 2));
  
      const url = res.data?.checkoutUrl;
      if (url) {
        // Chuyển hướng trang web sang URL của payOS
        window.location.href = url;
        console.log("URL thanh toán:", url);
      } else {
        message.error("Lỗi khi nhận URL thanh toán!");
      }
    } catch (error) {
      console.error(
        "❌ Lỗi khi thanh toán:",
        error.response?.data || error.message
      );
      message.error("Thanh toán thất bại!");
    }
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
                  <Button
                    onClick={(e) => handleDecrease(e, item.id, item.quantity)}
                  >
                    -
                  </Button>,
                  <span style={{ width: 30, textAlign: "center" }}>
                    {item.quantity}
                  </span>,
                  <Button
                    onClick={(e) => handleIncrease(e, item.id, item.quantity)}
                  >
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
                          ? `data:image/${item.image.fileExtension.replace(
                              ".",
                              ""
                            )};base64,${item.image.bytes}`
                          : "/images/default-placeholder.png" // Ảnh mặc định nếu không có
                      }
                      alt={item.name}
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
                  title={<strong>{item.productName || "Không có tên"}</strong>} // 🟢 Hiển thị tên sản phẩm
                  description={`${item.price.toLocaleString()} VND`}
                />
              </List.Item>
            )}
          />

          <div className="cart-footer">
            <div className="cart-total">
              <span>Tổng tiền: </span>
              <strong>{totalPrice.toLocaleString()} VND</strong>
            </div>
            <Button type="primary" onClick={handleCheckout}>
              Thanh toán
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
