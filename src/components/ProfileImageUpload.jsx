// src/components/ProfileImageUpload.jsx
import React, { useState } from "react";
import { Upload, Button, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import imageApi from "../api/imageApi";

const ProfileImageUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleCustomRequest = async ({ file }) => {
    setUploading(true);
    try {
      const res = await imageApi.upload(file);
      console.log("Image upload response:", res.data);
      if (res.data && res.data.id) {
        message.success("Avatar uploaded successfully!");
        if (onUploadSuccess) {
          onUploadSuccess(res.data);
        }
      } else {
        message.error("Avatar upload failed!");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error.response?.data || error.message);
      message.error("Avatar upload failed!");
    }
    setUploading(false);
  };

  return (
    <Upload
      customRequest={handleCustomRequest}
      showUploadList={false}
      accept="image/*"
    >
      <Button icon={<UploadOutlined />} size="large" disabled={uploading}>
        {uploading ? <Spin /> : "Choose Avatar"}
      </Button>
    </Upload>
  );
};

export default ProfileImageUpload;
