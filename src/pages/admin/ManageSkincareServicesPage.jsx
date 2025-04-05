import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, message, Modal, Form, Input, InputNumber } from "antd";
import servicesApi from "../../api/servicesApi";
import imageApi from "../../api/imageApi";
import ImageManager from "../../components/ImageManager";
import "../../styles/ManageServicesPage.css";
import { useNavigate } from "react-router-dom";

const ManageServicesPage = () => {
  const [services, setServices] = useState([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailService, setDetailService] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingService, setEditingService] = useState(null);
  const [createPreview, setCreatePreview] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [isImageManagerVisible, setIsImageManagerVisible] = useState(false);
  const [imageManagerTarget, setImageManagerTarget] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await servicesApi.getAllServices();
      let servicesData = res.data || [];
      // Với mỗi dịch vụ có image là null nhưng có imageId, gọi API để lấy chi tiết ảnh
      await Promise.all(
        servicesData.map(async (service) => {
          if (!service.image && service.imageId) {
            try {
              const imageRes = await imageApi.getImageById(service.imageId);
              service.image = imageRes.data;
            } catch (err) {
              console.error("Lỗi khi tải ảnh cho dịch vụ", service.id, err);
            }
          }
        })
      );
      setServices(servicesData);
    } catch (error) {
      message.error("Lỗi khi tải danh sách dịch vụ!");
    }
  };

  const handleCreateService = async (values) => {
    try {
      // Giả sử BE update dịch vụ cũng yêu cầu multipart/form-data, bạn có thể chuyển payload thành FormData
      const formData = new FormData();
      formData.append("serviceName", values.serviceName);
      formData.append("serviceDescription", values.serviceDescription);
      formData.append("benefits", values.benefits);
      formData.append("price", values.price);
      formData.append("workTime", values.workTime);
      formData.append("imageId", values.imageId || 0);

      await servicesApi.createService(formData);
      message.success("Tạo dịch vụ thành công!");
      setIsCreateModalVisible(false);
      createForm.resetFields();
      setCreatePreview(null);
      fetchServices();
    } catch (error) {
      console.error("Lỗi khi tạo dịch vụ:", error);
      message.error("Tạo dịch vụ thất bại!");
    }
  };

  const openEditModal = (service) => {
    setEditingService(service);
    editForm.setFieldsValue({
      serviceName: service.serviceName,
      serviceDescription: service.serviceDescription,
      benefits: service.benefits,
      price: service.price,
      workTime: service.workTime,
      imageId: service.imageId || 0,
    });
    setEditPreview(service.image || null);
    setIsEditModalVisible(true);
  };

  const handleUpdateService = async (values) => {
    try {
      const formData = new FormData();
      formData.append("serviceName", values.serviceName);
      formData.append("serviceDescription", values.serviceDescription);
      formData.append("benefits", values.benefits);
      formData.append("price", values.price);
      formData.append("workTime", values.workTime);
      formData.append("imageId", values.imageId || 0);

      await servicesApi.updateService(editingService.id, formData);
      message.success("Cập nhật dịch vụ thành công!");
      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditPreview(null);
      fetchServices();
    } catch (error) {
      console.error("Lỗi khi cập nhật dịch vụ:", error);
      message.error("Cập nhật dịch vụ thất bại!");
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await servicesApi.deleteService(id);
      message.success("Xóa dịch vụ thành công!");
      fetchServices();
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ:", error);
      message.error("Xóa dịch vụ thất bại!");
    }
  };

  const openImageManager = (target) => {
    setImageManagerTarget(target);
    setIsImageManagerVisible(true);
  };

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

  const openDetailModal = (service) => {
    setDetailService(service);
    setIsDetailModalVisible(true);
  };

  const columns = [
    {
      title: "Tên dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Mô tả",
      dataIndex: "serviceDescription",
      key: "serviceDescription",
      render: (text) =>
        text && text.length > 50 ? text.substring(0, 50) + "..." : text,
    },
    {
      title: "Lợi ích",
      dataIndex: "benefits",
      key: "benefits",
      render: (text) =>
        text && text.length > 50 ? text.substring(0, 50) + "..." : text,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString()} VND`,
    },
    {
      title: "Thời gian",
      dataIndex: "workTime",
      key: "workTime",
      render: (workTime) => `${workTime} phút`,
    },
    {
      title: "Hình ảnh",
      key: "image",
      render: (_, record) => {
        if (record.image) {
          const ext = record.image.fileExtension.replace(".", "");
          return (
            <img
              src={`data:image/${ext};base64,${record.image.bytes}`}
              alt="preview"
              style={{ width: 80, height: 80, objectFit: "cover" }}
            />
          );
        }
        return record.imageId ? "Đang tải ảnh..." : "No image";
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <>
          <Popconfirm
            title="Xóa dịch vụ này?"
            onConfirm={() => handleDeleteService(record.id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
          <Button type="link" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Button
            type="link"
            onClick={() => navigate(`/admin/manage-service-details/${record.id}`)}
          >
            Xem chi tiết
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="manage-services-container">
      <h2 className="manage-services-heading">Quản lý dịch vụ</h2>
      <Button type="primary" onClick={() => setIsCreateModalVisible(true)}>
        Thêm dịch vụ
      </Button>
      <Table dataSource={services} columns={columns} rowKey="id" />

      {/* Modal Tạo dịch vụ */}
      <Modal
        title="Thêm dịch vụ"
        visible={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          setCreatePreview(null);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setIsCreateModalVisible(false);
              setCreatePreview(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => createForm.submit()}
          >
            Tạo dịch vụ
          </Button>,
        ]}
        centered
      >
        <Form layout="vertical" form={createForm} onFinish={handleCreateService}>
          <Form.Item
            label="Tên dịch vụ"
            name="serviceName"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
          >
            <Input placeholder="Nhập tên dịch vụ" size="large" />
          </Form.Item>
          <Form.Item
            label="Mô tả dịch vụ"
            name="serviceDescription"
            rules={[{ required: true, message: "Vui lòng nhập mô tả dịch vụ!" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả dịch vụ" />
          </Form.Item>
          <Form.Item
            label="Lợi ích"
            name="benefits"
            rules={[{ required: true, message: "Vui lòng nhập lợi ích của dịch vụ!" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập lợi ích của dịch vụ" />
          </Form.Item>
          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá dịch vụ!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập giá dịch vụ"
              size="large"
            />
          </Form.Item>
          <Form.Item
            label="Thời gian (phút)"
            name="workTime"
            rules={[{ required: true, message: "Vui lòng nhập thời gian làm dịch vụ!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập thời gian làm dịch vụ"
              size="large"
            />
          </Form.Item>
          <Form.Item label="Ảnh dịch vụ" name="imageId">
            <Button onClick={() => openImageManager("create")} size="large">
              Chọn ảnh
            </Button>
            {createPreview && (
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <img
                  src={`data:image/${createPreview.fileExtension.replace(
                    ".",
                    ""
                  )};base64,${createPreview.bytes}`}
                  alt="preview"
                  style={{
                    width: 150,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Cập nhật dịch vụ */}
      <Modal
        title="Cập nhật dịch vụ"
        visible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditPreview(null);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setIsEditModalVisible(false);
              setEditPreview(null);
            }}
          >
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={() => editForm.submit()}>
            Cập nhật
          </Button>,
        ]}
        centered
      >
        <Form layout="vertical" form={editForm} onFinish={handleUpdateService}>
          <Form.Item
            label="Tên dịch vụ"
            name="serviceName"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
          >
            <Input placeholder="Nhập tên dịch vụ" size="large" />
          </Form.Item>
          <Form.Item
            label="Mô tả dịch vụ"
            name="serviceDescription"
            rules={[{ required: true, message: "Vui lòng nhập mô tả dịch vụ!" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả dịch vụ" />
          </Form.Item>
          <Form.Item
            label="Lợi ích"
            name="benefits"
            rules={[{ required: true, message: "Vui lòng nhập lợi ích của dịch vụ!" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập lợi ích của dịch vụ" />
          </Form.Item>
          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá dịch vụ!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập giá dịch vụ"
              size="large"
            />
          </Form.Item>
          <Form.Item
            label="Thời gian (phút)"
            name="workTime"
            rules={[{ required: true, message: "Vui lòng nhập thời gian làm dịch vụ!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập thời gian làm dịch vụ"
              size="large"
            />
          </Form.Item>
          <Form.Item label="Ảnh dịch vụ" name="imageId">
            <Button onClick={() => openImageManager("edit")} size="large">
              Chọn ảnh
            </Button>
            {editPreview && (
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <img
                  src={`data:image/${editPreview.fileExtension.replace(
                    ".",
                    ""
                  )};base64,${editPreview.bytes}`}
                  alt="preview"
                  style={{
                    width: 150,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal quản lý ảnh */}
      <ImageManager
        visible={isImageManagerVisible}
        onClose={() => setIsImageManagerVisible(false)}
        onSelectImage={handleSelectImage}
      />
    </div>
  );
};

export default ManageServicesPage;
