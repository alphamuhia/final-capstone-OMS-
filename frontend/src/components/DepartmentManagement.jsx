import React, { useState, useEffect } from "react";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/departments/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Error fetching departments:", err));
  }, [token]);

  const handleAddDepartment = (e) => {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/departments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newDepartment }),
    })
      .then((res) => res.json())
      .then((dept) => {
        setDepartments([...departments, dept]);
        setNewDepartment("");
      })
      .catch((err) => console.error("Error adding department:", err));
  };

  const handleDeleteDepartment = (id) => {
    if (!window.confirm("Are you sure?")) return;
    fetch(`http://127.0.0.1:8000/api/departments/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setDepartments(departments.filter((dept) => dept.id !== id));
      })
      .catch((err) => console.error("Error deleting department:", err));
  };

  return (
    <div className="department-management">
      <h1>Department Management</h1>
      <form onSubmit={handleAddDepartment}>
        <input
          type="text"
          value={newDepartment}
          onChange={(e) => setNewDepartment(e.target.value)}
          placeholder="Department Name"
          required
        />
        <button type="submit">Add Department</button>
      </form>
      <ul>
        {departments.map((dept) => (
          <li key={dept.id}>
            {dept.name}{" "}
            <button onClick={() => handleDeleteDepartment(dept.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DepartmentManagement;
