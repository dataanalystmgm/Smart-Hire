import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, LogOut, User as UserIcon, Brain, Menu, X } from 'lucide-react';
import { User } from '../types';

export default function Layout({ children, user, setUser }: { children: React.ReactNode, user: User | null, setUser: (u: User | null) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('mgm_user');
    setUser(null);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-mgm-green font-bold' : 'text-mgm-dark hover:text-mgm-green font-semibold';
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      const checkApproval = () => {
        const storedApps = localStorage.getItem('mgm_applications');
        if (storedApps) {
          try {
            const parsedApps = JSON.parse(storedApps);
            const userApps = parsedApps.filter((app: any) => String(app.userId) === String(user.userId));
            const approved = userApps.some((app: any) => {
              const status = app.status?.toLowerCase();
              return status === 'approved' || status === 'disetujui' || status === 'testing' || status === 'interview';
            });
            setIsApproved(approved);
          } catch (e) {
            console.error(e);
          }
        } else {
          setIsApproved(false);
        }

        // Check if interview already completed
        const storedInterviews = localStorage.getItem('mgm_interviews');
        if (storedInterviews) {
          try {
            const parsedInterviews = JSON.parse(storedInterviews);
            const completed = parsedInterviews.some((int: any) => 
              String(int.userId).toLowerCase() === String(user.userId).toLowerCase()
            );
            setIsInterviewCompleted(completed);
          } catch (e) {
            console.error(e);
          }
        } else {
          setIsInterviewCompleted(false);
        }
      };

      checkApproval();
      
      // Setup interval to check for status updates continuously
      const interval = setInterval(checkApproval, 1500);
      return () => clearInterval(interval);
    } else {
      setIsApproved(false);
      setIsInterviewCompleted(false);
    }
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-mgm-dark rounded-lg flex items-center justify-center">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-mgm-dark">MGM<span className="text-mgm-green">SmartHire</span></span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`text-sm transition-colors ${isActive('/')}`}>Home</Link>
              <Link to="/lowongan" className={`text-sm transition-colors ${isActive('/lowongan')}`}>Lowongan</Link>
              
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <Link to="/admin" className={`text-sm transition-colors ${isActive('/admin')}`}>Admin Dashboard</Link>
                  ) : (
                    <>
                      <Link to="/dashboard" className={`text-sm transition-colors ${isActive('/dashboard')}`}>Dashboard Saya</Link>
                      {isApproved && (
                        <>
                          <Link to="/tests" className={`text-sm transition-colors ${isActive('/tests')}`}>Tes Online</Link>
                          <Link to="/interview" className={`text-sm transition-colors ${isActive('/interview')}`}>Wawancara AI</Link>
                        </>
                      )}
                    </>
                  )}
                  
                  <div className="flex items-center pl-6 border-l border-slate-200 space-x-4">
                    <div className="flex items-center space-x-2 text-sm font-medium text-mgm-dark bg-mgm-light px-3 py-1.5 rounded-full">
                      <UserIcon className="w-4 h-4 text-mgm-green" />
                      <span>{user.name}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-sm p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                      title="Keluar"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className={`text-sm transition-colors ${isActive('/login')}`}>Masuk</Link>
                  <Link to="/register" className="text-sm font-bold bg-mgm-green text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 shadow-sm transition-all hover:shadow-md">Daftar</Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-mgm-dark hover:text-mgm-green transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white shadow-lg animate-fade-in w-full px-4 py-6 space-y-4 flex flex-col">
            <Link to="/" className={`text-base transition-colors py-2 border-b border-slate-100 ${isActive('/')}`}>Home</Link>
            <Link to="/lowongan" className={`text-base transition-colors py-2 border-b border-slate-100 ${isActive('/lowongan')}`}>Lowongan</Link>
            
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link to="/admin" className={`text-base transition-colors py-2 border-b border-slate-100 ${isActive('/admin')}`}>Admin Dashboard</Link>
                ) : (
                  <>
                    <Link to="/dashboard" className={`text-base transition-colors py-2 border-b border-slate-100 ${isActive('/dashboard')}`}>Dashboard Saya</Link>
                    {isApproved && (
                      <>
                        <Link to="/tests" className={`text-base transition-colors py-2 border-b border-slate-100 ${isActive('/tests')}`}>Tes Online</Link>
                        <Link to="/interview" className={`text-base transition-colors py-2 border-b border-slate-100 ${isActive('/interview')}`}>Wawancara AI</Link>
                      </>
                    )}
                  </>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-2 text-sm font-medium text-mgm-dark bg-mgm-light px-3 py-1.5 rounded-full">
                    <UserIcon className="w-4 h-4 text-mgm-green" />
                    <span>{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-sm px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                <Link to="/login" className={`text-base transition-colors py-2 ${isActive('/login')}`}>Masuk</Link>
                <Link to="/register" className="text-center text-base font-bold bg-mgm-green text-white py-3 rounded-xl hover:bg-opacity-90 shadow-sm transition-all w-full">Daftar</Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-10">
        {children}
      </main>

      <footer className="relative bg-mgm-dark text-white py-12 w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-[center_80%] z-0 opacity-20 mix-blend-overlay" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1zGWaHYnRfpQM-xxQdnoiBr1jUUzVgFu-')" }}
        />
        <div className="absolute inset-0 bg-mgm-dark/90 z-0 pointer-events-none"></div>
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12">
           <div className="grid md:grid-cols-3 gap-8 border-b border-white/10 pb-8 mb-8">
             <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-mgm-green rounded-lg flex items-center justify-center">
                    <Briefcase className="text-white w-5 h-5" />
                  </div>
                  <span className="font-bold text-xl tracking-tight">MGM<span className="text-mgm-yellow">SmartHire</span></span>
                </div>
                <p className="text-white/70 text-sm max-w-xs">
                  Platform rekrutmen cerdas yang didukung oleh Artificial Intelligence untuk menemukan talenta terbaik dengan proses yang lebih efisien dan terukur.
                </p>
             </div>
             <div>
                <h4 className="font-semibold mb-4 text-mgm-yellow">Perusahaan</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Hubungi Kami</a></li>
                </ul>
             </div>
             <div>
                <h4 className="font-semibold mb-4 text-mgm-yellow">Legal</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                </ul>
             </div>
           </div>
           <div className="text-center text-sm text-white/50">
             <p>&copy; {new Date().getFullYear()} MGM SmartHire AI. All rights reserved.</p>
           </div>
        </div>
      </footer>
    </div>
  );
}
