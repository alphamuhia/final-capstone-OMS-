import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styling/ManagerDashboard.css";

const ManagerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [advanceRequests, setAdvanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userid");
    navigate("/login");
  };

  // Helper: get employee name by id
  const getEmployeeNameById = (employeeId) => {
    const employee = employees.find(
      (emp) => Number(emp.id) === Number(employeeId)
    );
    return employee ? employee.username : "Unknown";
  };

  // Helper: get department name by id
  // If deptId is stored as a string, return it directly.
  const getDepartmentNameById = (deptId) => {
    if (!deptId) return "Unknown";
    if (typeof deptId === "string") return deptId;
    const dept = departments.find((d) => Number(d.id) === Number(deptId));
    return dept ? dept.name : "Unknown";
  };

  // New helper: get an employee's department name using the employee id
  const getEmployeeDepartmentNameById = (employeeId) => {
    const employee = employees.find(
      (emp) => Number(emp.id) === Number(employeeId)
    );
    return employee ? getDepartmentNameById(employee.department) : "Unknown";
  };

  // Fetch the manager's profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Manager profile:", data);
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, [token]);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/departments/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Departments:", data);
        setDepartments(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepartments();
  }, [token]);

  // Fetch employees and requests using the manager's department
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assume manager's department is stored as a number in profile.
        const managerDept = profile?.department || "";
  
        const [employeesRes, leaveRes, advanceRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/users/", {
            headers: { "Content-Type": "application/json" },
          }),
          fetch(
            `http://127.0.0.1:8000/api/leave-requests/?department=${managerDept}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `http://127.0.0.1:8000/api/advance-payment-requests/?department=${managerDept}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
  
        const employeesData = await employeesRes.json();
        const leaveData = await leaveRes.json();
        const advanceData = await advanceRes.json();
  
        setEmployees(employeesData);
        setLeaveRequests(Array.isArray(leaveData) ? leaveData : leaveData.results);
        setAdvanceRequests(Array.isArray(advanceData) ? advanceData : advanceData.results);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
  
    if (profile) {
      fetchData();
    }
  }, [token, profile]);

  // Determine manager's department as a number
  const managerDept = profile ? Number(profile.department) : null;

  // For ALL employees, show a department match indicator
  // Tick (✔️) if employee.department matches managerDept; cross (❌) otherwise.
  // (Note: The filteredEmployees list is not used here so you can see all employees.)
  const allEmployees = employees;

  // For pending leave requests, filter only those from employees in the manager's department.
  // Since we're filtering, these should all show a tick.
  const filteredLeaveRequests = leaveRequests.filter((req) => {
    const employee = employees.find(emp => Number(emp.id) === Number(req.employee));
    return employee && Number(employee.department) === managerDept;
  });

  // Function to fetch attendance for an employee
  const fetchAttendance = async (employeeId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/daily-log/?user=${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      const uniqueDays = new Set(
        data.map((entry) => new Date(entry.clock_in).toLocaleDateString())
      );
      const present = uniqueDays.size;
      const absent = 20 - present;
      setAttendance((prev) => ({
        ...prev,
        [employeeId]: { present, absent },
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Function to handle request actions (approve/decline)
  const handleRequestAction = async (reqId, requestType, action) => {
    const endpoint =
      requestType === "leave"
        ? `http://127.0.0.1:8000/api/leave-requests/${reqId}/${action}/`
        : `http://127.0.0.1:8000/api/advance-payment-requests/${reqId}/${action}/`;
    try {
      console.log(`Calling endpoint: ${endpoint}`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Action failed: ${errText}`);
      }
      if (requestType === "leave") {
        setLeaveRequests(prev =>
          prev.map(r =>
            r.id === reqId ? { ...r, status: action === "approve" ? "approved" : "declined" } : r
          )
        );
      } else {
        setAdvanceRequests(prev =>
          prev.map(r =>
            r.id === reqId ? { ...r, status: action === "approve" ? "approved" : "declined" } : r
          )
        );
      }
      console.log(`Request ${reqId} ${action}d successfully.`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <nav>
        <h1>OMS Managers</h1>
        <button className="logout" onClick={logout}>Logout</button>
      </nav>
      <div className="manager-dashboard">
        {/* Manager Profile Section */}
        <div className="manager-profile">
          <h3>Manager Profile</h3>
          <p><strong>Username:</strong> {profile?.username || "N/A"}</p>
          <p><strong>Email:</strong> {profile?.email || "N/A"}</p>
          <p>
            <strong>Department:</strong>{" "}
            {profile?.department ? getDepartmentNameById(profile.department) : "N/A"}
          </p>
        </div>

        {/* All Employees Section with Dept Match Indicator */}
        <h3 className="h3-title">All Employees</h3>
        <ul>
          {allEmployees.length > 0 ? (
            allEmployees.map(emp => {
              const isMatch = Number(emp.department) === managerDept;
              return (
                <li key={emp.id}>
                  <strong>{emp.username}</strong> (Department: {getDepartmentNameById(emp.department)}){" "}
                  {isMatch ? "✔️" : "❌"} —{" "}
                  {attendance[emp.id]
                    ? `${attendance[emp.id].present} present / ${attendance[emp.id].absent} absent`
                    : "Attendance: N/A"}{" "}
                  <button onClick={() => fetchAttendance(emp.id)}>Fetch Attendance</button>
                </li>
              );
            })
          ) : (
            <li>No employees found.</li>
          )}
        </ul>

        {/* Pending Leave Requests Section (filtered to manager's department) */}
        <h3 className="h3-title">Pending Leave Requests</h3>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Employee Department</th>
              <th>Dept Match</th>
              <th>Leave Start</th>
              <th>Leave End</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaveRequests.length > 0 ? (
              filteredLeaveRequests.map(req => (
                <tr key={req.id}>
                  <td>{req.employee}</td>
                  <td>{getEmployeeNameById(req.employee)}</td>
                  <td>{getEmployeeDepartmentNameById(req.employee)}</td>
                  <td>✔️</td>
                  <td>{req.start_date}</td>
                  <td>{req.end_date}</td>
                  <td>{req.reason}</td>
                  <td>{req.status}</td>
                  <td>
                    {req.status === "pending" && (
                      <>
                        <button onClick={() => handleRequestAction(req.id, "leave", "approve")}>Approve</button>
                        <button onClick={() => handleRequestAction(req.id, "leave", "decline")}>Decline</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No pending leave requests from your department.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pending Advance Requests Section */}
        <h3 className="h3-title">Pending Advance Requests</h3>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Employee Department</th>
              <th>Dept Match</th>
              <th>Requested Amount</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {advanceRequests.length > 0 ? (
              advanceRequests.map(req => {
                const emp = employees.find(emp => Number(emp.id) === Number(req.employee));
                const isMatch = emp && Number(emp.department) === managerDept;
                return (
                  <tr key={req.id}>
                    <td>{req.employee || "N/A"}</td>
                    <td>{req.employee ? getEmployeeNameById(req.employee) : "N/A"}</td>
                    <td>{req.employee ? getEmployeeDepartmentNameById(req.employee) : "N/A"}</td>
                    <td>{req.employee ? (isMatch ? "✔️" : "❌") : "N/A"}</td>
                    <td>{req.amount || "N/A"}</td>
                    <td>{req.reason || "N/A"}</td>
                    <td>{req.status}</td>
                    <td>
                      {req.status === "pending" && (
                        <>
                          <button onClick={() => handleRequestAction(req.id, "advance", "approve")}>Approve</button>
                          <button onClick={() => handleRequestAction(req.id, "advance", "decline")}>Decline</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8">No pending advance requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ManagerDashboard;
