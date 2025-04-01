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
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import servicesApi from "../../api/servicesApi";
import categoryApi from "../../api/categoryApi";
import imageApi from "../../api/imageApi";
import ImageManager from "../../components/ImageManager";
import "../../styles/ManageServicesPage.css";

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

      // Validate services and log any invalid entries
      const validServices = servicesWithImage.filter((service) => {
        if (!service.serviceName) {
          console.warn("Invalid service entry:", service);
          return false;
        }
        return true;
      });

      setServices(validServices);
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
      imageId: service.imageId,
    });

    setIsModalVisible(true);
  };

  // Xóa dịch vụ
  const handleDelete = async (id) => {
    try {
      const response = await servicesApi.deleteService(id);
      if (response.data && response.data.success) {
        message.success("Xóa dịch vụ thành công!");
        fetchServices();
      } else {
        message.error(response.data?.message || "Lỗi khi xóa dịch vụ!");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      const errorMsg = error.response?.data?.message || "Lỗi khi xóa dịch vụ!";
      message.error(errorMsg);
      if (errorMsg.includes("bookings")) {
        message.warning("Không thể xóa dịch vụ này vì đã có lịch hẹn sử dụng dịch vụ này!");
      }
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
        await servicesApi.updateService(currentService.id, {
          serviceName: values.serviceName,
          serviceDescription: values.serviceDescription,
          categoryId: values.categoryId,
          price: values.price,
          workTime: values.workTime,
          imageId: values.imageId || 0,
        });
        message.success("Cập nhật dịch vụ thành công!");
      } else {
        console.log("FormData keys:", [...formData.keys()]);
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
      key: "serviceName",
      render: (text) => text || "N/A",
    },
    {
      title: "Mô Tả",
      dataIndex: "serviceDescription",
      key: "serviceDescription",
      render: (text) => text || "N/A",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (price ? `${price.toLocaleString()} VND` : "N/A"),
    },
    {
      title: "Thời Gian (phút)",
      dataIndex: "workTime",
      key: "workTime",
      render: (time) => (time ? `${time} phút` : "N/A"),
    },
    {
      title: "Hình Ảnh",
      key: "image",
      render: (_, record) => {
        if (!record || !record.image) return "No image";
        const ext = record.image.fileExtension?.replace(".", "") || "jpeg";
        return (
          <img
            src={`data:image/${ext};base64,${record.image.bytes}`}
            alt="preview"
            style={{ width: 60, height: 60, objectFit: "cover" }}
          />
        );
      },
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => {
        if (!record) return null;
        return (
          <>
            <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
              Sửa
            </Button>
            <Popconfirm
              title="Xác nhận xóa dịch vụ?"
              description="Việc xóa dịch vụ này sẽ xóa tất cả các chi tiết liên quan. Bạn có chắc chắn muốn xóa không?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có, xóa"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Button danger style={{ marginRight: 8 }}>
                Xóa
              </Button>
            </Popconfirm>
            <Button onClick={() => handleManageDetails(record.id)}>
              Quản lý chi tiết
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <div className="manage-services-container">
      <h2 className="manage-services-heading">Quản Lý Dịch Vụ Skincare</h2>
      <Button
        type="primary"
        onClick={handleAdd}
        className="manage-services-add-button"
      >
        Thêm Dịch Vụ
      </Button>

      {/* Bọc bảng trong một div để áp style */}
      <div className="manage-services-table">
        <Table dataSource={services} columns={columns} rowKey="id" />
      </div>

      {/* Modal Thêm/Sửa */}
      <Modal
        className="manage-services-modal"
        title={isEditing ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical" className="manage-services-form">
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
                  src={`data:image/${selectedImage.fileExtension?.replace(
                    ".",
                    ""
                  )};base64,${selectedImage.bytes}`}
                  alt="preview"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    marginRight: 8,
                  }}
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
