/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Lowongan from './pages/Lowongan';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplicantDashboard from './pages/ApplicantDashboard';
import Tests from './pages/Tests';
import Interview from './pages/Interview';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Companies from './pages/Companies';
import SalaryGuide from './pages/SalaryGuide';
import SavedJobs from './pages/SavedJobs';
import { useState, useEffect } from 'react';
import { User } from './types';
import { ThemeLanguageProvider } from './context/ThemeLanguageContext';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mgm_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <ThemeLanguageProvider>
      <Router>
        <Layout user={user} setUser={setUser}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lowongan" element={<Lowongan />} />
          <Route path="/perusahaan" element={<Companies />} />
          <Route path="/panduan-gaji" element={<Navigate to="/lowongan" replace />} />
          <Route path="/tentang-kami" element={<About />} />
          <Route path="/tersimpan" element={user ? <SavedJobs user={user} /> : <Navigate to="/login?redirect=tersimpan" />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/dashboard" element={user ? <ApplicantDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/tests" element={user ? <Tests user={user} /> : <Navigate to="/login" />} />
          <Route path="/interview" element={user ? <Interview user={user} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  </ThemeLanguageProvider>
  );
}
