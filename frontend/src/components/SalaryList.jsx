import React, { useState, useEffect } from 'react';
import SalaryEdit from './SalaryEdit';
import './styling/SalaryList.css';
import { Link } from 'react-router-dom';

function SalaryList() {
  const [salaries, setSalaries] = useState([]);
  const [users, setUsers] = useState([]); // State to hold the list of users
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both salaries and users concurrently
    Promise.all([
      fetch('http://127.0.0.1:8000/api/salaries/').then(response => response.json()),
      fetch('http://127.0.0.1:8000/api/users/').then(response => response.json())
    ])
      .then(([salaryData, userData]) => {
        // Handle possible pagination for salaries or users:
        const salariesArray = salaryData.results || salaryData;
        const usersArray = userData.results || userData;
        setSalaries(salariesArray);
        setUsers(usersArray);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching salaries or users:', error);
        setLoading(false);
      });
  }, []);

  const handleEdit = (salary) => {
    setSelectedSalary(salary);
  };

  const handleUpdate = (updatedSalary) => {
    setSalaries(salaries.map(s => (s.id === updatedSalary.id ? updatedSalary : s)));
    setSelectedSalary(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="salary-list">
      <h1>Salary Payments &amp; History</h1>
      <Link to="/addsalary">Add new salary</Link>
      {Array.isArray(salaries) ? (
        <ul>
          {salaries.map(salary => {
            // Match the salary.user (assumed to be an ID) with a user from the users list.
            const userObj = users.find(user => user.id === salary.user);
            // If a match is found, use the username; otherwise, fallback to displaying the raw value.
            const username = userObj ? userObj.username : salary.user;

            return (
              <li key={salary.id}>
                <div className="salary-details">
                  <strong>User Name:</strong> {username} | <strong>Amount:</strong> ${salary.amount} |{' '}
                  <strong>Overtime Hours:</strong> {salary.overtime_hours} | <strong>Penalty:</strong> ${salary.penalty} |{' '}
                  <strong>Tax:</strong> ${salary.tax} | <strong>Net Salary:</strong> ${salary.net_salary} |{' '}
                  <strong>Payment Method:</strong> {salary.payment_method}
                </div>
                <button onClick={() => handleEdit(salary)}>Edit</button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div>Data is not in the expected format.</div>
      )}

      {selectedSalary && (
        <div className="modal">
          <div className="modal-content">
            <SalaryEdit
              salary={selectedSalary}
              onUpdate={handleUpdate}
              onCancel={() => setSelectedSalary(null)}
              onDelete={(deletedId) => {
                // Remove the deleted salary from the list
                setSalaries(salaries.filter(s => s.id !== deletedId));
                setSelectedSalary(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SalaryList;
