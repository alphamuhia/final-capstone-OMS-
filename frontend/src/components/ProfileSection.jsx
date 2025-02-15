import React, { useState, useEffect } from "react";
// import "./styling/ProfileSection.css";

const ProfileSection = ({ token, refreshProfile }) => {
  const [profile, setProfile] = useState({
    user: "",
    role: "",
    full_name: "",
    id_number: "",
    address: "",
    department: "",
    profile_picture: null,
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProfileData = () => {
    fetch("http://127.0.0.1:8000/api/employee-profile/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.detail || "Error fetching profile");
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.profile) {
          setProfile({
            user: data.profile.user || "",
            role: data.profile.role || "",
            full_name: data.profile.full_name || "",
            id_number: data.profile.id_number || "",
            address: data.profile.address || "",
            department: data.profile.department_name || "",
            profile_picture: data.profile.profile_picture || null,
          });
        } else {
          throw new Error("Unexpected response format.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setErrorMessage(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // If the backend reports that the profile doesn't exist, show a fallback UI.
  if (!loading && errorMessage === "Employee profile not found.") {
    return (
      <div className="profile-section">
        <h2>Profile</h2>
        <p>Your employee profile was not found.</p>
        <p>Please contact support or create your profile if this option is available.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_picture" && files.length > 0) {
      setProfile((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const updateProfile = (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("full_name", profile.full_name);
    formData.append("id_number", profile.id_number);
    formData.append("address", profile.address);
    if (profile.profile_picture instanceof File) {
      formData.append("profile_picture", profile.profile_picture);
    }

    fetch("http://127.0.0.1:8000/api/employee-profile/", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      // Do not set Content-Type when sending FormData.
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
        setProfile((prev) => ({
          ...prev,
          full_name: data.full_name || "",
          id_number: data.id_number || "",
          address: data.address || "",
          profile_picture: data.profile_picture || prev.profile_picture,
        }));
        setEditMode(false);
        if (refreshProfile) refreshProfile();
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
        setErrorMessage(`Error: ${err.message}`);
      });
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-section">
      <h2>Profile</h2>
      {message && <div className="success-message">{message}</div>}
      {errorMessage &&
        errorMessage !== "Employee profile not found." && (
          <div className="error-message">{errorMessage}</div>
        )}
      {!editMode ? (
        <div className="profile-view">
          <p>
            <strong>Username:</strong> {profile.user}
          </p>
          <p>
            <strong>Full Name:</strong> {profile.full_name}
          </p>
          <p>
            <strong>ID Number:</strong> {profile.id_number}
          </p>
          <p>
            <strong>Address:</strong> {profile.address}
          </p>
          <p>
            <strong>Role:</strong> {profile.role}
          </p>
          <p>
            <strong>Department:</strong> {profile.department}
          </p>
          {profile.profile_picture && (
            <div>
              <strong>Profile Picture:</strong>
              <img
                src={profile.profile_picture}
                alt="Profile"
                style={{ width: "100px" }}
              />
            </div>
          )}
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      ) : (
        <form className="profile-edit" onSubmit={updateProfile}>
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
            <input type="text" name="role" value={profile.role} readOnly />
          </div>
          <div>
            <label>Department:</label>
            <input
              type="text"
              name="department"
              value={profile.department}
              readOnly
            />
          </div>
          <div>
            <label>Profile Picture:</label>
            <input type="file" name="profile_picture" onChange={handleChange} />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditMode(false)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfileSection;
