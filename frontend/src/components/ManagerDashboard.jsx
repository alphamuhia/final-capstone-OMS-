import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styling/ManagerDashboard.css"; 

const ManagerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [advanceRequests, setAdvanceRequests] = useState([]);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userid");
    navigate("/login");
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/profile/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error(err));
  }, [token]);

  useEffect(() => {
    if (profile && profile.department) {
      fetch(`http://127.0.0.1:8000/api/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setEmployees(data))
        .catch((err) => console.error(err));
    }
  }, [profile, token]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/tasks/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const deptTasks = data.filter(
          (task) =>
            task.assigned_to &&
            task.assigned_to.department === profile?.department
        );
        setTasks(deptTasks);
      })
      .catch((err) => console.error(err));
  }, [token, profile]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/leave-requests/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLeaveRequests(data);
        } else if (data.results) {
          setLeaveRequests(data.results);
        } else {
          console.error("Unexpected data format for leave requests:", data);
          setLeaveRequests([]);
        }
      })
      .catch((err) => console.error(err));
  }, [token]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/advance-requests/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAdvanceRequests(data);
        } else if (data.results) {
          setAdvanceRequests(data.results);
        } else {
          console.error("Unexpected data format for advance requests:", data);
          setAdvanceRequests([]);
        }
      })
      .catch((err) => console.error(err));
  }, [token]);

  // Fetch attendance for a specific employee
  const fetchAttendance = (employeeId) => {
    fetch(`http://127.0.0.1:8000/api/employee/attendance-summary/?user=${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const uniqueDays = new Set(
          data.map((entry) => new Date(entry.clock_in).toLocaleDateString())
        );
        const present = uniqueDays.size;
        const absent = 22 - present; // Assuming a 22-day working period
        setAttendance((prev) => ({ ...prev, [employeeId]: { present, absent } }));
      })
      .catch((err) => console.error(err));
  };

  // Approve a request (leave or advance) by calling the appropriate endpoint
  const approveRequest = (reqId, requestType) => {
    let endpoint = "";
    if (requestType === "leave") {
      endpoint = `http://127.0.0.1:8000/api/leave-requests/${reqId}/approve/`;
    } else if (requestType === "advance") {
      endpoint = `http://127.0.0.1:8000/api/advance-requests/${reqId}/approve/`;
    }
    fetch(endpoint, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
    })
      .then((res) => res.json())
      .then(() => {
        if (requestType === "leave") {
          setLeaveRequests((prev) => prev.filter((r) => r.id !== reqId));
        } else if (requestType === "advance") {
          setAdvanceRequests((prev) => prev.filter((r) => r.id !== reqId));
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="manager-dashboard">
      <header>
        <h2>Manager Dashboard</h2>
        <button className="logout" onClick={logout}>Logout</button>
      </header>
      {/* Display the manager's department (adjust the property name as needed) */}
      <p className="dep-title">Department: {profile?.department || "N/A"}</p>
      
      <h3>Employees</h3>
      <ul>
        {profile &&
          employees
            .filter((emp) => emp.department === profile.department)
            .map((emp) => (
              <li key={emp.id}>
                <strong>{emp.username}</strong> —{" "}
                {attendance[emp.id]
                  ? `${attendance[emp.id].present} present / ${attendance[emp.id].absent} absent`
                  : "Attendance: N/A"}
                {" "}
                <button onClick={() => fetchAttendance(emp.id)}>Fetch Attendance</button>
              </li>
            ))}
      </ul>

      {/* Uncomment the tasks section if you want to display department tasks */}
      {/*
      <h3>Department Tasks</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{task.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      */}

      <h3>Pending Leave Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Details</th>
            <th>Status</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((req) => (
            <tr key={req.id}>
              <td>{req.user_username}</td>
              <td>{req.details}</td>
              <td>{req.status}</td>
              <td>
                {req.status === "pending" && (
                  <button onClick={() => approveRequest(req.id, "leave")}>
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Pending Advance Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Details</th>
            <th>Status</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          {advanceRequests.map((req) => (
            <tr key={req.id}>
              <td>{req.user_username}</td>
              <td>{req.details}</td>
              <td>{req.status}</td>
              <td>
                {req.status === "pending" && (
                  <button onClick={() => approveRequest(req.id, "advance")}>
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerDashboard;
