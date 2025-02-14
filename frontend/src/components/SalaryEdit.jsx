import React, { useState } from 'react';
import './styling/SalaryEdit.css';

function SalaryEdit({ salary, onUpdate, onCancel, onDelete }) {
  const paymentMethodOptions = [
    { value: 'check', display: 'Check' },
    { value: 'cash', display: 'Cash' },
    { value: 'bank', display: 'Bank' }
  ];

  const [amount, setAmount] = useState(salary.amount);
  const [overtimeHours, setOvertimeHours] = useState(salary.overtime_hours);
  const [penalty, setPenalty] = useState(salary.penalty);
  const [paymentMethod, setPaymentMethod] = useState(
    salary.payment_method || paymentMethodOptions[0].value
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedSalary = {
      ...salary,
      amount: parseFloat(amount),
      overtime_hours: parseFloat(overtimeHours),
      penalty: parseFloat(penalty),
      payment_method: paymentMethod,
    };

    fetch(`http://127.0.0.1:8000/api/salaries/${salary.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSalary),
    })
      .then(response => response.json())
      .then(data => {
        onUpdate(data);
      })
      .catch(error => console.error('Error updating salary:', error));
  };

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this salary?')) {
      return;
    }

    fetch(`http://127.0.0.1:8000/api/salaries/${salary.id}/`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          if (onDelete) {
            onDelete(salary.id);
          } else {
            onCancel();
          }
        } else {
          console.error('Failed to delete salary.');
        }
      })
      .catch(error => console.error('Error deleting salary:', error));
  };

  return (
    <>
    <div className="salary-edit-container">
      <h2>Edit Salary</h2>
      <form className="salary-edit-form" onSubmit={handleSubmit}>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label>Overtime Hours:</label>
          <input
            type="number"
            step="0.01"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(e.target.value)}
          />
        </div>
        <div>
          <label>Penalty:</label>
          <input
            type="number"
            step="0.01"
            value={penalty}
            onChange={(e) => setPenalty(e.target.value)}
          />
        </div>
        <div>
          <label>Payment Method:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            {paymentMethodOptions.map((method, index) => (
              <option key={index} value={method.value}>
                {method.display}
              </option>
            ))}
          </select>
        </div>
        <div className="button-group">
          <button type="submit">Update</button>
          <button type="button" className="delete-btn" onClick={handleDelete}>
            Delete
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
    </>
  );
}

export default SalaryEdit;
