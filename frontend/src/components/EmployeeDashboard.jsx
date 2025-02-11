import React, { useState, useEffect } from "react";
import AttendanceTable from "./AttendanceTable";
import "./styling/EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const token = localStorage.getItem("access_token");

  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [userId, setUserId] = useState("");

  const fetchProfile = () => {
    fetch("http://127.0.0.1:8000/api/profile/", {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setUserId(data.id);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  };

  const fetchAttendanceSummary = () => {
    fetch("http://127.0.0.1:8000/api/employee/attendance-summary/", {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => setAttendanceSummary(data))
      .catch((err) =>
        console.error("Error fetching attendance summary:", err)
      );
  };

  useEffect(() => {
    fetchProfile();
    fetchAttendanceSummary();
  }, []);

  const handleDailyLogSubmit = (e) => {
    e.preventDefault();
    const logData = { time_in: timeIn, time_out: timeOut };
    fetch("http://127.0.0.1:8000/api/employee/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Daily Log Submitted:", data);
        fetchAttendanceSummary();
        setTimeIn("");
        setTimeOut("");
      })
      .catch((err) => console.error("Error submitting daily log:", err));
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    const leaveData = {
      start_date: leaveStartDate,
      end_date: leaveEndDate,
      reason: leaveReason,
    };
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/leave-requests/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(leaveData),
        }
      );
      if (response.ok) {
        console.log("Leave request submitted successfully");
        setLeaveStartDate("");
        setLeaveEndDate("");
        setLeaveReason("");
      } else {
        console.error("Failed to submit leave request");
      }
    } catch (err) {
      console.error("Error submitting leave request:", err);
    }
  };

  const handleAdvanceSubmit = async (e) => {
    e.preventDefault();
    const advanceData = {
      amount: advanceAmount,
      reason: `Advance salary request for amount ${advanceAmount}`,
    };
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/advance-payment-requests/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(advanceData),
        }
      );
      if (response.ok) {
        console.log("Advance payment request submitted successfully");
        setAdvanceAmount("");
      } else {
        console.error("Failed to submit advance payment request");
      }
    } catch (err) {
      console.error("Error submitting advance payment request:", err);
    }
  };

  return (
    <div className="employee-dashboard">
      <h1>Employee Dashboard</h1>

      <form onSubmit={handleDailyLogSubmit}>
        <h3>Daily Log</h3>
        <label htmlFor="timeIn">Time In:</label>
        <input
          id="timeIn"
          type="time"
          value={timeIn}
          onChange={(e) => setTimeIn(e.target.value)}
          required
        />
        <label htmlFor="timeOut">Time Out:</label>
        <input
          id="timeOut"
          type="time"
          value={timeOut}
          onChange={(e) => setTimeOut(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

      <section>
        <h2>Requests</h2>

        <div className="leave-request">
          <h3>Leave Request</h3>
          <form onSubmit={handleLeaveSubmit}>
            <label htmlFor="leaveStartDate">Start Date:</label>
            <input
              id="leaveStartDate"
              type="date"
              value={leaveStartDate}
              onChange={(e) => setLeaveStartDate(e.target.value)}
              required
            />
            <label htmlFor="leaveEndDate">End Date:</label>
            <input
              id="leaveEndDate"
              type="date"
              value={leaveEndDate}
              onChange={(e) => setLeaveEndDate(e.target.value)}
              required
            />
            <label htmlFor="leaveReason">Reason for Leave:</label>
            <textarea
              id="leaveReason"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              required
            />
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="advance-request">
          <h3>Advance Salary Request</h3>
          <form onSubmit={handleAdvanceSubmit}>
            <label htmlFor="advanceAmount">Amount Requested:</label>
            <input
              id="advanceAmount"
              type="number"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              required
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      </section>

      <AttendanceTable attendanceSummary={attendanceSummary} />
    </div>
  );
};

export default EmployeeDashboard;
