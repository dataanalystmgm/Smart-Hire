import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { User } from '../types';
import { motion } from 'framer-motion';
import { googleSignIn } from '../lib/auth';
import { GoogleSheetsService, SPREADSHEET_ID } from '../services/googleSheets';

export default function Login({ setUser }: { setUser: (u: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSuccessfulLogin = (user: User) => {
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
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Admin shortcut
    if (cleanEmail === 'admin@company.com' && cleanPassword === 'admin123') {
      const adminUser: User = { userId: 'admin-001', name: 'Administrator', email: cleanEmail, role: 'admin' };
      handleSuccessfulLogin(adminUser);
      setLoading(false);
      return;
    }

    try {
      // Direct query to Google Sheet "Users"
      const user = await GoogleSheetsService.loginUser(cleanEmail, cleanPassword);
      handleSuccessfulLogin({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role as 'applicant' | 'admin'
      });
    } catch (err: any) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await googleSignIn();
      if (!res || !res.user) {
        setError('Login Google dibatalkan. Silakan coba lagi atau masuk menggunakan email & password.');
        return;
      }

      const userEmail = res.user.email || '';
      const userName = res.user.displayName || userEmail.split('@')[0];
      
      // Check if admin or register/lookup in Google Sheet
      const isAdmin = userEmail.includes('admin') || userEmail === 'analisdatamgm@gmail.com';
      
      let foundUser: any = null;
      try {
        foundUser = await GoogleSheetsService.loginUser(userEmail);
      } catch {
        // Register automatically in Google Sheet if new
        try {
          foundUser = await GoogleSheetsService.registerUser({
            name: userName,
            email: userEmail,
            role: isAdmin ? 'admin' : 'applicant'
          });
        } catch {
          foundUser = null;
        }
      }

      const appUser: User = {
        userId: foundUser?.userId || res.user.uid,
        name: userName,
        email: userEmail,
        role: (foundUser?.role || (isAdmin ? 'admin' : 'applicant')) as 'applicant' | 'admin'
      };

      handleSuccessfulLogin(appUser);
    } catch (err: any) {
      console.warn('Google sign-in warning:', err?.message || err);
      setError('Gagal masuk dengan Google: ' + (err?.message || 'Silakan coba lagi atau masuk dengan email.'));
    } finally {
      setGoogleLoading(false);
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
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Langsung Terhubung ke Google Sheet
          </div>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}

        {/* Google Sign-in Button following Workspace skill */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm mb-5 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
          </svg>
          <span>{googleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Atau dengan Email</span>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mgm-green focus:border-transparent outline-none transition-all text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mgm-green focus:border-transparent outline-none transition-all text-sm" 
            />
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-mgm-dark text-white font-bold py-3.5 rounded-xl hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Database ID: <span className="font-mono text-slate-500">{SPREADSHEET_ID.substring(0, 8)}...</span>
          </p>
        </div>
        
        <p className="mt-4 text-center text-sm text-slate-500 font-medium">
          Belum punya akun? <Link to="/register" className="text-mgm-green hover:underline font-bold">Daftar sekarang</Link>
        </p>
      </motion.div>
    </div>
  );
}
