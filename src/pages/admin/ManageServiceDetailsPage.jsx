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
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import serviceDetailApi from "../../api/servicesDetailApi";
import ImageManager from "../../components/ImageManager";

const ManageServiceDetailsPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  // Danh sách ServiceDetail
  const [details, setDetails] = useState([]);

  // Tạo Form
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [createPreview, setCreatePreview] = useState(null);

  // Sửa Form
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editPreview, setEditPreview] = useState(null);
  const [editingDetail, setEditingDetail] = useState(null);

  // ImageManager
  const [isImageManagerVisible, setIsImageManagerVisible] = useState(false);
  const [imageManagerTarget, setImageManagerTarget] = useState(null);
  // "create" hoặc "edit" → biết form nào đang gọi ImageManager

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  // Lấy danh sách ServiceDetail
  const fetchServiceDetails = async () => {
    try {
      const res = await serviceDetailApi.getDetailsByServiceId(serviceId);
      // Kiểm tra cấu trúc trả về
      // Ở đây ta giả định res.data.data là mảng
      setDetails(res.data.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách ServiceDetail!");
    }
  };

  // =======================
  // Tạo ServiceDetail
  // =======================
  const openCreateModal = () => {
    setIsCreateModalVisible(true);
    createForm.resetFields();
    setCreatePreview(null);
  };

  const handleCreateDetail = async (values) => {
    try {
      // Thêm serviceId vào payload
      const payload = {
        ...values,
        serviceId: Number(serviceId),
      };
      await serviceDetailApi.createDetail(payload);
      message.success("Tạo chi tiết dịch vụ thành công!");
      setIsCreateModalVisible(false);
      createForm.resetFields();
      setCreatePreview(null);
      fetchServiceDetails();
    } catch (error) {
      console.error("Lỗi khi tạo chi tiết:", error);
      message.error("Tạo chi tiết thất bại!");
    }
  };

  // =======================
  // Sửa ServiceDetail
  // =======================
  const openEditModal = (detail) => {
    setEditingDetail(detail);
    editForm.setFieldsValue({
      title: detail.title,
      description: detail.description,
      duration: detail.duration,
      imageId: detail.imageId || 0,
    });
    if (detail.image) {
      // Nếu BE trả thêm detail.image => hiển thị preview
      setEditPreview(detail.image);
    } else {
      setEditPreview(null);
    }
    setIsEditModalVisible(true);
  };

  const handleUpdateDetail = async (values) => {
    try {
      const payload = {
        ...values,
        serviceId: Number(serviceId),
      };
      await serviceDetailApi.updateDetail(editingDetail.id, payload);
      message.success("Cập nhật chi tiết dịch vụ thành công!");
      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditPreview(null);
      fetchServiceDetails();
    } catch (error) {
      console.error("Lỗi khi cập nhật chi tiết:", error);
      message.error("Cập nhật chi tiết thất bại!");
    }
  };

  // =======================
  // Xóa ServiceDetail
  // =======================
  const handleDelete = async (id) => {
    try {
      await serviceDetailApi.deleteDetail(id);
      message.success("Xóa thành công!");
      fetchServiceDetails();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      message.error("Xóa thất bại!");
    }
  };

  // =======================
  // ImageManager
  // =======================
  const openImageManager = (target) => {
    // target = "create" hoặc "edit"
    setImageManagerTarget(target);
    setIsImageManagerVisible(true);
  };

  const handleSelectImage = (image) => {
    message.success(`Đã chọn ảnh ID: ${image.id}`);
    if (imageManagerTarget === "create") {
      // Set vào createForm
      createForm.setFieldsValue({ imageId: image.id });
      setCreatePreview(image);
    } else if (imageManagerTarget === "edit") {
      editForm.setFieldsValue({ imageId: image.id });
      setEditPreview(image);
    }
    setIsImageManagerVisible(false);
  };

  // Quay lại danh sách dịch vụ
  const handleBackToServices = () => {
    navigate("/admin/manage-services");
  };

  // Cột bảng
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Thời lượng (phút)",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (img, record) => {
        if (!img) {
          // fallback: hiển thị imageId
          return record.imageId
            ? `Ảnh ID: ${record.imageId}`
            : "Không có ảnh";
        }
        // Nếu có img => hiển thị preview
        const ext = img.fileExtension.replace(".", "");
        return (
          <img
            src={`data:image/${ext};base64,${img.bytes}`}
            alt="preview"
            style={{ width: 60, height: 60, objectFit: "cover" }}
          />
        );
      },
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => (
        <>
          <Button onClick={() => openEditModal(record)} style={{ marginRight: 8 }}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản Lý Chi Tiết Dịch Vụ (ServiceId: {serviceId})</h2>
      <Button type="primary" onClick={openCreateModal} style={{ marginBottom: 16 }}>
        Thêm Chi Tiết
      </Button>
      <Button onClick={handleBackToServices} style={{ marginLeft: 8 }}>
        Quay Lại Danh Sách Dịch Vụ
      </Button>

      <Table
        dataSource={details}
        columns={columns}
        rowKey="id"
        style={{ marginTop: 16 }}
      />

      {/* Modal Tạo ServiceDetail */}
      <Modal
        title="Tạo chi tiết dịch vụ"
        visible={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          setCreatePreview(null);
        }}
        footer={null}
      >
        <Form layout="vertical" form={createForm} onFinish={handleCreateDetail}>
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Thời lượng (phút)"
            name="duration"
            initialValue={15}
            rules={[{ required: true, message: "Vui lòng nhập thời lượng!" }]}
          >
            <InputNumber min={1} max={180} style={{ width: "100%" }} />
          </Form.Item>

          {/* imageId ẩn */}
          <Form.Item name="imageId" hidden>
            <InputNumber />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <Button onClick={() => openImageManager("create")}>Chọn Ảnh</Button>
            {createPreview && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={`data:image/${createPreview.fileExtension.replace(
                    ".",
                    ""
                  )};base64,${createPreview.bytes}`}
                  alt="preview"
                  style={{ width: 80, height: 80, objectFit: "cover", marginRight: 8 }}
                />
                <span>
                  {createPreview.description || `Ảnh ID: ${createPreview.id}`}
                </span>
              </div>
            )}
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Sửa ServiceDetail */}
      <Modal
        title="Chỉnh sửa chi tiết dịch vụ"
        visible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditPreview(null);
        }}
        footer={null}
      >
        <Form layout="vertical" form={editForm} onFinish={handleUpdateDetail}>
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Thời lượng (phút)"
            name="duration"
            rules={[{ required: true, message: "Vui lòng nhập thời lượng!" }]}
          >
            <InputNumber min={1} max={180} style={{ width: "100%" }} />
          </Form.Item>

          {/* imageId ẩn */}
          <Form.Item name="imageId" hidden>
            <InputNumber />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <Button onClick={() => openImageManager("edit")}>Chọn Ảnh</Button>
            {editPreview && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={`data:image/${editPreview.fileExtension.replace(".", "")};base64,${editPreview.bytes}`}
                  alt="preview"
                  style={{ width: 80, height: 80, objectFit: "cover", marginRight: 8 }}
                />
                <span>{editPreview.description || `Ảnh ID: ${editPreview.id}`}</span>
              </div>
            )}
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal ImageManager */}
      <ImageManager
        visible={isImageManagerVisible}
        onClose={() => setIsImageManagerVisible(false)}
        onSelectImage={handleSelectImage}
      />
    </div>
  );
};

export default ManageServiceDetailsPage;
