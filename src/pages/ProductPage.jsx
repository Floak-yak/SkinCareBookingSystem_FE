import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { Input, Select, Card, Button, Slider } from "antd";
import CartContext from "../context/CartContext";
import "../styles/product.css";

const { Option } = Select;

const ProductPage = () => {
  const navigate = useNavigate();
  const { data: products, loading, error } = useFetch("/Product/GetProducts");
  const [searchTerm, setSearchTerm] = useState("");

  // Hiển thị/ẩn thanh kéo giá
  const [showPriceSlider, setShowPriceSlider] = useState(false);
  // Khoảng giá (khi showPriceSlider = true)
  const [priceRange, setPriceRange] = useState([0, 1000000]);

  // Lọc theo loại (mặc định = "", nghĩa là "Tất cả")
  const [filterCategory, setFilterCategory] = useState("");

  // Sắp xếp giá (asc, desc, none)
  const [sortMode, setSortMode] = useState("none");

  const { dispatch } = useContext(CartContext);

  // Lấy danh mục duy nhất
  const categories = products
    ? [...new Set(products.map((p) => p.category))]
    : [];

  // 1. Lọc theo tên + khoảng giá + loại
  let filteredProducts = products?.filter((product) => {
    const matchesName = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPrice =
      !showPriceSlider ||
      (product.price >= priceRange[0] && product.price <= priceRange[1]);
    const matchesCategory = filterCategory
      ? product.category === filterCategory
      : true;

    return matchesName && matchesPrice && matchesCategory;
  });

  // 2. Sắp xếp theo giá (asc, desc)
  if (sortMode === "asc") {
    filteredProducts = filteredProducts?.sort((a, b) => a.price - b.price);
  } else if (sortMode === "desc") {
    filteredProducts = filteredProducts?.sort((a, b) => b.price - a.price);
  }

  // Xử lý thêm vào giỏ hàng (ngăn click card)
  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Ngăn onClick card
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  // Khi click toàn bộ card => chuyển sang chi tiết
  const handleCardClick = (id) => {
    navigate(`/products/${id}`);
  };

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p>Có lỗi xảy ra khi tải dữ liệu sản phẩm.</p>;

  return (
    <div className="product-page">
      <h2>Danh sách sản phẩm</h2>

      {/* Tất cả bộ lọc + tìm kiếm + sắp xếp trên 1 hàng */}
      <div className="product-filters-row">
        {/* Tìm kiếm theo tên */}
        <Input
          placeholder="Tìm theo tên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 200 }}
        />

        {/* Nút "Chọn mức giá" */}
        <Button onClick={() => setShowPriceSlider(!showPriceSlider)}>
          {showPriceSlider ? "Ẩn chọn giá" : "Chọn mức giá"}
        </Button>

        {/* Thanh kéo (Slider) - hiển thị khi showPriceSlider = true */}
        {showPriceSlider && (
          <div style={{ width: 220 }}>
            <Slider
              range
              min={0}
              max={1000000}
              step={50000}
              defaultValue={[0, 1000000]}
              tipFormatter={(val) => `${val.toLocaleString()} VND`}
              tooltip={{ open: true }}
              onChange={(value) => setPriceRange(value)}
            />
          </div>
        )}

        {/* Lọc theo loại, mặc định = "" (Tất cả) */}
        <Select
          style={{ width: 150 }}
          value={filterCategory}
          onChange={(value) => setFilterCategory(value)}
        >
          <Option value="">Tất cả</Option>
          {categories.map((cat, index) => (
            <Option key={index} value={cat}>
              {cat}
            </Option>
          ))}
        </Select>

        {/* Sắp xếp giá */}
        <Select
          placeholder="Sắp xếp giá"
          style={{ width: 150 }}
          onChange={(value) => setSortMode(value)}
          defaultValue="none"
        >
          <Option value="none">Mặc định</Option>
          <Option value="asc">Thấp đến Cao</Option>
          <Option value="desc">Cao đến Thấp</Option>
        </Select>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => handleCardClick(product.id)}
          >
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
                <Button
                  className="add-to-cart-btn"
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
