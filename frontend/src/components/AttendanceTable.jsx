import React, { useState, useEffect } from "react";

const AttendanceTable = () => {
  const [attendances, setAttendances] = useState([]);
  const token = localStorage.getItem("access_token");
  const loggedInUserId = localStorage.getItem("user_id"); // Assuming user_id is stored in local storage

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
      .then((data) => {
        // Filter logs to only include those of the logged-in user
        const userLogs = data.filter((record) => record.user_id == loggedInUserId);

        // Remove duplicate logs, keeping only the first log per day
        const uniqueRecords = Object.values(
          userLogs.reduce((acc, record) => {
            if (!acc[record.date]) {
              acc[record.date] = record;
            }
            return acc;
          }, {})
        );

        setAttendances(uniqueRecords);
      })
      .catch((error) => console.error("Error fetching attendance:", error));
  }, [token, loggedInUserId]);

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
