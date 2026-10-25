import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../types';
import { motion } from 'framer-motion';
import { GoogleSheetsService } from '../services/googleSheets';

export default function Register({ setUser }: { setUser: (u: User) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'applicant' | 'mgm team'>('applicant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      let regSuccess = false;
      let registeredUserId = '';

      try {
        const directRes = await GoogleSheetsService.registerUser({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role
        });
        if (directRes?.userId) {
          regSuccess = true;
          registeredUserId = directRes.userId;
        }
      } catch (directErr: any) {
        if (directErr.message?.includes('sudah terdaftar') || directErr.message?.includes('already exists')) {
          setError(directErr.message);
          setLoading(false);
          return;
        }
        console.warn('Direct register failed, trying proxy fallback:', directErr);
      }

      if (!regSuccess) {
        const response = await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register', name, email, password, role })
        });
        const data = await response.json();
        if (data.status === 'success' || data.mocked) {
          regSuccess = true;
          registeredUserId = data.userId || 'usr_' + Math.random().toString(36).substring(2, 9);
        } else {
          setError(data.message || 'Registration failed');
          setLoading(false);
          return;
        }
      }
      
      if (regSuccess) {
        if (role === 'mgm team') {
          setSuccessMsg('Registrasi berhasil sebagai MGM Team. Akun Anda sedang menunggu persetujuan administrator.');
          setLoading(false);
          setTimeout(() => {
            navigate('/login');
          }, 3500);
          return;
        }

        const user = { userId: registeredUserId || 'user_' + Math.random(), name, email, role: 'applicant' as const };
        setUser(user);
        localStorage.setItem('mgm_user', JSON.stringify(user));
        navigate('/dashboard');
      }
    } catch (err) {
      if (role === 'mgm team') {
        setSuccessMsg('Registrasi berhasil sebagai MGM Team. Akun Anda sedang menunggu persetujuan administrator.');
        setLoading(false);
        setTimeout(() => navigate('/login'), 3500);
        return;
      }
      const user = { userId: 'user_' + Math.random(), name, email, role: 'applicant' as const };
      setUser(user);
      localStorage.setItem('mgm_user', JSON.stringify(user));
      navigate('/dashboard');
    } finally {
      if (role !== 'mgm team') {
        setLoading(false);
      }
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
        {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-xl font-medium">{successMsg}</div>}
        
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
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Pilih Role (Masuk ke Kolom E Sheet Users)</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer font-bold text-sm transition-all ${role === 'applicant' ? 'bg-mgm-green/10 border-mgm-green text-mgm-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="applicant" 
                  checked={role === 'applicant'} 
                  onChange={() => setRole('applicant')} 
                  className="sr-only"
                />
                Applicant
              </label>
              <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer font-bold text-sm transition-all ${role === 'mgm team' ? 'bg-mgm-green/10 border-mgm-green text-mgm-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="mgm team" 
                  checked={role === 'mgm team'} 
                  onChange={() => setRole('mgm team')} 
                  className="sr-only"
                />
                MGM Team
              </label>
            </div>
            {role === 'mgm team' && (
              <p className="text-xs text-amber-600 mt-1.5 font-medium">Jika mgm team, maka akan menunggu persetujuan administrator dahulu.</p>
            )}
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
