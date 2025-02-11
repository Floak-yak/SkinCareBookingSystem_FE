import React from "react";
import { Link } from "react-router-dom"; // Dùng Link để chuyển trang nhanh hơn
import "../styles/CardSpa.css";

export default function CardSpa({ id, name, image }) {
    return (
        <Link to={`/Services`} className="card-spa">
            <div className="card-spa-content">
                <img src={image} alt={name} />
                <div className="card-spa-body">
                    <h5 className="card-spa-title">{name}</h5>
                </div>
            </div>
        </Link>
    );
}