import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import "./styling/Employee.css";

const Employee = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] =useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [updatedData, setUpdatedData] = useState({ department: "", role: "" });

  const token = localStorage.getItem("access_token");

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      const approvedUsers = Array.isArray(data)
        ? data.filter((user) => user.is_approved)
        : [];

      setUsers(approvedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user: " + err.message);
    }
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setUpdatedData({ department: user.department || "", role: user.role || "" });
  };

  const closeEditForm = () => {
    setEditingUser(null);
    setUpdatedData({ department: "", role: "" });
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/departments/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setDepartments(data);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/roles/", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json", 
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setRoles(data);
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };

    fetchRoles();
  }, []);

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${editingUser.id}/`, {
        method: "PATCH",
        headers: { 
          // Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedUser = await response.json();
      // setUsers(prevUsers => prevUsers.map((user) =>
      //   user.id === updatedUser.id ? updatedUser : user
      // ));
      setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      closeEditForm();
    } catch (err) {
      console.error("Error updating user:", err); 
      alert("Error updating user: " + err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
    <AdminNavbar />
    <div className="employee-container">
      <h2>All Employees</h2>

      {loading && <p>Loading employees...</p>}

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchUsers}>Retry</button>
        </div>
      )}

      {!loading && !error && users.length === 0 && <p>No approved employees found.</p>}

      {!loading && !error && users.length > 0 && (
        <div className="table-wrapper">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((emp) => (
                <tr
                  key={emp.id}
                  className={emp.role?.toLowerCase() === "manager" ? "manager" : ""}
                >
                  <td>{emp.username}</td>
                  <td>
                    {departments.find((dept) => dept.id === emp.department)?.name || "N/A"}
                  </td>
                  <td>{emp.role}</td>
                  <td>
                    <button onClick={() => openEditForm(emp)} className="edit-button">
                      Edit
                    </button>
                    <button onClick={() => deleteUser(emp.id)} className="delete-button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* <tbody>
              {users.map((emp) => (
                <tr
                  key={emp.id}
                  className={emp.role?.toLowerCase() === "manager" ? "manager" : ""}
                >
                  <td>{emp.username}</td>
                  <td>{emp.department || "N/A"}</td>
                  <td>{emp.role}</td>
                  <td>
                    <button onClick={() => openEditForm(emp)} className="edit-button">
                      Edit
                    </button>
                    <button onClick={() => deleteUser(emp.id)} className="delete-button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody> */}
          </table>
        </div>
      )}

      {editingUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Employee</h3>

            <label>Department:</label>
            <select
              value={updatedData.department}
              onChange={(e) =>
                setUpdatedData({ ...updatedData, department: e.target.value })
              }
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>


            <label>Role:</label>
            <select
              value={updatedData.role}
              onChange={(e) =>
                setUpdatedData({ ...updatedData, role: e.target.value })
              }
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.name} value={role.name}>{role.name}</option>
              ))}
            </select>


            <div className="modal-actions">
              <button
                onClick={() => handleUpdateUser(editingUser.id)}
                className="save-button"
              >
                Save
              </button>
              <button onClick={closeEditForm} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Employee;

