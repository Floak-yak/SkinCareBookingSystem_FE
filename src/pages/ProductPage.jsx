import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { Input, Select, Card, Button } from "antd";
import CartContext from "../context/CartContext";
import "../styles/product.css";

const { Option } = Select;

const ProductPage = () => {
  const { data: products, loading, error } = useFetch("/data/products.json");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const { dispatch } = useContext(CartContext);

  // Tạo danh sách category duy nhất từ dữ liệu sản phẩm
  const categories = products ? [...new Set(products.map((p) => p.category))] : [];

  // Lọc sản phẩm theo tên, category và mức giá
  const filteredProducts = products?.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? product.category === filterCategory : true;
    let matchesPrice = true;
    if (filterPrice === "low") matchesPrice = product.price < 200000;
    else if (filterPrice === "medium")
      matchesPrice = product.price >= 200000 && product.price <= 400000;
    else if (filterPrice === "high") matchesPrice = product.price > 400000;
    return matchesName && matchesCategory && matchesPrice;
  });

  const handleAddToCart = (product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p>Có lỗi xảy ra khi tải dữ liệu sản phẩm.</p>;

  return (
    <div className="product-page">
      <h2>Danh sách sản phẩm</h2>
      <div className="product-filters">
        <Input
          placeholder="Tìm theo tên sản phẩm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "200px" }}
        />
        {/* Dropdown lọc theo category với dữ liệu động */}
        <Select
          placeholder="Chọn loại sản phẩm"
          style={{ width: "150px" }}
          onChange={(value) => setFilterCategory(value)}
          allowClear
        >
          {categories.map((cat, index) => (
            <Option key={index} value={cat}>
              {cat}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Chọn mức giá"
          style={{ width: "150px" }}
          onChange={(value) => setFilterPrice(value)}
          allowClear
        >
          <Option value="low">Dưới 200k</Option>
          <Option value="medium">200k - 400k</Option>
          <Option value="high">Trên 400k</Option>
        </Select>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <Card
              hoverable
              cover={
                <img
                  alt={product.name}
                  src={product.image}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              }
            >
              <Card.Meta
                title={product.name}
                description={`${product.price.toLocaleString()} VND`}
              />
              <div className="product-actions">
                <Button type="primary" onClick={() => handleAddToCart(product)}>
                  Thêm vào giỏ hàng
                </Button>
                <Link to={`/products/${product.id}`} className="view-detail-link">
                  Xem chi tiết
                </Link>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
