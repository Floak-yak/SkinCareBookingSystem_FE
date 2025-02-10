import React from "react";

const AboutUs = () => {
    const styles = {
        section: {
            backgroundColor: "#ffffff",
            padding: "80px 20px",
            textAlign: "center",
        },
        container: {
            maxWidth: "1200px",
            margin: "0 auto",
        },
        title: {
            fontSize: "2.5rem",
            // color: "#333",
            color: "#f9b37a",

            marginBottom: "40px",
            fontWeight: "bold",

        },
        cardsWrapper: {
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
        },
        card: {
            width: "calc(33.333% - 20px)",
            backgroundColor: "#fff8f0",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            border: "1px solid #f4a261",
        },
        image: {
            width: "80px",
            height: "80px",
            objectFit: "cover",
            marginBottom: "15px",
            borderRadius: "50%",
            border: "2px solid #f4a261",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        },
        cardTitle: {
            fontSize: "1.5rem",
            color: "#333",
            marginBottom: "10px",
            fontWeight: "bold",
        },
        cardDescription: {
            fontSize: "1rem",
            color: "#666",
            lineHeight: "1.6",
        },
    };

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <h2 style={styles.title}>Tại Sao Nên Chọn Rose Spa</h2>
                <div style={styles.cardsWrapper}>
                    <div style={styles.card}>
                        <img
                            src="https://rebibeauty.com/wp-content/uploads/2024/03/1-1.webp"
                            alt="Natural Products"
                            style={styles.image}
                        />
                        <h3 style={styles.cardTitle}>Natural Products</h3>
                        <p style={styles.cardDescription}>
                            Chúng tôi sử dụng 100% dược mỹ phẩm tự nhiên, đảm bảo an toàn và phù hợp với mọi loại da.
                        </p>
                    </div>
                    <div style={styles.card}>
                        <img
                            src="https://rebibeauty.com/wp-content/uploads/2024/03/2-1.webp"
                            alt="Experienced Staff"
                            style={styles.image}
                        />
                        <h3 style={styles.cardTitle}>Experienced Staff</h3>
                        <p style={styles.cardDescription}>
                            Đội ngũ chuyên viên được đào tạo chuyên nghiệp, tận tâm và giàu kinh nghiệm.
                        </p>
                    </div>
                    <div style={styles.card}>
                        <img
                            src="https://rebibeauty.com/wp-content/uploads/2024/03/3-1.webp"
                            alt="Relaxing Space"
                            style={styles.image}
                        />
                        <h3 style={styles.cardTitle}>Relaxing Space</h3>
                        <p style={styles.cardDescription}>
                            Không gian thư giãn, ấm cúng, mang lại cảm giác thoải mái và dễ chịu nhất.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
