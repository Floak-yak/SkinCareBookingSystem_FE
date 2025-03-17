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
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchCategories();
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

  const handleRoleChange = async (userId, newRole) => {
    await userApi.updateRole(userId, newRole);
    fetchUsers();
  };

  const handleCreateUser = async (values) => {
    try {
      const payload = {
        fullName: values.fullName,
        yearOfBirth: values.yearOfBirth.format("YYYY-MM-DD"),
        email: values.email,
        role: values.role,
        phoneNumber: values.phoneNumber,
        categoryId: values.categoryId || 0, // Chỉ gửi category nếu là SkinTherapist
      };

      await userApi.create(payload);
      message.success("Tạo tài khoản thành công!");
      fetchUsers();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
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
        <Select defaultValue={role} onChange={(value) => handleRoleChange(record.id, value)}>
          <Option value={2}>Staff</Option>
          <Option value={3}>SkinTherapist</Option>
          <Option value={1}>Manager</Option>
          <Option value={4}>User</Option>
        </Select>
      ),
    },
    {
      title: "Danh mục",
      key: "categoryName",
      render: (_, record) => (record.role === 3 ? record.categoryName || "N/A" : ""),
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
      <Modal
        title="Tạo tài khoản"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
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

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
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
    </div>
  );
};

export default ManageUsersPage;
