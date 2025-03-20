import React, { useState, useEffect } from "react";
import { Table, message, Button, Popconfirm, Modal, Form, Input } from "antd";
import categoryApi from "../../api/categoryApi";

const ManageCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh mục!");
    }
  };

  const handleCreateCategory = async (values) => {
    try {
      await categoryApi.create(values.categoryName);
      message.success("Tạo danh mục thành công!");
      fetchCategories();
      setIsCreateModalVisible(false);
      createForm.resetFields();
    } catch (error) {
      console.error("Lỗi khi tạo danh mục:", error);
      message.error("Tạo danh mục thất bại!");
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    editForm.setFieldsValue({
      categoryName: category.categoryName,
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateCategory = async (values) => {
    try {
      await categoryApi.update(editingCategory.id, values.categoryName);
      message.success("Cập nhật danh mục thành công!");
      fetchCategories();
      setIsEditModalVisible(false);
      editForm.resetFields();
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      message.error("Cập nhật danh mục thất bại!");
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await categoryApi.delete(categoryId);
      message.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      message.error("Xóa danh mục thất bại!");
    }
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <>
          <Popconfirm
            title="Xóa danh mục này?"
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
      <h2>Quản lý danh mục</h2>

      <Button
        type="primary"
        onClick={() => setIsCreateModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Thêm danh mục
      </Button>

      <Table dataSource={categories} columns={columns} rowKey="id" />

      <Modal
        title="Thêm danh mục"
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={createForm}
          onFinish={handleCreateCategory}
        >
          <Form.Item
            label="Tên danh mục"
            name="categoryName"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật danh mục"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" form={editForm} onFinish={handleUpdateCategory}>
          <Form.Item
            label="Tên danh mục"
            name="categoryName"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageCategoriesPage;
