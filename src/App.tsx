/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import { AdminLayout, BranchLayout } from './components/Layout';

import AdminDashboard from './pages/admin/Dashboard';
import AdminBranches from './pages/admin/Branches';
import AdminReports from './pages/admin/Reports';
import AdminGlobalProducts from './pages/admin/GlobalProducts';
import AdminTransfers from './pages/admin/Transfers';
import AdminBranchDetails from './pages/admin/BranchDetails';

import BranchSell from './pages/branch/Sell';
import BranchStock from './pages/branch/Stock';
import BranchReports from './pages/branch/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="branches" element={<AdminBranches />} />
          <Route path="branches/:id" element={<AdminBranchDetails />} />
          <Route path="products" element={<AdminGlobalProducts />} />
          <Route path="transfers" element={<AdminTransfers />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Branch Routes */}
        <Route path="/branch" element={<BranchLayout />}>
          <Route index element={<BranchSell />} />
          <Route path="stock" element={<BranchStock />} />
          <Route path="reports" element={<BranchReports />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
