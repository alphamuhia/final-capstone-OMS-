import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./styling/DepartmentManagement.css"; 

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/departments/");
        if (!response.ok) throw new Error("Failed to fetch departments");
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch Employees for Selected Department
  useEffect(() => {
    if (!selectedDepartment) return;
    const fetchDepartmentEmployees = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/users/department/${selectedDepartment}/`);
        if (!response.ok) throw new Error("Failed to fetch employees");
        const data = await response.json();
        setDepartmentEmployees(data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchDepartmentEmployees();
  }, [selectedDepartment]);
  
  // Add a New Department
  const handleAddDepartment = async () => {
    if (!newDepartmentName) return alert("Please provide a department name");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/departments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDepartmentName }),
      });
      if (!response.ok) throw new Error("Failed to add department");
      const newDepartment = await response.json();
      setDepartments([...departments, newDepartment]);
      setNewDepartmentName("");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Delete a Department
  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/departments/${id}/`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete department");
      setDepartments(departments.filter((department) => department.name !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div>
      <nav>
        <li><Link to="/admin">Dashboard</Link></li>
      </nav>
      <h1>Department Management</h1>
      {loading && <p>Loading data...</p>}
      {error && <p className="error">Error: {error}</p>}
      {!loading && !error && (
        <div className="department-container">
          <div className="department-list">
            <h2>Departments</h2>
            <ul>
              {departments.map((department) => (
                <li key={department.id}>
                  {department.name}
                  <span>
                    <button onClick={() => handleDeleteDepartment(department.id)}>Delete</button>
                    <button onClick={() => setSelectedDepartment(department.id)}>View Employees</button>
                  </span>
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              placeholder="New department name"
            />
            <button className="add-department" onClick={handleAddDepartment}>Add Department</button>
          </div>
          <div className="department-details">
            {selectedDepartment ? (
              <div className="department-card">
                {/* <h2>{selectedDepartment} Employees</h2> */}
                <h2>
                  {departments.find((dept) => dept.id === selectedDepartment)?.name} Employees
                </h2>
                {departmentEmployees.length > 0 ? (
                  <ul>
                    {departmentEmployees.map((emp) => (
                      <li key={emp.id}>
                        {emp.username} - {emp.role}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No employees in this department</p>
                )}
              </div>
            ) : (
              <p>Select a department to view employees</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
