import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [attendanceRefresh, setAttendanceRefresh] = useState(0);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // State for pending requests
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);
  const [pendingAdvanceRequests, setPendingAdvanceRequests] = useState([]);

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
    department: "",
  });

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userid");
    navigate("/login");
  };

  // Helper function to fetch userId based on username
  const fetchUserId = (username) => {
    fetch("http://127.0.0.1:8000/api/users/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((users) => {
        console.log("Users fetched:", users);
        const user = users.find((u) => u.username === username);
        if (user && user.id) {
          setUserId(user.id);
          setProfileLoaded(true);
        } else {
          console.error("User not found for username:", username);
        }
      })
      .catch((err) => console.error("Error fetching user id:", err));
  };

  // Fetch profile and update local state, then fetch userId
  const fetchProfile = () => {
    fetch("http://127.0.0.1:8000/api/profile/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("Profile response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Profile data received:", data);
        if (data.username) {
          setProfile({
            username: data.username,
            email: data.email || "",
            role: data.role || "",
            department: data.department || "",
          });
          // Fetch the user id based on the username
          fetchUserId(data.username);
        } else {
          console.error("Profile data is missing a 'username' field:", data);
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));
  };

  // Update profile (unchanged)
  const updateProfile = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");
    fetch("http://127.0.0.1:8000/api/profile/", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.detail || "Failed to update profile");
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Profile updated:", data);
        setMessage("Profile updated successfully!");
        setProfile({
          username: data.username || "",
          email: data.email || "",
          role: data.role || "",
          department: data.department || "",
        });
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
        setErrorMessage(`Error: ${err.message}`);
      });
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
    // Load pending requests from localStorage on mount
    const storedLeaveRequests = JSON.parse(localStorage.getItem("leaveRequests")) || [];
    setPendingLeaveRequests(storedLeaveRequests);
    const storedAdvanceRequests = JSON.parse(localStorage.getItem("advanceRequests")) || [];
    setPendingAdvanceRequests(storedAdvanceRequests);
  }, [token]);

  // Helper function to update the status of a request locally and in localStorage
  const updateRequestStatus = (requestId, newStatus, requestType) => {
    if (requestType === "leave") {
      const updatedLeaveRequests = pendingLeaveRequests.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      );
      setPendingLeaveRequests(updatedLeaveRequests);
      localStorage.setItem("leaveRequests", JSON.stringify(updatedLeaveRequests));
    } else if (requestType === "advance") {
      const updatedAdvanceRequests = pendingAdvanceRequests.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      );
      setPendingAdvanceRequests(updatedAdvanceRequests);
      localStorage.setItem("advanceRequests", JSON.stringify(updatedAdvanceRequests));
    }
  };

  // Polling to fetch updated statuses from the backend every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Fetch updated leave requests
        const leaveResponse = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (leaveResponse.ok) {
          const leaveData = await leaveResponse.json();
          setPendingLeaveRequests(leaveData);
          localStorage.setItem("leaveRequests", JSON.stringify(leaveData));
        }
        // Fetch updated advance requests
        const advanceResponse = await fetch("http://127.0.0.1:8000/api/advance-payment-requests/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (advanceResponse.ok) {
          const advanceData = await advanceResponse.json();
          setPendingAdvanceRequests(advanceData);
          localStorage.setItem("advanceRequests", JSON.stringify(advanceData));
        }
      } catch (error) {
        console.error("Error fetching updated request statuses:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [token]);

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

  // Daily log submission: send only time strings (e.g., "08:00") in the payload.
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
  
      // Removed hours_worked from payload as it is calculated in the serializer
      const logData = {
        time_in: timeIn,
        time_out: timeOut,
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

      const data = await response.json();
      console.log("Leave request submitted successfully", data);
      setMessage("Leave request submitted successfully!");

      const storedLeaveRequests = JSON.parse(localStorage.getItem("leaveRequests")) || [];
      const newLeaveRequest = {
        ...leaveData,
        status: "pending",
        date: new Date().toISOString(),
        id: data.id || Date.now(),
      };
      storedLeaveRequests.push(newLeaveRequest);
      localStorage.setItem("leaveRequests", JSON.stringify(storedLeaveRequests));
      setPendingLeaveRequests(storedLeaveRequests);

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

      const storedAdvanceRequests = JSON.parse(localStorage.getItem("advanceRequests")) || [];
      const newAdvanceRequest = {
        ...advanceData,
        status: "pending",
        date: new Date().toISOString(),
        id: data.id || Date.now(),
      };
      storedAdvanceRequests.push(newAdvanceRequest);
      localStorage.setItem("advanceRequests", JSON.stringify(storedAdvanceRequests));
      setPendingAdvanceRequests(storedAdvanceRequests);

      setAdvanceAmount("");
    } catch (err) {
      console.error("Error submitting advance payment request:", err);
      setErrorMessage(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <nav className="dashboard-navbar">
        <h1>OMS Employees</h1>
        <button className="logout" onClick={logout}>
          Logout
        </button>
      </nav>
      <div className="employee-dashboard">
        <h1>Employee Dashboard</h1>
        {message && <div className="success-message">{message}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Time Tracking Section */}
        <section className="time-tracking">
          <h2>Daily Log (Time Tracking)</h2>
          {!profileLoaded ? (
            <p>Loading user information...</p>
          ) : (
            <form onSubmit={handleDailyLogSubmit}>
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
          )}
        </section>

        {/* Requests Section */}
        {/* <section className="requests">
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
        </section> */}

        {/* Pending Requests Display */}
        {/* <section className="pending-requests">
          <h2>Pending Leave Requests</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date Submitted</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeaveRequests.length > 0 ? (
                pendingLeaveRequests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.id}</td>
                    <td>{new Date(req.date).toLocaleString()}</td>
                    <td>{req.start_date}</td>
                    <td>{req.end_date}</td>
                    <td>{req.reason}</td>
                    <td>{req.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No pending leave requests</td>
                </tr>
              )}
            </tbody>
          </table>
          <h2>Pending Advance Requests</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date Submitted</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingAdvanceRequests.length > 0 ? (
                pendingAdvanceRequests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.id}</td>
                    <td>{new Date(req.date).toLocaleString()}</td>
                    <td>{req.amount}</td>
                    <td>{req.reason}</td>
                    <td>{req.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No pending advance requests</td>
                </tr>
              )}
            </tbody>
          </table>
        </section> */}

        {/* Existing Attendance Table Component */}
        <AttendanceTable token={token} refreshFlag={attendanceRefresh} />
      </div>
    </>
  );
};

export default EmployeeDashboard;
