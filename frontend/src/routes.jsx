import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import EmployeeDashboard from "./pages/employee/Dashboard";
import SuperAdminDashboard from "./pages/superAdmin/Dashboard";
import ProtectedRoute from "./auth/ProtectedRoute";

import CreateAdmin from "./pages/superAdmin/CreateAdmin";
import CreateEmployee from "./pages/admin/CreateEmployee";
import EmployeeList from "./pages/admin/ViewEmployee";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import AdminLayout from "./layouts/AdminLayout";
import Attendance from "./pages/admin/Attendance";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowed={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="create-employee" element={<CreateEmployee />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="attendance" element={<Attendance />} />
      </Route>

      <Route
        path="/employee"
        element={
          <ProtectedRoute allowed={["EMPLOYEE"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowed={["SUPER_ADMIN"]}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="create-admin" element={<CreateAdmin />} />
      </Route>

      <Route
        path="/admin/create-employee"
        element={
          <ProtectedRoute allowed={["ADMIN"]}>
            <CreateEmployee />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute allowed={["ADMIN"]}>
            <EmployeeList />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
