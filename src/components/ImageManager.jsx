import React, { useEffect, useState } from "react";
import { Modal, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import imageApi from "../api/imageApi";

const ImageManager = ({ visible, onClose, onSelectImage }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchImages();
    }
  }, [visible]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await imageApi.getAll();
      setImages(res.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách ảnh!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      console.log("Đang upload file:", file);

      const res = await imageApi.upload(file);
      console.log("Res từ API:", res.data);

      if (res.data?.id) {
        message.success("Upload ảnh thành công!");
        fetchImages();
      } 
    } catch (error) {
      console.error(
        "Lỗi khi upload ảnh:",
        error.response?.data || error.message
      );
    }
    return false;
  };

  const handleSelect = (image) => {
    onSelectImage(image); // Gửi object ảnh
    onClose();
  };

  return (
    <Modal
      title="Quản lý ảnh"
      visible={visible}
      onCancel={onClose}
      zIndex={2000}
      footer={null}
    >
      <Upload beforeUpload={handleUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />}>Tải ảnh mới</Button>
      </Upload>

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          images.map((img) => (
            <div key={img.id} style={{ marginBottom: 10 }}>
              <img
                src={`data:image/${img.fileExtension.replace(".", "")};base64,${
                  img.bytes
                }`}
                alt="preview"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  marginRight: 8,
                }}
              />
              <span>{img.description || `Ảnh ID: ${img.id}`}</span>
              <Button type="link" onClick={() => handleSelect(img)}>
                Chọn
              </Button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default ImageManager;
