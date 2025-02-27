import { useState } from "react";
import { Table, Button, message, Spin, Card, Modal } from "antd";
import "../styles/approveBlog.css";
import useFetch from "../hooks/useFetch";

const ApproveBlogs = () => {
  const { data: allBlogs, loading, updateData } = useFetch("/data/blogs.json", "blogs");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Lọc bài viết chưa duyệt
  const pendingBlogs = allBlogs.filter(blog => !blog.isApproved);

  // Duyệt bài
  const handleApprove = (id) => {
    const blogToApprove = allBlogs.find(blog => blog.id === id);
    if (!blogToApprove) return;

    const updatedBlog = { ...blogToApprove, isApproved: true };
    updateData(updatedBlog);
    message.success("Bài viết đã được duyệt!");
  };

  // Mở modal, hiển thị chi tiết
  const showModal = (blog) => {
    setSelectedBlog(blog);
    setModalVisible(true);
  };

  // Đóng modal
  const closeModal = () => {
    setSelectedBlog(null);
    setModalVisible(false);
  };

  const columns = [
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Tác giả", dataIndex: "author", key: "author" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => showModal(record)}>
            Xem chi tiết
          </Button>
          <Button type="primary" onClick={() => handleApprove(record.id)}>
            Duyệt bài
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="approve-blogs-container">
      <Card className="approve-blogs-card">
        <h2>Duyệt Bài Viết</h2>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={pendingBlogs}
            columns={columns}
            rowKey="id"
          />
        )}
      </Card>

      <Modal
        title="Chi tiết bài viết"
        visible={modalVisible}
        onCancel={closeModal}
        footer={null}
      >
        {selectedBlog && (
          <div className="blog-detail-modal">
            <h3 className="blog-detail-title">{selectedBlog.title}</h3>

            {/* Thông tin tác giả, ngày đăng */}
            <p className="blog-detail-meta">
              <span className="blog-detail-author">
                Đăng bởi {selectedBlog.author}
              </span>
              {" - "}
              <span className="blog-detail-date">
                {new Date(selectedBlog.date).toLocaleDateString()}
              </span>
            </p>

            {/* Ảnh (nếu có) */}
            {selectedBlog.image && (
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="blog-detail-image"
              />
            )}

            {/* Nội dung (có thể chứa HTML, ảnh base64) */}
            <div
              className="blog-detail-content"
              dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApproveBlogs;
