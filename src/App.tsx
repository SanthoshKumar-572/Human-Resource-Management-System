/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStore } from '@/store';

// Pages
import Login from '@/pages/auth/Login';
import EmployeeDashboard from '@/pages/employee/Dashboard';
import Attendance from '@/pages/employee/Attendance';
import Leave from '@/pages/employee/Leave';
import Profile from '@/pages/employee/Profile';

import AdminDashboard from '@/pages/admin/Dashboard';
import Directory from '@/pages/admin/Directory';
import Approvals from '@/pages/admin/Approvals';
import Payroll from '@/pages/admin/Payroll';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { currentUser } = useStore();
  
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<DashboardLayout />}>
          {/* Employee Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Attendance />
            </ProtectedRoute>
          } />
          <Route path="/leave" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Leave />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/directory" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Directory />
            </ProtectedRoute>
          } />
          <Route path="/admin/approvals" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Approvals />
            </ProtectedRoute>
          } />
          <Route path="/admin/payroll" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Payroll />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
