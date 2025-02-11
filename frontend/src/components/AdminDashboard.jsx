import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styling/AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const refreshData = () => {
    fetchUsers();
    fetchDepartments();
  };

  const fetchUsers = () => {
    fetch("http://127.0.0.1:8000/api/users/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      })
      .catch((err) => console.error("Error fetching users:", err));
  };

  const fetchDepartments = () => {
    fetch("http://127.0.0.1:8000/api/departments/")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((error) => console.error("Error fetching departments:", error));
  };

  const approveUser = (userId) => {
    fetch(`http://127.0.0.1:8000/api/approve-user/${userId}/`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to approve user: ${errorMessage}`);
        }
        return response.json();
      })
      .then(() => {
        fetchUsers();
      })
      .catch((error) => console.error("Error approving user:", error));
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="admin-dashboard">
      <nav>
        <ul>
          <li>
            <Link to="/admin-departments">Departments</Link>
          </li>
          <li>
            <Link to="/employee-list">Employee</Link>
          </li>
          <li>
            <Link to="/payroll">Payroll</Link>
          </li>
          <li>
            <Link to="/notifications">Notification</Link>
          </li>
          <li>
            <button onClick={refreshData}>Refresh Data</button>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
      <h1>Admin Dashboard</h1>
      <div>
        {/* Pending Approvals */}
        <h3>Pending Approvals</h3>
        <ul>
          {users
            .filter((user) => !user.is_approved)
            .map((user) => {
              const userDepartment =
                departments.find((dep) => dep.id === user.department_id)?.name ||
                "Unknown";
              return (
                <li key={user.id}>
                  {user.username} - {userDepartment} - {user.role}
                  <button onClick={() => approveUser(user.id)}>Approve</button>
                </li>
              );
            })}
        </ul>
      </div>
      <div className="dashboard-sections">
        <section>
          <h2>Employee Management</h2>
          <p>Keep track of all employees in your company</p>
          <Link to="/employee-list">
            <button>Manage Employees</button>
          </Link>
        </section>
        <section>
          <h2>Department Management</h2>
          <p>Create and manage departments.</p>
          <Link to="/admin-departments">
            <button>Manage Departments</button>
          </Link>
        </section>
        <section>
          <h2>Payroll Management</h2>
          <p>Process payroll and view payment history.</p>
          <Link to="/payroll">
            <button>Manage Payroll</button>
          </Link>
        </section>
        <section>
          <h2>Notifications and Alerts</h2>
          <p>Get alerts for important deadlines.</p>
          <Link to="/notifications">
            <button>View Alerts</button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
