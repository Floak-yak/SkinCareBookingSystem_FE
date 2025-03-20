import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Select, Card, Button, Slider, message } from "antd";
import CartContext from "../context/CartContext";
import productApi from "../api/productApi";
import apiClient from "../api/apiClient"; // hoặc import categoryApi nếu bạn có
import "../styles/product.css";
import categoryApi from "../api/categoryApi";

const { Option } = Select;

const ProductPage = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [categoryMap, setCategoryMap] = useState(new Map()); // Map categoryId -> categoryName
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [showPriceSlider, setShowPriceSlider] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortMode, setSortMode] = useState("asc");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let productRes;
        if (sortMode === "asc") {
          productRes = await productApi.getSortedByPriceAsc();
        } else {
          productRes = await productApi.getSortedByPriceDesc();
        }
        const productList = productRes.data;

        const catRes = await categoryApi.getAll();
        const catData = catRes.data?.data || [];

        // Tạo map categoryId -> categoryName
        const catMap = new Map();
        catData.forEach((cat) => {
          catMap.set(cat.id, cat.categoryName);
        });
        setCategoryMap(catMap);

        // Gán categoryName cho mỗi product
        productList.forEach((p) => {
          p.categoryName = catMap.get(p.categoryId) || "N/A";
        });

        setProducts(productList);
      } catch (err) {
        console.error("Lỗi fetch data:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sortMode]);

  // Lấy danh sách tên danh mục (dùng cho dropdown)
  const categoryNames = [...new Set(products.map((p) => p.categoryName))];

  // ======================
  // Bộ lọc
  // ======================
  // Lọc theo: tên sản phẩm, khoảng giá, danh mục
  const filteredProducts = products.filter((product) => {
    // Tên
    const matchesName = product.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Khoảng giá
    const matchesPrice =
      !showPriceSlider ||
      (product.price >= priceRange[0] && product.price <= priceRange[1]);

    // Danh mục
    const matchesCategory = filterCategory
      ? product.categoryName === filterCategory
      : true;

    return matchesName && matchesPrice && matchesCategory;
  });

  // ======================
  // Sự kiện
  // ======================
  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Ngăn onClick card
    dispatch({ type: "ADD_ITEM", payload: product });
    message.success(`Đã thêm "${product.productName}" vào giỏ hàng!`);
  };

  const handleCardClick = (id) => {
    navigate(`/products/${id}`);
  };

  // ======================
  // Giao diện
  // ======================
  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-page">
      <h2>Danh sách sản phẩm</h2>

      {/* Thanh lọc & sắp xếp */}
      <div className="product-filters-row">
        {/* Tìm theo tên */}
        <Input
          placeholder="Tìm theo tên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 200 }}
        />

        {/* Nút bật/tắt thanh chọn giá */}
        <Button onClick={() => setShowPriceSlider(!showPriceSlider)}>
          {showPriceSlider ? "Ẩn chọn giá" : "Chọn mức giá"}
        </Button>

        {/* Thanh chọn khoảng giá */}
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

        {/* Chọn danh mục */}
        <Select
          style={{ width: 150 }}
          placeholder="Chọn danh mục"
          value={filterCategory}
          onChange={(value) => setFilterCategory(value)}
        >
          <Option value="">Tất cả</Option>
          {categoryNames.map((catName) => (
            <Option key={catName} value={catName}>
              {catName}
            </Option>
          ))}
        </Select>

        {/* Sắp xếp asc / desc */}
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
          <div
            key={product.id}
            className="product-card"
            onClick={() => handleCardClick(product.id)}
          >
            <Card
              hoverable
              cover={
                <img
                  alt={product.productName}
                  src={
                    product.image && product.image.bytes
                      ? `data:image/${product.image.fileExtension.replace(
                          ".",
                          ""
                        )};base64,${product.image.bytes}`
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
                title={product.productName}
                description={`${product.price.toLocaleString()} VND`}
              />
              <div style={{ marginTop: 8 }}>
                <small style={{ color: "#888" }}>
                  Danh mục: {product.categoryName}
                </small>
              </div>
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
