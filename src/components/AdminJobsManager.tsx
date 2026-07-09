import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, Plus, Trash, Save, Loader2, CheckCircle, Info, Pencil } from 'lucide-react';
import { Job } from '../types';
import { getJobs, addJob, updateJob } from '../data/jobs';

export default function AdminJobsManager() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Data & Analytics');
  const [location, setLocation] = useState('Jakarta, Indonesia');
  const [type, setType] = useState('Full-time');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const handleStartEdit = (job: Job) => {
    setEditingJobId(job.id);
    setTitle(job.title);
    setDepartment(job.department);
    setLocation(job.location);
    setType(job.type);
    setDescription(job.description);
    setRequirements(job.requirements.length > 0 ? job.requirements : ['']);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setTitle('');
    setDepartment('Data & Analytics');
    setLocation('Jakarta, Indonesia');
    setType('Full-time');
    setDescription('');
    setRequirements(['']);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Nama Posisi dan Deskripsi wajib diisi.');
      return;
    }

    const filteredReqs = requirements.map(r => r.trim()).filter(Boolean);
    if (filteredReqs.length === 0) {
      alert('Harap masukkan minimal satu kriteria persyaratan.');
      return;
    }

    setSubmitting(true);

    if (editingJobId) {
      const updatedJob: Job = {
        id: editingJobId,
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        type: type.trim(),
        description: description.trim(),
        requirements: filteredReqs
      };

      const success = await updateJob(updatedJob);
      if (success) {
        alert('Lowongan pekerjaan berhasil diperbarui dan disinkronkan ke Google Sheets!');
        handleResetForm();
        loadJobs();
      } else {
        alert('Gagal menyinkronkan pembaruan dengan Google Sheets, namun lowongan telah diperbarui di browser lokal Anda.');
        handleResetForm();
        loadJobs();
      }
    } else {
      const newJob: Job = {
        id: Math.random().toString(36).substr(2, 9),
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        type: type.trim(),
        description: description.trim(),
        requirements: filteredReqs
      };

      const success = await addJob(newJob);
      if (success) {
        alert('Lowongan pekerjaan berhasil ditambahkan dan disinkronkan ke Google Sheets!');
        handleResetForm();
        loadJobs();
      } else {
        alert('Gagal menyinkronkan dengan Google Sheets, namun lowongan telah disimpan di browser lokal Anda.');
        handleResetForm();
        loadJobs();
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-mgm-dark">Daftar Lowongan Kerja Aktif</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola lowongan pekerjaan yang tampil pada halaman karir pelamar.</p>
        </div>
        <button 
          onClick={() => {
            if (showAddForm) {
              handleResetForm();
            } else {
              setShowAddForm(true);
            }
          }}
          className="bg-mgm-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-opacity-90 transition-all text-sm shrink-0"
        >
          {showAddForm ? 'Batal' : <><Plus className="w-4 h-4 mr-1.5" /> Tambah Lowongan Baru</>}
        </button>
      </div>

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
                <option value="Remote">Remote / WFH</option>
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
                className="text-xs font-bold text-mgm-green hover:underline flex items-center"
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
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-200"
                    disabled={requirements.length === 1}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button 
              type="button" 
              onClick={handleResetForm}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200/50 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-mgm-dark text-white hover:bg-opacity-90 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-md transition-all"
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
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-mgm-light text-mgm-dark text-xs font-bold uppercase tracking-wider rounded-full">
                  {job.department}
                </span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleStartEdit(job)}
                    className="p-1.5 text-slate-500 hover:text-mgm-green hover:bg-slate-100 rounded-lg transition-colors border border-slate-100 hover:border-slate-200"
                    title="Edit lowongan ini"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <Briefcase className="w-5 h-5 text-mgm-green" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg text-mgm-dark leading-snug">{job.title}</h4>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 mt-2">
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {job.location}</span>
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {job.type}</span>
                </div>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 border-t border-slate-100 pt-3">
                {job.description}
              </p>
              <div className="space-y-1 pt-2">
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
          ))}
        </div>
      )}
    </div>
  );
}
