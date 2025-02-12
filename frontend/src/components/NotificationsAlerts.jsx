import React, { useEffect, useState } from "react";

const NotificationsAlerts = () => {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/notifications/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }, []);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <div className="notifications-alerts">
      <h1>Notifications and Alerts</h1>
      {notifications.length === 0 ? (
        <p>No notifications at the moment.</p>
      ) : (
        <ul>
          {notifications.map((note, index) => (
            <li key={index}>{note.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsAlerts;
