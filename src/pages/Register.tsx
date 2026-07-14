import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../types';
import { motion } from 'framer-motion';

export default function Register({ setUser }: { setUser: (u: User) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxxQ9HDOmYQ7ThrqP-8gOpLfPnU3B0W18jAci-lTVWFCYA_WmDV4KIuEcAtcjIN2kPqiQ/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, password, role: 'applicant' })
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        const user = { userId: data.userId, name: data.name, email: data.email, role: data.role };
        setUser(user);
        localStorage.setItem('mgm_user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
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
          <h2 className="text-3xl font-extrabold text-mgm-dark tracking-tight">Buat Akun Baru</h2>
          <p className="text-slate-500 mt-2 font-medium">Mulai perjalanan karir Anda bersama MGM SmartHire</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mgm-green focus:border-transparent outline-none transition-all" 
            />
          </div>
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
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Sudah punya akun? <Link to="/login" className="text-mgm-green hover:underline font-bold">Masuk di sini</Link>
        </p>
      </motion.div>
    </div>
  );
}
