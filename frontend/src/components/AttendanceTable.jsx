import React, { useState, useEffect } from "react";
// import "./AttendanceTable.css";

const AttendanceTable = () => {
  const [attendances, setAttendances] = useState([]);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/daily-log/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch attendance records");
        }
        return response.json();
      })
      .then((data) => setAttendances(data))
      .catch((error) => console.error("Error fetching attendance:", error));
  }, [token]);

  return (
    <div className="attendance-table-container">
      <h3>Attendance Record for the Month</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time In</th>
            <th>Time Out</th>
          </tr>
        </thead>
        <tbody>
          {attendances.length > 0 ? (
            attendances.map((record) => (
              <tr key={record.id}>
                <td>{record.date}</td>
                <td>{record.time_in || "N/A"}</td>
                <td>{record.time_out || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No attendance records found for this month.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
