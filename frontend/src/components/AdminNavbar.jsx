import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styling/AdminNavbar.css';

const AdminNavbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userid");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/admin" className="nav-link">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/employee-list" className="nav-link">Employees</Link>
        </li>
        <li className="nav-item">
          <Link to="/admin-departments" className="nav-link">Departments</Link>
        </li>   
        <li className="nav-item">
          <Link to="/salary" className="nav-link">Payroll</Link>
        </li> 
        <li className="nav-item">
          <Link to="/dailylog" className="nav-link">Daily Logs</Link>
        </li> 
        <li className="nav-item logout-item">
          <button className="logout" onClick={logout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
