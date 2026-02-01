import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Footer from './components/footer/Footer';
import Header from './components/header/Header';
import Login from './pages/login/Login';
import AdminPage from './pages/admin/Admin';
import ParticipantPage from './pages/participant/Participant.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App = () => (
  <Router>
    <div className="min-h-screen flex flex-col justify-between">
      <Header />
      <main className="flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/participant" 
            element={
              <ProtectedRoute allowedRoles={['participant']}>
                <ParticipantPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  </Router>
);

export default App;