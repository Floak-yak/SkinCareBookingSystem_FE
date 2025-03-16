import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  message,
  Upload,
  Popconfirm,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import apiClient from "../api/apiClient";

const { Option } = Select;

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [userForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [categoryForm] = Form.useForm();

  // Fetch danh sách tài khoản
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/User/GetUsers");
      console.log("Danh sách Users:", res.data); // Log dữ liệu từ API
      setUsers(res.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách tài khoản!");
      console.error("Lỗi API GetUsers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh mục sản phẩm
  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/Category/GetCategories");
      console.log("Danh mục nhận được:", res.data); // Debug
      setCategories(res.data);
    } catch (error) {
      message.error("Lỗi khi tải danh mục sản phẩm!");
    }
  };

  // Fetch danh sách sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/Product/SearchAsc");
      console.log("Danh sách Products:", res.data); // Log dữ liệu từ API
      setProducts(res.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm!");
      console.error("Lỗi API SearchAsc:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProducts();
    fetchCategories();
  }, []);

  // Khi chọn ảnh, upload ngay lên API
  const handleImageUpload = async (file) => {
    if (!file) {
      console.error("❌ Không nhận được file!");
      message.error("Không nhận được file!");
      return false;
    }

    console.log("📸 File nhận được trong beforeUpload:", file);

    const formData = new FormData();
    formData.append("image", file);

    console.log("📸 FormData sau khi append:", formData.get("image"));

    try {
      const imgRes = await apiClient.post("/Image/UploadImage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("📸 Kết quả từ API UploadImage:", imgRes.data);

      if (imgRes.data?.id) {
        setImageFile(imgRes.data.id); // Lưu ID ảnh vào state
        message.success("Tải ảnh lên thành công!");
      } else {
        throw new Error("Không nhận được ID ảnh từ server.");
      }
    } catch (error) {
      console.error(
        "❌ Lỗi upload ảnh:",
        error.response?.data || error.message
      );
      message.error(error.response?.data || "Tải ảnh lên thất bại!");
    }

    return false; // Trả về false để không tự động upload của AntD
  };

  // Tạo category
  const handleCreateCategory = async (values) => {
    try {
      const res = await apiClient.post(
        `/Category/Create?categoryName=${encodeURIComponent(
          values.categoryName
        )}&userId=4`
      );
      message.success("Tạo danh mục thành công!");
      setIsCategoryModalVisible(false);
      categoryForm.resetFields();
      // fetch lại categories
      fetchCategories();
    } catch (error) {
      message.error(error.response?.data || "Tạo danh mục thất bại!");
    }
  };

  // Mở modal Category
  const openCategoryModal = () => {
    setIsCategoryModalVisible(true);
  };

  // Khi user nhấn "Thêm mới" trong select box Category
  const handleSelectCategory = (value) => {
    if (value === "create-new") {
      // Chọn "Tạo mới" => Mở modal
      openCategoryModal();
      // Reset select box về trạng thái ban đầu
      productForm.setFieldsValue({ categoryId: undefined });
    }
  };

  // Xử lý tạo tài khoản
  const handleCreateAccount = async (values) => {
    try {
      const res = await apiClient.post("/User/CreateAccount", {
        Role: values.role,
        Email: values.email,
        FullName: values.fullName,
        YearOfBirth: values.yearOfBirth.format("YYYY-MM-DD"),
        PhoneNumber: values.phoneNumber,
      });
      message.success("Tài khoản đã được tạo thành công!");
      setIsUserModalVisible(false);
      userForm.resetFields();
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data || "Tạo tài khoản thất bại!");
    }
  };

  // Xử lý tạo sản phẩm
  const handleCreateProduct = async (values) => {
    try {
      if (!imageFile) {
        message.error("Vui lòng tải lên ảnh sản phẩm!");
        return;
      }

      const payload = [
        {
          productName: values.productName,
          createdDate: new Date().toISOString(), // BE yêu cầu "createdDate"
          price: values.price,
          categoryId: values.categoryId,
          imageId: imageFile, // imageFile là ID ảnh sau khi upload
        },
      ];

      console.log("🚀 Dữ liệu gửi lên BE:", payload);

      const res = await apiClient.post("/Product/AddProduct", payload);
      console.log("📌 Phản hồi từ API:", res.data);

      message.success("Sản phẩm đã được thêm thành công!");
      setIsProductModalVisible(false);
      productForm.resetFields();
      setImageFile(null);
      fetchProducts();
    } catch (error) {
      console.error(
        "❌ Lỗi khi tạo sản phẩm:",
        error.response?.data || error.message
      );

      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((errMessages) => {
          errMessages.forEach((err) => message.error(err));
        });
      } else {
        message.error(error.response?.data?.title || "Tạo sản phẩm thất bại!");
      }
    }
  };

  //Xóa sản phẩm
  const handleDeleteProduct = async (productId) => {
    try {
      const res = await apiClient.delete(
        `/Product/RemoveProduct?productId=${productId}`
      );
      message.success("Xóa sản phẩm thành công!");
      // Gọi lại fetchProducts() để load danh sách mới
      fetchProducts();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error.response?.data || error.message);
      message.error(error.response?.data || "Xóa sản phẩm thất bại!");
    }
  };

  // Cập nhật role của user
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await apiClient.put("/User", null, {
        params: { userId, role: newRole }, // Truyền query params theo yêu cầu BE
      });

      message.success("Cập nhật vai trò thành công!");
      fetchUsers(); // Cập nhật lại danh sách user
    } catch (error) {
      message.error(error.response?.data || "Cập nhật vai trò thất bại!");
    }
  };

  const userColumns = [
    { title: "Họ tên", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role, record) => (
        <Select
          defaultValue={role}
          style={{ width: 120 }}
          onChange={(value) => handleUpdateRole(record.id, value)} // Gọi API khi chọn
        >
          <Option value={2}>Staff</Option>
          <Option value={3}>SkinTherapist</Option>
          <Option value={1}>Manager</Option>
          <Option value={4}>User</Option>
        </Select>
      ),
    },
  ];

  const productColumns = [
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
      title: "Danh mục",
      dataIndex: "category",
      // Dùng optional chaining để tránh lỗi nếu category là null
      render: (cat) => cat?.categoryName || "N/A",
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      // Nếu BE trả base64 => hiển thị trực tiếp
      render: (img) => {
        if (!img) return "No image";
        // 1) Cách đơn giản: giả sử ảnh là PNG
        // return (
        //   <img
        //     src={`data:image/png;base64,${img.bytes}`}
        //     alt="Product"
        //     style={{ width: 80, height: 80, objectFit: "cover" }}
        //   />
        // );

        // 2) Nếu muốn dựa vào fileExtension (VD: .png, .jpg):
        const ext = img.fileExtension.replace(".", ""); // "png" hoặc "jpg"
        return (
          <img
            src={`data:image/${ext};base64,${img.bytes}`}
            alt="Product"
            style={{ width: 80, height: 80, objectFit: "cover" }}
          />
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc muốn xóa sản phẩm này?"
          onConfirm={() => handleDeleteProduct(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <h2>Trang Quản Trị</h2>
      <div style={{ marginBottom: 20 }}>
        <Button
          type="primary"
          onClick={() => setIsUserModalVisible(true)}
          style={{ marginRight: 10 }}
        >
          Tạo tài khoản nhân viên
        </Button>
        <Button type="primary" onClick={() => setIsProductModalVisible(true)}>
          Thêm sản phẩm
        </Button>
      </div>

      <h3>Danh sách tài khoản</h3>
      <Table
        dataSource={users}
        columns={userColumns}
        rowKey="id"
        loading={loading}
        style={{ marginBottom: 40 }}
      />

      <h3>Danh sách sản phẩm</h3>
      <Table
        dataSource={products}
        columns={productColumns}
        rowKey="id"
        loading={loading}
      />

      {/* Modal Tạo Tài Khoản */}
      <Modal
        title="Tạo tài khoản mới"
        visible={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" form={userForm} onFinish={handleCreateAccount}>
          <Form.Item
            label="Họ và Tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Ngày sinh"
            name="yearOfBirth"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select>
              <Option value={2}>Staff</Option>
              <Option value={3}>SkinTherapist</Option>
              <Option value={1}>Manager</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo tài khoản
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Tạo Sản Phẩm */}
      <Modal
        title="Thêm sản phẩm mới"
        visible={isProductModalVisible}
        onCancel={() => setIsProductModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={productForm}
          onFinish={handleCreateProduct}
        >
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
            rules={[{ required: true }]}
          >
            <Select
              onChange={handleSelectCategory}
              placeholder="Chọn hoặc thêm mới"
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </Option>
              ))}
              <Option value="create-new" style={{ color: "blue" }}>
                + Thêm mới
              </Option>
            </Select>
          </Form.Item>
          <Form.Item label="Ảnh sản phẩm">
            <Upload
              showUploadList={false} // Không hiển thị danh sách file đã chọn
              beforeUpload={(file) => handleImageUpload(file)} // 🔥 Đảm bảo truyền file
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>

            {imageFile && (
              <img
                src={imageFile}
                alt="Preview"
                style={{ marginTop: 10, width: "100%" }}
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo sản phẩm
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {/* 2.1.4 Modal Tạo Category */}
      <Modal
        title="Tạo danh mục mới"
        visible={isCategoryModalVisible}
        onCancel={() => setIsCategoryModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={categoryForm}
          onFinish={handleCreateCategory}
        >
          <Form.Item
            label="Tên danh mục"
            name="categoryName"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input placeholder="VD: Skincare, Serum,..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPage;
