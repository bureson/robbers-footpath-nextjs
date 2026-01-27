'use client'

import Dashboard from './dashboard';
import ProtectedRoute from '../components/protectedRoute';

export default function Admin () {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}