import React, { useState, useEffect } from 'react';

const Salary = () => {
  const [salaries, setSalaries] = useState([]);
  const [newSalary, setNewSalary] = useState({ user: '', amount: '' });
  const [error, setError] = useState(null);

  // State to manage inline editing
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({ user: '', amount: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/salaries/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error fetching salaries: ${response.statusText}`);
      }
      const data = await response.json();
      setSalaries(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Handle change for new salary form
  const handleChange = (e) => {
    setNewSalary({
      ...newSalary,
      [e.target.name]: e.target.value,
    });
  };

  // Submit a new salary entry
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/api/salaries/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSalary),
      });

      if (!response.ok) {
        throw new Error(`Error adding salary: ${response.statusText}`);
      }

      setNewSalary({ user: '', amount: '' });
      fetchSalaries();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Start editing a salary entry
  const handleEditClick = (salary) => {
    setEditingId(salary.id);
    setEditingData({ user: salary.user, amount: salary.amount });
  };

  // Handle changes in the inline edit form
  const handleEditChange = (e) => {
    setEditingData({
      ...editingData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit the edited salary data
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/salaries/${editingId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingData),
      });

      if (!response.ok) {
        throw new Error(`Error editing salary: ${response.statusText}`);
      }

      // Reset editing state and refresh the list
      setEditingId(null);
      setEditingData({ user: '', amount: '' });
      fetchSalaries();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Cancel editing mode
  const handleEditCancel = () => {
    setEditingId(null);
    setEditingData({ user: '', amount: '' });
  };

  return (
    <div>
      <h2>Salaries</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {/* Form for adding a new salary */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="user">User ID:</label>
          <input
            type="text"
            id="user"
            name="user"
            value={newSalary.user}
            onChange={handleChange}
            placeholder="Enter User ID"
            required
          />
        </div>
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            step="0.01"
            id="amount"
            name="amount"
            value={newSalary.amount}
            onChange={handleChange}
            placeholder="Enter Amount"
            required
          />
        </div>
        <button type="submit">Add Salary</button>
      </form>

      {/* List of salaries with inline editing functionality */}
      <ul>
        {salaries.map((salary) => (
          <li key={salary.id}>
            {editingId === salary.id ? (
              <form onSubmit={handleEditSubmit}>
                <div>
                  <label htmlFor={`edit-user-${salary.id}`}>User ID:</label>
                  <input
                    type="text"
                    id={`edit-user-${salary.id}`}
                    name="user"
                    value={editingData.user}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`edit-amount-${salary.id}`}>Amount:</label>
                  <input
                    type="number"
                    step="0.01"
                    id={`edit-amount-${salary.id}`}
                    name="amount"
                    value={editingData.amount}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <button type="submit">Save</button>
                <button type="button" onClick={handleEditCancel}>
                  Cancel
                </button>
              </form>
            ) : (
              // Display salary information with an Edit button
              <div>
                <strong>User ID:</strong> {salary.user} &mdash; 
                <strong>Amount:</strong> ${salary.amount} &mdash; 
                <strong>Pay Date:</strong> {salary.pay_date}
                <button onClick={() => handleEditClick(salary)}>Edit</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Salary;
