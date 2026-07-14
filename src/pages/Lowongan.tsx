import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, Briefcase, ChevronRight, CheckCircle, Brain, X, Loader2, Info, Upload, AlertTriangle, Filter } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Job } from '../types';
import { getJobs } from '../data/jobs';

export default function Lowongan() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Selected job for application modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{score: string, summary: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    const data = await getJobs();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    const applyJobId = searchParams.get('apply');
    if (applyJobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === applyJobId);
      if (job) {
        handleApplyClick(job);
        
        // Remove apply query param from URL
        searchParams.delete('apply');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, jobs]);

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
        text = `Kandidat ini memiliki pengalaman di bidang ${selectedJob?.department} dan memiliki keterampilan dasar yang relevan dengan posisi ${selectedJob?.title}. Namun mungkin kurang detail dalam CV yang diunggah.`;
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
          const score = scoreMatch ? scoreMatch[1] : "75";
          setMatchResult({
            score,
            summary: data.result
          });
        } else {
          alert("Gagal menganalisis CV: " + (data.error || "Unknown error"));
        }
      } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan sistem saat menganalisis CV.");
      } finally {
        setIsMatching(false);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmApply = () => {
    setIsSubmitting(true);
    
    setTimeout(async () => {
      const stored = localStorage.getItem('mgm_applications');
      const applications = stored ? JSON.parse(stored) : [];
      
      const user = JSON.parse(localStorage.getItem('mgm_user') || '{}');
      
      const newApp = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.userId || 'user1',
        jobId: selectedJob?.id,
        status: 'Applied',
        createdAt: new Date().toISOString()
      };
      
      applications.push(newApp);
      localStorage.setItem('mgm_applications', JSON.stringify(applications));

      try {
        await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'applyJob',
            userId: newApp.userId,
            userName: user.name || 'Unknown User',
            jobId: newApp.jobId,
            jobTitle: selectedJob?.title,
            status: newApp.status,
            createdAt: newApp.createdAt
          })
        });
      } catch (err) {
        console.error('Failed to sync application to Google Sheet', err);
      }
      
      setIsSubmitting(false);
      setSelectedJob(null);
      navigate('/dashboard');
    }, 1000);
  };

  // Extract unique departments and types for filters
  const departments = ['All', ...Array.from(new Set(jobs.map(j => j.department)))];
  const types = ['All', ...Array.from(new Set(jobs.map(j => j.type)))];

  // Filter logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requirements.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'All' || job.department === selectedDept;
    const matchesType = selectedType === 'All' || job.type === selectedType;

    return matchesSearch && matchesDept && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      {/* Header Banner */}
      <div className="bg-mgm-dark text-white rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-20 mix-blend-overlay" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1kgcXTFf7P3CyiBoD_qw3CED2NlR1bsEK')" }}
        />
        <div className="absolute top-0 right-0 w-32 h-32 bg-mgm-green/20 rounded-bl-full pointer-events-none z-0"></div>
        <div className="relative z-10 space-y-3">
          <span className="px-4 py-1.5 bg-mgm-green text-white text-xs font-bold uppercase tracking-wider rounded-full">
            MGM SmartHire AI
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Cari Lowongan Pekerjaan</h1>
          <p className="text-white/80 max-w-2xl font-light text-sm md:text-base leading-relaxed">
            Temukan berbagai peluang karir menarik di MGM. Gunakan fitur filter cerdas untuk menemukan posisi yang sesuai dengan keahlian Anda.
          </p>
        </div>
      </div>

      {/* Filter and Job Lists Layout */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <Filter className="w-5 h-5 text-mgm-green" />
            <span className="font-bold text-mgm-dark">Filter Pencarian</span>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kata Kunci</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari posisi atau bidang..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-mgm-green focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Departemen</label>
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-mgm-green outline-none"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'Semua Departemen' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tipe Pekerjaan</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-mgm-green outline-none"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'Semua Tipe' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {(searchTerm !== '' || selectedDept !== 'All' || selectedType !== 'All') && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('All');
                setSelectedType('All');
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Atur Ulang Filter
            </button>
          )}
        </div>

        {/* Jobs Results */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-slate-600">
              Menampilkan <span className="text-mgm-dark font-bold">{filteredJobs.length}</span> lowongan pekerjaan
            </p>
          </div>

          {loading ? (
            <div className="p-20 text-center text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
              Sedang memuat lowongan pekerjaan...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-16 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm border-dashed">
              <Info className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <h4 className="font-bold text-mgm-dark mb-1">Lowongan Tidak Ditemukan</h4>
              <p className="text-xs text-slate-400">Silakan ubah kata kunci atau filter pencarian Anda.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={job.id} 
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all group flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-mgm-light rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-mgm-light text-mgm-dark text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {job.department}
                    </span>
                    <Briefcase className="text-slate-300 w-5 h-5 group-hover:text-mgm-green transition-colors" />
                  </div>
                  <h4 className="text-xl font-bold text-mgm-dark mb-2 group-hover:text-mgm-green transition-colors">{job.title}</h4>
                  <div className="space-y-2 mb-6 flex-1 text-xs font-semibold text-slate-500">
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      {job.type}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleApplyClick(job)} 
                    className="block w-full text-center bg-slate-50 border border-slate-200 text-mgm-dark font-bold py-3 rounded-xl hover:bg-mgm-dark hover:text-white transition-colors text-sm"
                  >
                    Lamar Posisi Ini
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* JOB APPLICATION MODAL */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-mgm-dark/60 backdrop-blur-sm"
              onClick={() => setSelectedJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white rounded-[2rem] shadow-2xl relative z-10 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-20">
                <X className="w-6 h-6" />
              </button>
              
              <div className="p-8 pb-6 border-b border-slate-100">
                <span className="px-3 py-1 bg-mgm-light text-mgm-dark text-xs font-bold uppercase tracking-wider rounded-full mb-3 inline-block">
                  {selectedJob.department}
                </span>
                <h3 className="text-3xl font-bold text-mgm-dark mb-2">{selectedJob.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" />{selectedJob.location}</div>
                  <div className="flex items-center"><Clock className="w-4 h-4 mr-2" />{selectedJob.type}</div>
                </div>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="mb-8">
                  <h4 className="font-bold text-mgm-dark mb-3 text-lg">Deskripsi Pekerjaan</h4>
                  <p className="text-slate-600 leading-relaxed text-sm">{selectedJob.description}</p>
                </div>
                
                <div className="mb-8">
                  <h4 className="font-bold text-mgm-dark mb-3 text-lg">Kriteria & Persyaratan</h4>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, i) => (
                      <li key={i} className="flex items-start text-slate-600 text-sm">
                        <CheckCircle className="w-5 h-5 text-mgm-green mr-3 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-4">
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="px-6 py-3 font-bold text-slate-500 hover:text-mgm-dark hover:bg-slate-200/50 rounded-xl transition-colors text-sm"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirmApply}
                  disabled={isSubmitting}
                  className="bg-mgm-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center text-sm"
                >
                  {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...</> : "Lanjutkan Melamar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
