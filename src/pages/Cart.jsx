import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { List, Button, message } from "antd";
import CartContext from "../context/CartContext";
import useAuth from "../hooks/useAuth";
import productApi from "../api/productApi";
import "../styles/cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, dispatch } = useContext(CartContext);
  const { user } = useAuth(); 
  console.log("User từ useAuth:", user);

  // Giảm số lượng
  const handleDecrease = (e, id, currentQty) => {
    e.stopPropagation();
    if (currentQty > 1) {
      dispatch({ type: "UPDATE_ITEM", payload: { id, quantity: currentQty - 1 } });
    } else {
      dispatch({ type: "REMOVE_ITEM", payload: { id } });
    }
  };

  // Tăng số lượng
  const handleIncrease = (e, id, currentQty) => {
    e.stopPropagation();
    dispatch({ type: "UPDATE_ITEM", payload: { id, quantity: currentQty + 1 } });
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

  // 🟢 Xử lý khi bấm nút "Thanh toán"
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
      userId: user.userId, // 🟢 Lấy userId từ useAuth()
      checkoutProductInformation,
    };
  
    console.log("Checkout Data gửi lên:", checkoutData); // Debug dữ liệu gửi lên BE
  
    try {
      const res = await productApi.checkOut(checkoutData);
      console.log("✅ Thanh toán thành công:", res.data);
  
      message.success("Thanh toán thành công!");
      dispatch({ type: "CLEAR_CART" });
      navigate("/thank-you");
    } catch (err) {
      console.error("❌ Lỗi thanh toán:", err.response?.data || err.message);
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
                  <Button onClick={(e) => handleDecrease(e, item.id, item.quantity)}>-</Button>,
                  <span style={{ width: 30, textAlign: "center" }}>{item.quantity}</span>,
                  <Button onClick={(e) => handleIncrease(e, item.id, item.quantity)}>+</Button>,
                  <Button danger onClick={(e) => handleRemove(e, item.id)}>Xóa</Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<img src={item.image} alt={item.name} />}
                  title={item.name}
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
