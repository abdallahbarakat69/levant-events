import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import { authService } from './services/authService';

import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import SalesTeam from './pages/SalesTeam';
import Users from './pages/Users';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        // Add a timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 10000)
        );

        const authPromise = authService.isAuthenticated();
        const auth = await Promise.race([authPromise, timeoutPromise]);

        if (mounted) setIsAuthenticated(auth);
      } catch (err) {
        console.error("Auth check failed:", err);
        if (mounted) setError(err.message);
        // Fallback to false on error to redirect to login, or let user know
        if (mounted) setIsAuthenticated(false);
      }
    };
    checkAuth();
    return () => { mounted = false; };
  }, []);

  if (error) {
    return <div style={{ padding: 20, color: 'red' }}>Error checking auth: {error}. Check console.</div>;
  }

  if (isAuthenticated === null) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666' }}>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/sales-team" element={<SalesTeam />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
