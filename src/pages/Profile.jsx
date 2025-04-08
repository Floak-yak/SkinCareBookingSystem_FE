import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, DatePicker, Spin, Card } from "antd";
import moment from "moment";
import userApi from "../api/userApi";
import useAuth from "../hooks/useAuth";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form] = Form.useForm();
  const [initLoading, setInitLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user && user.userId) {
        try {
          const res = await userApi.getUserById(user.userId);
          if (res.data) {
            setUser(res.data);
            form.setFieldsValue({
              fullName: res.data.fullName,
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
  }, [user?.userId, form, setUser]);

  if (initLoading || !user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Spin tip="Loading user information..." />
      </div>
    );
  }

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    form.setFieldsValue({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      doB: user.yearOfBirth ? moment(user.yearOfBirth) : null,
      paymentMethod: user.paymentMethod,
      paymentNumber: user.paymentNumber
        ? new TextDecoder().decode(user.paymentNumber)
        : "",
    });
    setEditMode(false);
  };

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("userId", user.userId);
    formData.append("FullName", values.fullName);
    formData.append("PhoneNumber", values.phoneNumber);
    formData.append("YearOfBirth", values.doB.format("YYYY-MM-DD"));
    formData.append("PaymentMethod", values.paymentMethod || "");
    formData.append("PaymentNumber", values.paymentNumber || "");

    setSubmitLoading(true);
    try {
      await userApi.updateProfile(formData);
      const res = await userApi.getUserById(user.userId);
      if (res.data) {
        setUser(res.data);
        form.setFieldsValue({
          fullName: res.data.fullName,
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
          <p>
            <strong>Full Name:</strong> {user.fullName || "N/A"}
          </p>
          <p>
            <strong>Phone Number:</strong> {user.phoneNumber || "N/A"}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {user.yearOfBirth
              ? moment(user.yearOfBirth).format("DD/MM/YYYY")
              : "N/A"}
          </p>
          <p>
            <strong>Payment Method:</strong> {user.paymentMethod || "N/A"}
          </p>
          <p>
            <strong>Payment Number:</strong>{" "}
            {user.paymentNumber
              ? new TextDecoder().decode(user.paymentNumber)
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
            label="Phone Number"
            name="phoneNumber"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
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
            rules={[
              { required: true, message: "Vui lòng nhập phương thức thanh toán!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Payment Number"
            name="paymentNumber"
            rules={[
              { required: true, message: "Vui lòng nhập số tài khoản thanh toán!" },
            ]}
          >
            <Input />
          </Form.Item>
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
