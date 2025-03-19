import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";
import productApi from "../../api/productApi";
import categoryApi from "../../api/categoryApi";
import imageApi from "../../api/imageApi";
import ImageManager from "../../components/ImageManager";

const { Option } = Select;

const ManageProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modal tạo
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [createPreview, setCreatePreview] = useState(null);

  // Modal sửa
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editPreview, setEditPreview] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Modal ImageManager
  const [isImageManagerVisible, setIsImageManagerVisible] = useState(false);
  const [imageManagerTarget, setImageManagerTarget] = useState(null); // "create" or "edit"

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Lấy danh mục
  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll(); 
      setCategories(res.data.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh mục!");
    }
  };

  // Lấy danh sách sản phẩm + join ảnh
  const fetchProducts = async () => {
    try {
      const res = await productApi.getAll();
      const rawProducts = res.data || [];

      // “Join” ảnh nếu chỉ trả về imageId
      const productsWithImages = await Promise.all(
        rawProducts.map(async (p) => {
          if (!p.image && p.imageId) {
            try {
              const imgRes = await imageApi.getImageById(p.imageId);
              p.image = imgRes.data;
            } catch (err) {
              console.error("Lỗi khi lấy ảnh:", err);
            }
          }
          return p;
        })
      );

      setProducts(productsWithImages);
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm!");
    }
  };

  // =======================
  // Tạo sản phẩm
  // =======================
  const handleCreateProduct = async (values) => {
    try {
      const payload = [
        {
          productName: values.productName,
          price: values.price,
          createdDate: new Date().toISOString(),
          categoryId: values.categoryId,
          imageId: values.imageId || 0,
        },
      ];
      await productApi.create(payload);
      message.success("Tạo sản phẩm thành công!");
      setIsCreateModalVisible(false);
      createForm.resetFields();
      setCreatePreview(null);
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      message.error("Tạo sản phẩm thất bại!");
    }
  };

  // =======================
  // Sửa sản phẩm
  // =======================
  const openEditModal = (product) => {
    setEditingProduct(product);
    editForm.setFieldsValue({
      productName: product.productName,
      price: product.price,
      categoryId: product.categoryId,
      imageId: product.image?.id || 0,
    });

    if (product.image) {
      setEditPreview(product.image);
    } else {
      setEditPreview(null);
    }
    setIsEditModalVisible(true);
  };

  const handleUpdateProduct = async (values) => {
    try {
      const payload = {
        productId: editingProduct.id,
        productName: values.productName,
        price: values.price,
        categoryId: values.categoryId,
        imageId: values.imageId || 0,
      };
      await productApi.update(payload);
      message.success("Cập nhật sản phẩm thành công!");
      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditPreview(null);
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      message.error("Cập nhật sản phẩm thất bại!");
    }
  };

  // =======================
  // Xóa sản phẩm
  // =======================
  const handleDelete = async (id) => {
    try {
      await productApi.delete(id);
      message.success("Xóa sản phẩm thành công!");
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      message.error("Xóa sản phẩm thất bại!");
    }
  };

  // =======================
  // Mở ImageManager
  // =======================
  const openImageManager = (target) => {
    setImageManagerTarget(target);
    setIsImageManagerVisible(true);
  };

  // Khi chọn ảnh -> set imageId + preview
  const handleSelectImage = (image) => {
    message.success(`Đã chọn ảnh ID: ${image.id}`);
    if (imageManagerTarget === "create") {
      createForm.setFieldsValue({ imageId: image.id });
      setCreatePreview(image);
    } else if (imageManagerTarget === "edit") {
      editForm.setFieldsValue({ imageId: image.id });
      setEditPreview(image);
    }
    setIsImageManagerVisible(false);
  };

  // =======================
  // Cột bảng
  // =======================
  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString()} VND`,
    },
    {
      // Hiển thị tên danh mục
      title: "Danh mục",
      key: "categoryName",
      render: (record) => {
        // Tìm trong mảng categories
        const foundCat = categories.find((c) => c.id === record.categoryId);
        return foundCat ? foundCat.categoryName : "N/A";
      },
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (img) => {
        if (!img) return "No image";
        const ext = img.fileExtension.replace(".", "");
        return (
          <img
            src={`data:image/${ext};base64,${img.bytes}`}
            alt="preview"
            style={{ width: 80, height: 80, objectFit: "cover" }}
          />
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <>
          <Popconfirm
            title="Xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
          <Button type="link" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý sản phẩm</h2>

      <Button
        type="primary"
        onClick={() => setIsCreateModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Thêm sản phẩm
      </Button>

      <Table dataSource={products} columns={columns} rowKey="id" />

      {/* Modal Tạo sản phẩm */}
      <Modal
        title="Thêm sản phẩm"
        visible={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          setCreatePreview(null);
        }}
        footer={null}
      >
        <Form layout="vertical" form={createForm} onFinish={handleCreateProduct}>
          <Form.Item
            label="Tên sản phẩm"
            name="productName"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ảnh sản phẩm" name="imageId">
            <Button onClick={() => openImageManager("create")}>Chọn ảnh</Button>
            {createPreview && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={`data:image/${createPreview.fileExtension.replace(
                    ".",
                    ""
                  )};base64,${createPreview.bytes}`}
                  alt="preview"
                  style={{ width: 100, height: 100, objectFit: "cover" }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Cập nhật sản phẩm */}
      <Modal
        title="Cập nhật sản phẩm"
        visible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditPreview(null);
        }}
        footer={null}
      >
        <Form layout="vertical" form={editForm} onFinish={handleUpdateProduct}>
          <Form.Item
            label="Tên sản phẩm"
            name="productName"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ảnh sản phẩm" name="imageId">
            <Button onClick={() => openImageManager("edit")}>Chọn ảnh</Button>
            {editPreview && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={`data:image/${editPreview.fileExtension.replace(".", "")};base64,${editPreview.bytes}`}
                  alt="preview"
                  style={{ width: 100, height: 100, objectFit: "cover" }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal quản lý ảnh */}
      <ImageManager
        visible={isImageManagerVisible}
        onClose={() => setIsImageManagerVisible(false)}
        onSelectImage={handleSelectImage}
        zIndex={2000}
      />
    </div>
  );
};

export default ManageProductsPage;
