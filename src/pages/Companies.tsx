import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Search, Star, MapPin, Users, Briefcase, 
  ExternalLink, ShieldCheck, Check, ArrowRight, Heart, Sparkles, X, MessageSquare
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Company } from '../types';
import { getCompanies } from '../data/jobs';

export default function Companies() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const companies = useMemo(() => getCompanies(), []);

  const industries = useMemo(() => {
    const list = Array.from(new Set(companies.map(c => c.industry)));
    return ['All', ...list];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(comp => {
      const matchSearch = 
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchIndustry = selectedIndustry === 'All' || comp.industry === selectedIndustry;
      return matchSearch && matchIndustry;
    });
  }, [companies, searchTerm, selectedIndustry]);

  return (
    <div className="min-h-screen space-y-10 pb-20 w-full -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
      {/* Header Banner with Rich Gradient */}
      <div className="bg-gradient-to-br from-[#0c2428] via-[#183e44] via-45% to-[#275961] text-white pt-12 pb-10 px-6 md:px-12 rounded-3xl shadow-2xl relative overflow-hidden border-b-4 border-mgm-green">
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(245,252,170,0.15),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(255,0,92,0.18),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-mgm-green/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto space-y-4 text-center">
          <span className="px-4 py-1.5 bg-mgm-green text-white text-xs font-extrabold uppercase tracking-widest rounded-full shadow-md inline-block">
            Mercindo Company Explorer
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">
            Jelajahi Profil & Ulasan Perusahaan
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Dapatkan transparansi budaya kerja, tunjangan kesejahteraan, dan penilaian otentik dari karyawan sebelum Anda melamar pekerjaan.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="bg-white rounded-2xl p-2 shadow-2xl flex items-center text-slate-800">
              <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Cari nama perusahaan atau industri..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm font-semibold focus:outline-none bg-transparent placeholder-slate-400 py-2"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-1 text-slate-400 hover:text-slate-600 mr-2">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button 
                className="bg-mgm-green hover:bg-[#e00050] text-white text-xs font-extrabold px-6 py-3 rounded-xl transition-all"
              >
                FIND
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-2">
            Industri:
          </span>
          {industries.map(ind => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                selectedIndustry === ind
                  ? 'bg-mgm-dark text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {ind === 'All' ? 'Semua Industri' : ind}
            </button>
          ))}
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Menampilkan <span className="font-bold text-slate-900">{filteredCompanies.length}</span> Perusahaan
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredCompanies.map(company => (
          <div
            key={company.id}
            className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-extrabold text-mgm-dark group-hover:text-mgm-green transition-colors">
                        {company.name}
                      </h3>
                      {company.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" title="Terverifikasi" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{company.industry}</p>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-xl text-xs font-extrabold shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{company.rating.toFixed(1)}</span>
                  <span className="text-amber-600/70 text-[10px]">({company.reviewCount})</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {company.description}
              </p>

              {/* Meta stats */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{company.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{company.size}</span>
                </div>
              </div>

              {/* Benefits Pills */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Tunjangan Unggulan Karyawan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {company.benefits.map((b, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedCompany(company)}
                className="text-xs font-bold text-slate-700 hover:text-mgm-dark py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Lihat Detail & Ulasan
              </button>

              <button
                onClick={() => navigate(`/lowongan?keyword=${encodeURIComponent(company.name)}`)}
                className="bg-mgm-dark hover:bg-mgm-green text-white text-xs font-extrabold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
              >
                <span>{company.activeJobsCount} Lowongan Aktif</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Company Detail Modal */}
      <AnimatePresence>
        {selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setSelectedCompany(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto border border-slate-200 space-y-6"
            >
              <button
                onClick={() => setSelectedCompany(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-4">
                <img
                  src={selectedCompany.logo}
                  alt={selectedCompany.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-black text-mgm-dark">{selectedCompany.name}</h2>
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{selectedCompany.industry} • {selectedCompany.location}</p>
                </div>
              </div>

              {/* Rating summary */}
              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-900">Skor Kepuasan Karyawan</div>
                  <div className="text-[11px] text-amber-700">Berdasarkan {selectedCompany.reviewCount} ulasan anonim terverifikasi</div>
                </div>
                <div className="text-3xl font-black text-amber-900 flex items-center space-x-1">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  <span>{selectedCompany.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* About */}
              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                  Tentang Perusahaan
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedCompany.description}
                </p>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-3">
                  Tunjangan & Kesejahteraan Karyawan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCompany.benefits.map((b, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setSelectedCompany(null);
                    navigate(`/lowongan?keyword=${encodeURIComponent(selectedCompany.name)}`);
                  }}
                  className="flex-1 bg-mgm-dark hover:bg-mgm-green text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <span>Lihat Semua {selectedCompany.activeJobsCount} Lowongan Dibuka</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
