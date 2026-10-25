import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Trash2, ArrowRight, DollarSign, MapPin, 
  Briefcase, Clock, Building2, Sparkles, CheckCircle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Job, SavedJob, User } from '../types';
import { getJobs, getSavedJobs, toggleSaveJob } from '../data/jobs';

export default function SavedJobs({ user }: { user: User }) {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const allJobs = await getJobs();
    const saved = getSavedJobs(user.userId);
    setJobs(allJobs);
    setSavedJobs(saved);
    setLoading(false);
  };

  const handleRemove = (jobId: string) => {
    toggleSaveJob(user.userId, jobId);
    setSavedJobs(prev => prev.filter(s => s.jobId !== jobId));
  };

  const bookmarkedJobsList = savedJobs.map(s => {
    const job = jobs.find(j => j.id === s.jobId);
    return {
      savedInfo: s,
      job
    };
  }).filter(item => item.job !== undefined) as { savedInfo: SavedJob; job: Job }[];

  return (
    <div className="min-h-screen space-y-8 pb-20 w-full -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
      {/* Banner with Rich Gradient */}
      <div className="bg-gradient-to-br from-[#0c2428] via-[#183e44] via-45% to-[#275961] text-white pt-10 pb-8 px-6 md:px-12 rounded-3xl shadow-2xl relative overflow-hidden border-b-4 border-mgm-green">
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(245,252,170,0.15),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(255,0,92,0.18),transparent_50%)]" />
        <div className="relative z-10 max-w-5xl mx-auto space-y-2">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-mgm-green fill-current" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-mgm-yellow">
              Mercindo Saved Jobs
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black drop-shadow-md">Lowongan Pekerjaan Tersimpan</h1>
          <p className="text-white/80 text-sm font-light">
            Pantau dan tindak lanjuti lowongan yang menarik minat Anda sebelum masa penayangan berakhir.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-2">
          <span>Menampilkan {bookmarkedJobsList.length} lowongan tersimpan</span>
          <Link to="/lowongan" className="text-mgm-dark hover:text-mgm-green font-bold">
            + Cari Lowongan Baru
          </Link>
        </div>

        {bookmarkedJobsList.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FF005C]/10 text-mgm-green flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">Belum Ada Lowongan Tersimpan</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Ketika Anda menemukan lowongan yang sesuai, klik ikon hati untuk menyimpannya di sini agar mudah dilamar nanti.
              </p>
            </div>
            <Link
              to="/lowongan"
              className="inline-flex items-center space-x-2 bg-mgm-dark hover:bg-mgm-green text-white text-xs font-extrabold px-6 py-3.5 rounded-xl transition-all shadow-md"
            >
              <span>Jelajahi Lowongan Kerja Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedJobsList.map(({ savedInfo, job }) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                    <span className="text-mgm-dark font-bold">{job.company || 'PT Mercindo Global Manufaktur'}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {job.location} ({job.workArrangement || 'Hybrid'})
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-mgm-dark hover:text-mgm-green transition-colors">
                    <Link to={`/lowongan?keyword=${encodeURIComponent(job.title)}`}>
                      {job.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="bg-mgm-light text-mgm-dark border border-mgm-green/20 font-semibold px-2.5 py-1 rounded-lg">
                      {job.type}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Disimpan: {new Date(savedInfo.savedAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => handleRemove(job.id)}
                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Hapus dari tersimpan"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => navigate(`/lowongan?apply=${job.id}`)}
                    className="bg-mgm-green hover:bg-[#e00050] text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Lamar Sekarang</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
