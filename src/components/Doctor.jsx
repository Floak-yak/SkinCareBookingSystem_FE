import React from 'react';

const doctors = [
    { name: "Nguyễn Văn A", comment: "Đến với chúng tôi, làn da của bạn sẽ trở nên hoàn hảo từ sâu bên trong.", image: "https://th.bing.com/th/id/OIP.VjnDTh-qKV24EOxPOiKJvAHaLH?w=115&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7" },
    { name: "Nguyễn Văn B", comment: "Đẹp hơn mỗi ngày với những liệu trình chuyên sâu từ spa của chúng tôi.", image: "https://th.bing.com/th/id/OIP.DJDuwT98kRr_E8xKrq1HwgHaLI?w=115&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7" },
    { name: "Nguyễn Văn C", comment: "Hãy để chúng tôi chăm sóc bạn, để bạn có thể chăm sóc thế giới.", image: "https://th.bing.com/th/id/OIP.XLyQ5Pp5Io9SzR6LmF1yLAHaKo?w=137&h=197&c=7&r=0&o=5&dpr=1.3&pid=1.7" },
    { name: "Nguyễn Văn D", comment: "Chúng tôi không chỉ mang đến dịch vụ, mà còn là sự tận tâm.", image: "https://th.bing.com/th/id/OIP.Um8ILeEU-gjZ0xHU0pzSnQAAAA?pid=ImgDet&w=184&h=244&c=7&dpr=1.3" },
];

const DoctorProfiles = () => {
    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Chuyên Viên Đồng Hành</h2>
            <div style={styles.profiles}>
                {doctors.map((doctor, index) => (
                    <div key={index} style={styles.card}>
                        <img src={doctor.image} alt={doctor.name} style={styles.image} />
                        <h3 style={styles.name}>{doctor.name}</h3>
                        <p style={styles.comment}>{doctor.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { textAlign: 'center', padding: '20px', marginTop: '30px', marginBottom: '30px' },
    title: { fontSize: '2.5rem', marginBottom: '20px', color: "#f9b37a" },
    profiles: { display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' },
    card: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '10px', width: '250px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' },
    image: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' },
    name: { fontSize: '18px', fontWeight: 'bold', margin: '10px 0' },
    comment: { fontSize: '14px', color: '#555' },
};

export default DoctorProfiles;