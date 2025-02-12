import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styling/PayrollManagement.css"; 

const PayrollManagement = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("direct_deposit");
  const [amount, setAmount] = useState("");
  const [payday, setPayday] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPayrollId, setEditingPayrollId] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchPayrolls = () => {
    fetch("http://127.0.0.1:8000/api/payrolls/", {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
     },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error fetching payrolls: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setPayrolls(data);
        localStorage.setItem("payrolls", JSON.stringify(data));
      })
      .catch((err) => console.error("Error fetching payrolls:", err));
  };

  const fetchEmployees = () => {
    fetch("http://127.0.0.1:8000/api/users/", {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error fetching employees: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Error fetching employees:", err));
  };

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      user: selectedEmployee,
      salary: amount,
      payment_method: paymentMethod,
      payday: payday,
      notes: notes,
    };

    if (isEditing) {
      fetch(`http://127.0.0.1:8000/api/payrolls/${editingPayrollId}/`, {
        method: "PATCH", 
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error updating payroll: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const updatedPayrolls = payrolls.map((payroll) =>
            payroll.id === editingPayrollId ? data : payroll
          );
          setPayrolls(updatedPayrolls);
          localStorage.setItem("payrolls", JSON.stringify(updatedPayrolls));
          resetForm();
          setSubmitting(false);
        })
        .catch((err) => {
          console.error("Error updating payroll:", err);
          setSubmitting(false);
        });
    } else {
      fetch("http://127.0.0.1:8000/api/payrolls/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error submitting payroll: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const updatedPayrolls = [...payrolls, data];
          setPayrolls(updatedPayrolls);
          localStorage.setItem("payrolls", JSON.stringify(updatedPayrolls));
          navigate(`/payrolls/${data.id}`);
          resetForm();
          setSubmitting(false);
        })
        .catch((err) => {
          console.error("Error submitting payroll:", err);
          setSubmitting(false);
        });
    }
  };

  const handleEdit = (payroll) => {
    setSelectedEmployee(payroll.user);
    setPaymentMethod(payroll.payment_method);
    setAmount(payroll.salary);
    setPayday(payroll.payday);
    setNotes(payroll.notes);
    setIsEditing(true);
    setEditingPayrollId(payroll.id);
  };

  const resetForm = () => {
    setSelectedEmployee("");
    setPaymentMethod("direct_deposit");
    setAmount("");
    setPayday("");
    setNotes("");
    setIsEditing(false);
    setEditingPayrollId(null);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  return (
    <div className="payroll-management">
      <nav>
        <li><Link to="/admin">Dashboard</Link></li>
      </nav>
      <h1>Payroll Management</h1>
      
      {/* Payroll Entry Form */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Employee:
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.username} ({emp.department ? emp.department.name : "N/A"})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Payment Method:
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="direct_deposit">Direct Deposit</option>
              <option value="check">Check</option>
              <option value="electronic_transfer">Electronic Transfer</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Amount:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Payday:
            <input
              type="date"
              value={payday}
              onChange={(e) => setPayday(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Notes:
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        <button type="submit" disabled={submitting}>
          {isEditing ? "Update Payroll" : "Submit Payroll"}
        </button>
        {isEditing && (
          <button type="button" onClick={handleCancelEdit} disabled={submitting}>
            Cancel Edit
          </button>
        )}
      </form>

      {/* Display the list of posted payrolls */}
      <h2>Posted Payrolls</h2>
      {payrolls.length === 0 ? (
        <p>No payrolls found.</p>
      ) : (
        <ul>
          {payrolls.map((payroll) => (
            <li key={payroll.id}>
              <div>
                <strong>ID:</strong> {payroll.id} | <strong>Employee ID:</strong> {payroll.user} |{" "}
                <strong>Amount:</strong> {payroll.salary} | <strong>Method:</strong> {payroll.payment_method} |{" "}
                <strong>Payday:</strong> {payroll.payday}
              </div>
              <button onClick={() => handleEdit(payroll)}>Edit</button>
            </li>
          ))}
        </ul>
      )}

      {/* Payment History Table */}
      <h2>Payment History</h2>
      {payrolls.length === 0 ? (
        <p>No payment history found.</p>
      ) : (
        <table className="payment-history-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Payment Method</th>
              <th>Amount</th>
              <th>Payday</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((payroll) => {
              // Find the corresponding employee object
              const employee = employees.find((emp) => emp.id === payroll.user);
              return (
                <tr key={payroll.id}>
                  <td>{payroll.id}</td>
                  <td>{employee ? employee.username : payroll.user}</td>
                  <td>{employee && employee.department ? employee.department.name : "N/A"}</td>
                  <td>{payroll.payment_method}</td>
                  <td>{payroll.salary}</td>
                  <td>{payroll.payday}</td>
                  <td>{payroll.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PayrollManagement;
