import React from 'react'

export default function CardSpa({ id, name, image }) {
    return (
        <>
            <a
                href="http://localhost:3003/Services"
                style={{
                    textDecoration: "none",
                }}>
                <div
                    className="card"
                    style={{
                        backgroundColor: "#fff8f0",
                        borderRadius: "15px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        textAlign: "center",
                        padding: "15px",
                        margin: "10px",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        width: "300px",
                        // height: "400px",
                        overflow: "hidden",
                        flex: "0 0 auto", /* Ngăn không cho card co lại */
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                    }}
                >
                    <img
                        src={image}
                        className="card-img-top"
                        alt="..."
                        style={{
                            height: "180px",
                            width: "270px",//moi them
                            objectFit: "cover",
                            transition: "filter 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.9)")}
                        onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                    />
                    <div className="card-body" style={{ textAlign: "center", padding: "1.5rem" }}>
                        <h5 className="card-title" style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "#333" }}>
                            {name}
                        </h5>
                    </div>
                </div>
            </a>
        </>
    )
}