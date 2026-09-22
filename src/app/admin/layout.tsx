'use client';

import { ReactNode } from 'react';

import ProtectedRoute from '../components/protectedRoute';
import { AdminProvider } from './adminContext';
import AdminShell from './adminShell';

export default function AdminLayout ({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminProvider>
        <AdminShell>{children}</AdminShell>
      </AdminProvider>
    </ProtectedRoute>
  );
}
