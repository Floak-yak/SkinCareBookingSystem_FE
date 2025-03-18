import React, { useState, useEffect } from 'react';
import '../styles/Doctor.css';
import doctorApi from '../api/doctorApi';

const DoctorProfiles = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div className="container">
            <h2 className="title">Chuyên Viên Đồng Hành</h2>
            <div className="profiles">
                {doctors.map((doctor) => (
                    <div key={doctor.id} className="card">
                        <img
                            src={doctor.imageData?.bytes ? `data:image/${doctor.imageData.fileExtension.replace('.', '')};base64,${doctor.imageData.bytes}` : 'https://img.freepik.com/premium-photo/photo-smiling-female-doctor-gray-background_849827-101.jpg'}
                            alt={doctor.fullName}
                            className="image"
                            onError={(e) => {
                                console.log('Image load error for doctor:', doctor.fullName);
                                e.target.src = 'https://img.freepik.com/premium-photo/photo-smiling-female-doctor-gray-background_849827-101.jpg';
                            }}
                        />
                        <h3 className="name">{doctor.fullName}</h3>
                        <p className="comment">{doctor.description || 'Chuyên gia với nhiều năm kinh nghiệm trong lĩnh vực chăm sóc da.'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorProfiles;