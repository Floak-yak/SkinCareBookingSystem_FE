import React, { useEffect, useState } from "react";
import { Modal, Button, Upload, message, Row, Col, Card, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import imageApi from "../api/imageApi";
import bookingApi from "../api/bookingApi";

const ImageManagerForTransaction = ({ visible, onClose, onSelectImage, bookingId }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalKey, setModalKey] = useState(Date.now()); //reopen modal

    useEffect(() => {
        if (visible) {
            fetchImages();
        }
    }, [visible, modalKey]);

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
        if (!file) {
            message.error("Vui lòng chọn một file để tải lên!");
            return false;
        }

        if (!bookingId) {
            message.error("BookingId không hợp lệ!");
            return false;
        }

        try {
            const realFile = file.originFileObj || file; // Lấy file gốc từ Ant Design Upload

            const res = await bookingApi.upload(bookingId, realFile);

            if (res.data?.id) {
                message.success("Upload ảnh thành công!");
                setModalKey(Date.now());
            }
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error.response?.data || error.message);
            message.error("Upload thất bại!");
        }

        return false;
    };

    const handleSelect = (image) => {
        onSelectImage(image);
        onClose();
    };

    return (
        <Modal
            key={modalKey} // Khi key thay đổi, modal sẽ re-mount
            title="Quản lý ảnh"
            visible={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={800}
        >
            <div style={{ marginBottom: 16, textAlign: "center" }}>
                <Upload beforeUpload={handleUpload} showUploadList={false}>
                    <Button icon={<UploadOutlined />} size="large">
                        Tải ảnh mới
                    </Button>
                </Upload>
            </div>
            {loading ? (
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <Spin tip="Đang tải..." />
                </div>
            ) : (
                <Row gutter={[16, 16]}>
                    {images.map((img) => {
                        const imageSrc = `data:image/${img.fileExtension.replace(
                            ".",
                            ""
                        )};base64,${img.bytes}`;
                        return (
                            <Col xs={24} sm={12} md={8} lg={6} key={img.id}>
                                <Card
                                    hoverable
                                    style={{
                                        height: 250,
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                    cover={
                                        <img
                                            alt={img.description || `Ảnh ${img.id}`}
                                            src={imageSrc}
                                            style={{
                                                height: 150,
                                                objectFit: "cover",
                                            }}
                                        />
                                    }
                                >
                                    <div style={{ flexGrow: 1 }}>
                                        <Card.Meta
                                            title={
                                                <div
                                                    style={{
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        maxWidth: "100%",
                                                    }}
                                                >
                                                    {img.description || `Ảnh ID: ${img.id}`}
                                                </div>
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="primary"
                                        style={{ marginTop: 8 }}
                                        onClick={() => handleSelect(img)}
                                    >
                                        Chọn
                                    </Button>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </Modal>
    );
};

export default ImageManagerForTransaction;
