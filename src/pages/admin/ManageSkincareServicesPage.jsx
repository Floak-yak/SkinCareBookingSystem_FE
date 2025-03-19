import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Select
} from "antd";
import { useNavigate } from "react-router-dom";
import servicesApi from "../../api/servicesApi";
import categoryApi from "../../api/categoryApi";
import imageApi from "../../api/imageApi";
import ImageManager from "../../components/ImageManager";

const { Option } = Select;

const ManageServicesPage = () => {
  const navigate = useNavigate();

  // State
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modal Thêm/Sửa
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  // ImageManager
  const [isImageManagerVisible, setIsImageManagerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Form
  const [form] = Form.useForm();

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Lấy danh sách dịch vụ
  const fetchServices = async () => {
    try {
      const res = await servicesApi.getAllServices();
      const rawServices = res.data || [];

      // "Join" ảnh nếu chỉ trả về imageId
      const servicesWithImage = await Promise.all(
        rawServices.map(async (s) => {
          if (!s.image && s.imageId) {
            try {
              const imgRes = await imageApi.getImageById(s.imageId);
              s.image = imgRes.data;
            } catch (err) {
              console.error("Lỗi khi lấy ảnh:", err);
            }
          }
          return s;
        })
      );

      setServices(servicesWithImage);
    } catch (error) {
      message.error("Lỗi khi tải danh sách dịch vụ!");
    }
  };

  // Lấy danh mục
  const fetchCategories = async () => {
    try {
      const resCat = await categoryApi.getAll();
      setCategories(resCat.data.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh mục!");
    }
  };

  // Thêm dịch vụ
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentService(null);
    setSelectedImage(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Sửa dịch vụ
  const handleEdit = (service) => {
    setIsEditing(true);
    setCurrentService(service);

    if (service.image) {
      setSelectedImage(service.image);
    } else {
      setSelectedImage(null);
    }

    form.setFieldsValue({
      serviceName: service.serviceName,
      serviceDescription: service.serviceDescription,
      categoryId: service.categoryId,
      price: service.price,
      workTime: service.workTime,
      imageId: service.imageId
    });

    setIsModalVisible(true);
  };

  // Xóa dịch vụ
  const handleDelete = async (id) => {
    try {
      await servicesApi.deleteService(id);
      message.success("Xóa dịch vụ thành công!");
      fetchServices();
    } catch (error) {
      message.error("Lỗi khi xóa dịch vụ!");
    }
  };

  // Lưu (Thêm/Cập nhật)
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Dữ liệu form:", values);

      // Nếu BE yêu cầu multipart/form-data, ta tạo FormData và append từng trường
      const formData = new FormData();
      formData.append("serviceName", values.serviceName);
      formData.append("serviceDescription", values.serviceDescription);
      formData.append("categoryId", values.categoryId);
      formData.append("price", values.price);
      formData.append("workTime", values.workTime);
      formData.append("imageId", values.imageId || 0);

      if (isEditing && currentService) {
        // Cập nhật
        // Ở đây BE có endpoint PUT => tùy BE có cho multipart PUT hay không
        // Giả sử ta vẫn gửi JSON => servicesApi.updateService(...) cũ
        // Hoặc BE cũng yêu cầu form-data => ta cần 1 endpoint update (multipart)
        // Tạm để logic cũ: JSON. Hoặc thay = formData nếu BE cũng form-data
        await servicesApi.updateService(currentService.id, {
          serviceName: values.serviceName,
          serviceDescription: values.serviceDescription,
          categoryId: values.categoryId,
          price: values.price,
          workTime: values.workTime,
          imageId: values.imageId || 0
        });
        message.success("Cập nhật dịch vụ thành công!");
      } else {
        // Thêm mới => multipart
        console.log("FormData keys:", [...formData.keys()]); // Debug
        await servicesApi.createService(formData);
        message.success("Thêm dịch vụ thành công!");
      }

      setIsModalVisible(false);
      fetchServices();
    } catch (error) {
      console.error("Lỗi khi lưu dịch vụ:", error);
      message.error("Lỗi khi lưu dịch vụ!");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Quản lý ServiceDetail
  const handleManageDetails = (serviceId) => {
    navigate(`/admin/manage-service-details/${serviceId}`);
  };

  // ImageManager
  const handleOpenImageManager = () => {
    setIsImageManagerVisible(true);
  };

  const handleSelectImage = (img) => {
    setSelectedImage(img);
    form.setFieldsValue({ imageId: img.id });
  };

  const handleCloseImageManager = () => {
    setIsImageManagerVisible(false);
  };

  const columns = [
    {
      title: "Tên Dịch Vụ",
      dataIndex: "serviceName",
      key: "serviceName"
    },
    {
      title: "Mô Tả",
      dataIndex: "serviceDescription",
      key: "serviceDescription"
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price?.toLocaleString()} VND`
    },
    {
      title: "Thời Gian (phút)",
      dataIndex: "workTime",
      key: "workTime"
    },
    {
      title: "Hình Ảnh",
      key: "image",
      render: (_, record) => {
        if (!record.image) return "No image";
        const ext = record.image.fileExtension?.replace(".", "") || "jpeg";
        return (
          <img
            src={`data:image/${ext};base64,${record.image.bytes}`}
            alt="preview"
            style={{ width: 60, height: 60, objectFit: "cover" }}
          />
        );
      }
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
      )
    }
  ];

  return (
    <div>
      <h2>Quản Lý Dịch Vụ Skincare</h2>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm Dịch Vụ
      </Button>

      <Table dataSource={services} columns={columns} rowKey="id" />

      {/* Modal Thêm/Sửa */}
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
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Ẩn imageId */}
          <Form.Item name="imageId" hidden>
            <InputNumber />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <Button onClick={handleOpenImageManager}>Chọn Ảnh</Button>
            {selectedImage && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={`data:image/${selectedImage.fileExtension?.replace(".", "")};base64,${selectedImage.bytes}`}
                  alt="preview"
                  style={{ width: 80, height: 80, objectFit: "cover", marginRight: 8 }}
                />
                <span>
                  {selectedImage.description || `Ảnh ID: ${selectedImage.id}`}
                </span>
              </div>
            )}
          </div>

          <Form.Item label="Giá" name="price" initialValue={0}>
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
        // zIndex={2000}
      />
    </div>
  );
};

export default ManageServicesPage;
