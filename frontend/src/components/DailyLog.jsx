import React, { useState, useEffect } from "react";
import "./styling/DailyLog.css"; // Import the custom CSS file
import AdminNavbar from "./AdminNavbar";

const DailyLog = () => {
  const [dailyLogs, setDailyLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState("");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      setError("No access token found. Please log in.");
      return;
    }
    console.log("Using token:", token);
    fetchDailyLogs();
    fetchUsers();
  }, [token]);

  // Fetch all daily logs from the API.
  const fetchDailyLogs = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/daily-log/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch daily logs: ${response.status} ${text}`);
      }

      const data = await response.json();
      setDailyLogs(data);
    } catch (err) {
      console.error("Error fetching daily logs:", err);
      setError(err.message);
    }
  };

  // Fetch all users from the API.
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch users: ${response.status} ${text}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      // Optionally, handle error here
    }
  };

  // Helper function to get user name.
  const getUserName = (user) => {
    if (typeof user === "object") {
      return user.name || user.username || "N/A";
    } else {
      const foundUser = users.find((u) => Number(u.id) === Number(user));
      return foundUser ? (foundUser.name || foundUser.username) : "N/A";
    }
  };

  // Fetch attendance for a specific employee.
  const fetchAttendance = async (employee) => {
    const employeeId = typeof employee === "object" ? employee.id : employee;
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
      const absent = 20 - present; // Assuming 20 workdays
      setAttendance((prev) => ({
        ...prev,
        [employeeId]: { present, absent },
      }));
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  // Calculate the adjustment based on hours worked compared to a 10-hour standard.
  const calculateHoursAdjustment = (hours) => {
    const standardHours = 10;
    const parsedHours = Number(hours);
    if (parsedHours > standardHours) {
      const overtime = parsedHours - standardHours;
      return `Overtime by ${overtime} ${overtime > 1 ? "hours" : "hour"}`;
    } else if (parsedHours < standardHours) {
      const underHours = standardHours - parsedHours;
      return `Under hours by ${underHours} ${underHours > 1 ? "hours" : "hour"}`;
    } else {
      return "Met standard hours";
    }
  };

  const getFilteredLogs = () => {
    const filtered = dailyLogs.reduce((acc, log) => {
      const userId = typeof log.user === "object" ? log.user.id : log.user;
      const currentLogHours = Number(log.hours_worked);
      if (!acc[userId]) {
        acc[userId] = log;
      } else {
        const storedLogHours = Number(acc[userId].hours_worked);
        if (currentLogHours < storedLogHours) {
          acc[userId] = log;
        }
      }
      return acc;
    }, {});
    return Object.values(filtered);
  };

  const logsToDisplay = getFilteredLogs();

  return (
    <>
    <AdminNavbar />
    <div className="daily-log-container">
      <h2>Daily Logs from All Users</h2>
      {error && <div className="error-message">{error}</div>}
      {logsToDisplay.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Hours Worked</th>
              <th>Adjustment</th>
              <th>Date</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {logsToDisplay.map((log) => {
              const employeeId =
                typeof log.user === "object" ? log.user.id : log.user;
              const userName = getUserName(log.user);
              return (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{userName}</td>
                  <td>{log.time_in}</td>
                  <td>{log.time_out}</td>
                  <td>{log.hours_worked}</td>
                  <td>{calculateHoursAdjustment(log.hours_worked)}</td>
                  <td>{new Date(log.date).toLocaleString()}</td>
                  <td>
                    {attendance[employeeId] ? (
                      `${attendance[employeeId].present} present / ${attendance[employeeId].absent} absent`
                    ) : (
                      <button onClick={() => fetchAttendance(log.user)}>
                        Fetch Attendance
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No daily logs available.</p>
      )}
    </div>
    </>
  );
};

export default DailyLog;
