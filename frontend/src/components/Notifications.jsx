// import React, { useEffect, useState } from 'react';
import React from "react";

const Notifications = () => {
  // const [notifications, setNotifications] = useState([]);
  // const [error, setError] = useState(null);

  // const token = localStorage.getItem('access_token')

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

  // const fetchNotifications = () => {
  //   let url = 'http://127.0.0.1:8000/api/notifications/';

  //   fetch(url, {
  //     method: 'GET',
  //     headers: { 
  //       Authorization: `Bearer ${token}`,
  //       'Content-Type': 'application/json'
  //      },
  //   })
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error(`Error fetching notifications: ${response.status}`);
  //       }
  //       return response.json();
  //     })
  //     .then(data => setNotifications(data))
  //     .catch(error => setError(error.message));
  // };

  // const markAsRead = (notificationId) => {
  //   fetch(`http://127.0.0.1:8000/api/notifications/${notificationId}/`, {
  //     method: 'PATCH',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ is_read: true }),
  //   })
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Error updating notification');
  //       }
  //       return response.json();
  //     })
  //     .then(updatedNotification => {
  //       setNotifications(prev =>
  //         prev.map(notification =>
  //           notification.id === notificationId ? updatedNotification : notification
  //         )
  //       );
  //     })
  //     .catch(error => console.error('Error marking as read:', error));
  // };

  // const togglePin = (notificationId, currentPinState) => {
  //   fetch(`http://127.0.0.1:8000/api/notifications/${notificationId}/`, {
  //     method: 'PATCH',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ is_pinned: !currentPinState }),
  //   })
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Error updating notification');
  //       }
  //       return response.json();
  //     })
  //     .then(updatedNotification => {
  //       setNotifications(prev =>
  //         prev.map(notification =>
  //           notification.id === notificationId ? updatedNotification : notification
  //         )
  //       );
  //     })
  //     .catch(error => console.error('Error toggling pin:', error));
  // };

  // const deleteNotification = (notificationId) => {
  //   const confirmDelete = window.confirm("Are you sure you want to delete this notification?");
  //   if (!confirmDelete) return; // If user cancels, do nothing

  //   fetch(`http://127.0.0.1:8000/api/notifications/${notificationId}/`, {
  //     method: 'DELETE',
  //     headers: { 'Content-Type': 'application/json' },
  //   })
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Error deleting notification');
  //       }
  //       setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  //     })
  //     .catch(error => console.error('Error deleting notification:', error));
  // };

  return (
    <div>
      <h2>Notifications</h2>
      <h3>comming soon</h3>
      <p>Expected Features</p>
      <ul>
        <li>Real time notifications</li>
        <li>Email notifications</li>
        <li>Employee to employee Comunication</li>
        <li>Admin to employee Comunication and vise vasa</li>
        <li>Admin tomanager communication and vise vasa</li>
        <li>Manager to employee communication and vise vasa</li>
      </ul>
      {/* {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <ul>
          {notifications.map(notification => (
            <li
              key={notification.id}
              style={{
                marginBottom: '1rem',
                border: notification.is_pinned ? '2px solid gold' : '1px solid #ccc',
                padding: '0.5rem'
              }}
            >
              <p>{notification.message}</p>
              <p>
                <small>{new Date(notification.created_at).toLocaleString()}</small>
              </p>
              {!notification.is_read && (
                <button onClick={() => markAsRead(notification.id)}>
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => togglePin(notification.id, notification.is_pinned)}
                style={{ marginLeft: '0.5rem' }}
              >
                {notification.is_pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={() => deleteNotification(notification.id)}
                style={{ marginLeft: '0.5rem', color: 'red' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )} */}
    </div>
  );
};

export default Notifications;
