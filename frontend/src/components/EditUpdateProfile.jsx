// EditProfile.jsx
import React, { useState, useEffect } from "react";

const EditProfile = ({ token, refreshProfile }) => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    full_name: "",
    id_number: "",
    address: "",
    role: "",
    department: "",
    profile_picture: null,
  });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch profile from the Django API endpoint
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employee-profile/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          username: data.username || "",
          email: data.email || "",
          full_name: data.full_name || "",
          id_number: data.id_number || "",
          address: data.address || "",
          role: data.role || "",
          department: data.department || "",
          profile_picture: data.profile_picture || null,
        });
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, [token]);

  // Handle form field changes. For file input, update state with the File object.
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_picture" && files.length > 0) {
      setProfile((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Update the profile using FormData (to support file uploads)
  const updateProfile = (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    const formData = new FormData();
    Object.keys(profile).forEach((key) => {
      if (profile[key] !== null) {
        formData.append(key, profile[key]);
      }
    });

    fetch("http://127.0.0.1:8000/api/employee-profile/", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // Note: When using FormData, do NOT set Content-Type manually.
      },
      body: formData,
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
        setMessage("Profile updated successfully!");
        setProfile({
          username: data.username || "",
          email: data.email || "",
          full_name: data.full_name || "",
          id_number: data.id_number || "",
          address: data.address || "",
          role: data.role || "",
          department: data.department || "",
          profile_picture: data.profile_picture || null,
        });
        if (refreshProfile) refreshProfile();
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
        setErrorMessage(`Error: ${err.message}`);
      });
  };

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>
      {message && <div className="success-message">{message}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <form onSubmit={updateProfile}>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>ID Number:</label>
          <input
            type="text"
            name="id_number"
            value={profile.id_number}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Address:</label>
          <textarea
            name="address"
            value={profile.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Role:</label>
          <input
            type="text"
            name="role"
            value={profile.role}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Department:</label>
          <input
            type="text"
            name="department"
            value={profile.department}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Profile Picture:</label>
          <input type="file" name="profile_picture" onChange={handleChange} />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default EditProfile;
