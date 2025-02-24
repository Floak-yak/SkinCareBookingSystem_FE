import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { List, Button } from 'antd';
import "../styles/cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, dispatch } = useContext(CartContext);

  // Giảm số lượng. Nếu số lượng = 1, xóa sản phẩm
  const handleDecrease = (e, id, currentQty) => {
    e.stopPropagation(); // Ngăn onClick item
    if (currentQty > 1) {
      dispatch({ type: 'UPDATE_ITEM', payload: { id, quantity: currentQty - 1 } });
    } else {
      dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    }
  };

  // Tăng số lượng
  const handleIncrease = (e, id, currentQty) => {
    e.stopPropagation(); // Ngăn onClick item
    dispatch({ type: 'UPDATE_ITEM', payload: { id, quantity: currentQty + 1 } });
  };

  // Xóa sản phẩm
  const handleRemove = (e, id) => {
    e.stopPropagation(); // Ngăn onClick item
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
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

  // Xử lý khi bấm nút "Thanh toán"
  const handleCheckout = () => {
    // Tùy theo logic của bạn: chuyển trang, gọi API, ...
    console.log("Thanh toán giỏ hàng:", cart.items);
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
                // Khi click item => chuyển trang chi tiết
                onClick={() => handleItemClick(item.id)}
                actions={[
                  <Button onClick={(e) => handleDecrease(e, item.id, item.quantity)}>-</Button>,
                  <span style={{ width: 30, textAlign: 'center' }}>{item.quantity}</span>,
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

          {/* Hiển thị tổng số tiền và nút thanh toán */}
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
