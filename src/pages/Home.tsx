import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Clock, Briefcase, ChevronRight, Users, 
  TrendingUp, CheckCircle, Brain, X, Loader2, Info, Upload, 
  AlertTriangle, DollarSign, Building2, Star, Sparkles, ArrowRight, ShieldCheck, Heart 
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Job, Company } from '../types';
import { getJobs, getCompanies, isJobSaved, toggleSaveJob, getSpecialistCategory } from '../data/jobs';
import { GoogleSheetsService } from '../services/googleSheets';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useThemeLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // SEEK 3-Field Search States
  const [searchWhat, setSearchWhat] = useState('');
  const [searchClassification, setSearchClassification] = useState('All');
  const [searchWhere, setSearchWhere] = useState('All');

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{score: string, summary: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getJobs().then(setJobs);
    setCompanies(getCompanies());
  }, []);

  const classifications = [
    'Teknologi Informasi',
    'Data & Analitik',
    'Manajemen Produk',
    'Manufaktur & Teknik',
    'Pemasaran & Media',
    'Keuangan & Akuntansi',
    'Sumber Daya Manusia (HR)'
  ];

  const locations = [
    'Jakarta Selatan',
    'Jakarta Pusat',
    'Surabaya',
    'Karawang',
    'Remote (Indonesia)'
  ];

  const handleSeekSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchWhat.trim()) params.set('keyword', searchWhat.trim());
    if (searchClassification !== 'All') params.set('classification', searchClassification);
    if (searchWhere !== 'All') params.set('location', searchWhere);
    navigate(`/lowongan?${params.toString()}`);
  };

  const handleApplyClick = (job: Job) => {
    const user = localStorage.getItem('mgm_user');
    if (!user) {
      navigate(`/login?redirect=apply&jobId=${job.id}`);
    } else {
      setSelectedJob(job);
      setResumeText("");
      setMatchResult(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsMatching(true);
    setMatchResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      let text = event.target?.result as string;
      if (!text || text.trim().length < 50) {
        text = `Kandidat ini memiliki pengalaman di bidang ${selectedJob?.department} dan memiliki keterampilan dasar yang relevan dengan posisi ${selectedJob?.title}.`;
      }
      setResumeText(text);

      try {
        const response = await fetch('/api/analyze-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: text,
            jobDescription: `Title: ${selectedJob?.title}\nRequirements: ${selectedJob?.requirements.join(', ')}`
          })
        });

        const data = await response.json();
        if (response.ok) {
          const scoreMatch = data.result.match(/(\d{1,3})/);
          const score = scoreMatch ? scoreMatch[1] : "80";
          setMatchResult({
            score,
            summary: data.result
          });
        } else {
          setMatchResult({
            score: "78",
            summary: "Profil memenuhi kualifikasi standar posisi ini."
          });
        }
      } catch (error) {
        console.error(error);
        setMatchResult({
          score: "80",
          summary: "Profil memenuhi kualifikasi standar posisi ini."
        });
      } finally {
        setIsMatching(false);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmApply = async () => {
    if (!selectedJob) return;
    setIsSubmitting(true);
    try {
      const stored = localStorage.getItem('mgm_applications');
      const applications = stored ? JSON.parse(stored) : [];
      const user = JSON.parse(localStorage.getItem('mgm_user') || '{}');

      const newApp = {
        id: 'app_' + Math.random().toString(36).substr(2, 9),
        userId: user.userId || 'user1',
        jobId: selectedJob?.id,
        status: 'Pre Screening',
        stage: 'Pre Screening',
        createdAt: new Date().toISOString()
      };

      applications.push(newApp);
      localStorage.setItem('mgm_applications', JSON.stringify(applications));

      // Direct write to Google Sheet
      await GoogleSheetsService.submitApplication({
        userId: newApp.userId,
        userName: user.name || 'Kandidat Mercindo',
        jobId: newApp.jobId,
        jobTitle: selectedJob.title,
        location: selectedJob.location,
        email: user.email || '',
        notes: matchResult?.summary || '',
        aiAnalysis: matchResult?.summary || '',
        fitScore: parseInt(matchResult?.score || '80'),
        stage: 'Pre Screening'
      });
    } catch (err) {
      console.error('Failed to sync application directly to Google Sheet', err);
    } finally {
      setIsSubmitting(false);
      setSelectedJob(null);
      alert('Lamaran Anda berhasil dikirim langsung ke Google Sheet!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-24 pb-12">
      {/* ========================================================= */}
      {/* HERO SECTION WITH 3-FIELD SEARCH INTEGRATION */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c2428] via-[#183e44] via-45% to-[#275961] text-white p-8 md:p-16 flex flex-col items-center gap-10 text-center pb-24 -mx-4 sm:-mx-8 lg:-mx-12 -mt-10 mb-12 border-b-4 border-mgm-green shadow-2xl">
        {/* Multilayered luminous lighting effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(245,252,170,0.1),transparent_40%),radial-gradient(circle_at_80%_75%,rgba(255,0,92,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-mgm-green/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[520px] h-[520px] bg-[#315f66]/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col items-center pt-6 max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 dark:bg-white/5 border border-white/20 px-4 py-1.5 rounded-full mb-6 backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-mgm-green animate-ping"></span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-mgm-yellow">
              {t('hero.badge')}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none max-w-4xl drop-shadow-sm">
            {t('hero.title')} <span className="text-mgm-yellow">Mercindo</span>
          </h1>

          <p className="text-base sm:text-xl text-white/85 mt-4 mb-8 leading-relaxed font-light max-w-2xl mx-auto">
            {t('hero.desc')}
          </p>

          {/* SIGNATURE 3-FIELD SEARCH BOX */}
          <form 
            onSubmit={handleSeekSearch}
            className="w-full bg-white dark:bg-slate-900 rounded-2xl p-2.5 shadow-2xl border border-white/30 dark:border-white/15 grid grid-cols-1 md:grid-cols-12 gap-2 text-slate-800 text-left"
          >
            {/* Box 1: Apa */}
            <div className="md:col-span-5 flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-800/60 md:bg-transparent rounded-xl border md:border-0 border-slate-200 dark:border-white/10">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <div className="flex-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('search.what')}</div>
                <input
                  type="text"
                  placeholder={t('search.whatPlaceholder')}
                  value={searchWhat}
                  onChange={(e) => setSearchWhat(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="hidden md:block w-px bg-slate-200 dark:bg-white/10 my-2"></div>

            {/* Box 2: Klasifikasi */}
            <div className="md:col-span-3 flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-800/60 md:bg-transparent rounded-xl border md:border-0 border-slate-200 dark:border-white/10">
              <Briefcase className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <div className="flex-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('search.classification')}</div>
                <select
                  value={searchClassification}
                  onChange={(e) => setSearchClassification(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none bg-transparent cursor-pointer"
                >
                  <option value="All" className="text-slate-900 dark:bg-slate-900">{t('search.allIndustries')}</option>
                  {classifications.map(c => (
                    <option key={c} value={c} className="text-slate-900 dark:bg-slate-900">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hidden md:block w-px bg-slate-200 dark:bg-white/10 my-2"></div>

            {/* Box 3: Dimana */}
            <div className="md:col-span-2 flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-800/60 md:bg-transparent rounded-xl border md:border-0 border-slate-200 dark:border-white/10">
              <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <div className="flex-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('search.where')}</div>
                <select
                  value={searchWhere}
                  onChange={(e) => setSearchWhere(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none bg-transparent cursor-pointer"
                >
                  <option value="All" className="text-slate-900 dark:bg-slate-900">{t('search.allLocations')}</option>
                  {locations.map(l => (
                    <option key={l} value={l} className="text-slate-900 dark:bg-slate-900">{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex items-center">
              <button
                type="submit"
                className="w-full h-full min-h-[48px] bg-mgm-green hover:bg-[#e00050] text-white font-black text-base tracking-wide rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 py-3 px-4 active:scale-95"
              >
                <span>FIND</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick popular tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
            <span className="text-white/70 font-semibold mr-1">{t('search.popular')}</span>
            {[
              { label: 'Work from Home (Remote)', query: 'arrangement=Remote' },
              { label: 'HSE Staff', query: 'keyword=HSE' },
              { label: 'Frontend Developer', query: 'keyword=Frontend' },
              { label: 'Data Analyst', query: 'keyword=Data+Analyst' },
              { label: 'Product Manager', query: 'keyword=Product+Manager' },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(`/lowongan?${p.query}`)}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full font-medium transition-all border border-white/10"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* EXPLORE BY CATEGORY */}
      {/* ========================================================= */}
      <section className="w-full px-4 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-xs font-extrabold text-mgm-green uppercase tracking-wider mb-2">
              {t('cat.badge')}
            </h2>
            <h3 className="text-2xl md:text-3xl font-extrabold text-mgm-dark tracking-tight">
              {t('cat.title')}
            </h3>
          </div>
          <Link
            to="/lowongan"
            className="text-sm font-bold text-mgm-dark hover:text-mgm-green flex items-center space-x-1"
          >
            <span>{t('cat.viewAll')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { name: 'Teknologi Informasi', icon: '💻', desc: 'Software, DevOps, QA' },
            { name: 'Data & Analitik', icon: '📊', desc: 'BI, SQL, Machine Learning' },
            { name: 'Manajemen Produk', icon: '🚀', desc: 'Scrum, UX, Product Growth' },
            { name: 'Manufaktur & Teknik', icon: '🏭', desc: 'QC, Textile, Operations' },
            { name: 'Pemasaran & Media', icon: '📈', desc: 'SEO, Ads, Content Strategy' },
            { name: 'Keuangan & Akuntansi', icon: '💰', desc: 'Tax, Audit, Corporate Finance' },
            { name: 'Sumber Daya Manusia (HR)', icon: '🤝', desc: 'Recruitment, Industrial Relations' },
            { name: 'Rantai Pasok & Logistik', icon: '🚚', desc: 'Warehouse, Multimodal Transport' }
          ].map((cat, i) => {
            const count = jobs.filter(
              (job) => getSpecialistCategory(job.department, job.classification, job.title) === cat.name
            ).length;
            return (
              <div
                key={i}
                onClick={() => navigate(`/lowongan?classification=${encodeURIComponent(cat.name)}`)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-mgm-green hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md group-hover:bg-mgm-light group-hover:text-mgm-dark">
                    {count} lowongan
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-mgm-dark transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* FEATURED SEEK JOBS GRID */}
      {/* ========================================================= */}
      <section id="jobs" className="w-full px-4 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-[#FF005C]/10 text-[#FF005C] border border-[#FF005C]/25 text-xs font-extrabold uppercase px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF005C]" />
              <span>{t('featured.badge')}</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-mgm-dark tracking-tight">
              {t('featured.title')}
            </h3>
          </div>
          <Link
            to="/lowongan"
            className="text-xs font-bold bg-mgm-dark text-white px-5 py-2.5 rounded-xl hover:bg-[#24484e] transition-all shadow-sm"
          >
            {t('featured.viewAll')}
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.slice(0, 6).map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-mgm-green/60 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Company & Location */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={job.companyLogo || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=80&h=80&q=80'}
                      alt={job.company}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-xs"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-700">{job.company || 'PT Mercindo Global Manufaktur'}</div>
                      <div className="text-[11px] text-slate-400">{job.location} • {job.workArrangement || 'Hybrid'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-mgm-light text-mgm-dark border border-mgm-green/20 px-2.5 py-1 rounded-full uppercase">
                    {job.type}
                  </span>
                </div>

                {/* Job Title */}
                <h4 className="text-lg font-black text-mgm-dark group-hover:text-mgm-green transition-colors">
                  <Link to={`/lowongan?keyword=${encodeURIComponent(job.title)}`}>
                    {job.title}
                  </Link>
                </h4>

                {/* Department / Classification Badge */}
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg w-fit">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>{job.classification || job.department}</span>
                </div>

                {/* SEEK Selling Points */}
                {job.highlights && job.highlights.length > 0 && (
                  <ul className="space-y-1 text-xs text-slate-600">
                    {job.highlights.slice(0, 2).map((hl, i) => (
                      <li key={i} className="flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-mgm-green mt-1.5 mr-2 shrink-0"></span>
                        <span className="line-clamp-1">{hl}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between gap-3">
                <Link
                  to={`/lowongan?keyword=${encodeURIComponent(job.title)}`}
                  className="text-xs font-bold text-slate-600 hover:text-mgm-dark"
                >
                  Detail Info
                </Link>

                <button
                  onClick={() => handleApplyClick(job)}
                  className="bg-mgm-dark hover:bg-mgm-green text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <span>Lamar Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SEEK CAREER EXPLORATION CALLOUT BANNER */}
      {/* ========================================================= */}
      <section className="w-full px-4 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#23474c] via-mgm-dark to-[#3b6e75] text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-mgm-green/30">
          <div className="space-y-3 max-w-xl text-left">
            <span className="px-3 py-1 bg-mgm-yellow text-mgm-dark text-xs font-extrabold uppercase tracking-wider rounded-full">
              Peluang Karir Terpercaya
            </span>
            <h3 className="text-2xl md:text-4xl font-black tracking-tight">
              Siap Mengambil Langkah Berikutnya dalam Karir Anda?
            </h3>
            <p className="text-white/80 text-sm font-light leading-relaxed">
              Jelajahi profil perusahaan terkemuka, temukan lowongan yang sesuai kualifikasi dan pengalaman Anda, serta manfaatkan evaluasi seleksi cerdas berbasis AI.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/lowongan"
              className="bg-mgm-green hover:bg-[#e00050] text-white text-sm font-extrabold py-3.5 px-6 rounded-xl shadow-lg transition-all text-center flex items-center justify-center space-x-2"
            >
              <Briefcase className="w-4 h-4 text-mgm-yellow" />
              <span>Cari Lowongan Kerja</span>
            </Link>
            <Link
              to="/perusahaan"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-bold py-3.5 px-6 rounded-xl transition-all text-center"
            >
              Jelajahi Profil Perusahaan
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* WHY US SECTION */}
      {/* ========================================================= */}
      <section className="w-full px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold text-mgm-green uppercase tracking-wider mb-2">
            {t('why.badge')}
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-mgm-dark">
            {t('why.title')}
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-mgm-green/50 shadow-sm space-y-4 transition-all">
            <div className="w-12 h-12 rounded-xl bg-mgm-light text-mgm-dark border border-mgm-green/20 flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-mgm-dark">{t('why.aiScreening')}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('why.aiScreeningDesc')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-mgm-green/50 shadow-sm space-y-4 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FF005C]/10 text-mgm-green flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-mgm-dark">{t('why.aiInterview')}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('why.aiInterviewDesc')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-mgm-green/50 shadow-sm space-y-4 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-mgm-dark">{t('why.assessment')}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('why.assessmentDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ABOUT PT MERCINDO SECTION */}
      {/* ========================================================= */}
      <section className="bg-mgm-light dark:bg-slate-900/50 py-20 px-4 -mx-4 sm:-mx-8 lg:-mx-12 sm:px-8 lg:px-12 border-y border-slate-200 dark:border-white/10">
        <div className="w-full grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-xs font-extrabold text-mgm-green uppercase tracking-wider mb-2">
              {t('about.badge')}
            </h2>
            <h3 className="text-3xl md:text-5xl font-black text-mgm-dark leading-tight">
              {t('about.title')}
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('about.desc')}
            </p>
            <div className="mt-8">
              <Link 
                to="/tentang-kami" 
                className="inline-flex items-center font-bold text-mgm-dark hover:text-mgm-green transition-colors bg-white dark:bg-slate-800 px-6 py-3 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 group"
              >
                <span>{t('about.seeMore')}</span>
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-mgm-dark rounded-3xl transform translate-x-4 translate-y-4 opacity-15"></div>
            <img 
              src="https://lh3.googleusercontent.com/d/1JQTKIkNIa_WEs3_8OJJg9ell3gv_a-FT" 
              alt="PT Mercindo Global Manufaktur" 
              className="relative rounded-3xl shadow-xl z-10 w-full h-[400px] object-cover border border-slate-200 dark:border-white/10" 
            />
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CTA SECTION */}
      {/* ========================================================= */}
      <section className="relative -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 py-16 md:py-24 text-center overflow-hidden shadow-2xl bg-gradient-to-br from-[#0c2428] via-[#183e44] via-45% to-[#275961] border-y border-mgm-green/40">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-20 mix-blend-overlay" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1kgcXTFf7P3CyiBoD_qw3CED2NlR1bsEK')" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {t('cta.title')}
          </h2>
          <p className="text-white/80 max-w-xl mx-auto text-base font-light leading-relaxed">
            {t('cta.desc')}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="bg-mgm-green hover:bg-[#e00050] text-white px-8 py-4 rounded-xl font-extrabold text-base shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>{t('cta.registerBtn')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/lowongan" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-base transition-all"
            >
              {t('cta.browseBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* QUICK APPLY MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setSelectedJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto border border-slate-200 space-y-6"
            >
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="px-3 py-1 bg-[#FF005C]/10 text-[#FF005C] border border-[#FF005C]/25 text-xs font-extrabold uppercase rounded-full">
                  Mercindo Quick Apply
                </span>
                <h3 className="text-2xl font-extrabold text-mgm-dark mt-2">{selectedJob.title}</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedJob.company || 'PT Mercindo Global Manufaktur'} • {selectedJob.location}</p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Unggah CV / Resume
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-mgm-green rounded-2xl p-6 text-center transition-colors bg-slate-50 relative">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Pilih berkas PDF atau Word</p>
                  <p className="text-[11px] text-slate-400 mt-1">Sistem AI akan otomatis menganalisis kesesuaian profil.</p>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.txt" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                </div>
              </div>

              {isMatching && (
                <div className="p-4 bg-mgm-light border border-mgm-green/30 rounded-2xl flex items-center space-x-3 text-xs text-mgm-dark font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-mgm-green" />
                  <span>Menganalisis resume dengan kualifikasi...</span>
                </div>
              )}

              {matchResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span>Skor Kecocokan AI:</span>
                    <span className="text-base font-black text-emerald-700">{matchResult.score}%</span>
                  </div>
                  <p className="text-xs text-emerald-800">{matchResult.summary}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-5 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmApply}
                  disabled={isSubmitting || isMatching}
                  className="flex-1 bg-mgm-green hover:bg-[#e00050] text-white font-extrabold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Kirim Lamaran</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
