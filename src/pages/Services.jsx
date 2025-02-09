import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/services.css';

function Services() {
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      name: 'Chăm Sóc Da Cơ Bản',
      description: 'Liệu trình chăm sóc da cơ bản giúp làn da tươi mới và rạng rỡ',
      image: 'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2024/1/10/cham-soc-da-1-1704868931817515161230.jpeg',
      price: '499.000đ',
      duration: '60 phút',
      popular: true
    },
    {
      id: 2,
      name: 'Peel Da Chuyên Sâu',
      description: 'Điều trị chuyên sâu giúp cải thiện kết cấu và tông màu da',
      image: 'https://images-1.eucerin.com/~/media/eucerin/local/vn/but-tri-mun/but-tri-mun-1.jpg?la=vi-vn',
      price: '1.200.000đ',
      duration: '45 phút',
      popular: false
    },
    {
      id: 3,
      name: 'Trị Liệu Ánh Sáng LED',
      description: 'Công nghệ ánh sáng tiên tiến điều trị các vấn đề về da',
      image: 'https://o2skin.vn/wp-content/uploads/2024/05/ipl-trong-dieu-tri-da-lieu-4.jpg',
      price: '799.000đ',
      duration: '30 phút',
      popular: false
    },
    {
      id: 4,
      name: 'Massage Mặt Thư Giãn',
      description: 'Liệu pháp massage mặt giúp thư giãn và trẻ hóa làn da',
      image: 'https://images2.thanhnien.vn/zoom/700_438/Uploaded/quochung.qc/2018_09_22/MH2/1_RITY.jpg',
      price: '600.000đ',
      duration: '45 phút',
      popular: false
    },
    {
      id: 5,
      name: 'Điều Trị Mụn Chuyên Sâu',
      description: 'Phương pháp điều trị mụn hiệu quả, ngăn ngừa tái phát',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtL49DA8ovO8EnOCS-0zC6qp-XBNS-cVVDGQ&s',
      price: '900.000đ',
      duration: '60 phút',
      popular: false
    },
    {
      id: 6,
      name: 'Trẻ Hóa Da',
      description: 'Liệu trình trẻ hóa da toàn diện, giảm nếp nhăn',
      image: 'https://ritana.com.vn/files/image/4442-nang-co-mat-tre-hoa-da-5.jpg',
      price: '1.500.000đ',
      duration: '90 phút',
      popular: false
    },
    {
      id: 7,
      name: 'Điều Trị Nám - Tàn Nhang',
      description: 'Giải pháp hiệu quả cho da bị nám và tàn nhang',
      image: 'https://cdn.nhathuoclongchau.com.vn/unsafe/https://cms-prod.s3-sgn09.fptcloud.com/smalls/nguyen_nhan_gay_ra_nam_tan_nhang_o_phu_nu_1_a79db0ea52.jpg',
      price: '1.200.000đ',
      duration: '75 phút',
      popular: false
    },
    {
      id: 8,
      name: 'Tẩy Tế Bào Chết',
      description: 'Loại bỏ tế bào chết, làm sáng và mịn da',
      image: 'https://media.hasaki.vn/hsk/tay-te-bao-chet-da-mat-2.jpg',
      price: '400.000đ',
      duration: '45 phút',
      popular: false
    },
    {
      id: 9,
      name: 'Chăm Sóc Da Nhạy Cảm',
      description: 'Liệu trình đặc biệt cho da nhạy cảm và dễ kích ứng',
      image: 'https://cdn.nhathuoclongchau.com.vn/unsafe/800x0/https://cms-prod.s3-sgn09.fptcloud.com/da_nhay_cam_co_nen_peel_da_khong_bi_quyet_cham_soc_cho_lan_da_nhay_cam_1_ef8a850576.jpg',
      price: '700.000đ',
      duration: '60 phút',
      popular: false
    },
    {
        id: 10,
        name: 'Dưỡng Ẩm Chuyên Sâu',
        description: 'Liệu trình giúp cấp ẩm tối ưu cho làn da khô ráp và thiếu nước',
        image: 'https://i.vietgiaitri.com/2019/9/21/my-nhan-han-dien-style-ma-nu-danh-son-den-van-duoc-khen-dep-2-713e02.jpg',
        price: '900.000đ',
        duration: '50 phút',
        popular: false
      },
      {
        id: 11,
        name: 'Nâng Cơ Mặt',
        description: 'Phương pháp nâng cơ giúp da săn chắc, chống lão hóa',
        image: 'https://gangnam.com.vn/wp-content/uploads/2020/09/dai-nang-co-mat-co-hieu-qua-nhu-loi-don-1.jpg',
        price: '1.300.000đ',
        duration: '75 phút',
        popular: false
      },
      {
        id: 12,
        name: 'Làm Dịu Da Sau Laser',
        description: 'Liệu trình phục hồi và làm dịu da sau khi điều trị bằng laser',
        image: 'https://images-1.eucerin.com/~/media/eucerin/local/vn/phuc-hoi-da/phuc-hoi-da-1.jpg?la=vi-vn',
        price: '1.000.000đ',
        duration: '60 phút',
        popular: false
      }      
  ];

  const handleBooking = (service) => {
    navigate('/booking', { state: service });
  };

  return (
    <div className="services-page">
      <div className="services-header">
        <h1>Dịch Vụ Của Chúng Tôi</h1>
        <p>Trải nghiệm các liệu trình chăm sóc da cao cấp</p>
      </div>

      <div className="services-container">
        {services.map(service => (
          <div key={service.id} className={`service-item ${service.popular ? 'popular' : ''}`}>
            {service.popular && <span className="popular-tag">Phổ Biến Nhất</span>}  
            <div className="service-icon">{service.icon}</div>
            <h2>{service.name}</h2>
            <img src={service.image} alt={service.name} className="service-image" />
            <p className="service-description">{service.description}</p>
            <p className="service-price">Giá: {service.price}</p>
            <p className="service-duration">Thời gian: {service.duration}</p>
            <button className="book-service-btn" onClick={() => handleBooking(service)}>
              Đặt Lịch Ngay
            </button>
            <Link to={`/service/${service.id}`} className="view-details-btn">Xem Chi Tiết</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;
