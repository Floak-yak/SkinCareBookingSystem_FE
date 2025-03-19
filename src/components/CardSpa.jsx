import React from "react";
import { Link } from "react-router-dom";
import "../styles/CardSpa.css";

const CardSpa = ({ id, serviceName, image }) => {
    return (
        <Link to={`/Services`} className="card-spa">
            <div className="card-spa-content">
                <img 
                    src={image || 'https://img.freepik.com/free-photo/woman-getting-treatment-spa_23-2149157871.jpg'} 
                    alt={serviceName} 
                />
                <div className="card-spa-body">
                    <h5 className="card-spa-title">{serviceName}</h5>
                </div>
            </div>
        </Link>
    );
};

export default CardSpa;