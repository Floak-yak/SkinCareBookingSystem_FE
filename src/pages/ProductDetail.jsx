import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Rate, Tabs } from "antd";
import useFetch from "../hooks/useFetch";
import CartContext from "../context/CartContext";
import "../styles/productDetail.css";

const { TabPane } = Tabs;

const ProductDetail = () => {
  // Ví dụ rating tĩnh (có thể thay bằng state hoặc dữ liệu thật)
  const [rating] = useState(4.5); // 4.5/5
  const [numReviews] = useState(120);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: products, loading, error } = useFetch("/data/products.json");
  const { dispatch } = useContext(CartContext);

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p>Có lỗi xảy ra khi tải sản phẩm.</p>;

  const product = products.find((p) => p.id === Number(id));
  if (!product) return <p>Sản phẩm không tồn tại.</p>;

  // Lấy các sản phẩm liên quan cùng category, loại trừ sản phẩm hiện tại
  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  const handleAddToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  // Xử lý khi click vào sản phẩm liên quan
  const handleRelatedClick = (rid) => {
    navigate(`/products/${rid}`);
  };

  return (
    <div className="product-detail-page">
      <div className="product-detail-main">
        {/* Cột bên trái: Ảnh sản phẩm */}
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        {/* Cột bên phải: Thông tin sản phẩm */}
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p className="product-price">{product.price.toLocaleString()} VND</p>

          {/* Đánh giá */}
          <div className="product-rating">
            <Rate disabled defaultValue={Math.round(rating)} />
            <span className="rating-text">
              {rating}/5 ({numReviews} đánh giá)
            </span>
          </div>

          {/* Nút thêm giỏ hàng */}
          <Button
            type="primary"
            onClick={handleAddToCart}
            className="add-cart-btn"
          >
            Thêm vào giỏ hàng
          </Button>

          {/* Tabs: Mô tả, Đánh giá, Chính sách */}
          <Tabs defaultActiveKey="1" className="product-tabs">
            <TabPane tab="Mô tả" key="1">
              <p className="product-description">{product.description}</p>
            </TabPane>
            <TabPane tab="Đánh giá" key="2">
              <p>
                Hiển thị các đánh giá của người dùng hoặc form đánh giá ở đây.
              </p>
            </TabPane>
            <TabPane tab="Chính sách" key="3">
              <p>
                <strong>Giao hàng:</strong> Miễn phí vận chuyển cho đơn &gt; 500k.
              </p>
              <p>
                <strong>Đổi trả:</strong> Trong vòng 7 ngày nếu có lỗi nhà sản
                xuất.
              </p>
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      <div className="related-products">
        <h2>Sản phẩm liên quan</h2>
        <div className="related-products-container">
          {relatedProducts.map((rp) => (
            <div
              key={rp.id}
              className="related-product-card"
              onClick={() => handleRelatedClick(rp.id)}
            >
              <Card
                hoverable
                cover={
                  <img
                    alt={rp.name}
                    src={rp.image}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                }
              >
                <Card.Meta
                  title={rp.name}
                  description={`${rp.price.toLocaleString()} VND`}
                />
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
