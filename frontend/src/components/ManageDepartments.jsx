import React, { useState, useEffect } from "react"; 
import "./styling/DepartmentManagement.css"; 
import AdminNavbar from "./AdminNavbar";

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

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/departments/${id}/`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete department");
      setDepartments(departments.filter((department) => department.id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div>
      <AdminNavbar />
      <h1 className="title">Department Management</h1>
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
        </div>
      )}

      {/* Modal Popup for Department Employees */}
      {selectedDepartment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setSelectedDepartment(null)}>
              &times;
            </button>
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
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
