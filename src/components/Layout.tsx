import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, LogOut, User as UserIcon, Brain, Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { User } from '../types';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export default function Layout({ children, user, setUser }: { children: React.ReactNode, user: User | null, setUser: (u: User | null) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage, theme, toggleTheme, t } = useThemeLanguage();
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
        const storedStages = localStorage.getItem('mgm_candidate_stages');
        const stageOverrides = storedStages ? JSON.parse(storedStages) : {};
        const userStageOverride = String(stageOverrides[user.userId] || '').toLowerCase();
        const allowedStages = [
          'approved',
          'disetujui',
          'testing',
          'interview',
          'offered',
          'terpilih',
          'wawancara',
          'penawaran',
          'menerima tawaran',
          'menerima tawaran / tidak'
        ];

        if (allowedStages.includes(userStageOverride)) {
          setIsApproved(true);
        } else if (storedApps) {
          try {
            const parsedApps = JSON.parse(storedApps);
            const userApps = parsedApps.filter((app: any) => String(app.userId) === String(user.userId));
            const approved = userApps.some((app: any) => {
              const status = String(app.status || '').toLowerCase();
              return allowedStages.includes(status);
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
            <Link to="/" className="flex items-center space-x-2.5">
              <img
                src="https://lh3.googleusercontent.com/d/1datmNG_YznNrYUENZe2n-1eWfTZEJkfJ"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('drive.google.com/thumbnail')) {
                    target.src = 'https://drive.google.com/thumbnail?id=1datmNG_YznNrYUENZe2n-1eWfTZEJkfJ&sz=w400';
                  }
                }}
                alt="Mercindo Logo"
                className="h-11 w-auto object-contain bg-mgm-dark p-1.5 rounded-xl shadow-xs border border-mgm-green/30"
              />
              <div className="flex flex-col justify-center -space-y-1 font-google">
                <span className="font-bold text-xl tracking-tight text-mgm-dark">Mercindo</span>
                <span className="font-semibold text-sm tracking-wide text-mgm-green">Smart Hire</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className={`text-sm transition-colors ${isActive('/')}`}>{t('nav.home')}</Link>
              <Link to="/lowongan" className={`text-sm transition-colors ${isActive('/lowongan')}`}>{t('nav.jobs')}</Link>
              <Link to="/tentang-kami" className={`text-sm transition-colors ${isActive('/tentang-kami')}`}>{t('nav.about')}</Link>
              
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <Link to="/admin" className={`text-sm transition-colors ${isActive('/admin')}`}>{t('nav.admin')}</Link>
                  ) : (
                    <>
                      <Link to="/dashboard" className={`text-sm transition-colors ${isActive('/dashboard')}`}>{t('nav.myDashboard')}</Link>
                      {isApproved && (
                        <>
                          <Link to="/tests" className={`text-sm transition-colors ${isActive('/tests')}`}>{t('nav.tests')}</Link>
                          <Link to="/interview" className={`text-sm transition-colors ${isActive('/interview')}`}>{t('nav.interview')}</Link>
                        </>
                      )}
                    </>
                  )}
                  
                  <div className="flex items-center pl-4 border-l border-slate-200 dark:border-white/10 space-x-3">
                    <div className="flex items-center space-x-2 text-sm font-medium text-mgm-dark bg-mgm-light px-3 py-1.5 rounded-full border border-mgm-green/20">
                      <UserIcon className="w-4 h-4 text-mgm-green" />
                      <span>{user.name}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-sm p-2 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                      title={t('nav.logout')}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className={`text-sm transition-colors ${isActive('/login')}`}>{t('nav.login')}</Link>
                  <Link to="/register" className="text-sm font-bold bg-mgm-green text-white px-5 py-2.5 rounded-xl hover:bg-opacity-90 shadow-sm transition-all hover:shadow-md">{t('nav.register')}</Link>
                </div>
              )}

              {/* Language Switcher & Dark Mode Toggles */}
              <div className="flex items-center pl-3 border-l border-slate-200 dark:border-white/10 space-x-2">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-mgm-green hover:border-mgm-green border border-slate-200 dark:border-white/10 transition-all flex items-center space-x-1.5 shadow-xs"
                  title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                >
                  <Globe className="w-3.5 h-3.5 text-mgm-green" />
                  <span>{language === 'id' ? 'ID' : 'EN'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:text-mgm-green border border-slate-200 dark:border-white/10 transition-all shadow-xs"
                  title={theme === 'dark' ? t('theme.toggleLight') : t('theme.toggleDark')}
                  aria-label="Toggle dark mode"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>
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
          <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-lg animate-fade-in w-full px-4 py-6 space-y-4 flex flex-col">
            {/* Mobile Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengaturan Tampilan</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 flex items-center space-x-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-mgm-green" />
                  <span>{language === 'id' ? 'Bahasa: ID' : 'Lang: EN'}</span>
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                </button>
              </div>
            </div>

            <Link to="/" className={`text-base transition-colors py-2 border-b border-slate-100 dark:border-white/5 ${isActive('/')}`}>{t('nav.home')}</Link>
            <Link to="/lowongan" className={`text-base transition-colors py-2 border-b border-slate-100 dark:border-white/5 ${isActive('/lowongan')}`}>{t('nav.jobs')}</Link>
            <Link to="/tentang-kami" className={`text-base transition-colors py-2 border-b border-slate-100 dark:border-white/5 ${isActive('/tentang-kami')}`}>{t('nav.about')}</Link>
            
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link to="/admin" className={`text-base transition-colors py-2 border-b border-slate-100 dark:border-white/5 ${isActive('/admin')}`}>{t('nav.admin')}</Link>
                ) : (
                  <>
                    <Link to="/dashboard" className={`text-base transition-colors py-2 border-b border-slate-100 dark:border-white/5 ${isActive('/dashboard')}`}>{t('nav.myDashboard')}</Link>
                    {isApproved && (
                      <>
                        <Link to="/tests" className={`text-base transition-colors py-2 border-b border-slate-100 dark:border-white/5 ${isActive('/tests')}`}>{t('nav.tests')}</Link>
                        <Link to="/interview" className={`text-base transition-colors py-2 border-b border-slate-100 dark:border-white/5 ${isActive('/interview')}`}>{t('nav.interview')}</Link>
                      </>
                    )}
                  </>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-center space-x-2 text-sm font-medium text-mgm-dark bg-mgm-light px-3 py-1.5 rounded-full border border-mgm-green/20">
                    <UserIcon className="w-4 h-4 text-mgm-green" />
                    <span>{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-sm px-4 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                <Link to="/login" className={`text-base transition-colors py-2 ${isActive('/login')}`}>{t('nav.login')}</Link>
                <Link to="/register" className="text-center text-base font-bold bg-mgm-green text-white py-3 rounded-xl hover:bg-opacity-90 shadow-sm transition-all w-full">{t('nav.register')}</Link>
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
                <div className="flex items-center space-x-2.5 mb-4">
                  <img
                    src="https://lh3.googleusercontent.com/d/1datmNG_YznNrYUENZe2n-1eWfTZEJkfJ"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('drive.google.com/thumbnail')) {
                        target.src = 'https://drive.google.com/thumbnail?id=1datmNG_YznNrYUENZe2n-1eWfTZEJkfJ&sz=w400';
                      }
                    }}
                    alt="Mercindo Logo"
                    className="h-11 w-auto object-contain bg-[#24484e] p-1.5 rounded-xl shadow-xs border border-white/15"
                  />
                  <div className="flex flex-col justify-center -space-y-1 font-google">
                    <span className="font-bold text-xl tracking-tight text-white">Mercindo</span>
                    <span className="font-semibold text-sm tracking-wide text-mgm-green">Smart Hire</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm max-w-xs">
                  {t('footer.desc')}
                </p>
             </div>
             <div>
                <h4 className="font-semibold mb-4 text-mgm-yellow">{t('footer.company')}</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><Link to="/tentang-kami" className="hover:text-white transition-colors">{t('nav.about')}</Link></li>
                  <li><Link to="/lowongan" className="hover:text-white transition-colors">{t('footer.career')}</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
                </ul>
             </div>
           </div>
           <div className="text-center text-sm text-white/50">
             <p>&copy; {new Date().getFullYear()} MGM SmartHire AI. {t('footer.rights')}</p>
           </div>
        </div>
      </footer>
    </div>
  );
}
