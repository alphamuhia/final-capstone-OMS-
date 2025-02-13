import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AttendanceTable from "./AttendanceTable";
import "./styling/EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const token = localStorage.getItem("access_token");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [userId, setUserId] = useState("");
  const [attendanceRefresh, setAttendanceRefresh] = useState(0);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userid");
    navigate("/login");
  };

  const fetchProfile = () => {
    fetch("http://127.0.0.1:8000/api/profile/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Profile data:", data);
        if (data.id) setUserId(data.id);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, []);

  const sendNotificationToManagerAdmin = async (messageContent, hoursWorked) => {
    const notificationData = {
      user_id: userId,
      message: messageContent,
      hours_worked: hoursWorked,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/notifications/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      });
      const data = await response.json();
      console.log("Manager/Admin notification sent:", data);
    } catch (err) {
      console.error("Error sending manager/admin notification:", err);
    }
  };

  const sendEmployeeNotification = async (messageContent, hoursWorked) => {
    const notificationData = {
      message: messageContent,
      hours_worked: hoursWorked,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/notifications/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      });
      const data = await response.json();
      console.log("Employee notification sent:", data);
    } catch (err) {
      console.error("Error sending employee notification:", err);
    }
  };

  const handleDailyLogSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");
    console.log("handleDailyLogSubmit triggered");

    try {
      const [hIn, mIn] = timeIn.split(":").map(Number);
      const [hOut, mOut] = timeOut.split(":").map(Number);

      if (isNaN(hIn) || isNaN(mIn) || isNaN(hOut) || isNaN(mOut)) {
        alert("Invalid time format. Please use HH:MM format.");
        return;
      }

      if (mIn < 0 || mIn >= 60 || mOut < 0 || mOut >= 60) {
        alert("Minutes must be between 0 and 59. Please enter a valid time.");
        return;
      }

      if (hIn < 0 || hIn > 23 || hOut < 0 || hOut > 23) {
        alert("Hours must be between 0 and 23. Please enter a valid time.");
        return;
      }

      const today = new Date();
      const timeInDate = new Date(today);
      timeInDate.setHours(hIn, mIn, 0, 0);
      const timeOutDate = new Date(today);
      timeOutDate.setHours(hOut, mOut, 0, 0);

      let diff = (timeOutDate.getTime() - timeInDate.getTime()) / (1000 * 60 * 60);
      diff = Math.round(diff * 100) / 100;

      const logData = {
        time_in: timeIn,
        time_out: timeOut,
        hours_worked: diff,
      };

      const response = await fetch("http://127.0.0.1:8000/api/daily-log/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to submit daily log");
      }

      const data = await response.json();
      console.log("Daily Log Submitted:", data);

      if (diff !== 11) {
        let notificationMsg = `Employee worked ${diff} hours today.`;
        if (diff < 11) {
          notificationMsg += " This is less than the required 11 hours.";
        } else {
          notificationMsg += " This is more than the required 11 hours. Overtime pending approval.";
        }
        await sendNotificationToManagerAdmin(notificationMsg, diff);
      }

      await sendEmployeeNotification(`You worked ${diff} hours today.`, diff);
      setAttendanceRefresh((prev) => prev + 1);
      setMessage("Daily log submitted successfully!");
      setTimeIn("");
      setTimeOut("");
    } catch (err) {
      console.error("Error submitting daily log:", err);
      setErrorMessage(`Error: ${err.message}`);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");
    console.log("handleLeaveSubmit triggered");

    try {
      const leaveData = {
        start_date: leaveStartDate,
        end_date: leaveEndDate,
        reason: leaveReason,
      };

      const response = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leaveData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to submit leave request");
      }

      console.log("Leave request submitted successfully");
      setMessage("Leave request submitted successfully!");
      setLeaveStartDate("");
      setLeaveEndDate("");
      setLeaveReason("");
    } catch (err) {
      console.error("Error submitting leave request:", err);
      setErrorMessage(`Error: ${err.message}`);
    }
  };

  const handleAdvanceSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");
    console.log("handleAdvanceSubmit triggered");
  
    try {
      const advanceData = {
        amount: parseFloat(advanceAmount),
        reason: `Advance salary request for amount ${advanceAmount}`,
      };
  
      const response = await fetch("http://127.0.0.1:8000/api/advance-payment-requests/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(advanceData),
      });
  
      if (!response.ok) {
        let errorDetail;
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await response.json();
          errorDetail = errData.detail || "Failed to submit advance payment request";
        } else {
          errorDetail = await response.text();
        }
        throw new Error(errorDetail);
      }
  
      const data = await response.json();
      console.log("Advance payment request submitted successfully", data);
      setMessage("Advance payment request submitted successfully!");
      setAdvanceAmount("");
    } catch (err) {
      console.error("Error submitting advance payment request:", err);
      setErrorMessage(`Error: ${err.message}`);
    }
  };
  

 
  return (
    <div className="employee-dashboard">
      <header>
        <Link to="/notifications">Notifications</Link>
        <button className="logout" onClick={logout}>
          Logout
        </button>
      </header>
      <h1>Employee Dashboard</h1>
      {message && <div className="success-message">{message}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
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
        <button type="submit">Submit Daily Log</button>
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
            <button type="submit">Submit Leave Request</button>
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
            <button type="submit">Submit Advance Request</button>
          </form>
        </div>
      </section>
      <AttendanceTable token={token} refreshFlag={attendanceRefresh} />
    </div>
  );
};

export default EmployeeDashboard;
