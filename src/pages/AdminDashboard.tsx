import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Calendar, CheckCircle, Settings, Briefcase, Check, X, ShieldCheck } from 'lucide-react';
import AdminTestsEditor from './AdminTestsEditor';
import AdminJobsManager from '../components/AdminJobsManager';
import { getJobs } from '../data/jobs';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('applicants');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [analyzingCVs, setAnalyzingCVs] = useState<Record<string, boolean>>({});


  useEffect(() => {
    fetchData('Users');
  }, []);


//useEffect(() => {
//    const analyzePendingCVs = async () => {
//      if (activeTab !== 'applications' || data.length === 0) return;
//
//      const jobs = await getJobs();
//      
//      let docs = [];
//      try {
//        const resDocs = await fetch('/api/gas/proxy', {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/json' },
//          body: JSON.stringify({ action: 'get_data', type: 'Documents' })
//        });
//        const dDocs = await resDocs.json();
//        if (dDocs.status === 'success' && !dDocs.mocked) {
//          docs = dDocs.data || [];
//        } else {
//          docs = localStorage.getItem('mgm_documents') ? JSON.parse(localStorage.getItem('mgm_documents')!) : [];
//        }
//      } catch (e) {
//        docs = localStorage.getItem('mgm_documents') ? JSON.parse(localStorage.getItem('mgm_documents')!) : [];
//      }
//
//      const updatedApps = [...data];
//      let hasUpdates = false;
//
//      for (let i = 0; i < updatedApps.length; i++) {
//        const app = updatedApps[i];
//        
//        // Only analyze if status is Applied or Pending
//        const status = String(app.status || app.Status || '').toLowerCase();
//        const isPending = status === 'applied' || status === 'pending';
//        
//        if (isPending && !app.cvScore && !analyzingCVs[app.id || app.ID]) {
//          const jobId = app.jobId || app.JobId;
//          const userId = app.userId || app.UserID;
//          const job = jobs.find((j: any) => String(j.id) === String(jobId) || j.title === (app.jobTitle || app.JobTitle));
//          
//          const cvDoc = docs.find((d: any) => (String(d.UserID) === String(userId) || String(d.userId) === String(userId)) && (d.DocumentType === 'CV' || d.documentType === 'CV'));
//          
//          if (job && cvDoc && (cvDoc.FileUrl || cvDoc.fileUrl)) {
//            setAnalyzingCVs(prev => ({ ...prev, [app.id || app.ID]: true }));
//            
//            try {
//              const res = await fetch('/api/ai/screen', {
//                method: 'POST',
//                headers: { 'Content-Type': 'application/json' },
//                body: JSON.stringify({
//                  resumeUrl: cvDoc.FileUrl || cvDoc.fileUrl,
//                  jobDescription: job.description + "\nPersyaratan: " + job.requirements.join(", ")
//                })
//              });
//              
//              const resData = await res.json();
//              if (resData.result) {
//                app.cvScore = resData.result.score;
//                app.cvSuggestion = resData.result.suggestion;
//                hasUpdates = true;
//                
//                // Update local storage
//                const storedApps = localStorage.getItem('mgm_applications') ? JSON.parse(localStorage.getItem('mgm_applications')!) : [];
//                const updatedStored = storedApps.map((a: any) => (a.id === (app.id || app.ID)) ? { ...a, cvScore: app.cvScore, cvSuggestion: app.cvSuggestion } : a);
//                localStorage.setItem('mgm_applications', JSON.stringify(updatedStored));
//                
//                // Try sync to GAS sheet
//                try {
//                  await fetch('/api/gas/proxy', {
//                    method: 'POST',
//                    headers: { 'Content-Type': 'application/json' },
//                    body: JSON.stringify({
//                      action: 'update_application_cv_score',
//                      applicationId: app.id || app.ID,
//                      cvScore: app.cvScore,
//                      cvSuggestion: app.cvSuggestion
//                    })
//                  });
//                } catch (e) {
//                  console.error("Failed to sync CV Score to GAS", e);
//                }
//              }
//            } catch (err) {
//              console.error("Failed to analyze CV for app", app.id || app.ID, err);
//            } finally {
//              setAnalyzingCVs(prev => ({ ...prev, [app.id || app.ID]: false }));
//            }
//          } else if (job && !cvDoc) {
//             const localCVText = localStorage.getItem('mgm_user_cv');
//             if (localCVText) {
//                setAnalyzingCVs(prev => ({ ...prev, [app.id || app.ID]: true }));
//                try {
//                  const res = await fetch('/api/ai/screen', {
//                    method: 'POST',
//                    headers: { 'Content-Type': 'application/json' },
//                    body: JSON.stringify({
//                      resumeText: localCVText,
//                      jobDescription: job.description + "\nPersyaratan: " + job.requirements.join(", ")
//                    })
//                  });
//                  const resData = await res.json();
//                  if (resData.result) {
//                    app.cvScore = resData.result.score;
//                    app.cvSuggestion = resData.result.suggestion;
//                    hasUpdates = true;
//                    // Update local storage
//                    const storedApps = localStorage.getItem('mgm_applications') ? JSON.parse(localStorage.getItem('mgm_applications')!) : [];
//                    const updatedStored = storedApps.map((a: any) => (a.id === (app.id || app.ID)) ? { ...a, cvScore: app.cvScore, cvSuggestion: app.cvSuggestion } : a);
//                    localStorage.setItem('mgm_applications', JSON.stringify(updatedStored));
//
//                    // Try sync to GAS sheet
//                    try {
//                      await fetch('/api/gas/proxy', {
//                        method: 'POST',
//                        headers: { 'Content-Type': 'application/json' },
//                        body: JSON.stringify({
//                          action: 'update_application_cv_score',
//                          applicationId: app.id || app.ID,
//                          cvScore: app.cvScore,
//                          cvSuggestion: app.cvSuggestion
//                        })
//                      });
//                    } catch (e) {
//                      console.error("Failed to sync CV Score to GAS", e);
//                    }
//                  }
//                } catch (e) {
//                } finally {
//                  setAnalyzingCVs(prev => ({ ...prev, [app.id || app.ID]: false }));
//                }
//             }
//          }
//        }
//      }
//
//      if (hasUpdates) {
//        setData([...updatedApps]);
//      }
//    };
//
//    analyzePendingCVs();
//  }, [data, activeTab]);

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

  
  const handleRefreshCVAnalysis = async (row: any) => {
    setAnalyzingCVs(prev => ({ ...prev, [row.id || row.ID]: true }));
    try {
      const jobs = await getJobs();
      const jobId = row.jobId || row.JobId;
      const userId = row.userId || row.UserID;
      const job = jobs.find((j: any) => String(j.id) === String(jobId) || j.title === (row.jobTitle || row.JobTitle));
      
      let docs = [];
      try {
        const resDocs = await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_data', type: 'Documents' })
        });
        const dDocs = await resDocs.json();
        if (dDocs.status === 'success' && !dDocs.mocked) docs = dDocs.data || [];
        else docs = localStorage.getItem('mgm_documents') ? JSON.parse(localStorage.getItem('mgm_documents')!) : [];
      } catch (e) {
        docs = localStorage.getItem('mgm_documents') ? JSON.parse(localStorage.getItem('mgm_documents')!) : [];
      }
      
      const cvDoc = docs.find((d: any) => (String(d.UserID) === String(userId) || String(d.userId) === String(userId)) && (d.DocumentType === 'CV' || d.documentType === 'CV'));
      
      if (!job) throw new Error("Lowongan tidak ditemukan");
      if (!cvDoc) throw new Error("Dokumen CV tidak ditemukan");
      
      const fileUrl = cvDoc.FileUrl || cvDoc.fileUrl;
      if (!fileUrl) throw new Error("URL CV tidak valid");

      // Fetch base64 from GAS
      const proxyRes = await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_file_base64', fileUrl })
      });
      const proxyData = await proxyRes.json();
      
      let res;
      if (proxyData.status === 'success' && proxyData.base64) {
        res = await fetch('/api/ai/analyze-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: proxyData.base64,
            mimeType: proxyData.mimeType,
            jobDescription: job.description + "\nPersyaratan: " + (job.requirements ? job.requirements.join(", ") : '')
          })
        });
      } else {
        // Fallback to text screen if we couldn't get base64
        res = await fetch('/api/ai/screen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeUrl: fileUrl,
            jobDescription: job.description + "\nPersyaratan: " + (job.requirements ? job.requirements.join(", ") : '')
          })
        });
      }
      
      const resData = await res.json();
      if (resData.result) {
        // Save to GAS
        const aiAnalysis = `Skor: ${resData.result.score}%\n${resData.result.suggestion}`;
        
        try {
          await fetch('/api/gas/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_application_cv_analysis',
              applicationId: row.id || row.ID,
              aiAnalysis: aiAnalysis
            })
          });
        } catch (e) {}

        // Save local
        const storedApps = localStorage.getItem('mgm_applications') ? JSON.parse(localStorage.getItem('mgm_applications')!) : [];
        const updatedStored = storedApps.map((a: any) => (a.id === (row.id || row.ID)) ? { ...a, aiAnalysis: aiAnalysis, 'AI Analysis': aiAnalysis } : a);
        localStorage.setItem('mgm_applications', JSON.stringify(updatedStored));
        
        alert('Analisis CV selesai!');
        fetchData('Applications');
      } else {
        throw new Error("Gagal mendapatkan hasil dari AI");
      }
    } catch (err: any) {
      alert("Gagal menganalisis CV: " + err.message);
    } finally {
      setAnalyzingCVs(prev => ({ ...prev, [row.id || row.ID]: false }));
    }
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

  
  const handleRefreshAITest = async (row: any) => {
    setActionLoading('refresh-test-' + (row.userId || row.UserID) + '-' + (row.testType || row.TestType));
    try {
      let answersObj = row.answers || row.Answers;
      if (typeof answersObj === 'string') {
        try { answersObj = JSON.parse(answersObj); } catch(e) {}
      }
      
      const res = await fetch('/api/ai/evaluate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: row.testType || row.TestType, answers: answersObj })
      });
      const result = await res.json();
      
      // Update local storage
      const storedResults = localStorage.getItem('mgm_test_results') ? JSON.parse(localStorage.getItem('mgm_test_results')!) : [];
      const updatedResults = storedResults.map((r: any) => 
        (String(r.userId) === String(row.userId || row.UserID) && String(r.testType) === String(row.testType || row.TestType)) 
          ? { ...r, resume: result.result } 
          : r
      );
      localStorage.setItem('mgm_test_results', JSON.stringify(updatedResults));

      // Try sync to GAS sheet
      try {
        await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_test_evaluation',
            userId: row.userId || row.UserID,
            testType: row.testType || row.TestType,
            resume: result.result
          })
        });
      } catch (e) {
        console.error("Failed to sync test evaluation to GAS", e);
      }
      
      alert('Analisis AI berhasil diperbarui!');
      fetchData('TestResults');
    } catch(err) {
      alert('Gagal merefresh analisis AI.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshAIInterview = async (row: any) => {
    setActionLoading('refresh-interview-' + (row.userId || row.UserID));
    try {
      const conversation = row.summary || row.Summary || '';
      const res = await fetch('/api/ai/interpret-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation })
      });
      const result = await res.json();
      
      // Update local storage
      const storedInterviews = localStorage.getItem('mgm_interviews') ? JSON.parse(localStorage.getItem('mgm_interviews')!) : [];
      const updatedInterviews = storedInterviews.map((i: any) => 
        String(i.userId) === String(row.userId || row.UserID) 
          ? { ...i, aiSummary: result.result } 
          : i
      );
      localStorage.setItem('mgm_interviews', JSON.stringify(updatedInterviews));

      // Try sync to GAS sheet
      try {
        await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_interview_summary',
            userId: row.userId || row.UserID,
            aiSummary: result.result
          })
        });
      } catch (e) {
        console.error("Failed to sync interview summary to GAS", e);
      }
      
      alert('Interpretasi AI berhasil diperbarui!');
      fetchData('Interviews');
    } catch(err) {
      alert('Gagal merefresh interpretasi AI.');
    } finally {
      setActionLoading(null);
    }
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


  const sortedApplications = [...data].sort((a, b) => {
    const scoreA = parseFloat(a.cvScore || a.CVScore) || 0;
    const scoreB = parseFloat(b.cvScore || b.CVScore) || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    const dateA = new Date(a.createdAt || a.CreatedAt || 0).getTime();
    const dateB = new Date(b.createdAt || b.CreatedAt || 0).getTime();
    return dateB - dateA;
  });

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
                        <tr key={i}
 className="hover:bg-slate-50">
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
                        <th className="px-6 py-4">AI Kesesuaian CV</th>
                        <th className="px-6 py-4">Status Lamaran</th>
                        <th className="px-6 py-4">Tanggal Melamar</th>
                        <th className="px-6 py-4 text-center">Aksi / Kontrol</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {sortedApplications.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-mgm-dark">{row.userName || row.UserName || 'Kandidat'}</td>
                          <td className="px-6 py-4 text-slate-700 font-medium">{row.jobTitle || row.JobTitle || 'Generalist'}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              {analyzingCVs[row.id || row.ID] ? (
                                <div className="flex items-center text-xs text-slate-500">
                                  <div className="w-3.5 h-3.5 border-2 border-mgm-green border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Menganalisis...
                                </div>
                              ) : (row.aiAnalysis || row['AI Analysis']) ? (
                                <>
                                  <div className="text-xs text-slate-600 max-w-[250px] leading-relaxed whitespace-pre-wrap">
                                    {row.aiAnalysis || row['AI Analysis']}
                                  </div>
                                  <button
                                    onClick={() => handleRefreshCVAnalysis(row)}
                                    className="mt-2 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded font-bold flex items-center w-max"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Refresh AI
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="text-xs text-slate-400 italic mb-2">Belum dianalisis</span>
                                  {String(row.status || row.Status).toLowerCase() === 'applied' || String(row.status || row.Status).toLowerCase() === 'pending' ? (
                                    <button
                                      onClick={() => handleRefreshCVAnalysis(row)}
                                      className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded font-bold flex items-center w-max"
                                    >
                                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                      Analisis CV
                                    </button>
                                  ) : null}
                                </>
                              )}
                            </div>
                          </td>

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
                          <td className="px-6 py-4 text-xs text-slate-600 max-w-sm whitespace-pre-wrap leading-relaxed">
                            <div className="font-bold mb-1 text-mgm-dark">Interpretasi AI:</div>
                            {row.resume || row.Resume}
                            {String(row.resume || row.Resume || '').toLowerCase().includes('limit api') || String(row.resume || row.Resume || '').toLowerCase().includes('batas limit ai') ? (
                              <button
                                onClick={() => handleRefreshAITest(row)}
                                disabled={!!actionLoading}
                                className="mt-2 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded font-bold flex items-center"
                              >
                                {actionLoading === ('refresh-test-' + (row.userId || row.UserID) + '-' + (row.testType || row.TestType)) ? (
                                  <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mr-1"></div>
                                ) : (
                                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                )}
                                Refresh AI
                              </button>
                            ) : null}
                            {row.answers && (
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="font-bold mb-2 text-mgm-dark">Detail Jawaban:</div>
                                <div className="bg-slate-100 p-3 rounded-lg max-h-40 overflow-y-auto custom-scrollbar text-xs font-mono">
                                  {typeof row.answers === 'string' ? row.answers : JSON.stringify(row.answers, null, 2)}
                                </div>
                              </div>
                            )}
                          </td>
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
                          <td className="px-6 py-4 text-xs font-medium text-slate-700 max-w-sm whitespace-pre-wrap leading-relaxed">
                            {row.aiSummary || row['Summary by AI'] || row.SummaryByAI || 'Belum tergenerasi'}
                            {String(row.aiSummary || row['Summary by AI'] || row.SummaryByAI || '').toLowerCase().includes('limit api') || String(row.aiSummary || row['Summary by AI'] || row.SummaryByAI || '').toLowerCase().includes('batas limit') || !(row.aiSummary || row['Summary by AI'] || row.SummaryByAI) ? (
                              <button
                                onClick={() => handleRefreshAIInterview(row)}
                                disabled={!!actionLoading}
                                className="mt-2 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded font-bold flex items-center"
                              >
                                {actionLoading === ('refresh-interview-' + (row.userId || row.UserID)) ? (
                                  <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mr-1"></div>
                                ) : (
                                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                )}
                                Refresh AI
                              </button>
                            ) : null}
                          </td>
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
