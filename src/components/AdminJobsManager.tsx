import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  Plus,
  Trash,
  Save,
  Loader2,
  CheckCircle,
  Info,
  Pencil,
  FileText,
  Upload,
  Link as LinkIcon,
  ExternalLink,
  X,
  MessageSquare
} from 'lucide-react';
import { Job } from '../types';
import { getJobs, addJob, updateJob } from '../data/jobs';

export default function AdminJobsManager({
  onOpenInterviewQuestions
}: {
  onOpenInterviewQuestions?: (jobId: string) => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Data & Analytics');
  const [location, setLocation] = useState('Jakarta, Indonesia');
  const [type, setType] = useState('Full-time');
  const [company, setCompany] = useState('PT Mercindo Global Manufaktur');
  const [workArrangement, setWorkArrangement] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>([
    'Fleksibilitas kerja hibrida & lingkungan dinamis',
    'Asuransi kesehatan lengkap & tunjangan kinerja',
    'Jenjang karir profesional terstruktur'
  ]);
  const [requirements, setRequirements] = useState<string[]>(['']);

  // Optional Job Desc Document fields (File or URL)
  const [jobDescInputMode, setJobDescInputMode] = useState<'file' | 'url'>('file');
  const [jobDescUrl, setJobDescUrl] = useState('');
  const [jobDescFileName, setJobDescFileName] = useState('');
  const [jobDescText, setJobDescText] = useState('');
  const [uploadingJobDesc, setUploadingJobDesc] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const handleStartEdit = (job: Job) => {
    setEditingJobId(job.id);
    setTitle(job.title);
    setDepartment(job.department);
    setLocation(job.location);
    setType(job.type);
    setCompany(job.company || 'PT Mercindo Global Manufaktur');
    setWorkArrangement(job.workArrangement || 'Hybrid');
    setDescription(job.description);
    setHighlights(job.highlights && job.highlights.length > 0 ? job.highlights : [
      'Fleksibilitas kerja hibrida & lingkungan dinamis',
      'Asuransi kesehatan lengkap & tunjangan kinerja',
      'Jenjang karir profesional terstruktur'
    ]);
    setRequirements(job.requirements.length > 0 ? job.requirements : ['']);

    // Populate optional Job Desc fields
    setJobDescUrl(job.jobDescUrl || '');
    setJobDescFileName(job.jobDescFileName || '');
    setJobDescText(job.jobDescText || '');
    if (job.jobDescType === 'url' || (job.jobDescUrl && !job.jobDescUrl.startsWith('data:'))) {
      setJobDescInputMode('url');
    } else {
      setJobDescInputMode('file');
    }

    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setTitle('');
    setDepartment('Data & Analytics');
    setLocation('Jakarta, Indonesia');
    setType('Full-time');
    setCompany('PT Mercindo Global Manufaktur');
    setWorkArrangement('Hybrid');
    setDescription('');
    setHighlights([
      'Fleksibilitas kerja hibrida & lingkungan dinamis',
      'Asuransi kesehatan lengkap & tunjangan kinerja',
      'Jenjang karir profesional terstruktur'
    ]);
    setRequirements(['']);
    setJobDescUrl('');
    setJobDescFileName('');
    setJobDescText('');
    setJobDescInputMode('file');
    setEditingJobId(null);
    setShowAddForm(false);
  };

  const loadJobs = async () => {
    setLoading(true);
    const data = await getJobs();
    setJobs(data);
    setLoading(false);
  };

  const handleAddRequirementField = () => {
    setRequirements([...requirements, '']);
  };

  const handleRemoveRequirementField = (index: number) => {
    if (requirements.length === 1) return;
    const updated = [...requirements];
    updated.splice(index, 1);
    setRequirements(updated);
  };

  const handleRequirementChange = (index: number, val: string) => {
    const updated = [...requirements];
    updated[index] = val;
    setRequirements(updated);
  };

  const handleJobDescFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingJobDesc(true);
    setJobDescFileName(file.name);

    try {
      // Read as Data URL (base64) for AI processing & preview
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setJobDescUrl(dataUrl);

      // If text-based file, also extract text content
      if (
        file.type.startsWith('text/') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.csv')
      ) {
        const textContent = await file.text();
        setJobDescText(textContent.slice(0, 20000));
      }

      // Also upload to server /api/upload for logging
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', 'admin');
      formData.append('userName', 'Admin HR');
      formData.append('documentType', 'JobDesc');
      await fetch('/api/upload', {
        method: 'POST',
        body: formData
      }).catch(() => {});
    } catch (err) {
      console.error('Error reading Job Desc file:', err);
    } finally {
      setUploadingJobDesc(false);
    }
  };

  const handleClearJobDesc = () => {
    setJobDescUrl('');
    setJobDescFileName('');
    setJobDescText('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!title || !description) {
      setFeedbackMsg({ type: 'error', text: 'Nama Posisi dan Deskripsi wajib diisi.' });
      return;
    }

    const filteredReqs = requirements.map(r => r.trim()).filter(Boolean);
    if (filteredReqs.length === 0) {
      setFeedbackMsg({ type: 'error', text: 'Harap masukkan minimal satu kriteria persyaratan.' });
      return;
    }

    const filteredHighlights = highlights.map(h => h.trim()).filter(Boolean);
    const trimmedJobDescUrl = jobDescUrl.trim();
    const resolvedFileName =
      jobDescInputMode === 'url' && trimmedJobDescUrl
        ? jobDescFileName.trim() || 'Dokumen Job Desc (URL)'
        : jobDescFileName.trim();

    setSubmitting(true);

    if (editingJobId) {
      const existingJob = jobs.find(j => j.id === editingJobId);
      const updatedJob: Job = {
        ...(existingJob || {}),
        id: editingJobId,
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        type: type.trim(),
        company: company.trim(),
        workArrangement,
        highlights: filteredHighlights,
        description: description.trim(),
        requirements: filteredReqs,
        jobDescUrl: trimmedJobDescUrl || undefined,
        jobDescFileName: trimmedJobDescUrl ? resolvedFileName : undefined,
        jobDescType: trimmedJobDescUrl ? jobDescInputMode : undefined,
        jobDescText: trimmedJobDescUrl ? jobDescText : undefined,
        interviewQuestions: existingJob?.interviewQuestions || [],
        interviewPrompt: existingJob?.interviewPrompt
      };

      await updateJob(updatedJob);
      setFeedbackMsg({
        type: 'success',
        text: 'Lowongan pekerjaan berhasil diperbarui dan disinkronkan!'
      });
      handleResetForm();
      await loadJobs();
    } else {
      const newJob: Job = {
        id: Math.random().toString(36).substr(2, 9),
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        type: type.trim(),
        company: company.trim(),
        workArrangement,
        highlights: filteredHighlights,
        description: description.trim(),
        requirements: filteredReqs,
        jobDescUrl: trimmedJobDescUrl || undefined,
        jobDescFileName: trimmedJobDescUrl ? resolvedFileName : undefined,
        jobDescType: trimmedJobDescUrl ? jobDescInputMode : undefined,
        jobDescText: trimmedJobDescUrl ? jobDescText : undefined,
        interviewQuestions: []
      };

      await addJob(newJob);
      setFeedbackMsg({
        type: 'success',
        text: 'Lowongan pekerjaan baru berhasil ditambahkan dan disinkronkan!'
      });
      handleResetForm();
      await loadJobs();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-mgm-dark">Daftar Lowongan Kerja Aktif</h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola lowongan pekerjaan serta unggah dokumen Job Description (opsional) untuk pembuatan pertanyaan interview AI.
          </p>
        </div>
        <button 
          onClick={() => {
            if (showAddForm) {
              handleResetForm();
            } else {
              setShowAddForm(true);
            }
          }}
          className="bg-mgm-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-opacity-90 transition-all text-sm shrink-0 cursor-pointer"
        >
          {showAddForm ? 'Batal' : <><Plus className="w-4 h-4 mr-1.5" /> Tambah Lowongan Baru</>}
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-current opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5 animate-fade-in">
          <h3 className="font-bold text-mgm-dark text-lg border-b border-slate-200 pb-2">
            {editingJobId ? 'Form Edit Lowongan Kerja' : 'Form Tambah Lowongan Baru'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Nama Posisi / Pekerjaan</label>
              <input 
                type="text" 
                placeholder="Contoh: Logistic Supervisor" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="p-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-mgm-green text-sm font-semibold"
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Departemen / Bidang</label>
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                className="p-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-mgm-green text-sm font-semibold"
              >
                <option value="Data & Analytics">Data & Analytics</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="Operations">Operations</option>
                <option value="Health, Safety & Environment">Health, Safety & Environment</option>
                <option value="Manufacturing & QC">Manufacturing & QC</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Lokasi Penempatan</label>
              <input 
                type="text" 
                placeholder="Contoh: Jakarta, Indonesia atau Remote" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="p-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-mgm-green text-sm font-semibold"
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Tipe Pekerjaan</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="p-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-mgm-green text-sm font-semibold"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Nama Perusahaan / Unit Usaha</label>
              <input 
                type="text" 
                placeholder="Contoh: PT Mercindo Global Manufaktur" 
                value={company} 
                onChange={(e) => setCompany(e.target.value)}
                className="p-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-mgm-green text-sm font-semibold"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Sistem Kerja</label>
              <select 
                value={workArrangement} 
                onChange={(e: any) => setWorkArrangement(e.target.value)}
                className="p-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-mgm-green text-sm font-semibold"
              >
                <option value="Hybrid">Hybrid (Kombinasi WFH & Kantor)</option>
                <option value="Remote">Remote (100% WFH)</option>
                <option value="On-site">On-site (Pabrik / Kantor Penuh)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Deskripsi Pekerjaan</label>
            <textarea 
              rows={4}
              placeholder="Jelaskan peran, tugas, dan tanggung jawab posisi ini..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="p-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-mgm-green text-sm leading-relaxed"
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">Kriteria & Persyaratan (Satu per baris)</label>
              <button 
                type="button" 
                onClick={handleAddRequirementField}
                className="text-xs font-bold text-mgm-green hover:underline flex items-center cursor-pointer"
              >
                <Plus className="w-3 h-3 mr-1" /> Tambah Kriteria
              </button>
            </div>
            
            <div className="space-y-2.5">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    placeholder={`Persyaratan #${i + 1}`} 
                    value={req} 
                    onChange={(e) => handleRequirementChange(i, e.target.value)}
                    className="flex-1 p-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-mgm-green text-xs font-semibold"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveRequirementField(i)}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-200 cursor-pointer"
                    disabled={requirements.length === 1}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* OPTIONAL JOB DESC DOCUMENT UPLOAD (BY FILE OR URL) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-mgm-green" />
                  <span className="text-sm font-extrabold text-mgm-dark">
                    Upload Dokumen Job Description / Job Desc
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Opsional
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Lampirkan dokumen Job Desc melalui upload file atau URL dokumen. Job yang memiliki dokumen Job Desc akan tampil pada submenu <strong>Pertanyaan Interview</strong> untuk dibuatkan pertanyaan berbasis AI.
                </p>
              </div>

              {/* Toggle File vs URL */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 self-start">
                <button
                  type="button"
                  onClick={() => setJobDescInputMode('file')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-all cursor-pointer ${
                    jobDescInputMode === 'file'
                      ? 'bg-white text-mgm-dark shadow-xs'
                      : 'text-slate-600 hover:text-mgm-dark'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setJobDescInputMode('url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-all cursor-pointer ${
                    jobDescInputMode === 'url'
                      ? 'bg-white text-mgm-dark shadow-xs'
                      : 'text-slate-600 hover:text-mgm-dark'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                  Input URL
                </button>
              </div>
            </div>

            {jobDescInputMode === 'file' ? (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-mgm-green rounded-xl p-5 bg-slate-50/60 hover:bg-emerald-50/20 transition-all cursor-pointer">
                  <Upload className="w-6 h-6 text-mgm-green mb-2" />
                  <span className="text-xs font-bold text-mgm-dark">
                    {uploadingJobDesc
                      ? 'Sedang memproses dokumen...'
                      : 'Klik untuk pilih file Dokumen Job Desc (PDF, DOCX, TXT, Gambar)'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Bersifat opsional — maks. 15 MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg"
                    onChange={handleJobDescFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-600">
                    URL Dokumen Job Desc (Google Drive / Google Docs / Link PDF)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/... atau link dokumen Job Desc"
                    value={jobDescUrl.startsWith('data:') ? '' : jobDescUrl}
                    onChange={(e) => {
                      setJobDescUrl(e.target.value);
                      if (!jobDescFileName) {
                        setJobDescFileName('Dokumen Job Desc (URL)');
                      }
                    }}
                    className="p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:border-mgm-green text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-600">
                    Nama / Label Dokumen (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Job Desc HSE Staff.pdf"
                    value={jobDescFileName}
                    onChange={(e) => setJobDescFileName(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:border-mgm-green text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Preview Attached Job Desc */}
            {jobDescUrl && (
              <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 px-4 py-2.5 rounded-xl">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-emerald-900 truncate">
                      {jobDescFileName || 'Dokumen Job Desc Terlampir'}
                    </div>
                    <div className="text-[10px] text-emerald-700 truncate">
                      {jobDescUrl.startsWith('data:')
                        ? 'File Dokumen Terupload (Siap digunakan untuk Generate Pertanyaan Interview)'
                        : jobDescUrl}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearJobDesc}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center ml-3 shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Hapus
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button 
              type="button" 
              onClick={handleResetForm}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-mgm-dark text-white hover:bg-opacity-90 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-md transition-all cursor-pointer"
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4 mr-2" /> Simpan & Sinkronkan</>}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-mgm-green" />
          Memuat daftar lowongan kerja aktif...
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-slate-200 rounded-2xl bg-slate-50 border-dashed">
          <Info className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          Belum ada lowongan pekerjaan aktif. Silakan tambahkan lowongan pertama Anda.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job) => {
            const hasJobDesc = Boolean(job.jobDescUrl || job.jobDescFileName);
            const questionCount = Array.isArray(job.interviewQuestions) ? job.interviewQuestions.length : 0;

            return (
              <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-3 py-1 bg-mgm-light text-mgm-dark text-xs font-bold uppercase tracking-wider rounded-full">
                      {job.department}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleStartEdit(job)}
                        className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-mgm-green hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center cursor-pointer"
                        title="Edit lowongan atau unggah Job Desc"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit / Upload Job Desc
                      </button>
                      <Briefcase className="w-5 h-5 text-mgm-green shrink-0" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-mgm-dark leading-snug">{job.title}</h4>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 mt-2">
                      <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {job.location}</span>
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {job.type}</span>
                    </div>
                  </div>

                  {/* Job Desc & Interview Questions Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {hasJobDesc ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <FileText className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                        Job Desc: {job.jobDescFileName || 'Tersedia'}
                        {job.jobDescUrl && (
                          <a
                            href={job.jobDescUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={job.jobDescUrl.startsWith('data:') ? (job.jobDescFileName || 'Job_Desc') : undefined}
                            className="ml-1.5 text-emerald-700 hover:text-emerald-950 underline inline-flex items-center"
                            title="Buka Dokumen Job Desc"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                        <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        Job Desc: Belum Diupload (Opsional)
                      </span>
                    )}

                    {questionCount > 0 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                        {questionCount} Pertanyaan Interview
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 border-t border-slate-100 pt-3">
                    {job.description}
                  </p>

                  <div className="space-y-1 pt-1">
                    <h5 className="text-xs font-bold text-mgm-dark">Persyaratan:</h5>
                    <ul className="space-y-1">
                      {job.requirements.slice(0, 3).map((req, idx) => (
                        <li key={idx} className="flex items-start text-[11px] text-slate-500">
                          <CheckCircle className="w-3.5 h-3.5 text-mgm-green mr-1.5 shrink-0 mt-0.5" />
                          <span className="truncate">{req}</span>
                        </li>
                      ))}
                      {job.requirements.length > 3 && (
                        <li className="text-[11px] text-mgm-green font-bold pl-5">
                          + {job.requirements.length - 3} persyaratan lainnya
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {hasJobDesc && onOpenInterviewQuestions && (
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onOpenInterviewQuestions(job.id)}
                      className="text-xs font-bold text-mgm-green hover:underline flex items-center cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Kelola Pertanyaan Interview untuk Job Ini
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
