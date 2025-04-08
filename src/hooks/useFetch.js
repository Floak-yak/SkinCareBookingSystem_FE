import { useState, useEffect } from "react";

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  // Update data function - now only works with direct API data
  const updateData = (newItem) => {
    const updatedData = [...data];

    const existingIndex = updatedData.findIndex((item) => item.id === newItem.id);
    if (existingIndex !== -1) {
      updatedData[existingIndex] = newItem; // Update item if it exists
    } else {
      updatedData.push(newItem); // Add new item
    }

    setData(updatedData);
  };

  return { data, loading, error, setData, updateData };
};

export default useFetch;
