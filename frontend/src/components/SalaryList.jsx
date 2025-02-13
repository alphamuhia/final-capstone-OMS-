// import React, { useState, useEffect } from 'react';
// import SalaryEdit from './SalaryEdit';
// import './styling/SalaryList.css';
// import { Link } from 'react-router-dom';

// function SalaryList() {
//   const [salaries, setSalaries] = useState([]);
//   const [users, setUsers] = useState([]); // State to hold the list of users
//   const [selectedSalary, setSelectedSalary] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch both salaries and users concurrently
//     Promise.all([
//       fetch('http://127.0.0.1:8000/api/salaries/').then(response => response.json()),
//       fetch('http://127.0.0.1:8000/api/users/').then(response => response.json())
//     ])
//       .then(([salaryData, userData]) => {
//         // Handle possible pagination for salaries or users:
//         const salariesArray = salaryData.results || salaryData;
//         const usersArray = userData.results || userData;
//         setSalaries(salariesArray);
//         setUsers(usersArray);
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error('Error fetching salaries or users:', error);
//         setLoading(false);
//       });
//   }, []);

//   const handleEdit = (salary) => {
//     setSelectedSalary(salary);
//   };

//   const handleUpdate = (updatedSalary) => {
//     setSalaries(salaries.map(s => (s.id === updatedSalary.id ? updatedSalary : s)));
//     setSelectedSalary(null);
//   };

//   if (loading) return <div className="loading">Loading...</div>;

//   return (
//     <div className="salary-list">
//       <nav>
//         <li><Link to="/admin">Dashboard</Link></li>
//       </nav>
//       <h1>Salary Payments &amp; History</h1>
//       <Link to="/addsalary">Add new salary</Link>
//       {Array.isArray(salaries) ? (
//         <ul>
//           {salaries.map(salary => {
//             const userObj = users.find(user => user.id === salary.user);
//             const username = userObj ? userObj.username : salary.user;

//             return (
//               <li key={salary.id}>
//                 <div className="salary-details">
//                   <strong>User Name:</strong> {username} | <strong>Amount:</strong> Ksh. {salary.amount} |{' '}
//                   <strong>Overtime Hours:</strong> {salary.overtime_hours} Hrs| <strong>Penalty:</strong> Ksh. {salary.penalty} |{' '}
//                   <strong>Tax:</strong> Ksh. {salary.tax} | <strong>Net Salary:</strong> Ksh. {salary.net_salary} |{' '}
//                   <strong>Payment Method:</strong> {salary.payment_method}
//                 </div>
//                 <button onClick={() => handleEdit(salary)}>Edit</button>
//                 <Link to="/payout">
//                   <button>Payout</button>
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>
//       ) : (
//         <div>Data is not in the expected format.</div>
//       )}

//       {selectedSalary && (
//         <div className="modal">
//           <div className="modal-content">
//             <SalaryEdit
//               salary={selectedSalary}
//               onUpdate={handleUpdate}
//               onCancel={() => setSelectedSalary(null)}
//               onDelete={(deletedId) => {
//                 setSalaries(salaries.filter(s => s.id !== deletedId));
//                 setSelectedSalary(null);
//               }}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default SalaryList;



import React, { useState, useEffect } from 'react';
import SalaryEdit from './SalaryEdit';
import './styling/SalaryList.css';
import { Link, useNavigate } from 'react-router-dom';

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function SalaryList() {
  const [salaries, setSalaries] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // States for filtering
  const [searchText, setSearchText] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/salaries/').then((response) => response.json()),
      fetch('http://127.0.0.1:8000/api/users/').then((response) => response.json())
    ])
      .then(([salaryData, userData]) => {
        const salariesArray = salaryData.results || salaryData;
        const usersArray = userData.results || userData;
        setSalaries(salariesArray);
        setUsers(usersArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching salaries or users:', error);
        setLoading(false);
      });
  }, []);

  const handleEdit = (salary) => {
    setSelectedSalary(salary);
  };

  const handleUpdate = (updatedSalary) => {
    setSalaries(salaries.map((s) => (s.id === updatedSalary.id ? updatedSalary : s)));
    setSelectedSalary(null);
  };

  const handlePaymentAction = async (salary) => {
    if (salary.payment_method.toLowerCase() === 'bank') {
      navigate('/payout', { state: { salary } });
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/salaries/${salary.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paid: true,
          paid_at: new Date().toISOString()
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const updatedSalary = await response.json();
      setSalaries(salaries.map((s) => (s.id === updatedSalary.id ? updatedSalary : s)));
    } catch (error) {
      console.error('Error marking salary as paid:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  // Get unique payment methods (in lowercase for uniform filtering)
  const uniquePaymentMethods = Array.from(
    new Set(salaries.map((s) => s.payment_method.toLowerCase()))
  );

  // Filter salaries based on search text, payment method, and paid status
  const filteredSalaries = salaries.filter((salary) => {
    // Find the corresponding user for the salary
    const userObj = users.find((user) => user.id === salary.user);
    const username = userObj ? userObj.username.toLowerCase() : salary.user.toString().toLowerCase();
    const searchMatch = username.includes(searchText.toLowerCase());
    const paymentMatch =
      paymentFilter === '' ||
      salary.payment_method.toLowerCase() === paymentFilter;
    const paidMatch =
      paidFilter === '' ||
      (paidFilter === 'paid' ? salary.paid : !salary.paid);
    return searchMatch && paymentMatch && paidMatch;
  });

  return (
    <div className="salary-list">
      <nav>
        <li>
          <Link to="/admin">Dashboard</Link>
        </li>
      </nav>
      <h1>Salary Payments &amp; History</h1>
      <Link to="/addsalary">Add new salary</Link>

      {/* Filters Section */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search by user name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="">All Payment Methods</option>
          {uniquePaymentMethods.map((method, idx) => (
            <option key={idx} value={method}>
              {method.charAt(0).toUpperCase() + method.slice(1)}
            </option>
          ))}
        </select>
        <select value={paidFilter} onChange={(e) => setPaidFilter(e.target.value)}>
          <option value="">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {Array.isArray(filteredSalaries) ? (
        <ul>
          {filteredSalaries.map((salary) => {
            const userObj = users.find((user) => user.id === salary.user);
            const username = userObj ? userObj.username : salary.user;

            // Define the action button and the paid info message
            let actionButton = null;
            let paidMessage = null;

            // If the payment method is 'bank', show the payout button
            if (salary.payment_method.toLowerCase() === 'bank') {
              actionButton = (
                <button onClick={() => handlePaymentAction(salary)}>
                  Payout
                </button>
              );
            } else {
              // For non-bank payments, determine if the salary has been paid and if the 30-day period is still active.
              if (salary.paid && salary.paid_at) {
                const paidAt = new Date(salary.paid_at).getTime();
                const expiryTime = paidAt + 30 * 24 * 3600 * 1000; // 30 days later
                const timeRemainingMs = expiryTime - currentTime.getTime();

                // Display the paid message with a timer
                if (timeRemainingMs > 0) {
                  paidMessage = (
                    <div className="paid-message">
                      Salary marked as paid on{' '}
                      {new Date(salary.paid_at).toLocaleString()}. Next payment available in{' '}
                      {formatTime(timeRemainingMs)}.
                    </div>
                  );
                  // Disable the button until the timer expires
                  actionButton = (
                    <button disabled>
                      Paid ({formatTime(timeRemainingMs)} remaining)
                    </button>
                  );
                } else {
                  // If the 30-day period is over, allow marking as paid again.
                  actionButton = (
                    <button onClick={() => handlePaymentAction(salary)}>
                      Mark as Paid
                    </button>
                  );
                }
              } else {
                // If the salary hasn't been paid yet, show the "Mark as Paid" button.
                actionButton = (
                  <button onClick={() => handlePaymentAction(salary)}>
                    Mark as Paid
                  </button>
                );
              }
            }

            return (
              <li key={salary.id}>
                <div className="salary-details">
                  <strong>User Name:</strong> {username} | <strong>Amount:</strong> Ksh. {salary.amount} |{' '}
                  <strong>Overtime Hours:</strong> {salary.overtime_hours} Hrs | <strong>Penalty:</strong> Ksh. {salary.penalty} |{' '}
                  <strong>Tax:</strong> Ksh. {salary.tax} | <strong>Net Salary:</strong> Ksh. {salary.net_salary} |{' '}
                  <strong>Payment Method:</strong> {salary.payment_method}
                </div>
                {paidMessage}
                <button onClick={() => handleEdit(salary)}>Edit</button>
                {actionButton}
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
                setSalaries(salaries.filter((s) => s.id !== deletedId));
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
