import React from 'react';
import '../styles/Doctor.css';

const doctors = [
    {
        name: "Nguyễn Văn A",
        comment: "Đến với chúng tôi, làn da của bạn sẽ trở nên hoàn hảo từ sâu bên trong.",
        image: "https://th.bing.com/th/id/OIP.VjnDTh-qKV24EOxPOiKJvAHaLH?w=115&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
    },
    {
        name: "Nguyễn Văn B",
        comment: "Đẹp hơn mỗi ngày với những liệu trình chuyên sâu từ spa của chúng tôi.",
        image: "https://th.bing.com/th/id/OIP.DJDuwT98kRr_E8xKrq1HwgHaLI?w=115&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
    },
    {
        name: "Nguyễn Văn C",
        comment: "Hãy để chúng tôi chăm sóc bạn, để bạn có thể chăm sóc thế giới.",
        image: "https://th.bing.com/th/id/OIP.XLyQ5Pp5Io9SzR6LmF1yLAHaKo?w=137&h=197&c=7&r=0&o=5&dpr=1.3&pid=1.7"
    },
    {
        name: "Nguyễn Văn D",
        comment: "Chúng tôi không chỉ mang đến dịch vụ, mà còn là sự tận tâm.",
        image: "https://th.bing.com/th/id/OIP.Um8ILeEU-gjZ0xHU0pzSnQAAAA?pid=ImgDet&w=184&h=244&c=7&dpr=1.3"
    },
];

const DoctorProfiles = () => {
    return (
        <div className="container">
            <h2 className="title">Chuyên Viên Đồng Hành</h2>
            <div className="profiles">
                {doctors.map((doctor, index) => (
                    <div key={index} className="card">
                        <img src={doctor.image} alt={doctor.name} className="image" />
                        <h3 className="name">{doctor.name}</h3>
                        <p className="comment">{doctor.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorProfiles;