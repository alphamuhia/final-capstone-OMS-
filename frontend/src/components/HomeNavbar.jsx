import React from 'react';
import { Link } from 'react-router-dom';
import './styling/HomeNavbar.css';

function HomeNavbar() {
  return (
    <nav className="home-navbar">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/" className="nav-link">Home</Link>
        </li>
        <li className="nav-item login-item">
          <Link to="/login" className="nav-link">Login</Link>
        </li>
        <li className="nav-item">
          <Link to="/signup" className="nav-link">Register</Link>
        </li>
      </ul>
    </nav>
  );
}

export default HomeNavbar;
