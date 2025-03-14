import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Select, Card, Button, Slider, message } from "antd";
import CartContext from "../context/CartContext";
import productApi from "../api/productApi";
import "../styles/product.css";

const { Option } = Select;

const ProductPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPriceSlider, setShowPriceSlider] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortMode, setSortMode] = useState("asc");
  const { dispatch } = useContext(CartContext);

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let response;
        if (sortMode === "asc") {
          response = await productApi.getSortedByPriceAsc();
        } else if (sortMode === "desc") {
          response = await productApi.getSortedByPriceDesc();
        }
        setProducts(response.data);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sortMode]);

  // Lấy danh mục duy nhất
  const categories = products ? [...new Set(products.map((p) => p.categoryId))] : [];

  // 1. Lọc sản phẩm theo tên + khoảng giá + loại
  let filteredProducts = products?.filter((product) => {
    const matchesName = product.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPrice =
      !showPriceSlider ||
      (product.price >= priceRange[0] && product.price <= priceRange[1]);
    const matchesCategory = filterCategory ? product.categoryId === filterCategory : true;
    return matchesName && matchesPrice && matchesCategory;
  });

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  // Chuyển sang trang chi tiết sản phẩm
  const handleCardClick = (id) => {
    navigate(`/products/${id}`);
  };

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-page">
      <h2>Danh sách sản phẩm</h2>

      {/* Bộ lọc + tìm kiếm + sắp xếp */}
      <div className="product-filters-row">
        <Input
          placeholder="Tìm theo tên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 200 }}
        />

        <Button onClick={() => setShowPriceSlider(!showPriceSlider)}>
          {showPriceSlider ? "Ẩn chọn giá" : "Chọn mức giá"}
        </Button>

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

        <Select
          placeholder="Sắp xếp giá"
          style={{ width: 150 }}
          onChange={(value) => setSortMode(value)}
          defaultValue="asc"
        >
          <Option value="asc">Thấp đến Cao</Option>
          <Option value="desc">Cao đến Thấp</Option>
        </Select>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card" onClick={() => handleCardClick(product.id)}>
            <Card
              hoverable
              cover={
                <img
                  alt={product.productName}
                  src={`/images/${product.image?.description}`}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              }
            >
              <Card.Meta
                title={product.productName}
                description={`${product.price.toLocaleString()} VND`}
              />
              <div className="product-actions">
                <Button className="add-to-cart-btn" onClick={(e) => handleAddToCart(e, product)}>
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
