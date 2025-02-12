import React, { useState, useEffect } from 'react';

const AddPayroll = () => {
  // State for storing users fetched from the API.
  const [users, setUsers] = useState([]);
  // States for the payroll record fields.
  const [employeeId, setEmployeeId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [overtimeHours, setOvertimeHours] = useState('');
  const [adjustment, setAdjustment] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem("token");

  // Fetch the list of employees when the component mounts.
  useEffect(() => {
    fetch('http://localhost:8000/api/users/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response not ok');
        }
        return response.json();
      })
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  // Handle form submission.
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the data payload. Note that we now send 'payment_date' and 'adjustment'.
    const data = {
      employee_id: employeeId,
      payment_date: paymentDate,
      hours_worked: hoursWorked,
      overtime_hours: overtimeHours,
      adjustment: adjustment,
    };

    fetch('http://localhost:8000/api/payrolls/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error posting payroll record');
        }
        return response.json();
      })
      .then(result => {
        setMessage('Payroll record added successfully!');
      })
      .catch(error => {
        console.error('Error adding payroll record:', error);
        setMessage('Failed to add payroll record.');
      });
  };

  return (
    <div>
      <h2>Add Payroll Record</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        {/* Employee selection */}
        <div>
          <label>
            Employee:&nbsp;
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
              <option value="">Select an employee</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          </label>
        </div>
        {/* Payment date input */}
        <div>
          <label>
            Payment Date:&nbsp;
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </label>
        </div>
        {/* Hours worked input */}
        <div>
          <label>
            Hours Worked:&nbsp;
            <input
              type="number"
              step="0.01"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
              required
            />
          </label>
        </div>
        {/* Overtime hours input */}
        <div>
          <label>
            Overtime Hours:&nbsp;
            <input
              type="number"
              step="0.01"
              value={overtimeHours}
              onChange={(e) => setOvertimeHours(e.target.value)}
            />
          </label>
        </div>
        {/* Adjustment input */}
        <div>
          <label>
            Adjustment (Bonus/Fine):&nbsp;
            <input
              type="number"
              step="0.01"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">Submit Payroll Record</button>
      </form>
    </div>
  );
};

export default AddPayroll;
