import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, Briefcase, ChevronRight, Users, TrendingUp, CheckCircle, Brain, X, Loader2, Info, Upload, AlertTriangle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Job } from '../types';
import { getJobs } from '../data/jobs';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{score: string, summary: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        // Dummy fallback for unreadable or too short files
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
          // Parse the score from response (basic fallback parsing)
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

      // Sync application with GAS Google Sheet
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
  return (
    <div className="space-y-24 pb-12">
      {/* HERO SECTION */}
      <section className="relative rounded-[2rem] overflow-hidden bg-mgm-dark text-white p-8 md:p-16 shadow-2xl flex flex-col items-center gap-12 text-center pb-20">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current"><polygon points="0,100 100,0 100,100"/></svg>
        </div>
        
        <div className="relative z-10 w-full flex flex-col items-center pt-10">
          <div className="relative font-extrabold uppercase tracking-tighter mb-16 flex flex-col items-center select-none">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[12vw] sm:text-7xl md:text-8xl lg:text-[7rem] leading-none text-white whitespace-nowrap z-0 relative"
            >
              WE <span className="text-[#3ee0d0]">BELIEVE</span> IN YOUR
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[14vw] sm:text-8xl md:text-9xl lg:text-[9rem] leading-none text-white whitespace-nowrap z-10 -mt-2 sm:-mt-6 md:-mt-8 lg:-mt-12"
              style={{ 
                textShadow: '0 15px 30px rgba(0,0,0,0.6), 0 5px 10px rgba(0,0,0,0.4)',
              }}
            >
              POTENTIAL
            </motion.div>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed font-light max-w-2xl mx-auto"
          >
            Platform rekrutmen cerdas yang dirancang untuk menganalisis, memfilter, dan menemukan talenta terbaik secara akurat dan efisien.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto relative z-20"
          >
            <Link to="/register" className="bg-mgm-green text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all text-center flex items-center justify-center shadow-lg hover:shadow-xl">
              Mulai Karir Anda <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <a href="#jobs" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all text-center">
              Lihat Lowongan
            </a>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4 }}
             className="w-[100vw] relative z-20 mt-12 overflow-hidden border-t border-white/10 pt-12 -mx-8 md:-mx-16"
          >
            <div className="flex w-[200%] animate-marquee">
              <div className="w-1/2 flex items-center space-x-0 px-0">
                 <img src="https://lh3.googleusercontent.com/d/1a2HLhlQA7bpuXTctN3iwncSCsqnVjOK3" alt="Team working" className="w-1/4 h-48 object-cover opacity-80 hover:opacity-100 transition-all duration-300 border-x border-white/5" />
                 <img src="https://lh3.googleusercontent.com/d/1kgcXTFf7P3CyiBoD_qw3CED2NlR1bsEK" alt="Professional Interview" className="w-1/4 h-48 object-cover opacity-80 hover:opacity-100 transition-all duration-300 border-x border-white/5" />
                 <img src="https://lh3.googleusercontent.com/d/1LaeThuGivROJVt7ZQFEjVgXexg15PAfW" alt="Consulting" className="w-1/4 h-48 object-cover opacity-80 hover:opacity-100 transition-all duration-300 border-x border-white/5" />
                 <img src="https://lh3.googleusercontent.com/d/1XDA2IJdYabu5z8KXjZGoT0n89vHKaIpR" alt="Strategy" className="w-1/4 h-48 object-cover opacity-80 hover:opacity-100 transition-all duration-300 border-x border-white/5" />
              </div>
              <div className="w-1/2 flex items-center space-x-0 px-0">
                 <img src="https://lh3.googleusercontent.com/d/1zGWaHYnRfpQM-xxQdnoiBr1jUUzVgFu-" alt="Team working" className="w-1/4 h-48 object-cover opacity-80 hover:opacity-100 transition-all duration-300 border-x border-white/5" />
                 <img src="https://lh3.googleusercontent.com/d/1sjbLP_GKC1e_GBQ_Jlaw8ORlmRaNG2_B" alt="Professional Interview" className="w-1/4 h-48 object-cover opacity-80 hover:opacity-100 transition-all duration-300 border-x border-white/5" />
                 <img src="https://lh3.googleusercontent.com/d/103-U5wBI_j0OdFv9oHwKboOPmZgiv2MW" alt="Consulting" className="w-1/4 h-48 object-cover opacity-80 hover:opacity-100 transition-all duration-300 border-x border-white/5" />
                 <img src="https://lh3.googleusercontent.com/d/1JQTKIkNIa_WEs3_8OJJg9ell3gv_a-FT" alt="Strategy" className="w-1/4 h-48 object-cover opacity-80 hover:opacity-100 transition-all duration-300 border-x border-white/5" />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Floating Collage */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 0.4, scale: 1, rotate: -6 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute -top-10 left-[2%] w-48 h-64 md:w-64 md:h-80 rounded-3xl overflow-hidden border-2 border-mgm-green/30 shadow-2xl mix-blend-luminosity"
          >
            <div className="absolute inset-0 bg-mgm-green/40 z-10 mix-blend-color"></div>
            <img src="https://lh3.googleusercontent.com/d/1a2HLhlQA7bpuXTctN3iwncSCsqnVjOK3" alt="" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 0.3, scale: 1, rotate: 8 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="absolute top-20 right-[2%] w-56 h-72 md:w-72 md:h-96 rounded-3xl overflow-hidden border-2 border-mgm-green/30 shadow-2xl mix-blend-luminosity"
          >
            <div className="absolute inset-0 bg-mgm-green/50 z-10 mix-blend-color"></div>
            <img src="https://lh3.googleusercontent.com/d/1kgcXTFf7P3CyiBoD_qw3CED2NlR1bsEK" alt="" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 0.5, scale: 1, rotate: -12 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute -bottom-10 left-[15%] w-64 h-48 md:w-80 md:h-64 rounded-3xl overflow-hidden border-2 border-mgm-green/20 shadow-2xl mix-blend-luminosity"
          >
            <div className="absolute inset-0 bg-mgm-green/30 z-10 mix-blend-color"></div>
            <img src="https://lh3.googleusercontent.com/d/1LaeThuGivROJVt7ZQFEjVgXexg15PAfW" alt="" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
            animate={{ opacity: 0.4, scale: 1, rotate: 10 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute -bottom-20 right-[20%] w-72 h-56 md:w-96 md:h-72 rounded-3xl overflow-hidden border-2 border-mgm-green/40 shadow-2xl mix-blend-luminosity"
          >
            <div className="absolute inset-0 bg-mgm-green/40 z-10 mix-blend-color"></div>
            <img src="https://lh3.googleusercontent.com/d/1XDA2IJdYabu5z8KXjZGoT0n89vHKaIpR" alt="" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
            animate={{ opacity: 0.35, scale: 1, rotate: -15 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute top-[30%] left-[10%] w-40 h-56 md:w-56 md:h-72 rounded-3xl overflow-hidden border-2 border-mgm-green/20 shadow-2xl mix-blend-luminosity"
          >
            <div className="absolute inset-0 bg-mgm-green/45 z-10 mix-blend-color"></div>
            <img src="https://lh3.googleusercontent.com/d/1zGWaHYnRfpQM-xxQdnoiBr1jUUzVgFu-" alt="" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 25 }}
            animate={{ opacity: 0.45, scale: 1, rotate: 18 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute top-[10%] left-[40%] w-32 h-32 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border-2 border-mgm-green/30 shadow-2xl mix-blend-luminosity"
          >
            <div className="absolute inset-0 bg-mgm-green/35 z-10 mix-blend-color"></div>
            <img src="https://lh3.googleusercontent.com/d/1sjbLP_GKC1e_GBQ_Jlaw8ORlmRaNG2_B" alt="" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{ opacity: 0.3, scale: 1, rotate: -5 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="absolute top-[40%] right-[15%] w-48 h-48 md:w-64 md:h-64 rounded-[2rem] overflow-hidden border-2 border-mgm-green/40 shadow-2xl mix-blend-luminosity"
          >
            <div className="absolute inset-0 bg-mgm-green/55 z-10 mix-blend-color"></div>
            <img src="https://lh3.googleusercontent.com/d/103-U5wBI_j0OdFv9oHwKboOPmZgiv2MW" alt="" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 12 }}
            animate={{ opacity: 0.4, scale: 1, rotate: 22 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="absolute bottom-[20%] left-[30%] w-36 h-36 md:w-56 md:h-56 rounded-[2rem] overflow-hidden border-2 border-mgm-green/20 shadow-2xl mix-blend-luminosity"
          >
            <div className="absolute inset-0 bg-mgm-green/30 z-10 mix-blend-color"></div>
            <img src="https://lh3.googleusercontent.com/d/1JQTKIkNIa_WEs3_8OJJg9ell3gv_a-FT" alt="" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
            animate={{ opacity: 0.35, scale: 1, rotate: -25 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="absolute bottom-[5%] right-[40%] w-40 h-40 md:w-60 md:h-60 rounded-[2rem] overflow-hidden border-2 border-mgm-green/30 shadow-2xl mix-blend-luminosity"
          >
            <div className="absolute inset-0 bg-mgm-green/50 z-10 mix-blend-color"></div>
            <img src="https://lh3.googleusercontent.com/d/1kgcXTFf7P3CyiBoD_qw3CED2NlR1bsEK" alt="" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 30 }}
            animate={{ opacity: 0.25, scale: 1, rotate: 15 }}
            transition={{ duration: 1, delay: 0.65 }}
            className="absolute top-[50%] left-[2%] w-32 h-40 md:w-48 md:h-56 rounded-3xl overflow-hidden border-2 border-mgm-green/20 shadow-2xl mix-blend-luminosity"
          >
            <div className="absolute inset-0 bg-mgm-green/40 z-10 mix-blend-color"></div>
            <img src="https://lh3.googleusercontent.com/d/1a2HLhlQA7bpuXTctN3iwncSCsqnVjOK3" alt="" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* WHY US SECTION */}
      <section className="max-w-7xl mx-auto px-4">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-16"
         >
           <h2 className="text-sm font-bold text-mgm-green uppercase tracking-wider mb-2">Expertise Kami</h2>
           <h3 className="text-3xl md:text-4xl font-extrabold text-mgm-dark">Mengapa MGM SmartHire AI?</h3>
         </motion.div>
         <div className="grid md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <FeatureCard 
                icon={<Brain className="w-8 h-8 text-mgm-green" />}
                title="Screening Cerdas AI"
                desc="Sistem kami secara otomatis mencocokkan CV Anda dengan kriteria yang dibutuhkan perusahaan, memberikan hasil yang objektif."
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <FeatureCard 
                icon={<Users className="w-8 h-8 text-mgm-green" />}
                title="Wawancara Otomatis"
                desc="Jadwalkan dan lakukan wawancara awal dengan agen AI kami kapan saja sesuai dengan waktu Anda."
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <FeatureCard 
                icon={<TrendingUp className="w-8 h-8 text-mgm-green" />}
                title="Assessment Terintegrasi"
                desc="Dari tes logika hingga tes Kraepelin, semua dilakukan dalam satu platform dengan hasil instan."
              />
            </motion.div>
         </div>
      </section>

      {/* ABOUT PT MERCINDO SECTION */}
      <section className="bg-mgm-light py-20 px-4 mt-24 mb-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-sm font-bold text-mgm-green uppercase tracking-wider mb-2">Tentang Perusahaan</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-mgm-dark leading-tight">Terdepan dalam Manufaktur Garmen Global</h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              PT. Mercindo Global Manufaktur adalah perusahaan manufaktur terkemuka yang berspesialisasi dalam produksi pakaian dalam dan garmen berkualitas tinggi. Kami berkomitmen memberikan keunggulan di setiap jahitan, dengan standar internasional yang memenuhi kebutuhan pasar global maupun domestik.
            </p>
            <ul className="space-y-4 mt-8">
              {['Kapasitas produksi skala besar dan modern', 'Standar kualitas (Quality Control) internasional', 'Inovasi teknologi dalam industri garmen'].map((item, i) => (
                 <li key={i} className="flex items-center text-slate-700 font-medium">
                   <div className="w-6 h-6 rounded-full bg-mgm-green/20 flex items-center justify-center mr-4 text-mgm-green">
                     <CheckCircle className="w-4 h-4" />
                   </div>
                   {item}
                 </li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-mgm-green rounded-3xl transform translate-x-4 translate-y-4"></div>
            <img src="https://lh3.googleusercontent.com/d/1JQTKIkNIa_WEs3_8OJJg9ell3gv_a-FT" alt="PT Mercindo Global Manufaktur" className="relative rounded-3xl shadow-lg z-10 w-full h-[400px] object-cover" />
          </motion.div>
        </div>
      </section>

      {/* JOB BOARD SECTION */}
      <section id="jobs" className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-sm font-bold text-mgm-green uppercase tracking-wider mb-2">Karir</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-mgm-dark tracking-tight">Peluang Bergabung</h3>
          </div>
          
          <div className="flex-1 max-w-md w-full relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari posisi atau departemen..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-mgm-green focus:border-transparent outline-none shadow-sm transition-all"
            />
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          {filteredJobs.slice(0, 3).map((job, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              key={job.id} 
              className="bg-white rounded-[1.5rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-mgm-light rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 bg-mgm-olive/30 text-mgm-dark text-xs font-bold uppercase tracking-wider rounded-full">
                  {job.department}
                </span>
                <Briefcase className="text-slate-300 w-6 h-6 group-hover:text-mgm-green transition-colors" />
              </div>
              <h4 className="text-2xl font-bold text-mgm-dark mb-3 group-hover:text-mgm-green transition-colors">{job.title}</h4>
              <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-center text-sm font-medium text-slate-500">
                  <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm font-medium text-slate-500">
                  <Clock className="w-4 h-4 mr-3 text-slate-400" />
                  {job.type}
                </div>
              </div>
              <button 
                onClick={() => handleApplyClick(job)} 
                className="block w-full text-center bg-slate-50 border border-slate-200 text-mgm-dark font-bold py-3.5 rounded-xl hover:bg-mgm-dark hover:text-white transition-colors"
              >
                Lamar Posisi Ini
              </button>
            </motion.div>
          ))}
        </div>

        {filteredJobs.length > 3 && (
          <div className="text-center mt-12">
            <Link to="/lowongan" className="inline-flex items-center bg-mgm-dark text-white hover:bg-opacity-90 px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg">
              Lihat Semua {filteredJobs.length} Lowongan <ChevronRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* CTA SECTION */}
      <section className="relative rounded-[2rem] p-12 md:p-24 text-center overflow-hidden mx-4 md:mx-0 shadow-2xl bg-mgm-dark">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40 mix-blend-overlay" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1JQTKIkNIa_WEs3_8OJJg9ell3gv_a-FT')" }}
        />
        <div className="absolute inset-0 bg-mgm-dark/60 z-0"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-white mb-6"
          >
            Siap Melangkah Maju?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 mb-10 font-medium leading-relaxed"
          >
            Buat profil Anda sekarang dan biarkan sistem cerdas kami mencocokkan Anda dengan karir impian di PT. Mercindo Global Manufaktur.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/register" className="inline-block bg-mgm-green text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Buat Akun Kandidat
            </Link>
          </motion.div>
        </div>
      </section>

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
                  <p className="text-slate-600 leading-relaxed">{selectedJob.description}</p>
                </div>
                
                <div className="mb-8">
                  <h4 className="font-bold text-mgm-dark mb-3 text-lg">Kriteria & Persyaratan</h4>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, i) => (
                      <li key={i} className="flex items-start text-slate-600">
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
                  className="px-6 py-3 font-bold text-slate-500 hover:text-mgm-dark hover:bg-slate-200/50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirmApply}
                  disabled={isSubmitting}
                  className="bg-mgm-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center"
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

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="w-16 h-16 bg-mgm-light rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-mgm-dark mb-3">{title}</h4>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </motion.div>
  )
}
