import React from "react";
import { Link } from "react-router-dom";
import "./styling/Home.css"; 
import HomeNavbar from "./HomeNavbar";

const Home = () => {
  return (
    <>
    <HomeNavbar />
      <div>
        <section className="hero">
          <div className="hero-content">
            <h1>Welcome to Office Management Solutions</h1>
            <p>Streamline your office tasks with our cutting-edge management system.</p>
            <Link to="/signup" className="cta-button">Get Started</Link>
          </div>
        </section>

        <section className="about">
          <div className="container">
            <h2>About Us</h2>
            <p>
              At Office Management Solutions, we help businesses optimize their workflow by providing an
              all-in-one platform for employee and task management.
            </p>
          </div>
        </section>

        <section className="services">
          <div className="container">
            <h2>Our Services</h2>
            <div className="service-grid">
              <div className="service-card">
                <h3>Admin Overview</h3>
                <p>Automate repetitive office tasks and increase efficiency.</p>
              </div>
              <div className="service-card">
                <h3>Employee Management</h3>
                <p>Assign roles and monitor employee progress with ease.</p>
              </div>
              <div className="service-card">
                <h3>Data Analytics</h3>
                <p>Gain insights into your business performance with advanced analytics.</p>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="footer">
            <p>&copy; 2021 Office Management Solutions. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
