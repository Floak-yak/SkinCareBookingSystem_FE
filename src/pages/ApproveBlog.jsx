import React, { useState, useEffect } from "react";
import { Table, Button, message, Spin, Card, Modal } from "antd";
import postApi from "../api/postApi";
import "../styles/approveBlog.css";

const ApproveBlogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Lấy danh sách bài viết từ BE sử dụng postApi
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    setLoading(true);
    postApi
      .getPosts()
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Lọc ra các bài chưa duyệt (postStatus !== 1)
  const pendingBlogs = posts.filter((post) => post.postStatus !== 1);

  // Duyệt bài: gọi API duyệt bài với payload { id, status: 1 }
  const handleApprove = (id) => {
    const blogToApprove = posts.find((post) => post.id === id);
    if (!blogToApprove) return;

    const payload = { id, status: 1 };
    postApi
      .approvePost(payload)
      .then((res) => {
        message.success("Bài viết đã được duyệt!");
        // Update state: loại bỏ bài vừa duyệt khỏi danh sách
        setPosts((prev) => prev.filter((post) => post.id !== id));
      })
      .catch((err) => {
        message.error("Có lỗi xảy ra khi duyệt bài!");
      });
  };

  // Mở modal hiển thị chi tiết bài viết
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
    {
      title: "Tác giả",
      key: "author",
      render: (_, record) => record.user?.fullName || "Ẩn danh",
    },
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

  if (loading) return <Spin size="large" />;
  if (error) return <p>Có lỗi xảy ra khi tải bài viết: {error}</p>;

  return (
    <div className="approve-blogs-container">
      <Card className="approve-blogs-card">
        <h2>Duyệt Bài Viết</h2>
        <Table dataSource={pendingBlogs} columns={columns} rowKey="id" />
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
            <p className="blog-detail-meta">
              <span className="blog-detail-author">
                Đăng bởi {selectedBlog.user?.fullName || "Ẩn danh"}
              </span>
              {" - "}
              <span className="blog-detail-date">
                {new Date(selectedBlog.datePost).toLocaleDateString()}
              </span>
            </p>
            {selectedBlog.image && selectedBlog.image.description && (
              <img
                src={selectedBlog.image.description}
                alt={selectedBlog.title}
                className="blog-detail-image"
              />
            )}
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
