import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TablePg from './pages/TablePg';
import HistoryPage from './pages/HistoryPage';
import EditTablePg from './pages/EditTablePg';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/table"
        element={
          <ProtectedRoute>
            <TablePg />
          </ProtectedRoute>
        }
      />
      <Route
        path="/table/:id"
        element={
          <ProtectedRoute>
            <TablePg />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute>
            <EditTablePg />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
