import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  FileText,
  Sparkles,
  Plus,
  Trash,
  Save,
  Loader2,
  CheckCircle,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  X,
  Info
} from 'lucide-react';
import { Job } from '../types';
import { getJobs, updateJob } from '../data/jobs';

export default function AdminInterviewQuestionsManager({
  initialSelectedJobId,
  onNavigateToManageJobs
}: {
  initialSelectedJobId?: string | null;
  onNavigateToManageJobs?: () => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  // Prompt & Questions state for the selected job
  const [adminPrompt, setAdminPrompt] = useState<string>(
    'Buatkan 5 pertanyaan interview terstruktur berbahasa Indonesia yang sesuai dengan dokumen Job Description ini untuk menggali kompetensi teknis, pengalaman kerja relevan, dan penyelesaian masalah kandidat.'
  );
  const [questions, setQuestions] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick attach Job Desc state (in case admin wants to upload/attach Job Desc directly here)
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachTargetJobId, setAttachTargetJobId] = useState<string>('');
  const [attachMode, setAttachMode] = useState<'file' | 'url'>('file');
  const [attachUrl, setAttachUrl] = useState('');
  const [attachFileName, setAttachFileName] = useState('');
  const [attachText, setAttachText] = useState('');
  const [attaching, setAttaching] = useState(false);

  useEffect(() => {
    loadAllJobs();
  }, []);

  const loadAllJobs = async () => {
    setLoading(true);
    const loaded = await getJobs();
    setJobs(loaded);

    const jobsWithDesc = loaded.filter(j => Boolean(j.jobDescUrl || j.jobDescFileName));
    if (initialSelectedJobId && loaded.some(j => j.id === initialSelectedJobId)) {
      handleSelectJob(initialSelectedJobId, loaded);
    } else if (jobsWithDesc.length > 0) {
      handleSelectJob(jobsWithDesc[0].id, loaded);
    } else if (loaded.length > 0) {
      setAttachTargetJobId(loaded[0].id);
    }
    setLoading(false);
  };

  const handleSelectJob = (jobId: string, jobList: Job[] = jobs) => {
    setSelectedJobId(jobId);
    setFeedback(null);
    const found = jobList.find(j => j.id === jobId);
    if (found) {
      setQuestions(Array.isArray(found.interviewQuestions) ? [...found.interviewQuestions] : []);
      setAdminPrompt(
        found.interviewPrompt ||
          `Buatkan 5 pertanyaan interview mendalam berbahasa Indonesia sesuai dokumen Job Desc untuk posisi ${found.title} (${found.department}), mencakup kompetensi teknis, pengalaman kerja, dan studi kasus.`
      );
    }
  };

  const jobsWithJobDesc = jobs.filter(j => Boolean(j.jobDescUrl || j.jobDescFileName));
  const jobsWithoutJobDesc = jobs.filter(j => !j.jobDescUrl && !j.jobDescFileName);
  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

  const handleGenerateQuestionsWithAI = async () => {
    if (!selectedJob) return;
    if (!adminPrompt.trim()) {
      setFeedback({ type: 'error', text: 'Silakan isi prompt instruksi pembuatan pertanyaan terlebih dahulu.' });
      return;
    }

    setGenerating(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/ai/generate-interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: selectedJob.title,
          department: selectedJob.department,
          description: selectedJob.description,
          requirements: selectedJob.requirements,
          responsibilities: selectedJob.responsibilities,
          jobDescUrl: selectedJob.jobDescUrl,
          jobDescFileName: selectedJob.jobDescFileName,
          jobDescText: selectedJob.jobDescText,
          adminPrompt: adminPrompt.trim()
        })
      });

      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        // Auto-save generated questions to the job so they are ready immediately
        const updatedJob: Job = {
          ...selectedJob,
          interviewQuestions: data.questions,
          interviewPrompt: adminPrompt.trim()
        };
        await updateJob(updatedJob);
        setJobs(prev => prev.map(j => (j.id === updatedJob.id ? updatedJob : j)));
        setFeedback({
          type: 'success',
          text: `Berhasil membuat dan menyimpan ${data.questions.length} pertanyaan interview sesuai Job Desc untuk posisi ${selectedJob.title}!`
        });
      } else {
        setFeedback({ type: 'error', text: 'Gagal men-generate pertanyaan interview dari AI.' });
      }
    } catch (err) {
      console.error('Error generating interview questions:', err);
      setFeedback({ type: 'error', text: 'Terjadi kesalahan saat menghubungi server AI.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (!selectedJob) return;
    const cleaned = questions.map(q => q.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      setFeedback({ type: 'error', text: 'Harap tambahkan minimal 1 pertanyaan interview sebelum menyimpan.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const updatedJob: Job = {
        ...selectedJob,
        interviewQuestions: cleaned,
        interviewPrompt: adminPrompt.trim()
      };
      await updateJob(updatedJob);
      setQuestions(cleaned);
      setJobs(prev => prev.map(j => (j.id === updatedJob.id ? updatedJob : j)));
      setFeedback({
        type: 'success',
        text: `Daftar ${cleaned.length} pertanyaan interview untuk posisi ${selectedJob.title} berhasil disimpan! Pelamar pada posisi ini akan menjawab pertanyaan tersebut pada sesi Wawancara 1 Arah.`
      });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Gagal menyimpan daftar pertanyaan interview.' });
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const handleAddManualQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setQuestions(updated);
  };

  const handleAttachFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachFileName(file.name);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setAttachUrl(dataUrl);
    if (
      file.type.startsWith('text/') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.csv')
    ) {
      const txt = await file.text();
      setAttachText(txt.slice(0, 20000));
    }
  };

  const handleSaveAttachedJobDesc = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetJob = jobs.find(j => j.id === attachTargetJobId);
    if (!targetJob || !attachUrl.trim()) return;

    setAttaching(true);
    try {
      const updatedJob: Job = {
        ...targetJob,
        jobDescUrl: attachUrl.trim(),
        jobDescFileName:
          attachMode === 'url'
            ? attachFileName.trim() || 'Dokumen Job Desc (URL)'
            : attachFileName.trim() || 'Dokumen Job Desc',
        jobDescType: attachMode,
        jobDescText: attachText || undefined
      };
      await updateJob(updatedJob);
      const refreshed = await getJobs();
      setJobs(refreshed);
      handleSelectJob(updatedJob.id, refreshed);
      setShowAttachModal(false);
      setAttachUrl('');
      setAttachFileName('');
      setAttachText('');
      setFeedback({
        type: 'success',
        text: `Dokumen Job Desc berhasil dilampirkan pada lowongan ${updatedJob.title}! Silakan berikan prompt untuk membuat pertanyaan interview.`
      });
    } finally {
      setAttaching(false);
    }
  };

  if (loading) {
    return (
      <div className="p-14 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-mgm-green" />
        Memuat daftar lowongan dengan dokumen Job Description...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-mgm-green" />
            <h2 className="text-xl font-extrabold text-mgm-dark">
              Manajemen Pertanyaan Interview Berdasarkan Job Desc
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pilih lowongan yang dibuka dan sudah memiliki dokumen Job Desc, lalu berikan prompt AI untuk menyusun pertanyaan wawancara 1 arah bagi pelamar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setAttachTargetJobId(selectedJob?.id || jobsWithoutJobDesc[0]?.id || jobs[0]?.id || '');
              setShowAttachModal(true);
            }}
            className="bg-mgm-light text-mgm-dark hover:bg-emerald-100 border border-mgm-green/30 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-mgm-green" />
            Upload / Perbarui Job Desc Lowongan
          </button>
          {onNavigateToManageJobs && (
            <button
              type="button"
              onClick={onNavigateToManageJobs}
              className="bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center transition-all cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Ke Manajemen Lowongan
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="ml-3 opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODAL ATTACH JOB DESC FOR ANY OPEN JOB */}
      {showAttachModal && (
        <form
          onSubmit={handleSaveAttachedJobDesc}
          className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-mgm-dark flex items-center">
              <FileText className="w-4 h-4 mr-2 text-mgm-green" />
              Upload Dokumen Job Desc (File atau URL) pada Lowongan yang Dibuka
            </h3>
            <button
              type="button"
              onClick={() => setShowAttachModal(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pilih Job yang Dibuka</label>
              <select
                value={attachTargetJobId}
                onChange={(e) => setAttachTargetJobId(e.target.value)}
                className="p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-mgm-dark outline-none focus:border-mgm-green"
                required
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department}) {j.jobDescUrl || j.jobDescFileName ? '— [Sudah Ada Job Desc]' : '— [Belum Ada Job Desc]'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Metode Upload Job Desc</label>
              <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAttachMode('file')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                    attachMode === 'file' ? 'bg-mgm-dark text-white' : 'text-slate-600'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setAttachMode('url')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                    attachMode === 'url' ? 'bg-mgm-dark text-white' : 'text-slate-600'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                  Input URL
                </button>
              </div>
            </div>
          </div>

          {attachMode === 'file' ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-mgm-green rounded-xl p-5 bg-white cursor-pointer transition-all">
              <Upload className="w-6 h-6 text-mgm-green mb-1.5" />
              <span className="text-xs font-bold text-mgm-dark">
                {attachFileName ? `File Terpilih: ${attachFileName}` : 'Klik untuk memilih file Dokumen Job Desc (PDF, DOCX, TXT, Gambar)'}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg"
                onChange={handleAttachFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex flex-col space-y-1">
                <label className="text-xs font-bold text-slate-600">URL Dokumen Job Desc</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/... atau URL dokumen"
                  value={attachUrl.startsWith('data:') ? '' : attachUrl}
                  onChange={(e) => {
                    setAttachUrl(e.target.value);
                    if (!attachFileName) setAttachFileName('Dokumen Job Desc (URL)');
                  }}
                  className="p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold outline-none focus:border-mgm-green"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-slate-600">Nama Dokumen</label>
                <input
                  type="text"
                  placeholder="Job Desc Posisi.pdf"
                  value={attachFileName}
                  onChange={(e) => setAttachFileName(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold outline-none focus:border-mgm-green"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAttachModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200/60 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={attaching || !attachUrl.trim()}
              className="bg-mgm-green text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center shadow-xs hover:bg-opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {attaching ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Simpan Dokumen Job Desc
            </button>
          </div>
        </form>
      )}

      {/* MAIN CONTENT: LEFT LIST OF JOBS WITH UPLOADED JOB DESC, RIGHT PROMPT & QUESTIONS EDITOR */}
      {jobsWithJobDesc.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-mgm-green shadow-xs">
            <FileText className="w-7 h-7" />
          </div>
          <div className="max-w-lg mx-auto space-y-1.5">
            <h3 className="text-base font-extrabold text-mgm-dark">
              Belum Ada Lowongan yang Diupload Dokumen Job Desc-nya
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submenu ini menampilkan daftar lowongan kerja yang dibuka yang sudah diunggah dokumen Job Description-nya (melalui file atau URL). Silakan unggah dokumen Job Desc pada lowongan baru atau lowongan yang sudah dibuka.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setAttachTargetJobId(jobs[0]?.id || '');
                setShowAttachModal(true);
              }}
              className="bg-mgm-green text-white px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center shadow-sm hover:bg-opacity-90 cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Upload Dokumen Job Desc Sekarang
            </button>
            {onNavigateToManageJobs && (
              <button
                type="button"
                onClick={onNavigateToManageJobs}
                className="bg-white text-mgm-dark border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center hover:bg-slate-100 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 mr-1.5" />
                Tambah Lowongan Baru dengan Job Desc
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR: LIST OF OPEN JOBS WITH UPLOADED JOB DESC */}
          <div className="lg:col-span-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 px-1">
              <span className="text-xs font-extrabold text-mgm-dark uppercase tracking-wider flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-1.5 text-mgm-green" />
                Job dengan Dokumen Job Desc ({jobsWithJobDesc.length})
              </span>
            </div>

            <div className="flex flex-col space-y-2 max-h-[540px] overflow-y-auto pr-1 custom-scrollbar">
              {jobsWithJobDesc.map(job => {
                const isSelected = selectedJob?.id === job.id;
                const qCount = Array.isArray(job.interviewQuestions) ? job.interviewQuestions.length : 0;

                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleSelectJob(job.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-mgm-dark text-white border-mgm-dark shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-mgm-green/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm leading-snug truncate">
                          {job.title}
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 truncate ${
                            isSelected ? 'text-white/75' : 'text-slate-500'
                          }`}
                        >
                          {job.department} • {job.location}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                          isSelected
                            ? 'bg-mgm-green text-white'
                            : qCount > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {qCount > 0 ? `${qCount} Soal` : 'Belum Ada Soal'}
                      </span>
                    </div>

                    <div
                      className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
                        isSelected ? 'border-white/15 text-mgm-yellow' : 'border-slate-100 text-emerald-700'
                      }`}
                    >
                      <span className="flex items-center truncate font-semibold">
                        <FileText className="w-3 h-3 mr-1 shrink-0" />
                        <span className="truncate">{job.jobDescFileName || 'Dokumen Job Desc'}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {jobsWithoutJobDesc.length > 0 && (
              <div className="pt-3 border-t border-slate-200/80 px-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <span>{jobsWithoutJobDesc.length} lowongan lain belum memiliki Job Desc</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachTargetJobId(jobsWithoutJobDesc[0].id);
                    setShowAttachModal(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-mgm-green text-xs font-bold text-mgm-dark hover:text-mgm-green bg-white transition-all flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Upload Job Desc ke Lowongan Lain
                </button>
              </div>
            )}
          </div>

          {/* RIGHT AREA: SELECTED JOB DESC & AI PROMPT GENERATOR + QUESTION LIST */}
          <div className="lg:col-span-8 space-y-6">
            {selectedJob ? (
              <>
                {/* SELECTED JOB & JOB DESC SUMMARY CARD */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-mgm-light text-mgm-dark">
                        {selectedJob.department}
                      </span>
                      <h3 className="text-lg font-extrabold text-mgm-dark mt-1">
                        {selectedJob.title}
                      </h3>
                    </div>

                    {selectedJob.jobDescUrl && (
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={selectedJob.jobDescUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={
                            selectedJob.jobDescUrl.startsWith('data:')
                              ? selectedJob.jobDescFileName || 'Job_Desc'
                              : undefined
                          }
                          className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" />
                          Lihat Dokumen Job Desc ({selectedJob.jobDescFileName || 'Dokumen'})
                          <ExternalLink className="w-3 h-3 ml-1.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedJob.description}
                  </p>

                  {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedJob.requirements.map((req, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg font-medium"
                        >
                          • {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI PROMPT TO CREATE QUESTIONS BASED ON JOB DESC */}
                <div className="bg-gradient-to-br from-mgm-dark to-[#203f44] text-white p-6 rounded-2xl shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-mgm-yellow" />
                      <h4 className="font-extrabold text-base">
                        Prompt AI untuk Membuat Pertanyaan Interview (Sesuai Job Desc)
                      </h4>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/15 text-mgm-yellow font-bold">
                      Wawancara 1 Arah
                    </span>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed">
                    Berikan instruksi atau prompt kepada AI untuk men-generate pertanyaan interview berdasarkan dokumen Job Desc <strong>{selectedJob.title}</strong>. Pertanyaan yang dihasilkan akan tampil kepada pelamar pada sesi Wawancara 1 Arah.
                  </p>

                  {/* Quick Prompt Templates */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      `Buatkan 5 pertanyaan interview teknis & studi kasus sesuai Job Desc ${selectedJob.title}`,
                      `Buatkan 7 pertanyaan untuk menguji pengalaman kerja, hard skill, dan problem solving sesuai Job Desc`,
                      `Buatkan 5 pertanyaan metode STAR (Situation, Task, Action, Result) berdasarkan tanggung jawab di Job Desc`
                    ].map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAdminPrompt(tpl)}
                        className="text-[11px] bg-white/10 hover:bg-white/20 text-white/90 border border-white/15 px-3 py-1 rounded-full transition-all cursor-pointer"
                      >
                        + {tpl}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={adminPrompt}
                    onChange={(e) => setAdminPrompt(e.target.value)}
                    placeholder="Ketik prompt Anda di sini... Contoh: Buatkan 5 pertanyaan interview teknis dan situasional berdasarkan dokumen Job Desc ini..."
                    className="w-full p-3.5 rounded-xl bg-white/95 text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mgm-yellow"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleGenerateQuestionsWithAI}
                      disabled={generating}
                      className="bg-mgm-green hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md flex items-center transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menganalisis Job Desc & Membuat Pertanyaan...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Create Pertanyaan sesuai Job Desc (AI)
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* EDITABLE LIST OF INTERVIEW QUESTIONS FOR THIS JOB */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-mgm-dark">
                        Daftar Pertanyaan Interview ({questions.length} Pertanyaan)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pelamar untuk posisi <strong>{selectedJob.title}</strong> akan mendapatkan instruksi untuk berbicara dan menjawab daftar pertanyaan ini secara berurutan (1 arah).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddManualQuestion}
                      className="text-xs font-bold text-mgm-green hover:underline flex items-center shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Tambah Pertanyaan Manual
                    </button>
                  </div>

                  {questions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-2">
                      <Info className="w-6 h-6 mx-auto text-slate-400" />
                      <p className="font-bold text-slate-700">
                        Belum ada pertanyaan interview untuk posisi {selectedJob.title}.
                      </p>
                      <p>
                        Klik tombol <strong>"Create Pertanyaan sesuai Job Desc (AI)"</strong> di atas atau tambahkan pertanyaan secara manual.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200"
                        >
                          <div className="w-7 h-7 rounded-lg bg-mgm-dark text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-1">
                            {idx + 1}
                          </div>
                          <textarea
                            rows={2}
                            value={q}
                            onChange={(e) => handleQuestionChange(idx, e.target.value)}
                            placeholder={`Tulis pertanyaan interview ke-${idx + 1}...`}
                            className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-mgm-green resize-y"
                          />
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 text-slate-400 hover:text-mgm-dark hover:bg-white rounded border border-transparent hover:border-slate-200 disabled:opacity-30 cursor-pointer"
                              title="Geser naik"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(idx, 'down')}
                              disabled={idx === questions.length - 1}
                              className="p-1.5 text-slate-400 hover:text-mgm-dark hover:bg-white rounded border border-transparent hover:border-slate-200 disabled:opacity-30 cursor-pointer"
                              title="Geser turun"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 cursor-pointer"
                              title="Hapus pertanyaan"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSaveQuestions}
                      disabled={saving || questions.length === 0}
                      className="bg-mgm-dark hover:bg-opacity-90 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Simpan Pertanyaan Interview ({selectedJob.title})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
