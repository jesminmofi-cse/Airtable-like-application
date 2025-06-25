import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TablePg from './pages/TablePg';
import HistoryPage from './pages/HistoryPage';
import EditTablePg from './pages/EditTablePg';

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  return (
    <Routes>
      <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/table" element={<TablePg />} />
      <Route path="/table/:id" element={<TablePg />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/edit/:id" element={<EditTablePg />} />
    </Routes>
  );
};

export default App;
