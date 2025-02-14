import React from "react";
import { BrowserRouter as Router, Routes, Navigate, Route } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import EmployeeManagement from "./components/EmployeeManagement";
import DepartmentManagement from "./components/DepartmentManagement";
import Reporting from "./components/Reporting";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Employee from "./components/Employee";
import ManageDepartments from "./components/ManageDepartments";
import AttendanceTable from "./components/AttendanceTable";
import EditUpdateProfile from "./components/EditUpdateProfile";
import SalaryList from "./components/SalaryList";
import SalaryEdit from "./components/SalaryEdit";
import AddSalary from "./components/AddSalary";
import ManagerDepartment from "./components/ManagerDashboard";
import Notifications from "./components/Notifications";
import Payout from "./components/Payout";
import Navbar from "./components/AdminNavbar";
import HomeNavbar from "./components/HomeNavbar";
import DailyLog from "./components/DailyLog";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/employee-management" element={<ProtectedRoute><EmployeeManagement /></ProtectedRoute>} />
        {/* <Route path="/payroll" element={<ProtectedRoute><PayrollManagement /></ProtectedRoute>} /> */}
        <Route path="/manager" element={<ProtectedRoute><ManagerDepartment /></ProtectedRoute>} />
        <Route path="/employee" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reporting /></ProtectedRoute>} />
        <Route path="/employee-list" element={<ProtectedRoute><Employee /></ProtectedRoute>} />
        <Route path="/admin-departments" element={<ProtectedRoute><ManageDepartments /></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute><DepartmentManagement /></ProtectedRoute>} />
        <Route path="/addsalary" element={<ProtectedRoute><AddSalary /></ProtectedRoute>} />
        <Route path="/salary" element={<ProtectedRoute><SalaryList /></ProtectedRoute>} />
        <Route path="/editsalary" element={<ProtectedRoute><SalaryEdit /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><AttendanceTable /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><EditUpdateProfile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        <Route path="/payout" element={<ProtectedRoute><Payout /></ProtectedRoute>} />
        <Route path="/dailylog" element={<ProtectedRoute><DailyLog /></ProtectedRoute>} />

        <Route path="/AdminNavbar" element={<ProtectedRoute><Navbar /></ProtectedRoute>} />
        <Route path="/navbar" element={<ProtectedRoute><HomeNavbar /></ProtectedRoute>} />


      </Routes>
    </Router>
  );
}

export default App;
