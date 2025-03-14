import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, Select, message } from "antd";
import apiClient from "../api/apiClient";
// import "../styles/adminPage.css";

const { Option } = Select;

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Form tạo tài khoản mới
  const [form] = Form.useForm();

  // Lấy danh sách nhân viên từ API (Staff, SkinTherapist, Manager)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/User/GetUsers");
      setUsers(res.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCreateAccount = async (values) => {
    try {
      const res = await apiClient.post("/User/CreateAccount", {
        Role: values.role, // Role dưới dạng số: 2 cho Staff, 3 cho SkinTherapist, v.v.
        Email: values.email,
        FullName: values.fullName,
        YearOfBirth: values.yearOfBirth.format("YYYY-MM-DD"),
        PhoneNumber: values.phoneNumber,
      });
      message.success(res.data);
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers(); // làm mới danh sách
    } catch (error) {
      message.error(error.response?.data || "Tạo tài khoản thất bại!");
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await apiClient.put("/User", null, { // PUT /User?userId=...&role=...
        params: { userId, role: newRole },
      });
      message.success(res.data);
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data || "Cập nhật vai trò thất bại!");
    }
  };

  const columns = [
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role, record) => (
        <Select
          defaultValue={role}
          style={{ width: 120 }}
          onChange={(value) => handleUpdateRole(record.id, value)}
        >
          <Option value={2}>Staff</Option>
          <Option value={3}>SkinTherapist</Option>
          <Option value={1}>Manager</Option>
        </Select>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <h2>Trang Quản Trị</h2>
      <Button type="primary" onClick={showModal}>
        Tạo tài khoản nhân viên
      </Button>
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} style={{ marginTop: 20 }} />

      <Modal
        title="Tạo tài khoản mới"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateAccount}>
          <Form.Item
            label="Họ và Tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input placeholder="Họ và tên" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input placeholder="Số điện thoại" />
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
            <Select placeholder="Chọn vai trò">
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
    </div>
  );
};

export default AdminPage;
