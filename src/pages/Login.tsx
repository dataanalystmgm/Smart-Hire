import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { User } from '../types';
import { motion } from 'framer-motion';

export default function Login({ setUser }: { setUser: (u: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (email === 'admin@company.com' && password === 'admin123') {
      const adminUser = { userId: 'admin-001', name: 'Administrator', email, role: 'admin' as const };
      setUser(adminUser);
      localStorage.setItem('mgm_user', JSON.stringify(adminUser));
      navigate('/admin');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        const user = { userId: data.userId, name: data.name, email: data.email, role: data.role };
        setUser(user);
        localStorage.setItem('mgm_user', JSON.stringify(user));
        
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          const redirect = searchParams.get('redirect');
          if (redirect === 'apply') {
            const jobId = searchParams.get('jobId');
            navigate(`/?apply=${jobId}`);
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-mgm-dark tracking-tight">Selamat Datang Kembali</h2>
          <p className="text-slate-500 mt-2 font-medium">Masuk ke akun MGM SmartHire AI Anda</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mgm-green focus:border-transparent outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mgm-green focus:border-transparent outline-none transition-all" 
            />
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-mgm-dark text-white font-bold py-3.5 rounded-xl hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Belum punya akun? <Link to="/register" className="text-mgm-green hover:underline font-bold">Daftar sekarang</Link>
        </p>
      </motion.div>
    </div>
  );
}
