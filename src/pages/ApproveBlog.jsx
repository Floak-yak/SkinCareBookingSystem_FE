import { useState } from "react";
import { Table, Button, message, Spin, Card, Modal } from "antd";
import "../styles/approveBlog.css";
import useFetch from "../hooks/useFetch";

const ApproveBlogs = () => {
  const { data: allBlogs, loading, updateData } = useFetch("/data/blogs.json", "blogs");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const pendingBlogs = allBlogs.filter(blog => !blog.isApproved);

  const handleApprove = (id) => {
    const blogToApprove = allBlogs.find(blog => blog.id === id);
    if (!blogToApprove) return;

    const updatedBlog = { ...blogToApprove, isApproved: true };
    updateData(updatedBlog);

    message.success("Bài viết đã được duyệt!");
  };

  const showModal = (blog) => {
    setSelectedBlog(blog);
    setModalVisible(true);
  };

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
          <Button type="link" onClick={() => showModal(record)}>Xem chi tiết</Button>
          <Button type="primary" onClick={() => handleApprove(record.id)}>Duyệt bài</Button>
        </>
      ),
    },
  ];

  return (
    <div className="approve-blogs-container">
      <Card className="approve-blogs-card">
        <h2>Duyệt Bài Viết</h2>
        {loading ? <Spin size="large" /> : <Table dataSource={pendingBlogs} columns={columns} rowKey="id" />}
      </Card>
      <Modal title="Chi tiết bài viết" visible={modalVisible} onCancel={closeModal} footer={null}>
        {selectedBlog && <p>{selectedBlog.content}</p>}
      </Modal>
    </div>
  );
};

export default ApproveBlogs;
