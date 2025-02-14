import React, { useState, useEffect } from "react";
import "./styling/Signup.css";
import HomeNavbar from "./HomeNavbar";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
  });

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/departments/")
      .then((response) => response.json())
      .then((data) => setDepartments(data))
      .catch((error) => console.error("Error fetching departments:", error));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (response.ok) {
      alert("Signup successful! Wait for admin approval.");
    } else {
      alert("Signup failed: " + JSON.stringify(data));
    }
  };

  return (
    <>
    <HomeNavbar />
      <div className="signup-container">
        <h2>Signup</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <select name="role" onChange={handleChange}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
          <select name="department" onChange={handleChange} required>
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </>
  );
};

export default Signup;
