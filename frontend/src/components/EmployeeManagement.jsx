import React, { useState, useEffect } from "react";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employees/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Error fetching employees:", err));
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/employees/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((newEmployee) => {
        setEmployees([...employees, newEmployee]);
        setFormData({ name: "", email: "", department: "", position: "" });
      })
      .catch((err) => console.error("Error adding employee:", err));
  };

  const handleDeleteEmployee = (userid) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    fetch(`http://127.0.0.1:8000/api/user/${userid}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setEmployees(employees.filter((emp) => emp.id !== userid));
      })
      .catch((err) => console.error("Error deleting employee:", err));
  };

  return (
    <div className="employee-management">
      <h1>Employee Management</h1>
      <form onSubmit={handleAddEmployee}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="Department"
          required
        />
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="Position"
          required
        />
        <button type="submit">Add Employee</button>
      </form>
      <ul>
        {employees.map((emp) => (
          <li key={emp.id}>
            {emp.name} - {emp.email} - {emp.department} - {emp.position}{" "}
            <button onClick={() => handleDeleteEmployee(emp.id)}>Delete</button>
            {/* Add an edit button and functionality as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeManagement;
