import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./styling/Employee.css";

const Employee = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = () => {
    fetch("http://127.0.0.1:8000/api/users/", {
      method: "GET",
      headers: {
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
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <p>Loading employees...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="employee-container">
      <nav>
        <li>
          <Link to="/admin">Dashboard</Link>
        </li>
      </nav>
      <h2>All Employees</h2>
      {users.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.username}</td>
                <td>{emp.department || "N/A"}</td>
                {/* <td>{emp.department?.id || "N/A"}</td> */}
                {/* <td>{emp.department && emp.department.name ? emp.department.name : "N/A"}</td> */}
                {/* <td>
                  {emp.department && emp.department.name
                    ? emp.department.name
                    : "N/A"}
                </td> */}
                <td>{emp.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Employee;
