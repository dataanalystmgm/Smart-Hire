import React, { useState, useEffect } from 'react';
import { User, Application, Job } from '../types';
import { motion } from 'framer-motion';
import { 
  UploadCloud, 
  CheckCircle, 
  FileText, 
  AlertCircle, 
  FileCheck, 
  Briefcase, 
  X, 
  User as UserIcon, 
  MapPin, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Trash2, 
  Save, 
  Edit,
  FolderOpen
} from 'lucide-react';
import { getJobs } from '../data/jobs';

interface UserProfile {
  fullName: string;
  birthPlaceDate: string;
  highestEducation: string;
  major: string;
  homeAddress: string;
  phoneNumber: string;
}

export default function ApplicantDashboard({ user }: { user: User }) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [savedCV, setSavedCV] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([]);
  
  // Profile Information State
  const [profile, setProfile] = useState<UserProfile>({
    fullName: user.name || '',
    birthPlaceDate: '',
    highestEducation: '',
    major: '',
    homeAddress: '',
    phoneNumber: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Uploaded Documents Track
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { fileName: string; uploadedAt: string }>>({});

  useEffect(() => {
    const cv = localStorage.getItem('mgm_user_cv');
    if (cv) setSavedCV(cv);
    
    // Fetch Applications from Sheet
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_data', type: 'Applications' })
        });
        const d = await res.json();
        if (d.status === 'success' && d.data) {
          const mappedApps: Application[] = d.data
            .filter((app: any) => String(app.UserID || app.userId || '') === String(user.userId))
            .map((app: any) => ({
              id: app.ID || app.id,
              userId: app.UserID || app.userId,
              jobId: app.JobID || app.jobId,
              status: app.Status || app.status,
              createdAt: app.CreatedAt || app.createdAt
            }));
          setApplications(mappedApps);
          
          // Update local storage so that Layout.tsx (which polls localStorage) detects the status change
          const stored = localStorage.getItem('mgm_applications');
          let parsedApps = stored ? JSON.parse(stored) : [];
          // Remove existing apps for this user
          parsedApps = parsedApps.filter((app: any) => String(app.userId) !== String(user.userId));
          // Add the newly fetched apps
          parsedApps = [...parsedApps, ...mappedApps];
          localStorage.setItem('mgm_applications', JSON.stringify(parsedApps));
        }
      } catch (err) {
        console.warn('Failed to fetch applications from GAS:', err);
      }
    };
    fetchApplications();

    // Fetch Documents from Sheet
    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_data', type: 'Documents' })
        });
        const d = await res.json();
        if (d.status === 'success' && d.data) {
          const userDocs = d.data.filter((doc: any) => String(doc.UserID || doc.userId || '') === String(user.userId));
          const newDocs: Record<string, { fileName: string; uploadedAt: string }> = {};
          userDocs.forEach((doc: any) => {
            const type = doc.DocumentType || doc.documentType;
            if (type) {
              newDocs[type] = {
                fileName: doc.FileName || doc.fileName || type,
                uploadedAt: doc.CreatedAt || doc.createdAt || new Date().toISOString()
              };
            }
          });
          setUploadedDocs(newDocs);
          localStorage.setItem(`mgm_uploaded_docs_${user.userId}`, JSON.stringify(newDocs));
        } else {
           // Fallback to local
           loadLocalDocs();
        }
      } catch (err) {
        console.warn('Failed to fetch docs from GAS:', err);
        loadLocalDocs();
      }
    };
    
    const loadLocalDocs = () => {
       const storedDocs = localStorage.getItem(`mgm_uploaded_docs_${user.userId}`);
      if (storedDocs) {
        try {
          setUploadedDocs(JSON.parse(storedDocs));
        } catch (e) {
          console.error('Error parsing uploaded docs:', e);
        }
      } else if (cv) {
        const legacyCV = {
          CV: {
            fileName: 'CV_Kandidat.txt',
            uploadedAt: new Date().toISOString()
          }
        };
        setUploadedDocs(legacyCV);
        localStorage.setItem(`mgm_uploaded_docs_${user.userId}`, JSON.stringify(legacyCV));
      }
    };
    
    fetchDocuments();

    // Load Profile
    const storedProfile = localStorage.getItem(`mgm_profile_${user.userId}`);
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.error('Error parsing profile:', e);
      }
    }

    const dismissed = localStorage.getItem('mgm_dismissed_warnings');
    if (dismissed) {
      setDismissedWarnings(JSON.parse(dismissed));
    }

    getJobs().then(setJobs);
  }, [user.userId]);

  const handleDismissWarning = (appId: string) => {
    const updated = [...dismissedWarnings, appId];
    setDismissedWarnings(updated);
    localStorage.setItem('mgm_dismissed_warnings', JSON.stringify(updated));
  };
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    setUploadStatus(`Mengunggah ${type}...`);

    if (type === 'CV') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        let text = event.target?.result as string;
        if (!text || text.trim().length < 50) {
          text = `Ini adalah profil simulasi untuk kandidat ${profile.fullName || user.name}. Kandidat memiliki pengalaman di bidang logistik dan teknologi, serta keterampilan yang relevan dengan kebutuhan industri saat ini.`;
        }
        localStorage.setItem('mgm_user_cv', text);
        setSavedCV(text);
      };
      reader.readAsText(file);
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.userId);
    formData.append('userName', profile.fullName || user.name);
    formData.append('documentType', type);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.status === 'success') {
        const newDocs = {
          ...uploadedDocs,
          [type]: {
            fileName: file.name,
            uploadedAt: new Date().toISOString()
          }
        };
        setUploadedDocs(newDocs);
        localStorage.setItem(`mgm_uploaded_docs_${user.userId}`, JSON.stringify(newDocs));
        setUploadStatus(`${type} berhasil diunggah!`);
      } else {
        // Fallback to local storage only if proxy endpoint fails in offline sandbox
        const newDocs = {
          ...uploadedDocs,
          [type]: {
            fileName: file.name,
            uploadedAt: new Date().toISOString()
          }
        };
        setUploadedDocs(newDocs);
        localStorage.setItem(`mgm_uploaded_docs_${user.userId}`, JSON.stringify(newDocs));
        setUploadStatus(`${type} berhasil diunggah! (Local Mode)`);
      }
    } catch (err) {
      // Local fallback
      const newDocs = {
        ...uploadedDocs,
        [type]: {
          fileName: file.name,
          uploadedAt: new Date().toISOString()
        }
      };
      setUploadedDocs(newDocs);
      localStorage.setItem(`mgm_uploaded_docs_${user.userId}`, JSON.stringify(newDocs));
      setUploadStatus(`${type} berhasil diunggah! (Local Fallback)`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleDeleteDoc = async (type: string) => {
    setUploading(true);
    setUploadStatus(`Menghapus ${type}...`);
    try {
      await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_document', userId: user.userId, documentType: type })
      });
    } catch (e) {
      console.warn("Failed to delete from GAS", e);
    }

    const updated = { ...uploadedDocs };
    delete updated[type];
    setUploadedDocs(updated);
    localStorage.setItem(`mgm_uploaded_docs_${user.userId}`, JSON.stringify(updated));
    
    if (type === 'CV') {
      localStorage.removeItem('mgm_user_cv');
      setSavedCV(null);
    }
    
    setUploadStatus(`${type} berhasil dihapus!`);
    setUploading(false);
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`mgm_profile_${user.userId}`, JSON.stringify(profile));
    setIsEditingProfile(false);
    setUploadStatus("Profil berhasil diperbarui!");
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const getJobDetails = (jobId: string) => {
    return jobs.find(j => j.id === jobId);
  };

  return (
    <div className="space-y-8">
      <header className="mb-6 bg-mgm-dark text-white rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-20 mix-blend-overlay" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1XDA2IJdYabu5z8KXjZGoT0n89vHKaIpR')" }}
        />
        <div className="absolute top-0 right-0 w-32 h-32 bg-mgm-green/20 rounded-bl-full pointer-events-none z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Dashboard Pelamar</h1>
          <p className="text-white/80 mt-2 text-base">Selamat datang kembali, {profile.fullName || user.name}. Kelola data dan lamaran Anda.</p>
        </div>
      </header>

      {/* Hero Notifications */}
      {applications.filter(app => !dismissedWarnings.includes(app.id)).some(app => app.status === 'Approved' || app.status === 'Rejected') && (
        <div className="space-y-3 mb-6">
          {applications.filter(app => !dismissedWarnings.includes(app.id)).map(app => {
            const job = getJobDetails(app.jobId);
            if (app.status === 'Approved') {
              return (
                <motion.div 
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="bg-[#eefcf2] border border-green-200 text-green-800 p-5 rounded-2xl flex items-start space-x-4 shadow-sm relative pr-12"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-base text-green-950">Selamat! Lamaran Anda Diterima</h4>
                    <p className="text-xs text-green-800 mt-1">Lamaran Anda untuk posisi <strong>{job?.title || 'Pekerjaan'}</strong> telah disetujui. Silakan selesaikan <strong>Tes Online</strong> dan <strong>Wawancara AI Suara</strong> di menu navigasi.</p>
                  </div>
                  <button 
                    onClick={() => handleDismissWarning(app.id)} 
                    className="absolute top-4 right-4 text-green-700 hover:text-green-950 hover:bg-green-100/50 p-1.5 rounded-full transition-colors"
                    title="Hapus"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            }
            if (app.status === 'Rejected') {
              return (
                <motion.div 
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="bg-[#fdf2f2] border border-red-200 text-red-800 p-5 rounded-2xl flex items-start space-x-4 shadow-sm relative pr-12"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-base text-red-950">Status Lamaran Selesai</h4>
                    <p className="text-xs text-red-800 mt-1">Terima kasih telah melamar posisi <strong>{job?.title || 'Pekerjaan'}</strong>. Saat ini tim rekrutmen kami belum dapat melanjutkan lamaran Anda ke tahap berikutnya.</p>
                  </div>
                  <button 
                    onClick={() => handleDismissWarning(app.id)} 
                    className="absolute top-4 right-4 text-red-700 hover:text-red-950 hover:bg-red-100/50 p-1.5 rounded-full transition-colors"
                    title="Hapus"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            }
            return null;
          })}
        </div>
      )}

      {uploadStatus && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-mgm-light text-mgm-dark p-3.5 rounded-xl flex items-center border border-mgm-olive/50 shadow-sm max-w-md">
          <CheckCircle className="w-5 h-5 mr-3 text-mgm-green" />
          <span className="font-bold text-sm">{uploadStatus}</span>
        </motion.div>
      )}

      {/* Main Layout Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Identity Profile */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Identity General Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-mgm-dark flex items-center">
                <UserIcon className="w-6 h-6 mr-3 text-mgm-green" />
                Profil Pelamar
              </h2>
              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs font-bold text-mgm-green bg-mgm-light hover:bg-mgm-olive/20 px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5"
              >
                {isEditingProfile ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Batal</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    <span>Edit Profil</span>
                  </>
                )}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-mgm-green focus:bg-white transition-all text-mgm-dark"
                      placeholder="Contoh: Budi Santoso"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tempat Tanggal Lahir</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-mgm-green focus:bg-white transition-all text-mgm-dark"
                      placeholder="Contoh: Jakarta, 12 Agustus 1998"
                      value={profile.birthPlaceDate}
                      onChange={(e) => setProfile({ ...profile, birthPlaceDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pendidikan Terakhir</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-mgm-green focus:bg-white transition-all text-mgm-dark"
                      value={profile.highestEducation}
                      onChange={(e) => setProfile({ ...profile, highestEducation: e.target.value })}
                      required
                    >
                      <option value="">-- Pilih Pendidikan --</option>
                      <option value="SMA / SMK">SMA / SMK / Sederajat</option>
                      <option value="D3">Diploma (D3)</option>
                      <option value="D4 / S1">Sarjana Terapan / Strata 1 (D4 / S1)</option>
                      <option value="S2">Magister (S2)</option>
                      <option value="S3">Doktor (S3)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jurusan</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-mgm-green focus:bg-white transition-all text-mgm-dark"
                      placeholder="Contoh: Teknik Informatika / Manajemen"
                      value={profile.major}
                      onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nomor Telepon</label>
                    <input
                      type="tel"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-mgm-green focus:bg-white transition-all text-mgm-dark"
                      placeholder="Contoh: 08123456789"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alamat Rumah</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-mgm-green focus:bg-white transition-all text-mgm-dark"
                      placeholder="Contoh: Jl. Sudirman No. 45, Jakarta Selatan"
                      value={profile.homeAddress}
                      onChange={(e) => setProfile({ ...profile, homeAddress: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-mgm-green text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90 shadow-sm transition-all flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Profil</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <UserIcon className="w-4 h-4 text-mgm-green shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</p>
                      <p className="text-sm font-extrabold text-mgm-dark mt-0.5">{profile.fullName || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-4 h-4 text-mgm-green shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tempat Tanggal Lahir</p>
                      <p className="text-sm font-bold text-mgm-dark mt-0.5">{profile.birthPlaceDate || <span className="text-slate-400 font-medium italic text-xs">Belum diisi</span>}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <GraduationCap className="w-4 h-4 text-mgm-green shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendidikan Terakhir</p>
                      <p className="text-sm font-bold text-mgm-dark mt-0.5">{profile.highestEducation || <span className="text-slate-400 font-medium italic text-xs">Belum diisi</span>}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FolderOpen className="w-4 h-4 text-mgm-green shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jurusan</p>
                      <p className="text-sm font-bold text-mgm-dark mt-0.5">{profile.major || <span className="text-slate-400 font-medium italic text-xs">Belum diisi</span>}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-4 h-4 text-mgm-green shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Telepon</p>
                      <p className="text-sm font-bold text-mgm-dark mt-0.5">{profile.phoneNumber || <span className="text-slate-400 font-medium italic text-xs">Belum diisi</span>}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-mgm-green shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Rumah</p>
                      <p className="text-sm font-bold text-mgm-dark mt-0.5">{profile.homeAddress || <span className="text-slate-400 font-medium italic text-xs">Belum diisi</span>}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.section>

          {/* AI Screening Data Details */}
          {savedCV && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-mgm-dark text-white p-6 sm:p-8 rounded-3xl border border-mgm-dark shadow-sm hover:shadow-md transition-all"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FileCheck className="w-5 h-5 mr-3 text-mgm-green" />
                Data CV Anda
              </h2>
              <p className="text-slate-300 mb-4 text-xs font-medium">Data teks CV ini akan digunakan untuk proses AI Screening saat Anda melamar pekerjaan.</p>
              <div className="bg-slate-800 p-4 rounded-xl text-xs text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                {savedCV}
              </div>
            </motion.section>
          )}
        </div>

        {/* RIGHT COLUMN: Smaller Status List & Documents Upload List */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Status Lamaran: Smaller & Custom backgrounds */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            <h2 className="text-xl font-bold text-mgm-dark mb-4 flex items-center justify-between">
              <span>Status Lamaran</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Compact</span>
            </h2>
            
            {applications.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-mgm-dark">Belum ada lamaran aktif</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">Silakan jelajahi lowongan pekerjaan yang tersedia di menu Lowongan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const job = getJobDetails(app.jobId);
                  const isRejected = app.status === 'Rejected' || String(app.status).toLowerCase() === 'ditolak';
                  const isApproved = app.status === 'Approved' || String(app.status).toLowerCase() === 'disetujui' || String(app.status).toLowerCase() === 'testing' || String(app.status).toLowerCase() === 'interview';
                  
                  let bgClass = "bg-white border-slate-200 hover:border-slate-300";
                  if (isRejected) {
                    bgClass = "bg-rose-50 border-rose-200 text-rose-900";
                  } else if (isApproved) {
                    bgClass = "bg-emerald-50 border-emerald-200 text-emerald-950";
                  }
                  
                  return (
                    <div key={app.id} className={`border p-4 rounded-xl hover:shadow-sm transition-all flex flex-col justify-between ${bgClass}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full ${
                          isRejected ? 'bg-rose-200 text-rose-800' :
                          isApproved ? 'bg-emerald-200 text-emerald-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                          {new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-mgm-dark">
                          {job ? job.title : 'Posisi Tidak Diketahui'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center mt-1">
                          <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                          {job ? job.department : '-'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* Dokumen Profil: With Delete & Re-upload Capability */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-bold text-mgm-dark mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-3 text-mgm-green" />
              Dokumen Profil
            </h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Unggah dokumen yang diperlukan untuk peninjauan otomatis AI dan HR.</p>
            
            <div className="space-y-4">
              <DocumentCard 
                title="Curriculum Vitae (CV)" 
                type="CV" 
                uploadedInfo={uploadedDocs['CV']}
                onChange={(e) => handleUpload(e, 'CV')} 
                onDelete={() => handleDeleteDoc('CV')}
                disabled={uploading} 
                accept=".txt,.md,.pdf" 
              />
              <DocumentCard 
                title="Ijazah" 
                type="Ijazah" 
                uploadedInfo={uploadedDocs['Ijazah']}
                onChange={(e) => handleUpload(e, 'Ijazah')} 
                onDelete={() => handleDeleteDoc('Ijazah')}
                disabled={uploading} 
                accept=".pdf,.jpg,.jpeg,.png" 
              />
              <DocumentCard 
                title="KTP / Identitas" 
                type="KTP" 
                uploadedInfo={uploadedDocs['KTP']}
                onChange={(e) => handleUpload(e, 'KTP')} 
                onDelete={() => handleDeleteDoc('KTP')}
                disabled={uploading} 
                accept=".pdf,.jpg,.jpeg,.png" 
              />
              <DocumentCard 
                title="Sertifikat (Opsional)" 
                type="Sertifikat" 
                uploadedInfo={uploadedDocs['Sertifikat']}
                onChange={(e) => handleUpload(e, 'Sertifikat')} 
                onDelete={() => handleDeleteDoc('Sertifikat')}
                disabled={uploading} 
                accept=".pdf,.jpg,.jpeg,.png" 
              />
            </div>
          </motion.section>

        </div>

      </div>
    </div>
  );
}

interface DocumentCardProps {
  title: string;
  type: string;
  uploadedInfo?: { fileName: string; uploadedAt: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  disabled: boolean;
  accept: string;
}

function DocumentCard({ title, type, uploadedInfo, onChange, onDelete, disabled, accept }: DocumentCardProps) {
  const fileInputId = `file-input-${type}`;

  return (
    <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:border-slate-200 transition-all flex items-center justify-between">
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="font-extrabold text-mgm-dark text-sm">{title}</h4>
        
        {uploadedInfo ? (
          <div className="mt-1 flex flex-col space-y-0.5">
            <p className="text-xs text-emerald-600 font-semibold flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Telah Diunggah
            </p>
            <p className="text-[11px] text-slate-500 font-mono truncate max-w-xs">{uploadedInfo.fileName}</p>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Belum diunggah</p>
        )}
      </div>

      <div className="shrink-0">
        {uploadedInfo ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
            title="Hapus dokumen ini"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <label 
            htmlFor={fileInputId} 
            className={`cursor-pointer bg-mgm-light text-mgm-dark border border-mgm-olive/20 hover:bg-mgm-dark hover:text-white hover:border-mgm-dark px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Unggah</span>
            <input 
              id={fileInputId}
              type="file" 
              className="hidden" 
              accept={accept} 
              onChange={onChange} 
              disabled={disabled} 
            />
          </label>
        )}
      </div>
    </div>
  );
}
