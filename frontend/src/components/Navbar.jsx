import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styling/Navbar.css"; 

const Navbar = () => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // Could be "admin", "manager", or "employee"
  const navigate = useNavigate();

  // Function to handle logout: removes token and role, then navigates to home
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          Office Management
        </Link>
        <ul className="nav-links">
          {/* When not logged in, show Login and Signup */}
          {!token && (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">Signup</Link>
              </li>
            </>
          )}

          {/* When logged in as admin, show admin-specific links */}
          {token && userRole === "admin" && (
            <>
              <li>
                <Link to="/admin">Dashboard</Link>
              </li>
              <li>
                <Link to="/employees">Employees</Link>
              </li>
              <li>
                <Link to="/departments">Departments</Link>
              </li>
              <li>
                <Link to="/positions">Positions</Link>
              </li>
              <li>
                <Link to="/payroll">Payroll</Link>
              </li>
              <li>
                <Link to="/reports">Reports</Link>
              </li>
              <li>
                <Link to="/notifications">Alerts</Link>
              </li>
            </>
          )}

          {/* When logged in as manager, show manager-specific links */}
          {token && userRole === "manager" && (
            <>
              <li>
                <Link to="/manager">Dashboard</Link>
              </li>
              <li>
                <Link to="/team">Team</Link>
              </li>
              <li>
                <Link to="/projects">Projects</Link>
              </li>
              {/* Add more manager-specific links as needed */}
            </>
          )}

          {/* When logged in as employee, show employee-specific links */}
          {token && userRole === "employee" && (
            <>
              <li>
                <Link to="/employee">Dashboard</Link>
              </li>
              <li>
                <Link to="/employee/payments">Payment History</Link>
              </li>
            </>
          )}

          {/* Regardless of role, if a token exists, show the Logout button */}
          {token && (
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
