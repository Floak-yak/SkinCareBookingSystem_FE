import React, { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import CartContext from "../context/CartContext";
import { Button, Row, Col, Card } from "antd";
import "../styles/productDetail.css";

const ProductDetail = () => {
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

  return (
    <div className="product-detail-page">
      <div className="product-detail-main">
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p className="product-price">{product.price.toLocaleString()} VND</p>
          <p className="product-description">{product.description}</p>
          <Button type="primary" onClick={handleAddToCart}>
            Thêm vào giỏ hàng
          </Button>
        </div>
      </div>
      <div className="related-products">
        <h2>Sản phẩm liên quan</h2>
        <div className="related-products-container">
          {relatedProducts.map((rp) => (
            <div key={rp.id} className="related-product-card">
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
                <Link to={`/products/${rp.id}`} className="view-detail-link">
                  Xem chi tiết
                </Link>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
