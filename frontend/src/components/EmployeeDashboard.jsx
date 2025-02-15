import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styling/EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const token = localStorage.getItem("access_token");
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState("");
  const [profilePicture, setProfilePicture] = useState(
    localStorage.getItem("profile_picture") || ""
  );
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [attendanceRefresh, setAttendanceRefresh] = useState(0);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newProfilePictureFile, setNewProfilePictureFile] = useState(null);
  const [updatePicMessage, setUpdatePicMessage] = useState("");
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
        setProfile(data);
        if (data.id) setUserId(data.id);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
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

  // Update profile picture locally (no backend call)
  const handleProfilePictureUpdate = (e) => {
    e.preventDefault();
    setUpdatePicMessage("");
    if (!newProfilePictureFile) {
      setUpdatePicMessage("Please select an image file to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProfilePicture(base64String);
      localStorage.setItem("profile_picture", base64String);
      setUpdatePicMessage("Profile picture updated successfully!");
      setNewProfilePictureFile(null);
    };
    reader.onerror = () => {
      setUpdatePicMessage("Error reading the file.");
    };
    reader.readAsDataURL(newProfilePictureFile);
  };

  return (
    <div className="employee-dashboard">
      <header>
        <h1>Employee Dashboard</h1>
        <button className="logout" onClick={logout}>
          Logout
        </button>
      </header>
      <h1 className="pet">Employee Dashboard</h1>
      
      <div className="profile">
        <h2>Your Profile</h2>
        {/* Display the profile picture */}
        <img
          src={profilePicture || "https://via.placeholder.com/150"}
          alt="Profile"
          className="profile-picture"
        />
        {profile ? (
          <div>
            {/* <p><strong>ID:</strong> {profile.id}</p> */}
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
        {/* Form for updating profile picture locally */}
        <form onSubmit={handleProfilePictureUpdate} className="update-profile-picture-form">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewProfilePictureFile(e.target.files[0])}
          />
          <button type="submit">Update Profile Picture</button>
        </form>
        {updatePicMessage && <div className="update-pic-message">{updatePicMessage}</div>}
      </div>

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
      
    </div>
  );
};

export default EmployeeDashboard;
