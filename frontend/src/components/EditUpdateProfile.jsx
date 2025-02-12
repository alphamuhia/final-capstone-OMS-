import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const EditUpdateProfile = () => {
  const { id } = useParams(); // Get the user ID from the URL

  const [profile, setProfile] = useState({
    full_name: '',
    id_number: '',
    address: '',
    profile_picture: null,
    role: '',
    status: '',
    department: null,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Retrieve the JWT access token from localStorage (or use another storage method)
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    // If an ID exists in the URL, fetch that user's profile.
    // Otherwise, fetch the current logged-in user's profile.
    const endpoint = id ? `/api/users/${id}/` : '/api/employee/profile/';

    fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching profile (status: ${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        // The API may return the profile as either data.profile or data directly.
        setProfile(data.profile || data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        setMessage('Error loading profile.');
        setLoading(false);
      });
  }, [token, id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_picture') {
      setProfile({ ...profile, profile_picture: files[0] });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const endpoint = id ? `/api/users/${id}/` : '/api/employee/profile/';

    const formData = new FormData();
    for (const key in profile) {
      if (Object.prototype.hasOwnProperty.call(profile, key)) {
        if (key === 'profile_picture' && profile[key] instanceof File) {
          formData.append(key, profile[key]);
        } else if (profile[key] !== null) {
          formData.append(key, profile[key]);
        }
      }
    }

    fetch(endpoint, {
      method: 'PUT',
      headers: {
        // Do not set Content-Type when using FormData
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error updating profile (status: ${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        setMessage('Profile updated successfully!');
        setProfile(data.profile || data);
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        setMessage('Error updating profile.');
      });
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="edit-profile">
      <h2>Edit User Profile</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label htmlFor="full_name">Full Name:</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={profile.full_name || ''}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="id_number">ID Number:</label>
          <input
            type="text"
            id="id_number"
            name="id_number"
            value={profile.id_number || ''}
            onChange={handleChange}
            placeholder="Enter your ID number"
          />
        </div>

        <div>
          <label htmlFor="address">Address:</label>
          <textarea
            id="address"
            name="address"
            value={profile.address || ''}
            onChange={handleChange}
            placeholder="Enter your address"
          ></textarea>
        </div>

        <div>
          <label htmlFor="role">Role:</label>
          <input
            type="text"
            id="role"
            name="role"
            value={profile.role || ''}
            disabled
          />
        </div>

        <div>
          <label htmlFor="status">Status:</label>
          <input
            type="text"
            id="status"
            name="status"
            value={profile.status || ''}
            disabled
          />
        </div>

        <div>
          <label htmlFor="department">Department:</label>
          <input
            type="text"
            id="department"
            name="department"
            value={profile.department ? profile.department.name : ''}
            disabled
          />
        </div>

        <div>
          <label htmlFor="profile_picture">Profile Picture:</label>
          <input
            type="file"
            id="profile_picture"
            name="profile_picture"
            onChange={handleChange}
          />
          {/* Display the current profile picture if available (assuming it's a URL) */}
          {profile.profile_picture &&
            typeof profile.profile_picture === 'string' && (
              <img
                src={profile.profile_picture}
                alt="Profile"
                width="100"
                style={{ display: 'block', marginTop: '10px' }}
              />
            )}
        </div>

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default EditUpdateProfile;
