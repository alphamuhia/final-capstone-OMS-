import React, { useState } from "react";

const PendingApprovalsCard = ({ users, departments, approveUser, declineUser }) => {
  // State to manage the popup visibility
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Filter out the pending approvals
  const pendingApprovals = users.filter((user) => !user.is_approved);

  return (
    <div className="pending-approvals">
      <h3>Pending Approvals</h3>
      <p>
        {pendingApprovals.length} approvals waiting approval
      </p>
      {/* Button to open the popup */}
      <button onClick={() => setIsPopupOpen(true)}>Show Details</button>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h4>Pending Approvals List</h4>
            <ul>
              {pendingApprovals.map((user) => {
                // Find the user's department name or default to "Unknown"
                const userDepartment =
                  departments.find((dep) => dep.id === user.department)?.name ||
                  "Unknown";
                return (
                  <li key={user.id}>
                    {user.username} - {userDepartment} - {user.role}
                    <button onClick={() => declineUser(user.id)}>Decline</button>
                    <button onClick={() => approveUser(user.id)}>Approve</button>
                  </li>
                );
              })}
            </ul>
            {/* Button to close the popup */}
            <button onClick={() => setIsPopupOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsCard;
