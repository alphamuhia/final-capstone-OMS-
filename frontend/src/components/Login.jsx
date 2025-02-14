import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styling/Login.css";
import HomeNavbar from "./HomeNavbar";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  // Update form state when inputs change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission and login
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
      // Store tokens in localStorage
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("userid", data.id);
      alert("Login successful!");

      // Role-based navigation
      if (data.role === null) {
        if (data.is_superuser) {
          navigate("/admin");
        } else {
          alert("User role is missing. Please contact the admin.");
          navigate("/");
        }
      } else if (
        ["employee", "manager", "team leader", "assistant manager"].includes(data.role.toLowerCase())
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

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      console.error("No refresh token available.");
      return;
    }

    const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("access_token", data.access);
      console.log("Access token refreshed!");
    } else {
      console.error("Failed to refresh token:", data);
    }
  };

  return (
    <>
      <HomeNavbar />
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
    </>
  );
};

export default Login;
