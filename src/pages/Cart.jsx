import React, { useContext } from 'react';
import CartContext from '../context/CartContext';
import { List, Button, InputNumber } from 'antd';
import "../styles/cart.css";

const Cart = () => {
  const { cart, dispatch } = useContext(CartContext);

  const handleQuantityChange = (id, value) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, quantity: value } });
  };

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  return (
    <div className="cart-container">
      <h2>Giỏ hàng của bạn</h2>
      {cart.items.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={cart.items}
          renderItem={item => (
            <List.Item
              actions={[
                <InputNumber
                  min={1}
                  value={item.quantity}
                  onChange={(value) => handleQuantityChange(item.id, value)}
                />,
                <Button danger onClick={() => handleRemove(item.id)}>Xóa</Button>
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
      )}
    </div>
  );
};

export default Cart;
