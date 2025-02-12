import React, { useEffect, useState } from 'react';

const PayrollHistory = () => {
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/payrolls/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        return response.json();
      })
      .then(data => setPayrolls(data))
      .catch(error => console.error('Error fetching payroll data:', error));
  }, []);

  return (
    <div>
      <h1>Payroll History</h1>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Employee</th>
            <th>Hours Worked</th>
            <th>Overtime Hours</th>
            <th>Gross Pay</th>
            <th>Tax</th>
            <th>Deductions</th>
            <th>Net Pay</th>
            <th>Net Pay After Advances</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map(payroll => (
            <tr key={payroll.id}>
              <td>{payroll.date}</td>
              <td>{payroll.employee?.username}</td>
              <td>{payroll.hours_worked}</td>
              <td>{payroll.overtime_hours}</td>
              <td>{payroll.gross_pay}</td>
              <td>{payroll.tax}</td>
              <td>{payroll.deductions}</td>
              <td>{payroll.net_pay}</td>
              <td>{payroll.net_pay_after_advances}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollHistory;
