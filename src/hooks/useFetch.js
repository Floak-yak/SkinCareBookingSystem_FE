import { useState, useEffect } from "react";

const useFetch = (url, localStorageKey = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        const jsonData = await response.json();

        // Lấy dữ liệu từ localStorage nếu có
        const storedData = localStorageKey
          ? JSON.parse(localStorage.getItem(localStorageKey)) || []
          : [];

        // Hợp nhất dữ liệu mà không bị trùng lặp
        const mergedData = [...jsonData];

        storedData.forEach((item) => {
          if (!mergedData.some((existing) => existing.id === item.id)) {
            mergedData.push(item);
          }
        });

        setData(mergedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, localStorageKey]);

  // Cập nhật dữ liệu mà không làm mất dữ liệu mock
  const updateData = (newItem) => {
    const updatedData = [...data];

    const existingIndex = updatedData.findIndex((item) => item.id === newItem.id);
    if (existingIndex !== -1) {
      updatedData[existingIndex] = newItem; // Cập nhật bài viết nếu đã tồn tại
    } else {
      updatedData.push(newItem); // Thêm mới nếu chưa có
    }

    setData(updatedData);
    if (localStorageKey) {
      localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
    }
  };

  return { data, loading, error, setData, updateData };
};

export default useFetch;
