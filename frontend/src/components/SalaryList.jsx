import React, { useState, useEffect } from 'react';
import SalaryEdit from './SalaryEdit';
import './styling/SalaryList.css';
import { Link, useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

// Helper function to format milliseconds into a days/hours/minutes/seconds string.
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

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');

  // Update currentTime every second for the countdown timer.
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper: load local updates from localStorage.
  const loadLocalUpdates = () => {
    return JSON.parse(localStorage.getItem('localSalaryUpdates') || '{}');
  };

  // Helper: save local updates to localStorage.
  const saveLocalUpdates = (updates) => {
    localStorage.setItem('localSalaryUpdates', JSON.stringify(updates));
  };

  // When fetching salary and user data, merge in any locally stored updates.
  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/salaries/').then((response) =>
        response.json()
      ),
      fetch('http://127.0.0.1:8000/api/users/').then((response) =>
        response.json()
      )
    ])
      .then(([salaryData, userData]) => {
        const salariesArray = salaryData.results || salaryData;
        const usersArray = userData.results || userData;
        const localUpdates = loadLocalUpdates();
        // Merge local updates into the fetched salaries.
        const mergedSalaries = salariesArray.map((salary) => {
          if (localUpdates[salary.id]) {
            // Check if the timer has already expired for this local update.
            const paidAt = new Date(localUpdates[salary.id].paid_at).getTime();
            const expiryTime = paidAt + 30 * 24 * 3600 * 1000;
            if (expiryTime < new Date().getTime()) {
              // Timer expired, remove the local update.
              delete localUpdates[salary.id];
              return { ...salary, paid: false, paid_at: null };
            }
            return { ...salary, ...localUpdates[salary.id] };
          }
          return salary;
        });
        saveLocalUpdates(localUpdates);
        setSalaries(mergedSalaries);
        setUsers(usersArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching salaries or users:', error);
        setLoading(false);
      });
  }, []);

  // Every time currentTime updates, check if any salary's 30-day lockout has expired.
  useEffect(() => {
    setSalaries((prevSalaries) => {
      const localUpdates = loadLocalUpdates();
      let updated = false;
      const newSalaries = prevSalaries.map((salary) => {
        if (
          salary.paid &&
          salary.paid_at &&
          new Date(salary.paid_at).getTime() + 30 * 24 * 3600 * 1000 <=
            currentTime.getTime()
        ) {
          updated = true;
          if (localUpdates[salary.id]) {
            delete localUpdates[salary.id];
          }
          // Reset the salary to allow marking as paid again.
          return { ...salary, paid: false, paid_at: null };
        }
        return salary;
      });
      if (updated) {
        saveLocalUpdates(localUpdates);
      }
      return newSalaries;
    });
  }, [currentTime]);

  // Handle opening the edit modal for a salary.
  const handleEdit = (salary) => {
    setSelectedSalary(salary);
  };

  // Update the salary in the list after editing.
  const handleUpdate = (updatedSalary) => {
    setSalaries((prevSalaries) =>
      prevSalaries.map((s) =>
        s.id === updatedSalary.id ? updatedSalary : s
      )
    );
    setSelectedSalary(null);
  };

  // Process the payout action.
  // - For bank payments, navigate to the payout page.
  // - For check or cash, update the state locally (and localStorage) without a backend call.
  // - For other methods, proceed with the backend update.
  const handlePaymentAction = async (salary) => {
    const method = salary.payment_method.toLowerCase();

    if (method === 'bank') {
      navigate('/payout', { state: { salary } });
      return;
    } else if (method === 'check' || method === 'cash') {
      // Update state locally for check or cash payments.
      const updatedSalary = {
        ...salary,
        paid: true,
        paid_at: new Date().toISOString(),
      };

      // Save this update in localStorage.
      const localUpdates = loadLocalUpdates();
      localUpdates[salary.id] = {
        paid: true,
        paid_at: updatedSalary.paid_at,
      };
      saveLocalUpdates(localUpdates);

      setSalaries((prevSalaries) =>
        prevSalaries.map((s) =>
          s.id === updatedSalary.id ? updatedSalary : s
        )
      );
      return;
    }

    // For any other non-bank payment methods that require backend interaction.
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/salaries/${salary.id}/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paid: true,
            paid_at: new Date().toISOString(),
          }),
        }
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const updatedSalary = await response.json();
      setSalaries((prevSalaries) =>
        prevSalaries.map((s) =>
          s.id === updatedSalary.id ? updatedSalary : s
        )
      );
    } catch (error) {
      console.error('Error marking salary as paid:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  // Get unique payment methods for the payment filter dropdown.
  const uniquePaymentMethods = Array.from(
    new Set(salaries.map((s) => s.payment_method.toLowerCase()))
  );

  // Apply filters: search by username, payment method, and paid status.
  const filteredSalaries = salaries.filter((salary) => {
    const userObj = users.find((user) => user.id === salary.user);
    const username = userObj
      ? userObj.username.toLowerCase()
      : salary.user.toString().toLowerCase();
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
    <>
      <AdminNavbar />
      <div className="salary-list">
        <h1>Salary Payments &amp; History</h1>
        <Link to="/addsalary">Add new salary</Link>

        {/* Filter Section */}
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
          <select
            value={paidFilter}
            onChange={(e) => setPaidFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        {/* Salary List Section */}
        {Array.isArray(filteredSalaries) ? (
          <ul>
            {filteredSalaries.map((salary) => {
              const userObj = users.find((user) => user.id === salary.user);
              const username = userObj ? userObj.username : salary.user;
              
              // Determine if the timer is running for this salary.
              const isTimerRunning =
                salary.paid &&
                salary.paid_at &&
                new Date(salary.paid_at).getTime() + 30 * 24 * 3600 * 1000 >
                  currentTime.getTime();
              
              let actionButton = null;
              let paidMessage = null;

              if (salary.payment_method.toLowerCase() === 'bank') {
                actionButton = (
                  <button onClick={() => handlePaymentAction(salary)}>
                    Payout
                  </button>
                );
              } else {
                if (salary.paid && salary.paid_at) {
                  const paidAt = new Date(salary.paid_at).getTime();
                  const expiryTime = paidAt + 30 * 24 * 3600 * 1000; // 30 days in ms
                  const timeRemainingMs = expiryTime - currentTime.getTime();

                  if (timeRemainingMs > 0) {
                    paidMessage = (
                      <div className="paid-message">
                        Salary marked as paid on{' '}
                        {new Date(salary.paid_at).toLocaleString()}. Next payment
                        available in {formatTime(timeRemainingMs)}.
                      </div>
                    );
                    actionButton = (
                      <button disabled>
                        Paid ({formatTime(timeRemainingMs)} remaining)
                      </button>
                    );
                  } else {
                    // Timer expired: show button to mark as paid again.
                    actionButton = (
                      <button onClick={() => handlePaymentAction(salary)}>
                        Mark as Paid
                      </button>
                    );
                  }
                } else {
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
                    <strong>User Name:</strong> {username} |{' '}
                    <strong>Amount:</strong> Ksh. {salary.amount} |{' '}
                    <strong>Overtime Hours:</strong> {salary.overtime_hours} Hrs |{' '}
                    <strong>Penalty:</strong> Ksh. {salary.penalty} |{' '}
                    <strong>Tax:</strong> Ksh. {salary.tax} |{' '}
                    <strong>Net Salary:</strong> Ksh. {salary.net_salary} |{' '}
                    <strong>Payment Method:</strong> {salary.payment_method}
                  </div>
                  {paidMessage}
                  {/* Disable Edit button if timer is active */}
                  <button onClick={() => handleEdit(salary)} disabled={isTimerRunning}>
                    Edit
                  </button>
                  {actionButton}
                </li>
              );
            })}
          </ul>
        ) : (
          <div>Data is not in the expected format.</div>
        )}

        {/* Modal for editing a salary */}
        {selectedSalary && (
          <div className="modal">
            <div className="modal-content">
              <SalaryEdit
                salary={selectedSalary}
                onUpdate={handleUpdate}
                onCancel={() => setSelectedSalary(null)}
                onDelete={(deletedId) => {
                  setSalaries((prevSalaries) =>
                    prevSalaries.filter((s) => s.id !== deletedId)
                  );
                  setSelectedSalary(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SalaryList;
