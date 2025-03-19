import React, { useState, useEffect } from "react";
import { Table, Select, message, Popconfirm, Button, Modal, Form, Input, DatePicker } from "antd";
import userApi from "../../api/userApi";
import categoryApi from "../../api/categoryApi";

const { Option } = Select;

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  // Modal để chọn/chỉnh sửa danh mục khi role = SkinTherapist (3)
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userApi.getAll();
      setUsers(res.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách tài khoản!");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh mục!");
    }
  };

  // Khi thay đổi vai trò từ Select trong bảng
  const handleRoleChange = async (user, newRole) => {
    // Nếu chuyển thành SkinTherapist (role 3) mà chưa có danh mục (hoặc categoryId = 0)
    if (newRole === 3 && (!user.categoryId || user.categoryId === 0)) {
      setSelectedUser(user);
      setSelectedRole(newRole);
      setIsCategoryModalVisible(true);
      return;
    }
    try {
      // Với các trường hợp khác hoặc nếu đã có danh mục hợp lệ, cập nhật luôn
      await userApi.updateRole(user.id, newRole, newRole === 3 ? user.categoryId : undefined);
      message.success("Cập nhật vai trò thành công!");
      fetchUsers();
    } catch (error) {
      message.error("Cập nhật vai trò thất bại!");
    }
  };

  // Khi click vào tên danh mục trong bảng để chỉnh sửa danh mục
  const handleEditCategory = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setSelectedCategory(user.categoryId); // Pre-populate danh mục hiện tại
    setIsCategoryModalVisible(true);
  };

  const handleCategorySelect = (value) => {
    setSelectedCategory(value);
  };

  const handleCategoryModalOk = async () => {
    if (!selectedUser || !selectedCategory) {
      message.error("Vui lòng chọn danh mục!");
      return;
    }
    try {
      // Cập nhật user với role = 3 và danh mục đã chọn
      await userApi.updateRole(selectedUser.id, 3, selectedCategory);
      message.success("Cập nhật vai trò và danh mục thành công!");
      setIsCategoryModalVisible(false);
      setSelectedUser(null);
      setSelectedCategory(null);
      fetchUsers();
    } catch (error) {
      message.error("Cập nhật vai trò thất bại!");
    }
  };

  const handleCategoryModalCancel = () => {
    setIsCategoryModalVisible(false);
    setSelectedUser(null);
    setSelectedCategory(null);
  };

  const handleCreateUser = async (values) => {
    try {
      const payload = {
        fullName: values.fullName,
        yearOfBirth: values.yearOfBirth.format("YYYY-MM-DD"),
        email: values.email,
        role: values.role,
        phoneNumber: values.phoneNumber,
        categoryId: values.categoryId || 0,
      };
  
      const response = await userApi.create(payload);
      // Giả sử response.data chứa trường password
      const generatedPassword = response.data?.password;
  
      message.success("Tạo tài khoản thành công!");
      fetchUsers();
      setIsModalVisible(false);
      form.resetFields();
  
      if (generatedPassword) {
        Modal.info({
          title: "Mật khẩu của nhân viên vừa tạo",
          content: (
            <div>
              <p>Mật khẩu: <strong>{generatedPassword}</strong></p>
              <p>Vui lòng ghi nhớ hoặc lưu lại để gửi cho nhân viên!</p>
            </div>
          ),
          onOk() {},
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo tài khoản:", error);
      message.error("Tạo tài khoản thất bại!");
    }
  };

  const columns = [
    { title: "Họ tên", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role, record) => (
        <Select defaultValue={role} onChange={(value) => handleRoleChange(record, value)}>
          <Option value={1}>Manager</Option>
          <Option value={2}>Staff</Option>
          <Option value={3}>SkinTherapist</Option>
          <Option value={4}>User</Option>
        </Select>
      ),
    },
    {
      title: "Danh mục",
      key: "categoryName",
      render: (_, record) => {
        if (record.role === 3) {
          // Ép kiểu để so sánh chắc chắn
          const cat = categories.find((c) => String(c.id) === String(record.categoryId));
          return (
            <span
              onClick={() => handleEditCategory(record)}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              {cat ? cat.categoryName : "N/A"}
            </span>
          );
        }
        return "";
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Popconfirm title="Xóa tài khoản này?" onConfirm={() => userApi.delete(record.id)}>
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý tài khoản</h2>
      <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: 16 }}>
        Tạo tài khoản
      </Button>

      <Table dataSource={users} columns={columns} rowKey="id" />

      {/* Modal Tạo Tài Khoản */}
      <Modal title="Tạo tài khoản" visible={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <Form layout="vertical" form={form} onFinish={handleCreateUser}>
          <Form.Item label="Họ và Tên" name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
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

          <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}>
            <Select onChange={(value) => setSelectedRole(value)}>
              <Option value={1}>Manager</Option>
              <Option value={2}>Staff</Option>
              <Option value={3}>SkinTherapist</Option>
              <Option value={4}>User</Option>
            </Select>
          </Form.Item>

          {selectedRole === 3 && (
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
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo tài khoản
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chọn/chỉnh sửa danh mục cho SkinTherapist */}
      <Modal
        title="Chọn danh mục cho SkinTherapist"
        visible={isCategoryModalVisible}
        onOk={handleCategoryModalOk}
        onCancel={handleCategoryModalCancel}
      >
        <Select
          placeholder="Chọn danh mục"
          onChange={handleCategorySelect}
          style={{ width: "100%" }}
          value={selectedCategory}
        >
          {categories.map((cat) => (
            <Option key={cat.id} value={cat.id}>
              {cat.categoryName}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default ManageUsersPage;
  