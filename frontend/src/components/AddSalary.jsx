import React, { useState, useEffect } from 'react';
import './styling/AddSalary.css';

function AddSalary() {
  const paymentMethodOptions = [
    { value: 'check', display: 'Check' },
    { value: 'cash', display: 'Cash' },
    { value: 'bank', display: 'Bank' }
  ];

  const [amount, setAmount] = useState('');
  const [overtimeHours, setOvertimeHours] = useState('');
  const [penalty, setPenalty] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethodOptions[0].value);
  const [selectedUser, setSelectedUser] = useState('');

  const [users, setUsers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState(paymentMethodOptions);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/users/').then(response => response.json()),
      fetch('http://127.0.0.1:8000/api/salaries/').then(response => response.json())
    ])
      .then(([usersData, salariesData]) => {
        const salaryList = salariesData.results || salariesData;
        const usersWithSalary = new Set(salaryList.map(salary => salary.user));
        const availableUsers = usersData.filter(user => !usersWithSalary.has(user.username));
        setUsers(availableUsers);
        if (availableUsers.length > 0) {
          setSelectedUser(availableUsers[0].id);
        }
      })
      .catch(err => console.error('Error fetching users or salaries:', err));
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/payment-methods/')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPaymentMethods(data);
          setPaymentMethod(data[0].value);
        }
      })
      .catch(err => {
        console.error('Error fetching payment methods:', err);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const salaryData = {
      user: selectedUser,
      amount: parseFloat(amount),
      overtime_hours: parseFloat(overtimeHours),
      penalty: parseFloat(penalty),
      payment_method: paymentMethod,
    };

    fetch('http://127.0.0.1:8000/api/salaries/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salaryData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create salary.');
        }
        return response.json();
      })
      .then(data => {
        setSuccess(true);
        setError(null);
        setAmount('');
        setOvertimeHours('');
        setPenalty('');
        if (paymentMethods.length > 0) {
          setPaymentMethod(paymentMethods[0].value);
        }
        const updatedUsers = users.filter(user => user.id !== parseInt(selectedUser, 10));
        setUsers(updatedUsers);
        if (updatedUsers.length > 0) {
          setSelectedUser(updatedUsers[0].id);
        } else {
          setSelectedUser('');
        }
      })
      .catch(err => {
        setError(err.message);
        setSuccess(false);
      });
  };

  return (
    <div className="add-salary-container">
      <h2>Add Salary</h2>
      {success && <div className="success-message">Salary successfully added!</div>}
      {error && <div className="error-message">Error: {error}</div>}
      <form className="add-salary-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>User:</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            required
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Overtime Hours:</label>
          <input
            type="number"
            step="0.01"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Penalty:</label>
          <input
            type="number"
            step="0.01"
            value={penalty}
            onChange={(e) => setPenalty(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Payment Method:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            {paymentMethods.map((method, index) => (
              <option key={index} value={method.value}>
                {method.display}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={!selectedUser}>
          Add Salary
        </button>
      </form>
    </div>
  );
}

export default AddSalary;
