import React, { useState, useEffect } from 'react';
import '../styles/Skintherapist.css'; // File CSS sẽ được thêm sau
import doctorApi from '../api/doctorApi';
import categoryApi from '../api/categoryApi';

const DoctorsList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryApi.getAll();
                const categoriesData = response.data.data || [];
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    // Hàm tìm chuyên ngành dựa trên categoryId
    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.categoryName : 'Không xác định';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both doctors and images in parallel
                const [doctorsResponse, imagesResponse] = await Promise.all([
                    doctorApi.getAllDoctors(),
                    doctorApi.getAllImages()
                ]);

                // Create a map of images by id for faster lookup
                const imagesMap = imagesResponse.data.reduce((acc, img) => {
                    acc[img.id] = img;
                    return acc;
                }, {});

                // Map doctors with their corresponding images
                const doctorsWithImages = doctorsResponse.data.map(doctor => ({
                    ...doctor,
                    imageData: imagesMap[doctor.id] || null
                }));

                setDoctors(doctorsWithImages);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải thông tin bác sĩ');
                setLoading(false);
                console.error('Error fetching data:', err);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;

    // Định dạng ngày sinh
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="list-container">
            <h1>Danh sách chuyên viên</h1>
            <div className="doctors-grid">
                {doctors.length === 0 ? (
                    <p>Không có chuyên viên nào để hiển thị.</p>
                ) : (
                    doctors.map((doctor) => {
                        return (
                            <div key={doctor.id} className="doctors-card">
                                <div className="doctor-profile">
                                    <div className="doctor-info">
                                        <h2>{doctor.fullName}</h2>
                                        <div className="info-item">
                                            <label>Ngày sinh: </label>
                                            <span>{formatDate(doctor.yearOfBirth)}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Email: </label>
                                            <span>{doctor.email}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Số điện thoại: </label>
                                            <span>{doctor.phoneNumber}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Chuyên ngành: </label>
                                            <span>{getCategoryName(doctor.categoryId)}</span>
                                        </div>
                                    </div>

                                    <div className="image-wrapper">
                                        {doctor.imageData ? (
                                            <img
                                                src={
                                                    doctor.imageData?.bytes
                                                        ? `data:image/${doctor.imageData.fileExtension.replace('.', '')};base64,${doctor.imageData.bytes}`
                                                        : 'https://img.freepik.com/premium-photo/photo-smiling-female-doctor-gray-background_849827-101.jpg'
                                                }
                                                alt={doctor.fullName}
                                                className="profile-image"
                                                onError={(e) => {
                                                    console.log('Image load error:', doctor.fullName);
                                                    e.target.src =
                                                        'https://img.freepik.com/premium-photo/photo-smiling-female-doctor-gray-background_849827-101.jpg';
                                                }}
                                            />
                                        ) : (
                                            <div className="image-placeholder">
                                                <p>(Chưa có hình ảnh)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DoctorsList;