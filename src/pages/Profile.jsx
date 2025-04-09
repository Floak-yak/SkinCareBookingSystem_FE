import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  DatePicker,
  Spin,
  Card,
} from "antd";
import moment from "moment";
import userApi from "../api/userApi";
import useAuth from "../hooks/useAuth";
import "../styles/Profile.css";

// Helper function: chuyển URL sang File (sử dụng cho ảnh mặc định)
async function urlToFile(url, filename, mimeType) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType });
}

const Profile = () => {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [form] = Form.useForm();
  const [initLoading, setInitLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // Không sử dụng state avatarFile vì ta ẩn luôn phần upload ảnh

  // Hàm lấy userId từ context; nếu không có, dùng user.id
  const getUserId = () => user?.userId || user?.id;

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = getUserId();
      if (user && userId) {
        try {
          const res = await userApi.getUserById(userId);
          if (res.data) {
            setUserDetails(res.data);
            form.setFieldsValue({
              fullName: res.data.fullName,
              email: res.data.email,
              phoneNumber: res.data.phoneNumber,
              doB: res.data.yearOfBirth ? moment(res.data.yearOfBirth) : null,
              paymentMethod: res.data.paymentMethod,
              paymentNumber: res.data.paymentNumber
                ? new TextDecoder().decode(res.data.paymentNumber)
                : "",
            });
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          message.error("Failed to load user information");
        }
      }
      setInitLoading(false);
    };

    fetchUserDetails();
  }, [user, form]);

  if (initLoading || !userDetails) {
    return (
      <div className="profile-container">
        <Spin tip="Loading user information..." />
      </div>
    );
  }

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    form.setFieldsValue({
      fullName: userDetails.fullName,
      email: userDetails.email,
      phoneNumber: userDetails.phoneNumber,
      doB: userDetails.yearOfBirth ? moment(userDetails.yearOfBirth) : null,
      paymentMethod: userDetails.paymentMethod,
      paymentNumber: userDetails.paymentNumber
        ? new TextDecoder().decode(userDetails.paymentNumber)
        : "",
    });
    setEditMode(false);
  };

  const onFinish = async (values) => {
    const userId = getUserId();
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("FullName", values.fullName);
    formData.append("Email", values.email);
    formData.append("PhoneNumber", values.phoneNumber);
    formData.append("YearOfBirth", values.doB.format("YYYY-MM-DD"));
    formData.append("PaymentMethod", values.paymentMethod || "");
    formData.append("PaymentNumber", values.paymentNumber || "");

    // Vì BE yêu cầu bắt buộc có trường Image,
    // chúng ta dùng ảnh mặc định nếu người dùng không upload ảnh mới.
    const defaultAvatarUrl = "/default-avatar.png"; // Ảnh mặc định nằm trong folder public
    let fileToUpload;
    try {
      fileToUpload = await urlToFile(defaultAvatarUrl, "default-avatar.png", "image/png");
    } catch (err) {
      console.error("Error converting default avatar URL to file:", err);
      message.error("Có lỗi khi xử lý ảnh avatar mặc định");
      setSubmitLoading(false);
      return;
    }
    formData.append("Image", fileToUpload);

    // Debug: in ra các entry của FormData để kiểm tra
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    setSubmitLoading(true);
    try {
      await userApi.updateProfile(formData);
      const res = await userApi.getUserById(userId);
      if (res.data) {
        setUserDetails(res.data);
        form.setFieldsValue({
          fullName: res.data.fullName,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber,
          doB: res.data.yearOfBirth ? moment(res.data.yearOfBirth) : null,
          paymentMethod: res.data.paymentMethod,
          paymentNumber: res.data.paymentNumber
            ? new TextDecoder().decode(res.data.paymentNumber)
            : "",
        });
        message.success("Profile updated successfully");
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    }
    setSubmitLoading(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>
      {!editMode ? (
        <Card className="profile-card">
          <div className="profile-avatar">
            {userDetails.avatarUrl ? (
              <img
                src={userDetails.avatarUrl}
                alt="Avatar"
                className="profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar-placeholder">No Avatar</div>
            )}
          </div>
          <p>
            <strong>Full Name:</strong> {userDetails.fullName || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {userDetails.email || "N/A"}
          </p>
          <p>
            <strong>Phone Number:</strong> {userDetails.phoneNumber || "N/A"}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {userDetails.yearOfBirth
              ? moment(userDetails.yearOfBirth).format("DD/MM/YYYY")
              : "N/A"}
          </p>
          <p>
            <strong>Payment Method:</strong> {userDetails.paymentMethod || "N/A"}
          </p>
          <p>
            <strong>Payment Number:</strong>{" "}
            {userDetails.paymentNumber
              ? new TextDecoder().decode(userDetails.paymentNumber)
              : "N/A"}
          </p>
          <Button type="primary" onClick={handleEdit}>
            Edit Info
          </Button>
        </Card>
      ) : (
        <Form
          className="profile-form"
          form={form}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Date of Birth"
            name="doB"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
          >
            <DatePicker format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            label="Payment Method"
            name="paymentMethod"
            rules={[{ required: true, message: "Vui lòng nhập phương thức thanh toán!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Payment Number"
            name="paymentNumber"
            rules={[{ required: true, message: "Vui lòng nhập số tài khoản thanh toán!" }]}
          >
            <Input />
          </Form.Item>
          {/* Ẩn luôn phần upload ảnh, không hiển thị giao diện upload */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              style={{ marginRight: "8px" }}
            >
              Save Changes
            </Button>
            <Button onClick={handleCancelEdit}>Cancel</Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default Profile;
