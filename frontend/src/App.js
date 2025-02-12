import React from "react";
import { BrowserRouter as Router, Routes, Navigate, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/AdminDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import EmployeeManagement from "./components/EmployeeManagement";
import DepartmentManagement from "./components/DepartmentManagement";
// import PayrollManagement from "./components/PayrollManagement";
// import PaymentTracking from "./components/PaymentTracking";
import Reporting from "./components/Reporting";
import NotificationsAlerts from "./components/NotificationsAlerts";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import ManagerDashboard from "./components/ManagerDashboard";
import Employee from "./components/Employee";
import ManageDepartments from "./components/ManageDepartments";
import Salary from "./components/Salary";
import AttendanceTable from "./components/AttendanceTable";
import EditUpdateProfile from "./components/EditUpdateProfile";
import AddPayroll from "./components/AddPayroll";
import PayrollHistory from "./components/PayrollHistory";
import PendingApprovalsCard from "./components/PendingAprovals";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Admin Routes */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        {/* <Route path="/admin/employees" element={<EmployeeManagement />} /> */}
        {/* <Route path="/admin/departments" element={<DepartmentManagement />} /> */}
        {/* <Route path="/admin/payroll" element={<PayrollManagement />} /> */}
        {/* <Route path="/admin/reports" element={<Reporting />} /> */}
        {/* <Route path="/admin/notifications" element={<NotificationsAlerts />} /> */}
        {/* Employee Routes */}
        {/* <Route path="/employee" element={<EmployeeDashboard />} /> */}
        {/* <Route path="/employee/payments" element={<PaymentTracking />} /> */}

        {/* Protected Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/employee-management" element={<ProtectedRoute><EmployeeManagement /></ProtectedRoute>} />
        {/* <Route path="/payroll" element={<ProtectedRoute><PayrollManagement /></ProtectedRoute>} /> */}
        <Route path="/manager" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/employee" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsAlerts /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reporting /></ProtectedRoute>} />
        <Route path="/employee-list" element={<ProtectedRoute><Employee /></ProtectedRoute>} />
        <Route path="/admin-departments" element={<ProtectedRoute><ManageDepartments /></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute><DepartmentManagement /></ProtectedRoute>} />
        <Route path="/salary" element={<ProtectedRoute><Salary /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><AttendanceTable /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><EditUpdateProfile /></ProtectedRoute>} />
        <Route path="/payroll" element={<ProtectedRoute><AddPayroll /></ProtectedRoute>} />
        <Route path="/payhistory" element={<ProtectedRoute><PayrollHistory /></ProtectedRoute>} />
        <Route path="/approvals" element={<ProtectedRoute><PendingApprovalsCard /></ProtectedRoute>} />

      </Routes>
    </Router>
  );
}

export default App;
