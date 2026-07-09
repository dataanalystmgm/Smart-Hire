import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Calendar, CheckCircle, Settings, Briefcase, Check, X, ShieldCheck } from 'lucide-react';
import AdminTestsEditor from './AdminTestsEditor';
import AdminJobsManager from '../components/AdminJobsManager';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('applicants');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData('Users');
  }, []);

  const fetchData = async (sheetName: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_data', type: sheetName })
      });
      const d = await res.json();
      
      if (d.status === 'success' && !d.mocked) {
        // Map Keys to make them consistent
        setData(d.data || []);
      } else {
        // Local Storage Fallback if GAS is mocked or not responding
        if (sheetName === 'Users') {
          const storedUsers = localStorage.getItem('mgm_users') 
            ? JSON.parse(localStorage.getItem('mgm_users')!) 
            : [
                { ID: 'u1', Name: 'Budi Santoso', Email: 'budi@example.com', Role: 'applicant', CreatedAt: new Date().toISOString() },
                { ID: 'u2', Name: 'Andi Kusuma', Email: 'andi@example.com', Role: 'applicant', CreatedAt: new Date().toISOString() }
              ];
          setData(storedUsers);
        } else if (sheetName === 'Applications') {
          const storedApps = localStorage.getItem('mgm_applications') 
            ? JSON.parse(localStorage.getItem('mgm_applications')!) 
            : [
                { id: 'a1', userId: 'u1', userName: 'Budi Santoso', jobId: 'ops_spv', jobTitle: 'Operational Supervisor Logistics', status: 'Applied', createdAt: new Date().toISOString() }
              ];
          setData(storedApps);
        } else if (sheetName === 'TestResults') {
          const storedResults = localStorage.getItem('mgm_test_results') 
            ? JSON.parse(localStorage.getItem('mgm_test_results')!) 
            : [
                { userId: 'u1', userName: 'Budi Santoso', testType: 'creplin', score: '88', resume: 'Kandidat menyelesaikan tes Kraepelin dengan tingkat akurasi 88%. Hasil sangat baik.', validated: 'Belum Divalidasi', createdAt: new Date().toISOString() }
              ];
          setData(storedResults);
        } else if (sheetName === 'Interviews') {
          const storedInterviews = localStorage.getItem('mgm_interviews') 
            ? JSON.parse(localStorage.getItem('mgm_interviews')!) 
            : [
                { userId: 'u1', userName: 'Budi Santoso', summary: 'Candidate: Ya saya siap.\nAI: Mengapa Anda tertarik?\nCandidate: Saya berpengalaman 3 tahun.', aiSummary: 'Sikap komunikasi: Percaya diri dan taktis.\nKelebihan: Memahami cold chain logistics.\nRekomendasi: Diterima.', validated: 'Belum Divalidasi', createdAt: new Date().toISOString() }
              ];
          setData(storedInterviews);
        } else if (sheetName === 'Documents') {
          const storedDocs = localStorage.getItem('mgm_documents') 
            ? JSON.parse(localStorage.getItem('mgm_documents')!) 
            : [
                { UserID: 'u1', DocumentType: 'CV', FileName: 'cv_budi.txt', FileUrl: 'http://mock-url/cv_budi.txt', CreatedAt: new Date().toISOString() }
              ];
          setData(storedDocs);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleTabChange = (tab: string, sheetName: string) => {
    setActiveTab(tab);
    if (sheetName) {
      fetchData(sheetName);
    }
  };

  // Approval flow for applications
  const handleApproveApp = async (appId: string, userId: string) => {
    setActionLoading('approve-' + appId);
    // 1. Update localStorage
    const storedApps = localStorage.getItem('mgm_applications') ? JSON.parse(localStorage.getItem('mgm_applications')!) : [];
    const updatedApps = storedApps.map((a: any) => (a.id === appId || (a.userId === userId && a.status === 'Applied')) ? { ...a, status: 'Approved' } : a);
    localStorage.setItem('mgm_applications', JSON.stringify(updatedApps));

    // 2. Sync with GAS Sheet
    try {
      await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_application_status', applicationId: appId, status: 'Approved' })
      });
    } catch (err) {
      console.error("GAS Application status sync failed:", err);
    } finally {
      setActionLoading(null);
    }

    alert('Lamaran berhasil DISETUJUI. Kandidat akan menerima notifikasi dan menu Tes Online telah terbuka.');
    fetchData('Applications');
  };

  const handleRejectApp = async (appId: string, userId: string) => {
    setActionLoading('reject-' + appId);
    // 1. Update localStorage
    const storedApps = localStorage.getItem('mgm_applications') ? JSON.parse(localStorage.getItem('mgm_applications')!) : [];
    const updatedApps = storedApps.map((a: any) => (a.id === appId || (a.userId === userId && a.status === 'Applied')) ? { ...a, status: 'Rejected' } : a);
    localStorage.setItem('mgm_applications', JSON.stringify(updatedApps));

    // 2. Sync with GAS Sheet
    try {
      await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_application_status', applicationId: appId, status: 'Rejected' })
      });
    } catch (err) {
      console.error("GAS Application status sync failed:", err);
    } finally {
      setActionLoading(null);
    }

    alert('Lamaran berhasil DITOLAK. Kandidat akan mendapatkan notifikasi status ini.');
    fetchData('Applications');
  };

  // Validation of test results
  const handleValidateTestResult = async (userId: string, testType: string) => {
    setActionLoading('validate-test-' + userId + '-' + testType);
    // 1. Update local storage fallback
    const storedResults = localStorage.getItem('mgm_test_results') ? JSON.parse(localStorage.getItem('mgm_test_results')!) : [];
    const updatedResults = storedResults.map((r: any) => (r.userId === userId && r.testType === testType) ? { ...r, validated: 'Valid / Disetujui' } : r);
    localStorage.setItem('mgm_test_results', JSON.stringify(updatedResults));

    // 2. Sync with GAS Sheet
    try {
      await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate_test', userId, testType, validated: 'Valid / Disetujui' })
      });
    } catch (err) {
      console.error("GAS validate test sync failed:", err);
    } finally {
      setActionLoading(null);
    }

    alert('Hasil tes berhasil divalidasi oleh admin!');
    fetchData('TestResults');
  };

  // Validation of interview results
  const handleValidateInterviewResult = async (userId: string) => {
    setActionLoading('validate-interview-' + userId);
    // 1. Update local storage fallback
    const storedInterviews = localStorage.getItem('mgm_interviews') ? JSON.parse(localStorage.getItem('mgm_interviews')!) : [];
    const updatedInterviews = storedInterviews.map((i: any) => i.userId === userId ? { ...i, validated: 'Valid / Disetujui' } : i);
    localStorage.setItem('mgm_interviews', JSON.stringify(updatedInterviews));

    // 2. Sync with GAS Sheet
    try {
      await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate_interview', userId, validated: 'Valid / Disetujui' })
      });
    } catch (err) {
      console.error("GAS validate interview sync failed:", err);
    } finally {
      setActionLoading(null);
    }

    alert('Hasil wawancara berhasil divalidasi oleh admin!');
    fetchData('Interviews');
  };

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-mgm-dark tracking-tight flex items-center">
          <Users className="w-8 h-8 mr-3 text-mgm-green" />
          Admin Panel
        </h1>
        <p className="text-slate-500 mt-2">Kelola kandidat, persetujuan lamaran, dokumen, validasi hasil tes & wawancara yang tersinkronisasi.</p>
      </header>

      {/* Clean Themed Tabs */}
      <div className="flex space-x-4 border-b border-slate-200 overflow-x-auto custom-scrollbar">
        <TabButton active={activeTab === 'applicants'} onClick={() => handleTabChange('applicants', 'Users')} icon={<Users className="w-4 h-4 mr-2" />} label="Pelamar" />
        <TabButton active={activeTab === 'applications'} onClick={() => handleTabChange('applications', 'Applications')} icon={<Briefcase className="w-4 h-4 mr-2" />} label="Daftar Lamaran" />
        <TabButton active={activeTab === 'documents'} onClick={() => handleTabChange('documents', 'Documents')} icon={<FileText className="w-4 h-4 mr-2" />} label="Dokumen" />
        <TabButton active={activeTab === 'tests'} onClick={() => handleTabChange('tests', 'TestResults')} icon={<CheckCircle className="w-4 h-4 mr-2" />} label="Hasil Tes" />
        <TabButton active={activeTab === 'interviews'} onClick={() => handleTabChange('interviews', 'Interviews')} icon={<Calendar className="w-4 h-4 mr-2" />} label="Hasil Wawancara" />
        <TabButton active={activeTab === 'manage_jobs'} onClick={() => handleTabChange('manage_jobs', '')} icon={<Briefcase className="w-4 h-4 mr-2" />} label="Manajemen Lowongan" />
        <TabButton active={activeTab === 'manage_tests'} onClick={() => handleTabChange('manage_tests', '')} icon={<Settings className="w-4 h-4 mr-2" />} label="Manajemen Soal" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'manage_tests' ? (
           <div className="p-6">
             <AdminTestsEditor />
           </div>
        ) : activeTab === 'manage_jobs' ? (
           <div className="p-6">
             <AdminJobsManager />
           </div>
        ) : (
          <div className="overflow-x-auto w-full">
            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <div className="w-10 h-10 border-4 border-mgm-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                Memuat data dari Google Sheets / Local Storage...
              </div>
            ) : data.length === 0 ? (
              <div className="p-12 text-center text-slate-500">Belum ada data untuk kategori ini.</div>
            ) : (
              <table className="w-full text-left text-sm">
                {/* ------------------------------------------------------------------ */}
                {/* 1. RENDER APPLICANTS TAB (Users) */}
                {/* ------------------------------------------------------------------ */}
                {activeTab === 'applicants' && (
                  <>
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">ID User</th>
                        <th className="px-6 py-4">Nama Pelamar</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Peran</th>
                        <th className="px-6 py-4">Tanggal Registrasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{row.ID || row.id}</td>
                          <td className="px-6 py-4 font-bold text-mgm-dark">{row.Name || row.name}</td>
                          <td className="px-6 py-4 text-slate-600">{row.Email || row.email}</td>
                          <td className="px-6 py-4">
                            <span className="bg-mgm-light text-mgm-dark font-semibold px-2.5 py-1 text-xs rounded-full border border-slate-200">
                              {row.Role || row.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {row.CreatedAt || row.createdAt ? new Date(row.CreatedAt || row.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* ------------------------------------------------------------------ */}
                {/* 2. RENDER APPLICATIONS TAB (Applications) */}
                {/* ------------------------------------------------------------------ */}
                {activeTab === 'applications' && (
                  <>
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Nama Kandidat</th>
                        <th className="px-6 py-4">Posisi Lowongan</th>
                        <th className="px-6 py-4">Status Lamaran</th>
                        <th className="px-6 py-4">Tanggal Melamar</th>
                        <th className="px-6 py-4 text-center">Aksi / Kontrol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-mgm-dark">{row.userName || row.UserName || 'Kandidat'}</td>
                          <td className="px-6 py-4 text-slate-700 font-medium">{row.jobTitle || row.JobTitle || 'Generalist'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              String(row.status || row.Status).toLowerCase() === 'approved' || String(row.status || row.Status).toLowerCase() === 'disetujui'
                                ? 'bg-green-100 text-green-700' 
                                : String(row.status || row.Status).toLowerCase() === 'rejected' || String(row.status || row.Status).toLowerCase() === 'ditolak'
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {row.status || row.Status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {row.createdAt || row.CreatedAt ? new Date(row.createdAt || row.CreatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {(String(row.status || row.Status).toLowerCase() === 'applied' || String(row.status || row.Status).toLowerCase() === 'pending') ? (
                              <div className="flex justify-center space-x-2">
                                <button 
                                  onClick={() => handleApproveApp(row.id || row.ID, row.userId || row.UserID)}
                                  disabled={!!actionLoading}
                                  className="bg-mgm-green text-white hover:bg-opacity-90 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center shadow-sm"
                                >
                                  {actionLoading === ('approve-' + (row.id || row.ID)) ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                  ) : (
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  Terima
                                </button>
                                <button 
                                  onClick={() => handleRejectApp(row.id || row.ID, row.userId || row.UserID)}
                                  disabled={!!actionLoading}
                                  className="bg-red-500 text-white hover:bg-opacity-90 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center shadow-sm"
                                >
                                  {actionLoading === ('reject-' + (row.id || row.ID)) ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                  ) : (
                                    <X className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Sudah Diproses</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* ------------------------------------------------------------------ */}
                {/* 3. RENDER DOCUMENTS TAB (Documents) */}
                {/* ------------------------------------------------------------------ */}
                {activeTab === 'documents' && (
                  <>
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Tipe Dokumen</th>
                        <th className="px-6 py-4">Nama File</th>
                        <th className="px-6 py-4">Tautan</th>
                        <th className="px-6 py-4">Tanggal Unggah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-4"><span className="bg-slate-100 px-2.5 py-1 text-xs font-bold rounded text-mgm-dark border border-slate-200">{row.DocumentType || row.documentType}</span></td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{row.FileName || row.fileName}</td>
                          <td className="px-6 py-4">
                            <a href={row.FileUrl || row.fileUrl} target="_blank" rel="noreferrer" className="text-mgm-green hover:underline font-bold text-xs flex items-center">
                              Lihat Berkas (Google Drive) &rarr;
                            </a>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {row.CreatedAt || row.createdAt ? new Date(row.CreatedAt || row.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* ------------------------------------------------------------------ */}
                {/* 4. RENDER TESTS TAB (TestResults) */}
                {/* ------------------------------------------------------------------ */}
                {activeTab === 'tests' && (
                  <>
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Nama Pelamar</th>
                        <th className="px-6 py-4">Jenis Tes</th>
                        <th className="px-6 py-4">Skor</th>
                        <th className="px-6 py-4">Evaluasi AI</th>
                        <th className="px-6 py-4">Status Validasi</th>
                        <th className="px-6 py-4 text-center">Aksi Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-mgm-dark">{row.userName || row.UserName || 'Kandidat'}</td>
                          <td className="px-6 py-4 font-semibold text-slate-600 text-xs">{row.testType || row.TestType}</td>
                          <td className="px-6 py-4 font-extrabold text-slate-800 text-sm">{row.score || row.Score}</td>
                          <td className="px-6 py-4 text-xs text-slate-600 max-w-sm whitespace-pre-wrap leading-relaxed">{row.resume || row.Resume}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                              String(row.validated || row.Validated).toLowerCase().includes('valid') 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {row.validated || row.Validated || 'Belum Divalidasi'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {!(String(row.validated || row.Validated).toLowerCase().includes('valid')) ? (
                              <button 
                                onClick={() => handleValidateTestResult(row.userId || row.UserID, row.testType || row.TestType)}
                                disabled={!!actionLoading}
                                className="bg-mgm-dark text-white hover:bg-opacity-90 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center mx-auto shadow-sm"
                              >
                                {actionLoading === ('validate-test-' + (row.userId || row.UserID) + '-' + (row.testType || row.TestType)) ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                )}
                                Validasi
                              </button>
                            ) : (
                              <span className="text-xs text-green-600 font-bold flex items-center justify-center"><Check className="w-4 h-4 mr-0.5" /> Valid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* ------------------------------------------------------------------ */}
                {/* 5. RENDER INTERVIEWS TAB (Interviews) */}
                {/* ------------------------------------------------------------------ */}
                {activeTab === 'interviews' && (
                  <>
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Nama Pelamar</th>
                        <th className="px-6 py-4">Percakapan Asli</th>
                        <th className="px-6 py-4">Summary by AI (Interpretasi)</th>
                        <th className="px-6 py-4">Status Validasi</th>
                        <th className="px-6 py-4 text-center">Aksi Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-mgm-dark">{row.userName || row.UserName || 'Kandidat'}</td>
                          <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate" title={row.summary || row.Summary}>{row.summary || row.Summary}</td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-700 max-w-sm whitespace-pre-wrap leading-relaxed">{row.aiSummary || row['Summary by AI'] || row.SummaryByAI || 'Belum tergenerasi'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                              String(row.validated || row.Validated).toLowerCase().includes('valid') 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {row.validated || row.Validated || 'Belum Divalidasi'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {!(String(row.validated || row.Validated).toLowerCase().includes('valid')) ? (
                              <button 
                                onClick={() => handleValidateInterviewResult(row.userId || row.UserID)}
                                disabled={!!actionLoading}
                                className="bg-mgm-dark text-white hover:bg-opacity-90 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center mx-auto shadow-sm"
                              >
                                {actionLoading === ('validate-interview-' + (row.userId || row.UserID)) ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                )}
                                Validasi
                              </button>
                            ) : (
                              <span className="text-xs text-green-600 font-bold flex items-center justify-center"><Check className="w-4 h-4 mr-0.5" /> Valid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-sm font-bold border-b-2 transition-all shrink-0 ${active ? 'border-mgm-green text-mgm-green' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
    >
      {icon} {label}
    </button>
  );
}
