import React, { useState, useEffect } from "react";

const PaymentTracking = () => {
  const [payments, setPayments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employee/payments/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPayments(data))
      .catch((err) => console.error("Error fetching payment history:", err));
  }, [token]);

  return (
    <div className="payment-tracking">
      <h1>Payment History</h1>
      <ul>
        {payments.map((pay) => (
          <li key={pay.id}>
            Date: {pay.date} – Amount: {pay.amount} – Method: {pay.method}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentTracking;
