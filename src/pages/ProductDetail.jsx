import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Rate, Tabs, message } from "antd";
import CartContext from "../context/CartContext";
import productApi from "../api/productApi"; 
import "../styles/productDetail.css";

const { TabPane } = Tabs;

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating] = useState(4.5);
  const [numReviews] = useState(120);

  const { id, name } = useParams(); 
  const navigate = useNavigate();
  const { dispatch } = useContext(CartContext);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productRes = await productApi.searchByName(name);
        let productList = productRes.data || [];

        let currentProduct = productList.find((p) => String(p.id) === id);

        if (!currentProduct) {
          setError("Sản phẩm không tồn tại.");
          return;
        }

        setProduct(currentProduct);

        if (currentProduct?.categoryId) {
          const relatedRes = await productApi.searchByCategoryId(currentProduct.categoryId);
          let relatedList = relatedRes.data || [];
          relatedList = relatedList.filter((p) => String(p.id) !== id);
          setRelated(relatedList);
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
        setError("Không thể tải sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, name]);

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Sản phẩm không tồn tại.</p>;

  const handleAddToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: product });
    message.success(`Đã thêm "${product.productName}" vào giỏ hàng!`);
  };

  const handleRelatedClick = (rid, rname) => {
    navigate(`/products/${rid}/${encodeURIComponent(rid)}`);
  };

  return (
    <div className="product-detail-page">
      <div className="product-detail-main">
        <div className="product-detail-image">
          <img
            src={
              product.image && product.image.bytes
                ? `data:image/${product.image.fileExtension.replace(".", "")};base64,${product.image.bytes}`
                : "/images/default-placeholder.png"
            }
            alt={product.productName}
            onError={(e) => (e.target.src = "/images/default-placeholder.png")}
          />
        </div>

        <div className="product-detail-info">
          <h1>{product.productName}</h1>
          <p className="product-price">{product.price?.toLocaleString()} VND</p>

          <div className="product-rating">
            <Rate disabled defaultValue={Math.round(rating)} />
            <span className="rating-text">
              {rating}/5 ({numReviews} đánh giá)
            </span>
          </div>

          <Button type="primary" onClick={handleAddToCart} className="add-cart-btn">
            Thêm vào giỏ hàng
          </Button>

          <Tabs defaultActiveKey="1" className="product-tabs">
            <TabPane tab="Mô tả" key="1">
              <p className="product-description">
                {product.description || "Chưa có mô tả."}
              </p>
            </TabPane>
            <TabPane tab="Đánh giá" key="2">
              <p>Hiển thị các đánh giá của người dùng ở đây.</p>
            </TabPane>
            <TabPane tab="Chính sách" key="3">
              <p>
                <strong>Giao hàng:</strong> Miễn phí vận chuyển cho đơn &gt; 500k.
              </p>
              <p>
                <strong>Đổi trả:</strong> Trong vòng 7 ngày nếu có lỗi nhà sản xuất.
              </p>
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* 🟢 Sản phẩm liên quan */}
      <div className="related-products">
        <h2>Sản phẩm liên quan</h2>
        <div className="related-products-container">
          {related.map((rp) => (
            <div
              key={rp.id}
              className="related-product-card"
              onClick={() => handleRelatedClick(rp.id, rp.productName)}
            >
              <Card
                hoverable
                cover={
                  <img
                    alt={rp.productName}
                    src={
                      rp.image && rp.image.bytes
                        ? `data:image/${rp.image.fileExtension.replace(".", "")};base64,${rp.image.bytes}`
                        : "/images/default-placeholder.png"
                    }
                    onError={(e) =>
                      (e.target.src = "/images/default-placeholder.png")
                    }
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                }
              >
                <Card.Meta
                  title={rp.productName}
                  description={`${rp.price?.toLocaleString()} VND`}
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
