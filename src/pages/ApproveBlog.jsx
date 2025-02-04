import { useEffect, useState } from "react";
import { Table, Button, message, Spin, Card, Modal } from "antd";
import "../styles/approveBlog.css";

const ApproveBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/blogs.json");
        const jsonData = await response.json();
        const storedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];

        // Gộp dữ liệu từ blogs.json và localStorage, tránh trùng lặp
        const mergedBlogs = [...jsonData, ...storedBlogs].reduce((acc, blog) => {
          if (!acc.find((b) => b.id === blog.id)) {
            acc.push(blog);
          }
          return acc;
        }, []);

        // Lọc bài chưa duyệt
        setBlogs(mergedBlogs.filter((blog) => !blog.isApproved));
      } catch (error) {
        message.error("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleApprove = (id) => {
    const storedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];
    const updatedBlogs = storedBlogs.map((blog) =>
      blog.id === id ? { ...blog, isApproved: true } : blog
    );

    localStorage.setItem("blogs", JSON.stringify(updatedBlogs));
    setBlogs(updatedBlogs.filter((blog) => !blog.isApproved));
    message.success("Bài viết đã được duyệt!");
  };

  // Hiển thị modal xem chi tiết bài viết
  const showModal = (blog) => {
    setSelectedBlog(blog);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedBlog(null);
    setModalVisible(false);
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
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

  return (
    <div className="approve-blogs-container">
      <Card className="approve-blogs-card">
        <h2>Duyệt Bài Viết</h2>
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <Table dataSource={blogs} columns={columns} rowKey="id" />
        )}
      </Card>

      <Modal title="Chi tiết bài viết" visible={modalVisible} onCancel={closeModal} footer={null}>
        {selectedBlog && (
          <div className="blog-detail-modal">
            <h3>{selectedBlog.title}</h3>
            <p><strong>Tác giả:</strong> {selectedBlog.author}</p>
            {selectedBlog.image && <img src={selectedBlog.image} alt={selectedBlog.title} className="blog-detail-image" />}
            <p>{selectedBlog.content}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApproveBlogs;
