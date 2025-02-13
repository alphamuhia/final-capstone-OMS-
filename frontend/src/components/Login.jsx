import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styling/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    console.log("Login Response:", data);

    if (response.ok) {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("userid", data.id);
      alert("Login successful!");

      if (data.role === null) {
        if (data.is_superuser) {
          navigate("/admin");
        } else {
          alert("User role is missing. Please contact the admin.");
          navigate("/");
        }
      } else if (data.role.toLowerCase() === "manager") {
        navigate("/manager");
      } else if (
        ["employee", "team leader", "assistant manager"].includes(data.role.toLowerCase())
      ) {
        navigate("/employee");
      } else {
        alert("User role not recognized. Role received: " + data.role);
        navigate("/");
      }
    } else {
      alert("Login failed: " + JSON.stringify(data));
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
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
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
