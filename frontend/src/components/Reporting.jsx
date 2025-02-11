import React, { useState, useEffect } from "react";

const Reporting = () => {
  const [reportData, setReportData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/admin/reports/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setReportData(data))
      .catch((err) => console.error("Error fetching report data:", err));
  }, [token]);

  if (!reportData) {
    return <p>Loading reports...</p>;
  }

  return (
    <div className="reporting">
      <h1>Reports</h1>
      <section>
        <h2>Payroll Reports</h2>
        <p>Total Payroll Expense: {reportData.totalPayroll}</p>
        <p>Total Taxes: {reportData.totalTaxes}</p>
      </section>
      <section>
        <h2>Departmental Reports</h2>
        {reportData.departments &&
          reportData.departments.map((dept, index) => (
            <div key={index}>
              <h3>{dept.name}</h3>
              <p>Payroll Expense: {dept.payrollExpense}</p>
            </div>
          ))}
      </section>
      <section>
        <h2>Custom Reports</h2>
        {/* Add a form here to generate custom reports if needed */}
      </section>
    </div>
  );
};

export default Reporting;
