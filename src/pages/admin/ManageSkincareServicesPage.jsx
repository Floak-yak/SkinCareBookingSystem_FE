import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Select } from "antd";
import { useNavigate } from "react-router-dom";
import servicesApi from "../../api/servicesApi";
import categoryApi from "../../api/categoryApi";
import ImageManager from "../../components/ImageManager";

const { Option } = Select;

const ManageServicesPage = () => {
  const navigate = useNavigate();

  // State
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Modal chính (Thêm/Sửa dịch vụ)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  // ImageManager Modal
  const [isImageManagerVisible, setIsImageManagerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Form AntD
  const [form] = Form.useForm();

  // Lấy danh sách dịch vụ + danh mục
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await servicesApi.getAllServices(); 
      setServices(res.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách dịch vụ!");
    }
  };

  const fetchCategories = async () => {
    try {
      const resCat = await categoryApi.getAll();
      // Tùy cấu trúc trả về, bạn map đúng trường data
      setCategories(resCat.data.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh mục!");
    }
  };

  // ======= Tạo mới dịch vụ =======
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentService(null);
    setSelectedImage(null); // Chưa có ảnh
    form.resetFields();
    setIsModalVisible(true);
  };

  // ======= Sửa dịch vụ =======
  const handleEdit = (service) => {
    setIsEditing(true);
    setCurrentService(service);

    // Nếu service có trường imageId hoặc image (tùy cách BE trả)
    // Ta gán vào selectedImage để preview
    // Ở đây giả sử service trả về { image: { id, bytes, fileExtension, ... } }
    if (service.image) {
      setSelectedImage(service.image);
    } else {
      setSelectedImage(null);
    }

    // Gán giá trị form
    form.setFieldsValue({
      serviceName: service.serviceName,
      serviceDescription: service.serviceDescription,
      categoryId: service.categoryId,
      price: service.price,
      workTime: service.workTime,
      imageId: service.imageId, // Nếu BE trả field imageId riêng
    });

    setIsModalVisible(true);
  };

  // ======= Xóa dịch vụ =======
  const handleDelete = async (id) => {
    try {
      await servicesApi.deleteService(id);
      message.success("Xóa dịch vụ thành công!");
      fetchServices();
    } catch (error) {
      message.error("Lỗi khi xóa dịch vụ!");
    }
  };

  // ======= Lưu (Thêm hoặc Cập nhật) =======
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // values: { serviceName, serviceDescription, categoryId, price, workTime, imageId }

      if (isEditing && currentService) {
        // Cập nhật
        await servicesApi.updateService(currentService.id, values);
        message.success("Cập nhật dịch vụ thành công!");
      } else {
        // Thêm mới
        await servicesApi.createService(values);
        message.success("Thêm dịch vụ thành công!");
      }
      setIsModalVisible(false);
      fetchServices();
    } catch (error) {
      message.error("Lỗi khi lưu dịch vụ!");
      console.error(error);
    }
  };

  // ======= Đóng modal =======
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // ======= Chuyển sang trang quản lý ServiceDetail =======
  const handleManageDetails = (serviceId) => {
    navigate(`/admin/manage-service-details/${serviceId}`);
  };

  // ======= Mở ImageManager =======
  const handleOpenImageManager = () => {
    setIsImageManagerVisible(true);
  };

  // ======= Callback khi chọn ảnh trong ImageManager =======
  const handleSelectImage = (img) => {
    // Lưu object ảnh để hiển thị preview
    setSelectedImage(img);
    // Gán imageId vào form
    form.setFieldsValue({ imageId: img.id });
  };

  // ======= Đóng ImageManager =======
  const handleCloseImageManager = () => {
    setIsImageManagerVisible(false);
  };

  // Cột bảng
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Tên Dịch Vụ", dataIndex: "serviceName", key: "serviceName" },
    { title: "Mô Tả", dataIndex: "serviceDescription", key: "serviceDescription" },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price?.toLocaleString()} VND`,
    },
    {
      title: "Thời Gian (phút)",
      dataIndex: "workTime",
      key: "workTime",
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa dịch vụ?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger style={{ marginRight: 8 }}>
              Xóa
            </Button>
          </Popconfirm>
          <Button onClick={() => handleManageDetails(record.id)}>
            Quản lý chi tiết
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản Lý Dịch Vụ Skincare</h2>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm Dịch Vụ
      </Button>

      <Table dataSource={services} columns={columns} rowKey="id" />

      {/* Modal Thêm/Sửa Dịch Vụ */}
      <Modal
        title={isEditing ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Dịch Vụ"
            name="serviceName"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            name="serviceDescription"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
            initialValue={1}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Trường ẩn lưu imageId */}
          <Form.Item name="imageId" hidden>
            <InputNumber />
          </Form.Item>

          {/* Nút mở ImageManager + hiển thị ảnh đã chọn */}
          <div style={{ marginBottom: 16 }}>
            <Button onClick={handleOpenImageManager}>Chọn Ảnh</Button>
            {selectedImage && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={`data:image/${selectedImage.fileExtension?.replace(".", "")};base64,${selectedImage.bytes}`}
                  alt="preview"
                  style={{ width: 80, height: 80, objectFit: "cover", marginRight: 8 }}
                />
                <span>{selectedImage.description || `Ảnh ID: ${selectedImage.id}`}</span>
              </div>
            )}
          </div>

          <Form.Item
            label="Giá"
            name="price"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Thời gian (phút)"
            name="workTime"
            initialValue={1}
            rules={[{ required: true, message: "Vui lòng nhập thời gian!" }]}
          >
            <InputNumber min={1} max={90} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal ImageManager */}
      <ImageManager
        visible={isImageManagerVisible}
        onClose={handleCloseImageManager}
        onSelectImage={handleSelectImage}
      />
    </div>
  );
};

export default ManageServicesPage;
