import React from 'react';
import '../styles/Contact.css';

function Contact() {
  return (
    <div className="contact section">
      <div className="container">
        <h1 className="section-title">Contact Us</h1>
        <div className="contact-content">
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <p>
              <i className="fas fa-map-marker-alt"></i>
              123 Beauty Street, Spa City, SC 12345
            </p>
            <p>
              <i className="fas fa-phone"></i>
              (555) 123-4567
            </p>
            <p>
              <i className="fas fa-envelope"></i>
              info@skincareclinic.com
            </p>
          </div>
          <form className="contact-form">
            <div className="form-group">
              <input type="text" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Your Email" required />
            </div>
            <div className="form-group">
              <input type="tel" placeholder="Your Phone" />
            </div>
            <div className="form-group">
              <textarea placeholder="Your Message" rows="5" required></textarea>
            </div>
            <button type="submit" className="submit-button">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact; 