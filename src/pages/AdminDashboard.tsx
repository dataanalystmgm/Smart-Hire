import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Settings, 
  Briefcase, 
  Check, 
  X, 
  ShieldCheck, 
  Search, 
  GraduationCap, 
  Phone, 
  Mail, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  ChevronRight,
  UserCheck,
  Award,
  Layers,
  FileCheck,
  ArrowRight,
  MessageSquare,
  Send,
  UserX,
  ShieldAlert
} from 'lucide-react';
import AdminTestsEditor from './AdminTestsEditor';
import AdminJobsManager from '../components/AdminJobsManager';
import AdminInterviewQuestionsManager from '../components/AdminInterviewQuestionsManager';
import { getJobs } from '../data/jobs';
import { GoogleSheetsService } from '../services/googleSheets';

export type CandidateStage =
  | 'Terdaftar'
  | 'Pre Screening'
  | 'Terpilih'
  | 'Wawancara'
  | 'Penawaran'
  | 'Menerima Tawaran / Tidak'
  | 'Menerima Tawaran'
  | 'Tidak Menerima Tawaran'
  | 'Ditolak';

export type PipelineStageGroup =
  | 'Terdaftar'
  | 'Pre Screening'
  | 'Terpilih'
  | 'Wawancara'
  | 'Penawaran'
  | 'Menerima Tawaran / Tidak'
  | 'Ditolak';

export const PIPELINE_STAGES: {
  id: PipelineStageGroup;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  { id: 'Terdaftar', label: 'Terdaftar', shortLabel: '1. Terdaftar', description: 'Akun kandidat terdaftar' },
  { id: 'Pre Screening', label: 'Pre Screening', shortLabel: '2. Pre Screening', description: 'Seleksi berkas & AI CV' },
  { id: 'Terpilih', label: 'Terpilih', shortLabel: '3. Terpilih', description: 'Lolos seleksi & akses tes' },
  { id: 'Wawancara', label: 'Wawancara', shortLabel: '4. Wawancara', description: 'Tahap wawancara AI / HR' },
  { id: 'Penawaran', label: 'Penawaran', shortLabel: '5. Penawaran', description: 'Offering letter dikirim' },
  { id: 'Menerima Tawaran / Tidak', label: 'Menerima Tawaran / Tidak', shortLabel: '6. Menerima Tawaran / Tidak', description: 'Keputusan kandidat atas penawaran' },
  { id: 'Ditolak', label: 'Ditolak', shortLabel: '7. Ditolak', description: 'Tidak lolos seleksi' }
];

export const ALL_SELECTABLE_STAGES: { value: CandidateStage; label: string }[] = [
  { value: 'Terdaftar', label: '1. Terdaftar' },
  { value: 'Pre Screening', label: '2. Pre Screening' },
  { value: 'Terpilih', label: '3. Terpilih' },
  { value: 'Wawancara', label: '4. Wawancara' },
  { value: 'Penawaran', label: '5. Penawaran' },
  { value: 'Menerima Tawaran / Tidak', label: '6. Menerima Tawaran / Tidak (Menunggu Respon)' },
  { value: 'Menerima Tawaran', label: '6a. Menerima Tawaran (Diterima)' },
  { value: 'Tidak Menerima Tawaran', label: '6b. Tidak Menerima Tawaran (Menolak)' },
  { value: 'Ditolak', label: '7. Ditolak' }
];

export function normalizeStage(raw?: string): CandidateStage {
  if (!raw) return 'Terdaftar';
  const s = String(raw).trim().toLowerCase();
  if (s === 'terdaftar' || s === 'registered') return 'Terdaftar';
  if (
    s === 'pre screening' ||
    s === 'prescreening' ||
    s === 'pre-screening' ||
    s === 'screening' ||
    s === 'applied' ||
    s === 'pending' ||
    s === 'menunggu review'
  ) {
    return 'Pre Screening';
  }
  if (
    s === 'terpilih' ||
    s === 'approved' ||
    s === 'disetujui' ||
    s === 'testing' ||
    s === 'shortlisted'
  ) {
    return 'Terpilih';
  }
  if (s === 'wawancara' || s === 'interview') return 'Wawancara';
  if (s === 'penawaran' || s === 'offered' || s === 'offering') return 'Penawaran';
  if (s === 'menerima tawaran / tidak' || s === 'menerima tawaran/tidak') return 'Menerima Tawaran / Tidak';
  if (s === 'menerima tawaran' || s === 'accepted' || s === 'hired') return 'Menerima Tawaran';
  if (s === 'tidak menerima tawaran' || s === 'menolak tawaran' || s === 'declined') return 'Tidak Menerima Tawaran';
  if (s === 'ditolak' || s === 'rejected') return 'Ditolak';
  return 'Terdaftar';
}

export function getPipelineGroup(stage: CandidateStage): PipelineStageGroup {
  if (
    stage === 'Menerima Tawaran' ||
    stage === 'Tidak Menerima Tawaran' ||
    stage === 'Menerima Tawaran / Tidak'
  ) {
    return 'Menerima Tawaran / Tidak';
  }
  return stage;
}

export function getStageStyle(stage: CandidateStage): {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
} {
  switch (stage) {
    case 'Terdaftar':
      return {
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-700',
        badgeBorder: 'border-slate-200',
        dotColor: 'bg-slate-400'
      };
    case 'Pre Screening':
      return {
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
        badgeBorder: 'border-amber-200',
        dotColor: 'bg-amber-500 animate-pulse'
      };
    case 'Terpilih':
      return {
        badgeBg: 'bg-sky-100',
        badgeText: 'text-sky-800',
        badgeBorder: 'border-sky-200',
        dotColor: 'bg-sky-500'
      };
    case 'Wawancara':
      return {
        badgeBg: 'bg-indigo-100',
        badgeText: 'text-indigo-800',
        badgeBorder: 'border-indigo-200',
        dotColor: 'bg-indigo-500'
      };
    case 'Penawaran':
      return {
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-800',
        badgeBorder: 'border-purple-200',
        dotColor: 'bg-purple-500'
      };
    case 'Menerima Tawaran / Tidak':
      return {
        badgeBg: 'bg-teal-100',
        badgeText: 'text-teal-800',
        badgeBorder: 'border-teal-200',
        dotColor: 'bg-teal-500 animate-pulse'
      };
    case 'Menerima Tawaran':
      return {
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800',
        badgeBorder: 'border-emerald-200',
        dotColor: 'bg-emerald-500'
      };
    case 'Tidak Menerima Tawaran':
      return {
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-800',
        badgeBorder: 'border-orange-200',
        dotColor: 'bg-orange-500'
      };
    case 'Ditolak':
      return {
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-800',
        badgeBorder: 'border-rose-200',
        dotColor: 'bg-rose-500'
      };
  }
}

export function getNextStage(currentStage: CandidateStage): CandidateStage | null {
  const order: CandidateStage[] = [
    'Terdaftar',
    'Pre Screening',
    'Terpilih',
    'Wawancara',
    'Penawaran',
    'Menerima Tawaran / Tidak',
    'Menerima Tawaran'
  ];
  const idx = order.indexOf(currentStage);
  if (idx !== -1 && idx < order.length - 1) {
    return order[idx + 1];
  }
  return null;
}

interface UserProfileData {
  fullName?: string;
  birthPlaceDate?: string;
  highestEducation?: string;
  major?: string;
  homeAddress?: string;
  phoneNumber?: string;
}

interface ApplicationData {
  id: string;
  userId: string;
  userName?: string;
  jobId: string;
  jobTitle: string;
  status: CandidateStage;
  createdAt: string;
  cvScore?: string;
  cvSuggestion?: string;
  aiAnalysis?: string;
}

interface DocumentData {
  id?: string;
  userId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

interface TestResultData {
  userId: string;
  userName?: string;
  testType: string;
  score: string;
  resume: string;
  validated: string;
  createdAt?: string;
  answers?: any;
}

interface InterviewData {
  userId: string;
  userName?: string;
  summary: string;
  aiSummary: string;
  validated: string;
  createdAt?: string;
}

interface CandidateRecord {
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profile: UserProfileData;
  applications: ApplicationData[];
  documents: DocumentData[];
  testResults: TestResultData[];
  interviews: InterviewData[];
  overallStatus: CandidateStage;
}

export function extractAiScore(app: any): number {
  if (!app) return 0;
  const directVal =
    app.cvScore ??
    app.CVScore ??
    app.FitScore ??
    app.fitScore ??
    app.aiScore ??
    app.score;
  if (directVal !== undefined && directVal !== null && String(directVal).trim() !== '') {
    const parsed = parseFloat(String(directVal).replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      return Math.min(100, Math.round(parsed));
    }
  }

  const textVal = String(
    app.aiAnalysis ||
      app['AI Analysis'] ||
      app.AIAnalysis ||
      app.cvSuggestion ||
      app.CVSuggestion ||
      app.Notes ||
      app.notes ||
      ''
  );
  if (textVal) {
    const skorMatch =
      textVal.match(/skor[^0-9]*(\d{1,3})/i) ||
      textVal.match(/score[^0-9]*(\d{1,3})/i) ||
      textVal.match(/(\d{1,3})\s*%/);
    if (skorMatch && skorMatch[1]) {
      const parsed = parseInt(skorMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
        return parsed;
      }
    }
  }
  return 0;
}

export function doesApplicationMatchJob(
  app: ApplicationData,
  jobFilterVal: string,
  openJobsList: any[]
): boolean {
  if (!jobFilterVal || jobFilterVal === 'all') return true;
  if (jobFilterVal === 'no_job') return false;

  const filterLower = jobFilterVal.trim().toLowerCase();
  if (
    String(app.jobId).trim().toLowerCase() === filterLower ||
    String(app.jobTitle).trim().toLowerCase() === filterLower
  ) {
    return true;
  }

  const matchedJob = openJobsList.find(
    (j) =>
      String(j.id).trim().toLowerCase() === filterLower ||
      String(j.title).trim().toLowerCase() === filterLower
  );
  if (matchedJob) {
    return (
      String(app.jobId).trim().toLowerCase() === String(matchedJob.id).trim().toLowerCase() ||
      String(app.jobTitle).trim().toLowerCase() === String(matchedJob.title).trim().toLowerCase()
    );
  }
  return false;
}

export function getCandidateBestAiScore(
  cand: CandidateRecord,
  jobFilterVal: string = 'all',
  openJobsList: any[] = []
): number {
  if (!cand.applications || cand.applications.length === 0) return 0;
  const relevantApps =
    jobFilterVal && jobFilterVal !== 'all' && jobFilterVal !== 'no_job'
      ? cand.applications.filter((a) => doesApplicationMatchJob(a, jobFilterVal, openJobsList))
      : cand.applications;

  if (relevantApps.length === 0) return 0;
  return Math.max(...relevantApps.map((a) => extractAiScore(a)), 0);
}

export function getLocalMgmApprovals(): Record<string, string> {
  try {
    const raw = localStorage.getItem('mgm_user_approvals');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setLocalMgmApprovals(approvals: Record<string, string>) {
  try {
    localStorage.setItem('mgm_user_approvals', JSON.stringify(approvals));
  } catch {}
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'applicants' | 'manage_jobs' | 'interview_questions' | 'manage_tests' | 'manage_mgm_team'>('applicants');
  const [selectedInterviewJobId, setSelectedInterviewJobId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [analyzingCVs, setAnalyzingCVs] = useState<Record<string, boolean>>({});
  
  // MGM Team approval state
  const [mgmUsers, setMgmUsers] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Pending' | 'Approved' | 'Rejected' | string;
    createdAt: string;
  }[]>([]);
  const [mgmFilterStatus, setMgmFilterStatus] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [mgmSearchTerm, setMgmSearchTerm] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PipelineStageGroup | 'has_docs'>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  
  // Modal state for full dossier
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'profile' | 'applications' | 'documents' | 'tests' | 'interviews'>('overview');

  useEffect(() => {
    loadAllCandidateData();
  }, []);

  const loadAllCandidateData = async () => {
    setLoading(true);
    try {
      // Helper to fetch directly from Google Sheets service (CORS-enabled public endpoint that works anywhere, including Vercel)
      const fetchWithFallback = async (sheetType: string, directFetchFn: () => Promise<any[]>) => {
        try {
          const directData = await directFetchFn();
          if (Array.isArray(directData) && directData.length > 0) {
            return directData;
          }
        } catch (e) {
          console.warn(`Direct fetch for ${sheetType} failed, trying API proxy:`, e);
        }
        try {
          const res = await fetch('/api/gas/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_data', type: sheetType })
          });
          const d = await res.json();
          if (d.status === 'success' && Array.isArray(d.data)) return d.data;
        } catch {}
        return [];
      };

      const [resUsers, resApps, resDocs, resTests, resInterviews, fetchedJobs] = await Promise.allSettled([
        fetchWithFallback('Users', () => GoogleSheetsService.getUsers()),
        fetchWithFallback('Applications', () => GoogleSheetsService.getApplications()),
        fetchWithFallback('Documents', () => GoogleSheetsService.getDocuments()),
        fetchWithFallback('TestResults', () => GoogleSheetsService.getTestResults()),
        fetchWithFallback('Interviews', () => GoogleSheetsService.getInterviews()),
        getJobs()
      ]);

      const jobsList = fetchedJobs.status === 'fulfilled' && Array.isArray(fetchedJobs.value) ? fetchedJobs.value : [];
      setOpenJobs(jobsList);

      const extractList = (res: PromiseSettledResult<any>): any[] => {
        if (res.status !== 'fulfilled' || !res.value) return [];
        if (Array.isArray(res.value)) return res.value;
        if (Array.isArray(res.value?.data)) return res.value.data;
        return [];
      };

      // Normalize Users
      const usersFromDb = extractList(resUsers);
      let rawUsers: any[] = [];
      if (usersFromDb.length > 0) {
        rawUsers = usersFromDb;
      } else {
        const storedUsers = localStorage.getItem('mgm_users');
        rawUsers = storedUsers ? JSON.parse(storedUsers) : [
          { ID: 'u1', Name: 'Budi Santoso', Email: 'budi@example.com', Role: 'applicant', CreatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString() },
          { ID: 'u2', Name: 'Andi Kusuma', Email: 'andi@example.com', Role: 'applicant', CreatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
          { ID: 'u3', Name: 'Rina Wulandari', Email: 'rina.wulan@example.com', Role: 'applicant', CreatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString() }
        ];
      }

      // Local stage overrides and local applications
      const storedStagesStr = localStorage.getItem('mgm_candidate_stages');
      const localStageOverrides: Record<string, CandidateStage> = storedStagesStr ? JSON.parse(storedStagesStr) : {};
      const storedAppsStr = localStorage.getItem('mgm_applications');
      const localAppsList: any[] = storedAppsStr ? JSON.parse(storedAppsStr) : [];

      // Normalize Applications
      const appsFromDb = extractList(resApps);
      let rawApps: any[] = [];
      if (appsFromDb.length > 0) {
        rawApps = appsFromDb;
      } else if (localAppsList.length > 0) {
        rawApps = localAppsList;
      } else {
        rawApps = [
          { id: 'a1', userId: 'u1', userName: 'Budi Santoso', jobId: 'ops_spv', jobTitle: 'Operational Supervisor Logistics', status: 'Pre Screening', cvScore: '85', cvSuggestion: 'Kandidat memiliki latar belakang logistik yang kuat dan sertifikasi pergudangan.', createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
          { id: 'a2', userId: 'u2', userName: 'Andi Kusuma', jobId: 'sewing_op', jobTitle: 'Junior Sewing Operator', status: 'Wawancara', cvScore: '92', cvSuggestion: 'Pengalaman menjahit sarung tangan 2 tahun, presisi tinggi.', createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
          { id: 'a3', userId: 'u3', userName: 'Rina Wulandari', jobId: 'qc_garment', jobTitle: 'Quality Control Garment Inspector', status: 'Terpilih', cvScore: '88', cvSuggestion: 'Pemahaman mendalam mengenai standar jahitan export dan toleransi cacat produk.', createdAt: new Date(Date.now() - 3600000 * 18).toISOString() }
        ];
      }

      // Merge any local application updates into rawApps
      localAppsList.forEach(localApp => {
        const idx = rawApps.findIndex(ra => String(ra.id || ra.ID) === String(localApp.id));
        if (idx !== -1) {
          rawApps[idx] = {
            ...rawApps[idx],
            status: localApp.status || rawApps[idx].status || rawApps[idx].Status,
            Status: localApp.status || rawApps[idx].Status || rawApps[idx].status,
            cvScore: localApp.cvScore || rawApps[idx].cvScore,
            cvSuggestion: localApp.cvSuggestion || rawApps[idx].cvSuggestion,
            aiAnalysis: localApp.aiAnalysis || rawApps[idx].aiAnalysis
          };
        } else {
          rawApps.push(localApp);
        }
      });

      // Normalize Documents
      const docsFromDb = extractList(resDocs);
      let rawDocs: any[] = [];
      if (docsFromDb.length > 0) {
        rawDocs = docsFromDb;
      } else {
        const storedDocs = localStorage.getItem('mgm_documents');
        rawDocs = storedDocs ? JSON.parse(storedDocs) : [
          { UserID: 'u1', DocumentType: 'CV', FileName: 'CV_Budi_Santoso_Logistics.pdf', FileUrl: 'https://drive.google.com/file/d/1XDA2IJdYabu5z8KXjZGoT0n89vHKaIpR/view', CreatedAt: new Date().toISOString() },
          { UserID: 'u1', DocumentType: 'Ijazah', FileName: 'Ijazah_S1_Teknik_Industri_Budi.pdf', FileUrl: 'https://drive.google.com/file/d/103-U5wBI_j0OdFv9oHwKboOPmZgiv2MW/view', CreatedAt: new Date().toISOString() },
          { UserID: 'u1', DocumentType: 'Sertifikat', FileName: 'Sertifikat_Supply_Chain_MGM.pdf', FileUrl: 'https://drive.google.com/file/d/1a2HLhlQA7bpuXTctN3iwncSCsqnVjOK3/view', CreatedAt: new Date().toISOString() },
          { UserID: 'u2', DocumentType: 'CV', FileName: 'CV_Andi_Kusuma_Operator.pdf', FileUrl: 'https://drive.google.com/file/d/1kgcXTFf7P3CyiBoD_qw3CED2NlR1bsEK/view', CreatedAt: new Date().toISOString() },
          { UserID: 'u2', DocumentType: 'Ijazah', FileName: 'Ijazah_SMK_Tata_Busana_Andi.pdf', FileUrl: 'https://drive.google.com/file/d/1JQTKIkNIa_WEs3_8OJJg9ell3gv_a-FT/view', CreatedAt: new Date().toISOString() },
          { UserID: 'u3', DocumentType: 'CV', FileName: 'CV_Rina_Wulandari_QC.pdf', FileUrl: 'https://drive.google.com/file/d/1XDA2IJdYabu5z8KXjZGoT0n89vHKaIpR/view', CreatedAt: new Date().toISOString() }
        ];
      }

      // Normalize TestResults
      const testsFromDb = extractList(resTests);
      let rawTests: any[] = [];
      if (testsFromDb.length > 0) {
        rawTests = testsFromDb;
      } else {
        const storedResults = localStorage.getItem('mgm_test_results');
        rawTests = storedResults ? JSON.parse(storedResults) : [
          { userId: 'u1', userName: 'Budi Santoso', testType: 'creplin', score: '88', resume: 'Kandidat menyelesaikan tes Kraepelin dengan tingkat akurasi 88%. Kecepatan kerja stabil dan daya tahan stres sangat prima.', validated: 'Belum Divalidasi', createdAt: new Date().toISOString() },
          { userId: 'u2', userName: 'Andi Kusuma', testType: 'disc', score: '90', resume: 'Tipe profil Conscientiousness & Steadiness tinggi, sangat teliti untuk pekerjaan operator sewing.', validated: 'Valid / Disetujui', createdAt: new Date().toISOString() }
        ];
      }

      // Normalize Interviews
      const interviewsFromDb = extractList(resInterviews);
      let rawInterviews: any[] = [];
      if (interviewsFromDb.length > 0) {
        rawInterviews = interviewsFromDb;
      } else {
        const storedInterviews = localStorage.getItem('mgm_interviews');
        rawInterviews = storedInterviews ? JSON.parse(storedInterviews) : [
          { userId: 'u1', userName: 'Budi Santoso', summary: 'Candidate: Ya, saya memiliki pengalaman 3 tahun di pergudangan garmen.\nAI: Bagaimana Anda menangani deadline ketat?\nCandidate: Melakukan prioritas batching dan koordinasi tim harian.', aiSummary: 'Sikap komunikasi: Percaya diri, lugas, dan taktis.\nKelebihan: Memahami alur logistik garmen & manajemen stok.\nRekomendasi: Sangat direkomendasikan untuk posisi Supervisor.', validated: 'Belum Divalidasi', createdAt: new Date().toISOString() },
          { userId: 'u2', userName: 'Andi Kusuma', summary: 'Candidate: Terbiasa menjahit jenis sarung tangan kulit dan sintetis.\nAI: Mengapa memilih MGM?\nCandidate: MGM pabrik garmen bereputasi global dengan lingkungan kerja baik.', aiSummary: 'Kandidat memiliki motivasi kerja tinggi dan komitmen pada kualitas jahitan.\nRekomendasi: Lolos ke tahap penawaran kerja.', validated: 'Valid / Disetujui', createdAt: new Date().toISOString() }
        ];
      }

      // Aggregate all into CandidateRecord objects
      const candidateMap: Record<string, CandidateRecord> = {};

      const localApprovals = getLocalMgmApprovals();

      // Extract MGM Team users (role is tim_mgm or mgm team)
      const teamList = rawUsers
        .filter((u: any) => {
          const r = String(u.Role || u.role || '').trim().toLowerCase();
          return r === 'tim_mgm' || r === 'mgm team';
        })
        .map((u: any) => {
          const uid = String(u.ID || u.id || u.userId || '');
          const uemail = String(u.Email || u.email || '').trim().toLowerCase();
          const rawRole = String(u.Role || u.role || 'tim_mgm').trim();
          const localOverride = localApprovals[uid] || (uemail ? localApprovals[uemail] : undefined);
          const rawStatus = String(localOverride || u.Status || u.status || 'Pending').trim();
          return {
            id: uid,
            name: String(u.Name || u.name || 'Anggota Tim MGM'),
            email: String(u.Email || u.email || '-'),
            role: rawRole,
            status: (rawStatus.toLowerCase() === 'approved' || rawStatus.toLowerCase() === 'disetujui')
              ? 'Approved'
              : (rawStatus.toLowerCase() === 'rejected' || rawStatus.toLowerCase() === 'ditolak')
              ? 'Rejected'
              : 'Pending',
            createdAt: String(u.CreatedAt || u.createdAt || '')
          };
        });
      setMgmUsers(teamList);

      // 1. Seed with Candidates (exclude internal accounts)
      rawUsers.forEach((u: any) => {
        const id = String(u.ID || u.id || u.userId || '');
        if (!id) return;
        const role = String(u.Role || u.role || 'applicant').toLowerCase();
        if (role === 'admin' || role === 'tim_mgm' || role === 'mgm team') return;
        
        let localProfile: UserProfileData = {};
        const profileStr = localStorage.getItem(`mgm_profile_${id}`);
        if (profileStr) {
          try { localProfile = JSON.parse(profileStr); } catch (e) {}
        } else {
          if (id === 'u1') {
            localProfile = {
              fullName: 'Budi Santoso',
              birthPlaceDate: 'Semarang, 15 Mei 1998',
              highestEducation: 'S1',
              major: 'Teknik Industri',
              homeAddress: 'Jl. Raya Solo - Karanganyar No. 45, Karanganyar',
              phoneNumber: '081234567890'
            };
          } else if (id === 'u2') {
            localProfile = {
              fullName: 'Andi Kusuma',
              birthPlaceDate: 'Surakarta, 20 Agustus 2002',
              highestEducation: 'SMK',
              major: 'Tata Busana & Garmen',
              homeAddress: 'Jl. Veteran No. 12, Pasar Kliwon, Surakarta',
              phoneNumber: '085712345678'
            };
          } else if (id === 'u3') {
            localProfile = {
              fullName: 'Rina Wulandari',
              birthPlaceDate: 'Boyolali, 12 Januari 2000',
              highestEducation: 'D3',
              major: 'Manajemen Industri & QC',
              homeAddress: 'Jl. Pandanaran No. 88, Boyolali',
              phoneNumber: '087890123456'
            };
          }
        }

        candidateMap[id] = {
          userId: id,
          name: u.Name || u.name || localProfile.fullName || 'Kandidat',
          email: u.Email || u.email || '-',
          role: u.Role || u.role || 'applicant',
          createdAt: u.CreatedAt || u.createdAt || new Date().toISOString(),
          profile: localProfile,
          applications: [],
          documents: [],
          testResults: [],
          interviews: [],
          overallStatus: 'Terdaftar'
        };
      });

      // 2. Attach Applications
      rawApps.forEach((a: any) => {
        const uid = String(a.userId || a.UserID || a.id_user || '');
        if (!uid) return;
        
        if (!candidateMap[uid]) {
          candidateMap[uid] = {
            userId: uid,
            name: a.userName || a.UserName || 'Kandidat',
            email: a.userEmail || a.email || '-',
            role: 'applicant',
            createdAt: a.createdAt || a.CreatedAt || new Date().toISOString(),
            profile: {},
            applications: [],
            documents: [],
            testResults: [],
            interviews: [],
            overallStatus: 'Terdaftar'
          };
        }

        const appId = String(a.id || a.ID || `app_${uid}_${a.jobId || a.JobId || '1'}`);
        const normalizedAppStatus = normalizeStage(a.status || a.Status || 'Pre Screening');
        const extractedScore = extractAiScore(a);

        // Try resolving job title from openJobs if only jobId is present
        const rawJobId = String(a.jobId || a.JobId || a.JobID || '');
        const matchedOpenJob = jobsList.find((j: any) => String(j.id) === rawJobId);
        const resolvedJobTitle = a.jobTitle || a.JobTitle || matchedOpenJob?.title || 'Posisi Terbuka';

        const appObj: ApplicationData = {
          id: appId,
          userId: uid,
          userName: a.userName || a.UserName,
          jobId: rawJobId,
          jobTitle: resolvedJobTitle,
          status: normalizedAppStatus,
          createdAt: a.createdAt || a.CreatedAt || new Date().toISOString(),
          cvScore: extractedScore > 0 ? String(extractedScore) : (a.cvScore || a.CVScore),
          cvSuggestion: a.cvSuggestion || a.CVSuggestion,
          aiAnalysis: a.aiAnalysis || a['AI Analysis'] || a.AIAnalysis
        };

        const existingIndex = candidateMap[uid].applications.findIndex(existing => existing.id === appObj.id);
        if (existingIndex === -1) {
          candidateMap[uid].applications.push(appObj);
        } else {
          candidateMap[uid].applications[existingIndex] = appObj;
        }
      });

      // 3. Attach Documents (exclude KTP)
      rawDocs.forEach((d: any) => {
        const uid = String(d.UserID || d.userId || '');
        if (!uid) return;

        const docType = String(d.DocumentType || d.documentType || '');
        if (docType.toUpperCase() === 'KTP') return;

        if (candidateMap[uid]) {
          const docObj: DocumentData = {
            id: String(d.id || d.ID || `${uid}_${docType}`),
            userId: uid,
            type: docType,
            fileName: d.FileName || d.fileName || `${docType}_Document`,
            fileUrl: d.FileUrl || d.fileUrl || '#',
            uploadedAt: d.CreatedAt || d.createdAt || new Date().toISOString()
          };
          
          if (!candidateMap[uid].documents.some(x => x.type === docObj.type && x.fileName === docObj.fileName)) {
            candidateMap[uid].documents.push(docObj);
          }
        }
      });

      Object.keys(candidateMap).forEach(uid => {
        const localDocStr = localStorage.getItem(`mgm_uploaded_docs_${uid}`);
        if (localDocStr) {
          try {
            const parsed = JSON.parse(localDocStr);
            Object.entries(parsed).forEach(([type, info]: [string, any]) => {
              if (type.toUpperCase() === 'KTP') return;
              if (!candidateMap[uid].documents.some(x => x.type === type)) {
                candidateMap[uid].documents.push({
                  userId: uid,
                  type,
                  fileName: info.fileName || `${type}.pdf`,
                  fileUrl: info.fileUrl || '#',
                  uploadedAt: info.uploadedAt || new Date().toISOString()
                });
              }
            });
          } catch (e) {}
        }
      });

      // 4. Attach Test Results
      rawTests.forEach((t: any) => {
        const uid = String(t.userId || t.UserID || '');
        if (!uid || !candidateMap[uid]) return;

        const testObj: TestResultData = {
          userId: uid,
          userName: t.userName || t.UserName,
          testType: t.testType || t.TestType || 'Umum',
          score: String(t.score || t.Score || '0'),
          resume: t.resume || t.Resume || '-',
          validated: t.validated || t.Validated || 'Belum Divalidasi',
          createdAt: t.createdAt || t.CreatedAt,
          answers: t.answers || t.Answers
        };

        if (!candidateMap[uid].testResults.some(x => x.testType === testObj.testType)) {
          candidateMap[uid].testResults.push(testObj);
        }
      });

      // 5. Attach Interviews
      rawInterviews.forEach((i: any) => {
        const uid = String(i.userId || i.UserID || '');
        if (!uid || !candidateMap[uid]) return;

        const interviewObj: InterviewData = {
          userId: uid,
          userName: i.userName || i.UserName,
          summary: i.summary || i.Summary || '-',
          aiSummary: i.aiSummary || i['Summary by AI'] || i.SummaryByAI || '-',
          validated: i.validated || i.Validated || 'Belum Divalidasi',
          createdAt: i.createdAt || i.CreatedAt
        };

        if (!candidateMap[uid].interviews.some(x => x.summary === interviewObj.summary)) {
          candidateMap[uid].interviews.push(interviewObj);
        }
      });

      // 6. Determine overallStatus for each candidate and sort each candidate's applications by AI score desc
      Object.values(candidateMap).forEach(cand => {
        cand.applications.sort((a, b) => extractAiScore(b) - extractAiScore(a));
        if (localStageOverrides[cand.userId]) {
          cand.overallStatus = normalizeStage(localStageOverrides[cand.userId]);
          // Sync primary app display with candidate stage override if present
          if (cand.applications.length === 1) {
            cand.applications[0].status = cand.overallStatus;
          }
        } else if (cand.applications.length > 0) {
          cand.overallStatus = cand.applications[0].status;
        } else {
          cand.overallStatus = 'Terdaftar';
        }
      });

      const stageWeight: Record<CandidateStage, number> = {
        'Pre Screening': 8,
        'Terpilih': 7,
        'Wawancara': 6,
        'Penawaran': 5,
        'Menerima Tawaran / Tidak': 4,
        'Menerima Tawaran': 3,
        'Tidak Menerima Tawaran': 2,
        'Terdaftar': 1,
        'Ditolak': 0
      };

      // Sort candidates primarily by highest AI match score descending
      const list = Object.values(candidateMap).sort((a, b) => {
        const scoreDiff = getCandidateBestAiScore(b) - getCandidateBestAiScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        const weightDiff = (stageWeight[b.overallStatus] ?? 0) - (stageWeight[a.overallStatus] ?? 0);
        if (weightDiff !== 0) return weightDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setCandidates(list);
      if (selectedCandidate) {
        const refreshed = list.find(c => c.userId === selectedCandidate.userId);
        if (refreshed) setSelectedCandidate(refreshed);
      }
    } catch (err) {
      console.error('Failed to load candidate summary dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Approval / Rejection for Tim MGM accounts
  const handleApproveMgmUser = async (userId: string, newStatus: 'Approved' | 'Rejected' | 'Pending') => {
    const targetUser = mgmUsers.find(u => u.id === userId);
    const userEmail = targetUser?.email;
    const loadingKey = `mgm-user-${userId}-${newStatus}`;
    setActionLoading(loadingKey);
    try {
      // 1. Optimistic update in UI state
      setMgmUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));

      // 2. Save in localStorage so re-reading Google Sheet or refreshing NEVER reverts
      const localApprovals = getLocalMgmApprovals();
      localApprovals[userId] = newStatus;
      if (userEmail && userEmail !== '-') {
        localApprovals[userEmail.toLowerCase()] = newStatus;
      }
      setLocalMgmApprovals(localApprovals);

      // 3. Persist to server (.mgm_approvals.json) & Google Sheets
      await GoogleSheetsService.approveUser(userId, newStatus, userEmail);

      // 4. Reload candidate data (it will merge with localApprovals and server store)
      await loadAllCandidateData();
    } catch (err: any) {
      console.error('Failed to update MGM user status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Universal Stage Updater for any Candidate and/or Application
  const handleUpdateStage = async (userId: string, newStage: CandidateStage, appId?: string) => {
    const loadingKey = appId ? `stage-${appId}` : `stage-user-${userId}`;
    setActionLoading(loadingKey);

    try {
      // 1. Save candidate stage override in localStorage
      const storedStagesStr = localStorage.getItem('mgm_candidate_stages');
      const stageOverrides = storedStagesStr ? JSON.parse(storedStagesStr) : {};
      stageOverrides[userId] = newStage;
      localStorage.setItem('mgm_candidate_stages', JSON.stringify(stageOverrides));

      // 2. Update applications in localStorage
      const targetCand = candidates.find(c => c.userId === userId);
      const storedAppsStr = localStorage.getItem('mgm_applications');
      let storedApps: any[] = storedAppsStr ? JSON.parse(storedAppsStr) : [];

      if (targetCand && targetCand.applications.length > 0) {
        targetCand.applications.forEach(candApp => {
          if (!appId || candApp.id === appId) {
            const existingIdx = storedApps.findIndex(a => String(a.id) === String(candApp.id));
            if (existingIdx !== -1) {
              storedApps[existingIdx] = { ...storedApps[existingIdx], status: newStage };
            } else {
              storedApps.push({ ...candApp, status: newStage });
            }
          }
        });
      } else if (appId) {
        storedApps = storedApps.map(a => String(a.id) === String(appId) ? { ...a, status: newStage } : a);
      }
      localStorage.setItem('mgm_applications', JSON.stringify(storedApps));

      // 3. Optimistic state update so UI updates immediately
      setCandidates(prev =>
        prev.map(cand => {
          if (cand.userId !== userId) return cand;
          const updatedApps = cand.applications.map(a =>
            !appId || a.id === appId ? { ...a, status: newStage } : a
          );
          return {
            ...cand,
            overallStatus: newStage,
            applications: updatedApps
          };
        })
      );

      if (selectedCandidate && selectedCandidate.userId === userId) {
        setSelectedCandidate(prev => {
          if (!prev) return null;
          return {
            ...prev,
            overallStatus: newStage,
            applications: prev.applications.map(a =>
              !appId || a.id === appId ? { ...a, status: newStage } : a
            )
          };
        });
      }

      // 4. Sync with Google Sheets Column F (Status) & Column I (Stage)
      const appsToSync = appId
        ? [{ id: appId }]
        : (targetCand?.applications && targetCand.applications.length > 0
            ? targetCand.applications
            : [{ id: '' }]);

      for (const appItem of appsToSync) {
        try {
          if (appItem.id) {
            await GoogleSheetsService.updateApplicationStage(
              appItem.id,
              newStage as any,
              undefined,
              userId
            );
          } else {
            await fetch('/api/gas/proxy', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'update_application_status',
                userId,
                status: newStage
              })
            });
          }
        } catch (err) {
          console.warn('GAS Application status sync warning:', err);
        }
      }
    } finally {
      setActionLoading(null);
    }
  };

  // AI CV Screen and Analysis
  const handleRefreshCVAnalysis = async (candidate: CandidateRecord, app: ApplicationData) => {
    setAnalyzingCVs(prev => ({ ...prev, [app.id]: true }));
    try {
      const jobs = await getJobs();
      const job = jobs.find((j: any) => String(j.id) === String(app.jobId) || j.title === app.jobTitle);
      const cvDoc = candidate.documents.find(d => d.type === 'CV');
      
      let res;
      if (cvDoc && cvDoc.fileUrl && cvDoc.fileUrl !== '#') {
        const proxyRes = await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_file_base64', fileUrl: cvDoc.fileUrl })
        });
        const proxyData = await proxyRes.json();

        if (proxyData.status === 'success' && proxyData.base64) {
          res = await fetch('/api/ai/analyze-cv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: proxyData.base64,
              mimeType: proxyData.mimeType,
              jobDescription: (job?.description || app.jobTitle) + '\nPersyaratan: ' + (job?.requirements?.join(', ') || '')
            })
          });
        } else {
          res = await fetch('/api/ai/screen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resumeUrl: cvDoc.fileUrl,
              jobDescription: (job?.description || app.jobTitle) + '\nPersyaratan: ' + (job?.requirements?.join(', ') || '')
            })
          });
        }
      } else {
        const localCVText = localStorage.getItem('mgm_user_cv') || `Profil Kandidat: ${candidate.name}, Pendidikan: ${candidate.profile.highestEducation || 'S1'} ${candidate.profile.major || 'Teknik'}, Pengalaman kerja di bidang garmen dan manufaktur.`;
        res = await fetch('/api/ai/screen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: localCVText,
            jobDescription: (job?.description || app.jobTitle) + '\nPersyaratan: ' + (job?.requirements?.join(', ') || '')
          })
        });
      }

      const resData = await res.json();
      if (resData.result) {
        const aiAnalysis = `Skor: ${resData.result.score}%\n${resData.result.suggestion}`;
        const scoreStr = String(resData.result.score || '85');
        
        try {
          await fetch('/api/gas/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_application_cv_analysis',
              applicationId: app.id,
              aiAnalysis: aiAnalysis
            })
          });
        } catch (e) {}

        const storedApps = localStorage.getItem('mgm_applications') ? JSON.parse(localStorage.getItem('mgm_applications')!) : [];
        const exists = storedApps.some((a: any) => a.id === app.id);
        const updatedStored = exists
          ? storedApps.map((a: any) =>
              a.id === app.id
                ? { ...a, cvScore: scoreStr, cvSuggestion: resData.result.suggestion, aiAnalysis: aiAnalysis, 'AI Analysis': aiAnalysis }
                : a
            )
          : [...storedApps, { ...app, cvScore: scoreStr, cvSuggestion: resData.result.suggestion, aiAnalysis: aiAnalysis }];
        localStorage.setItem('mgm_applications', JSON.stringify(updatedStored));

        await loadAllCandidateData();
      }
    } catch (err: any) {
      console.error('Analisis CV gagal:', err);
    } finally {
      setAnalyzingCVs(prev => ({ ...prev, [app.id]: false }));
    }
  };

  // Validate Test Result
  const handleValidateTestResult = async (userId: string, testType: string) => {
    setActionLoading('validate-test-' + userId + '-' + testType);
    try {
      const storedResults = localStorage.getItem('mgm_test_results') ? JSON.parse(localStorage.getItem('mgm_test_results')!) : [];
      const updatedResults = storedResults.map((r: any) => 
        (String(r.userId) === String(userId) && String(r.testType) === String(testType)) ? { ...r, validated: 'Valid / Disetujui' } : r
      );
      localStorage.setItem('mgm_test_results', JSON.stringify(updatedResults));

      try {
        await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'validate_test', userId, testType, validated: 'Valid / Disetujui' })
        });
      } catch (err) {
        console.warn('GAS validate test sync warning:', err);
      }

      await loadAllCandidateData();
    } finally {
      setActionLoading(null);
    }
  };

  // Validate Interview Result
  const handleValidateInterviewResult = async (userId: string) => {
    setActionLoading('validate-interview-' + userId);
    try {
      const storedInterviews = localStorage.getItem('mgm_interviews') ? JSON.parse(localStorage.getItem('mgm_interviews')!) : [];
      const updatedInterviews = storedInterviews.map((i: any) => 
        String(i.userId) === String(userId) ? { ...i, validated: 'Valid / Disetujui' } : i
      );
      localStorage.setItem('mgm_interviews', JSON.stringify(updatedInterviews));

      try {
        await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'validate_interview', userId, validated: 'Valid / Disetujui' })
        });
      } catch (err) {
        console.warn('GAS validate interview sync warning:', err);
      }

      await loadAllCandidateData();
    } finally {
      setActionLoading(null);
    }
  };

  // Build list of open jobs + any applied job titles for the Job Filter
  const availableJobOptions = React.useMemo(() => {
    const map = new Map<string, { key: string; id: string; title: string; department: string; count: number }>();

    // First register all open jobs from database
    openJobs.forEach((job: any) => {
      const id = String(job.id || '').trim();
      const title = String(job.title || '').trim();
      if (!title) return;
      const key = id || title;
      const count = candidates.filter(c =>
        c.applications.some(app => doesApplicationMatchJob(app, key, openJobs))
      ).length;
      map.set(title.toLowerCase(), {
        key,
        id,
        title,
        department: String(job.department || job.category || '').trim(),
        count
      });
    });

    // Also include any applied job titles not in openJobs
    candidates.forEach(c => {
      c.applications.forEach(app => {
        const t = String(app.jobTitle || '').trim();
        if (!t || t === '-') return;
        const lower = t.toLowerCase();
        if (!map.has(lower)) {
          const count = candidates.filter(cand =>
            cand.applications.some(a => doesApplicationMatchJob(a, t, openJobs))
          ).length;
          map.set(lower, {
            key: t,
            id: String(app.jobId || t),
            title: t,
            department: '',
            count
          });
        }
      });
    });

    return Array.from(map.values());
  }, [openJobs, candidates]);

  // Filter candidates by search, stage, and open job, then sort by highest AI Match Score descending
  const filteredCandidates = React.useMemo(() => {
    const filtered = candidates.filter(cand => {
      const q = searchTerm.toLowerCase();
      const matchSearch = 
        cand.name.toLowerCase().includes(q) ||
        cand.email.toLowerCase().includes(q) ||
        cand.overallStatus.toLowerCase().includes(q) ||
        (cand.profile.highestEducation && cand.profile.highestEducation.toLowerCase().includes(q)) ||
        (cand.profile.major && cand.profile.major.toLowerCase().includes(q)) ||
        (cand.profile.homeAddress && cand.profile.homeAddress.toLowerCase().includes(q)) ||
        cand.applications.some(a => a.jobTitle.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Filter by Open Job
      if (jobFilter !== 'all') {
        if (jobFilter === 'no_job') {
          if (cand.applications.length > 0) return false;
        } else {
          const matchesJob = cand.applications.some(app =>
            doesApplicationMatchJob(app, jobFilter, openJobs)
          );
          if (!matchesJob) return false;
        }
      }

      // Filter by Stage
      if (statusFilter === 'all') return true;
      if (statusFilter === 'has_docs') return cand.documents.length > 0;

      return getPipelineGroup(cand.overallStatus) === statusFilter;
    });

    // Sort from highest AI match score to lowest
    return [...filtered].sort((a, b) => {
      const scoreB = getCandidateBestAiScore(b, jobFilter, openJobs);
      const scoreA = getCandidateBestAiScore(a, jobFilter, openJobs);
      if (scoreB !== scoreA) return scoreB - scoreA;
      // Tie-breaker: candidates with applications first
      if (b.applications.length !== a.applications.length) {
        return b.applications.length - a.applications.length;
      }
      return a.name.localeCompare(b.name);
    });
  }, [candidates, searchTerm, statusFilter, jobFilter, openJobs]);

  // Calculate counts per pipeline stage
  const getStageCount = (group: PipelineStageGroup) =>
    candidates.filter(c => getPipelineGroup(c.overallStatus) === group).length;

  return (
    <div className="space-y-8 w-full max-w-[1680px] mx-auto pb-16">
      {/* HEADER SECTION */}
      <div className="relative rounded-[2rem] bg-gradient-to-r from-mgm-dark via-[#284f55] to-teal-950 text-white p-8 md:p-10 shadow-xl overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-15 mix-blend-overlay" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1XDA2IJdYabu5z8KXjZGoT0n89vHKaIpR')" }}
        />
        <div className="absolute top-0 right-0 w-80 h-80 bg-mgm-green/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-mgm-yellow border border-white/15 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-mgm-yellow animate-pulse" />
              <span>Sistem Rekrutmen Terpadu MGM SmartHire AI</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Dashboard Tahapan Rekrutmen</h1>
            <p className="text-white/80 mt-2 text-sm md:text-base max-w-2xl font-light">
              Kelola dan perbarui setiap tahap rekrutmen kandidat mulai dari Terdaftar, Pre Screening, Terpilih, Wawancara, Penawaran, Menerima Tawaran / Tidak, hingga Ditolak.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={loadAllCandidateData}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center transition-all shadow-sm backdrop-blur-md"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Muat Ulang Data
            </button>
          </div>
        </div>

        {/* PIPELINE STAGE METRIC CARDS (7 STAGES + TOTAL) */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-8 pt-6 border-t border-white/15">
          <button
            onClick={() => {
              setActiveTab('applicants');
              setStatusFilter('all');
            }}
            className={`text-left rounded-2xl p-3.5 border transition-all backdrop-blur-md ${
              statusFilter === 'all'
                ? 'bg-white/25 border-white/40 shadow-lg'
                : 'bg-white/10 border-white/10 hover:bg-white/15'
            }`}
          >
            <div className="flex items-center justify-between text-white/80 text-[11px] font-semibold mb-1">
              <span>Total</span>
              <Users className="w-3.5 h-3.5 text-white/70" />
            </div>
            <div className="text-2xl font-extrabold text-white">{candidates.length}</div>
            <div className="text-[10px] text-white/60 mt-0.5 truncate">Semua Pelamar</div>
          </button>

          {PIPELINE_STAGES.map((st) => {
            const count = getStageCount(st.id);
            const isSelected = statusFilter === st.id;
            return (
              <button
                key={st.id}
                onClick={() => {
                  setActiveTab('applicants');
                  setStatusFilter(st.id);
                }}
                className={`text-left rounded-2xl p-3.5 border transition-all backdrop-blur-md ${
                  isSelected
                    ? 'bg-mgm-green/40 border-mgm-yellow shadow-lg'
                    : 'bg-white/10 border-white/10 hover:bg-white/15'
                }`}
              >
                <div className="flex items-center justify-between text-white/90 text-[11px] font-bold mb-1">
                  <span className="truncate">{st.label}</span>
                </div>
                <div className="text-2xl font-extrabold text-white">{count}</div>
                <div className="text-[10px] text-white/65 mt-0.5 truncate">{st.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`flex items-center px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${
            activeTab === 'applicants'
              ? 'bg-mgm-dark text-white shadow-md'
              : 'text-slate-600 hover:text-mgm-dark hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 mr-2" />
          Ringkasan & Tahapan Pelamar
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20 text-current font-extrabold">
            {candidates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('manage_jobs')}
          className={`flex items-center px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${
            activeTab === 'manage_jobs'
              ? 'bg-mgm-dark text-white shadow-md'
              : 'text-slate-600 hover:text-mgm-dark hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Manajemen Lowongan
        </button>

        <button
          onClick={() => setActiveTab('interview_questions')}
          className={`flex items-center px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${
            activeTab === 'interview_questions'
              ? 'bg-mgm-dark text-white shadow-md'
              : 'text-slate-600 hover:text-mgm-dark hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Pertanyaan Interview
        </button>

        <button
          onClick={() => setActiveTab('manage_tests')}
          className={`flex items-center px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${
            activeTab === 'manage_tests'
              ? 'bg-mgm-dark text-white shadow-md'
              : 'text-slate-600 hover:text-mgm-dark hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4 mr-2" />
          Manajemen Soal Tes
        </button>

        <button
          onClick={() => setActiveTab('manage_mgm_team')}
          className={`flex items-center px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${
            activeTab === 'manage_mgm_team'
              ? 'bg-mgm-dark text-white shadow-md'
              : 'text-slate-600 hover:text-mgm-dark hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mr-2" />
          Persetujuan Tim MGM
          {mgmUsers.filter(u => u.status === 'Pending').length > 0 ? (
            <span className="ml-2 px-2.5 py-0.5 text-xs rounded-full bg-amber-500 text-white font-extrabold animate-pulse shadow-sm">
              {mgmUsers.filter(u => u.status === 'Pending').length} Menunggu
            </span>
          ) : (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-200 text-slate-700 font-extrabold">
              {mgmUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* CONTENT AREA */}
      {activeTab === 'manage_mgm_team' ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Manajemen Otorisasi Akun
                </div>
                <h2 className="text-2xl font-extrabold text-mgm-dark">Persetujuan Akun Tim MGM</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Semua akun yang mendaftar dengan role Tim MGM (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">mgm team / tim_mgm</code>) memerlukan persetujuan Administrator sebelum diizinkan masuk ke sistem.
                </p>
              </div>

              <button
                onClick={loadAllCandidateData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all self-start md:self-auto shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Segarkan Data
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
              <div 
                onClick={() => setMgmFilterStatus('all')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${mgmFilterStatus === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'}`}
              >
                <div className="text-xs font-semibold opacity-70">Total Akun Tim MGM</div>
                <div className="text-2xl font-extrabold mt-1">{mgmUsers.length}</div>
                <div className="text-[11px] opacity-60 mt-0.5">Semua Pendaftaran</div>
              </div>

              <div 
                onClick={() => setMgmFilterStatus('Pending')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${mgmFilterStatus === 'Pending' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70 text-amber-900'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold opacity-85">Menunggu Persetujuan</span>
                  <Clock className="w-3.5 h-3.5 opacity-75" />
                </div>
                <div className="text-2xl font-extrabold mt-1">
                  {mgmUsers.filter(u => u.status === 'Pending').length}
                </div>
                <div className="text-[11px] opacity-75 mt-0.5">Membutuhkan Tindakan</div>
              </div>

              <div 
                onClick={() => setMgmFilterStatus('Approved')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${mgmFilterStatus === 'Approved' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70 text-emerald-900'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold opacity-85">Disetujui (Aktif)</span>
                  <CheckCircle className="w-3.5 h-3.5 opacity-75" />
                </div>
                <div className="text-2xl font-extrabold mt-1">
                  {mgmUsers.filter(u => u.status === 'Approved').length}
                </div>
                <div className="text-[11px] opacity-75 mt-0.5">Dapat Login</div>
              </div>

              <div 
                onClick={() => setMgmFilterStatus('Rejected')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${mgmFilterStatus === 'Rejected' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 text-rose-900'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold opacity-85">Ditolak</span>
                  <UserX className="w-3.5 h-3.5 opacity-75" />
                </div>
                <div className="text-2xl font-extrabold mt-1">
                  {mgmUsers.filter(u => u.status === 'Rejected').length}
                </div>
                <div className="text-[11px] opacity-75 mt-0.5">Akses Dicegah</div>
              </div>
            </div>

            {/* Alert if pending */}
            {mgmUsers.filter(u => u.status === 'Pending').length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-amber-900 text-sm">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                  <span>
                    Ada <strong>{mgmUsers.filter(u => u.status === 'Pending').length} akun Tim MGM baru</strong> yang sedang menunggu persetujuan Anda agar dapat masuk ke sistem.
                  </span>
                </div>
                <button
                  onClick={() => setMgmFilterStatus('Pending')}
                  className="px-3 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-lg hover:bg-amber-700 transition-all shrink-0"
                >
                  Tinjau Sekarang
                </button>
              </div>
            )}
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau email tim..."
                  value={mgmSearchTerm}
                  onChange={(e) => setMgmSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-mgm-green focus:ring-1 focus:ring-mgm-green"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setMgmFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      mgmFilterStatus === st
                        ? 'bg-mgm-dark text-white border-mgm-dark shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'all' ? 'Semua' : st === 'Pending' ? 'Menunggu' : st === 'Approved' ? 'Disetujui' : 'Ditolak'}
                    <span className="ml-1.5 opacity-70">
                      ({st === 'all' ? mgmUsers.length : mgmUsers.filter(u => u.status === st).length})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Accounts Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {(() => {
              const filteredList = mgmUsers.filter((u) => {
                const matchStatus = mgmFilterStatus === 'all' || u.status === mgmFilterStatus;
                const matchSearch =
                  !mgmSearchTerm ||
                  u.name.toLowerCase().includes(mgmSearchTerm.toLowerCase()) ||
                  u.email.toLowerCase().includes(mgmSearchTerm.toLowerCase());
                return matchStatus && matchSearch;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="text-center py-16 px-4">
                    <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-700">Tidak Ada Akun Tim MGM</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {mgmSearchTerm || mgmFilterStatus !== 'all'
                        ? 'Tidak ada akun yang sesuai dengan filter pencarian Anda.'
                        : 'Belum ada pendaftaran akun dengan role Tim MGM. Ketika seseorang mendaftar sebagai MGM Team, akunnya akan muncul di sini untuk persetujuan.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="divide-y divide-slate-100">
                  {filteredList.map((user) => {
                    const isPending = user.status === 'Pending';
                    const isApproved = user.status === 'Approved';
                    const isRejected = user.status === 'Rejected';
                    const isApproving = actionLoading === `mgm-user-${user.id}-Approved`;
                    const isRejecting = actionLoading === `mgm-user-${user.id}-Rejected`;

                    return (
                      <div
                        key={user.id}
                        className={`p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isPending ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* User Identity */}
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-base shrink-0 shadow-sm ${
                            isPending ? 'bg-amber-100 text-amber-800 border border-amber-300' : isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-slate-900 text-base">{user.name}</h4>
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                Role: {user.role}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                              <span>{user.email}</span>
                              {user.createdAt && (
                                <>
                                  <span>•</span>
                                  <span>Terdaftar: {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge & Actions */}
                        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                          {/* Badge */}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 animate-pulse" />
                              Menunggu Persetujuan
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Disetujui (Aktif)
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                              <UserX className="w-3.5 h-3.5" />
                              Ditolak
                            </span>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApproveMgmUser(user.id, 'Approved')}
                                  disabled={actionLoading !== null}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
                                >
                                  {isApproving ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  <span>Setujui</span>
                                </button>

                                <button
                                  onClick={() => handleApproveMgmUser(user.id, 'Rejected')}
                                  disabled={actionLoading !== null}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                                >
                                  {isRejecting ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <X className="w-3.5 h-3.5" />
                                  )}
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}

                            {isApproved && (
                              <button
                                onClick={() => handleApproveMgmUser(user.id, 'Rejected')}
                                disabled={actionLoading !== null}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 font-semibold text-xs rounded-lg transition-all disabled:opacity-50 border border-transparent hover:border-rose-200"
                              >
                                {isRejecting ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                                <span>Cabut Akses</span>
                              </button>
                            )}

                            {isRejected && (
                              <button
                                onClick={() => handleApproveMgmUser(user.id, 'Approved')}
                                disabled={actionLoading !== null}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-lg transition-all disabled:opacity-50"
                              >
                                {isApproving ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                <span>Setujui Kembali</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      ) : activeTab === 'manage_jobs' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <AdminJobsManager
            onOpenInterviewQuestions={(jobId) => {
              setSelectedInterviewJobId(jobId);
              setActiveTab('interview_questions');
            }}
          />
        </div>
      ) : activeTab === 'interview_questions' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <AdminInterviewQuestionsManager
            initialSelectedJobId={selectedInterviewJobId}
            onNavigateToManageJobs={() => setActiveTab('manage_jobs')}
          />
        </div>
      ) : activeTab === 'manage_tests' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <AdminTestsEditor />
        </div>
      ) : (
        /* APPLICANTS RINGKASAN DASHBOARD WITH LEFT VERTICAL STAGE & JOB FILTER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR: VERTICAL STAGE & OPEN JOBS FILTER */}
          <aside className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:sticky lg:top-24 space-y-5">
            {/* FILTER JOB YANG DIBUKA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-mgm-green" />
                  <h3 className="text-xs font-extrabold text-mgm-dark uppercase tracking-wider">
                    Filter Job Dibuka
                  </h3>
                </div>
                {jobFilter !== 'all' && (
                  <button
                    onClick={() => setJobFilter('all')}
                    className="text-[11px] font-bold text-mgm-green hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-col space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                <button
                  onClick={() => setJobFilter('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold transition-all border ${
                    jobFilter === 'all'
                      ? 'bg-mgm-dark text-white border-mgm-dark shadow-xs'
                      : 'bg-slate-50/70 text-slate-700 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">Semua Lowongan Dibuka</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                      jobFilter === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {availableJobOptions.length} Job
                  </span>
                </button>

                {availableJobOptions.map((job) => {
                  const isSelected = jobFilter === job.key;
                  return (
                    <button
                      key={job.key}
                      onClick={() => setJobFilter(job.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-mgm-green text-white border-mgm-green shadow-xs'
                          : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate font-bold">{job.title}</div>
                        {job.department && (
                          <div
                            className={`text-[10px] font-normal truncate ${
                              isSelected ? 'text-white/80' : 'text-slate-400'
                            }`}
                          >
                            {job.department}
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : job.count > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {job.count} pelamar
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FILTER TAHAP */}
            <div className="space-y-3 pt-2 border-t border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-mgm-green" />
                  <h3 className="text-xs font-extrabold text-mgm-dark uppercase tracking-wider">
                    Filter Tahap
                  </h3>
                </div>
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="text-[11px] font-bold text-mgm-green hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Vertical Stage List (Menurun) */}
              <div className="flex flex-col space-y-1.5">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                    statusFilter === 'all'
                      ? 'bg-mgm-dark text-white border-mgm-dark shadow-sm'
                      : 'bg-slate-50/70 text-slate-700 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        statusFilter === 'all' ? 'bg-mgm-yellow' : 'bg-slate-400'
                      }`}
                    />
                    <span className="truncate">Semua Kandidat</span>
                  </div>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${
                      statusFilter === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {candidates.length}
                  </span>
                </button>

                <div className="pt-1 pb-0.5 px-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Tahapan Rekrutmen
                  </span>
                </div>

                {PIPELINE_STAGES.map((st, idx) => {
                  const count = getStageCount(st.id);
                  const active = statusFilter === st.id;
                  const style = getStageStyle(st.id);
                  return (
                    <button
                      key={st.id}
                      onClick={() => setStatusFilter(st.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                        active
                          ? 'bg-mgm-green text-white border-mgm-green shadow-sm'
                          : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5 min-w-0 pr-2">
                        <span
                          className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 ${
                            active
                              ? 'bg-white/20 text-white'
                              : `${style.badgeBg} ${style.badgeText}`
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-extrabold">{st.label}</div>
                          <div
                            className={`text-[10px] font-normal truncate ${
                              active ? 'text-white/80' : 'text-slate-400'
                            }`}
                          >
                            {st.description}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                <div className="pt-2 border-t border-slate-100 mt-1">
                  <button
                    onClick={() => setStatusFilter('has_docs')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                      statusFilter === 'has_docs'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-blue-50/60 text-blue-800 border-blue-100 hover:bg-blue-100/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Ada Dokumen</span>
                    </div>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${
                        statusFilter === 'has_docs'
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-blue-700 border border-blue-200'
                      }`}
                    >
                      {candidates.filter(c => c.documents.length > 0).length}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN AREA: SEARCH BAR, JOB FILTER & CANDIDATE CARDS */}
          <div className="lg:col-span-9 space-y-6">
            {/* SEARCH BAR, JOB FILTER & AI SORT INDICATOR */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, email, posisi, tahap, jurusan, domisili..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-mgm-green focus:border-transparent bg-slate-50/50"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown Filter Job yang Dibuka */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative min-w-[230px] sm:min-w-[260px]">
                    <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mgm-green pointer-events-none" />
                    <select
                      value={jobFilter}
                      onChange={e => setJobFilter(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-mgm-dark bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-mgm-green cursor-pointer"
                    >
                      <option value="all">Semua Job yang Dibuka ({availableJobOptions.length})</option>
                      {availableJobOptions.map(job => (
                        <option key={job.key} value={job.key}>
                          {job.title} ({job.count} pelamar)
                        </option>
                      ))}
                      <option value="no_job">Belum Melamar Posisi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filters & AI Match Score Sort Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Urutan Otomatis: Paling Match berdasarkan Skor AI (Tertinggi → Terendah)
                  </span>

                  {jobFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      <Briefcase className="w-3 h-3 mr-1.5" />
                      Job: {jobFilter === 'no_job' ? 'Belum Melamar' : availableJobOptions.find(j => j.key === jobFilter)?.title || jobFilter}
                      <button
                        onClick={() => setJobFilter('all')}
                        className="ml-1.5 hover:text-blue-950"
                        title="Hapus filter job"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-mgm-light text-mgm-dark border border-mgm-green/30">
                      Tahap: {statusFilter === 'has_docs' ? 'Ada Dokumen' : statusFilter}
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="ml-1.5 hover:text-mgm-dark"
                        title="Hapus filter tahap"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Menampilkan <span className="font-extrabold text-mgm-dark">{filteredCandidates.length}</span> dari {candidates.length} kandidat
                </div>
              </div>
            </div>

            {/* CANDIDATES LISTING (CARDS / DOSSIER VIEW) */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <div className="w-12 h-12 border-4 border-mgm-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-base font-bold text-mgm-dark">Menyinkronkan Ringkasan Pelamar...</h3>
                <p className="text-slate-500 text-sm mt-1">Mengambil profil, dokumen, lamaran, dan hasil asesmen terbaru.</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Tidak ada pelamar pada tahap / filter job ini</h3>
                <p className="text-slate-500 text-sm mt-1">Coba sesuaikan kata kunci pencarian, filter job yang dibuka, atau pilih tahap rekrutmen lainnya di sebelah kiri.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredCandidates.map((candidate, idx) => {
                  const displayAiScore = getCandidateBestAiScore(candidate, jobFilter, openJobs);
                  return (
                    <CandidateSummaryCard
                      key={candidate.userId}
                      candidate={candidate}
                      displayAiScore={displayAiScore}
                      rankIndex={idx + 1}
                      actionLoading={actionLoading}
                      analyzingCVs={analyzingCVs}
                      onUpdateStage={handleUpdateStage}
                      onRefreshCV={handleRefreshCVAnalysis}
                      onValidateTest={handleValidateTestResult}
                      onValidateInterview={handleValidateInterviewResult}
                      onOpenDossier={(cand) => {
                        setSelectedCandidate(cand);
                        setModalTab('overview');
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL CANDIDATE DOSSIER MODAL */}
      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetailModal
            candidate={selectedCandidate}
            activeTab={modalTab}
            setActiveTab={setModalTab}
            actionLoading={actionLoading}
            analyzingCVs={analyzingCVs}
            onClose={() => setSelectedCandidate(null)}
            onUpdateStage={handleUpdateStage}
            onRefreshCV={handleRefreshCVAnalysis}
            onValidateTest={handleValidateTestResult}
            onValidateInterview={handleValidateInterviewResult}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// INTERACTIVE STAGE PIPELINE STEPPER COMPONENT
// ============================================================================
function StagePipelineControl({
  currentStage,
  isUpdating,
  onSelectStage
}: {
  currentStage: CandidateStage;
  isUpdating: boolean;
  onSelectStage: (stage: CandidateStage) => void;
}) {
  const currentGroup = getPipelineGroup(currentStage);
  const activeIndex = PIPELINE_STAGES.findIndex(s => s.id === currentGroup);
  const nextStage = getNextStage(currentStage);

  const compactDisplayLabel = (id: PipelineStageGroup) => {
    if (id === 'Menerima Tawaran / Tidak') return 'Menerima / Tidak';
    return id;
  };

  return (
    <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200/80 space-y-3 overflow-hidden">
      {/* Header Row: Title + Quick Next Stage Action */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold text-mgm-dark uppercase tracking-wider flex items-center">
          <Layers className="w-3.5 h-3.5 mr-1.5 text-mgm-green shrink-0" />
          Tahap Rekrutmen (Klik untuk Ubah Stage)
        </span>

        {nextStage && currentStage !== 'Ditolak' && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onSelectStage(nextStage)}
            className="text-[11px] font-bold bg-mgm-green text-white px-3 py-1.5 rounded-lg hover:bg-opacity-90 transition-all inline-flex items-center shrink-0 shadow-xs cursor-pointer"
            title={`Lanjut ke tahap ${nextStage}`}
          >
            <span>Lanjut: {nextStage === 'Menerima Tawaran / Tidak' ? 'Respon Tawaran' : nextStage}</span>
            <ArrowRight className="w-3 h-3 ml-1 shrink-0" />
          </button>
        )}
      </div>

      {/* Dropdown Selector Row (Full Width so it never overflows) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">
          Pilih Status Tahap:
        </span>
        <select
          value={currentStage}
          disabled={isUpdating}
          onChange={(e) => onSelectStage(e.target.value as CandidateStage)}
          className="w-full flex-1 min-w-0 text-xs font-bold bg-white border border-slate-300 text-mgm-dark rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mgm-green cursor-pointer shadow-xs"
        >
          {ALL_SELECTABLE_STAGES.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 7-Stage Interactive Pipeline Grid (Clean 4-column layout with full readable stage names) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-0.5">
        {PIPELINE_STAGES.map((step, idx) => {
          const isCurrent = currentGroup === step.id;
          const isRejectedStep = step.id === 'Ditolak';
          const isPassed = !isRejectedStep && currentStage !== 'Ditolak' && idx < activeIndex;

          let btnClass = 'bg-white text-slate-700 border-slate-200 hover:border-mgm-green hover:text-mgm-dark';
          let badgeClass = 'bg-slate-100 text-slate-600';

          if (isCurrent) {
            if (isRejectedStep) {
              btnClass = 'bg-rose-600 text-white border-rose-600 shadow-xs font-extrabold ring-2 ring-rose-200';
              badgeClass = 'bg-white/20 text-white';
            } else if (currentStage === 'Tidak Menerima Tawaran') {
              btnClass = 'bg-orange-600 text-white border-orange-600 shadow-xs font-extrabold ring-2 ring-orange-200';
              badgeClass = 'bg-white/20 text-white';
            } else {
              btnClass = 'bg-mgm-dark text-white border-mgm-dark shadow-xs font-extrabold ring-2 ring-mgm-green/30';
              badgeClass = 'bg-white/20 text-white';
            }
          } else if (isPassed) {
            btnClass = 'bg-emerald-50/90 text-emerald-900 border-emerald-200 hover:bg-emerald-100';
            badgeClass = 'bg-emerald-600 text-white';
          }

          return (
            <button
              key={step.id}
              type="button"
              disabled={isUpdating}
              onClick={() => onSelectStage(step.id)}
              className={`px-2.5 py-2 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-start gap-2 text-left leading-tight min-w-0 ${btnClass} ${
                isUpdating ? 'opacity-60 cursor-wait' : 'cursor-pointer'
              }`}
              title={`Set tahap ke: ${step.label}`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${badgeClass}`}
              >
                {isPassed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
              </span>
              <span className="truncate">{compactDisplayLabel(step.id)}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-decision helper when in Penawaran or Menerima Tawaran / Tidak */}
      {(currentGroup === 'Menerima Tawaran / Tidak' || currentGroup === 'Penawaran') && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200/70">
          <span className="text-[11px] font-bold text-slate-600">
            Keputusan Kandidat atas Penawaran:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onSelectStage('Menerima Tawaran')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center cursor-pointer ${
                currentStage === 'Menerima Tawaran'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3 h-3 mr-1" />
              Menerima Tawaran
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onSelectStage('Tidak Menerima Tawaran')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center cursor-pointer ${
                currentStage === 'Tidak Menerima Tawaran'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
              }`}
            >
              <X className="w-3 h-3 mr-1" />
              Tidak Menerima Tawaran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CANDIDATE SUMMARY CARD
// ============================================================================
interface CandidateSummaryCardProps {
  key?: string;
  candidate: CandidateRecord;
  displayAiScore: number;
  rankIndex: number;
  actionLoading: string | null;
  analyzingCVs: Record<string, boolean>;
  onUpdateStage: (userId: string, newStage: CandidateStage, appId?: string) => void;
  onRefreshCV: (cand: CandidateRecord, app: ApplicationData) => void;
  onValidateTest: (userId: string, testType: string) => void;
  onValidateInterview: (userId: string) => void;
  onOpenDossier: (cand: CandidateRecord) => void;
}

function CandidateSummaryCard({
  candidate,
  displayAiScore,
  rankIndex,
  actionLoading,
  analyzingCVs,
  onUpdateStage,
  onRefreshCV,
  onValidateTest,
  onValidateInterview,
  onOpenDossier
}: CandidateSummaryCardProps) {
  const cvDoc = candidate.documents.find(d => d.type === 'CV');
  const ijazahDoc = candidate.documents.find(d => d.type === 'Ijazah');
  const certDoc = candidate.documents.find(d => d.type === 'Sertifikat');

  const initials = candidate.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');

  const stageStyle = getStageStyle(candidate.overallStatus);
  const isUpdatingCandidateStage =
    actionLoading === `stage-user-${candidate.userId}` ||
    candidate.applications.some(a => actionLoading === `stage-${a.id}`);

  const aiBadgeColor =
    displayAiScore >= 80
      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
      : displayAiScore >= 60
      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
      : displayAiScore > 0
      ? 'bg-rose-500 text-white border-rose-500'
      : 'bg-slate-100 text-slate-500 border-slate-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
    >
      {/* CARD TOP BAR */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-50/60 to-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3.5 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-mgm-dark to-teal-800 text-white font-extrabold flex items-center justify-center text-lg shadow-sm shrink-0 font-google">
              {initials || 'PL'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base md:text-lg text-mgm-dark tracking-tight leading-snug break-words">
                  {candidate.name}
                </h3>
                {displayAiScore > 0 && rankIndex === 1 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                    <Award className="w-3 h-3 mr-1 text-amber-600" />
                    Top Match #1
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 mt-1 text-xs text-slate-500">
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 max-w-[160px] truncate inline-block align-middle"
                  title={`ID: ${candidate.userId}`}
                >
                  ID: {candidate.userId}
                </span>
                <span className="flex items-center text-slate-600 truncate max-w-full">
                  <Mail className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                  <span className="truncate">{candidate.email}</span>
                </span>
                {candidate.profile.phoneNumber && (
                  <span className="flex items-center text-slate-600 shrink-0">
                    <Phone className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                    {candidate.profile.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Current Stage & AI Match Score Badges */}
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${aiBadgeColor}`}
              title={displayAiScore > 0 ? `Skor Kecocokan AI: ${displayAiScore}%` : 'Belum ada skor AI CV'}
            >
              <Sparkles className="w-3 h-3 mr-1 shrink-0" />
              {displayAiScore > 0 ? `AI Match: ${displayAiScore}%` : 'Skor AI: -'}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${stageStyle.badgeBg} ${stageStyle.badgeText} ${stageStyle.badgeBorder}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${stageStyle.dotColor}`} />
              {candidate.overallStatus}
            </span>
          </div>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-6 space-y-5 flex-1 text-xs">
        {/* INTERACTIVE STAGE PIPELINE CONTROLLER */}
        <StagePipelineControl
          currentStage={candidate.overallStatus}
          isUpdating={isUpdatingCandidateStage}
          onSelectStage={(newStage) =>
            onUpdateStage(candidate.userId, newStage, candidate.applications[0]?.id)
          }
        />

        {/* 1. INFORMASI PROFIL */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center">
              <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-mgm-green" />
              Informasi Profil & Pendidikan
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px]">Pendidikan Terakhir:</span>
              <span className="font-semibold text-mgm-dark">
                {candidate.profile.highestEducation || '-'} {candidate.profile.major ? `(${candidate.profile.major})` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Tempat, Tanggal Lahir:</span>
              <span className="font-semibold text-mgm-dark">
                {candidate.profile.birthPlaceDate || '-'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px]">Alamat Domisili:</span>
              <span className="font-medium text-slate-600 line-clamp-1">
                {candidate.profile.homeAddress || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. POSISI YANG DILAMAR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center">
              <Briefcase className="w-3.5 h-3.5 mr-1.5 text-mgm-green" />
              Posisi yang Dilamar ({candidate.applications.length})
            </span>
          </div>

          {candidate.applications.length === 0 ? (
            <div className="text-slate-400 italic text-xs py-2 bg-slate-50/50 rounded-lg px-3 border border-dashed border-slate-200">
              Belum memilih lowongan spesifik (Status tahap dapat tetap diatur di atas).
            </div>
          ) : (
            candidate.applications.map((app) => {
              const appStageStyle = getStageStyle(app.status);
              const isUpdatingThisApp = actionLoading === `stage-${app.id}`;

              return (
                <div key={app.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-mgm-dark">{app.jobTitle}</h4>
                      <span className="text-[10px] text-slate-400 flex items-center mt-0.5">
                        <Clock className="w-3 h-3 mr-1" />
                        Melamar pada:{' '}
                        {new Date(app.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${appStageStyle.badgeBg} ${appStageStyle.badgeText} ${appStageStyle.badgeBorder}`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* AI Match Score / Screening Insight */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center text-[10px] font-extrabold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                          <Sparkles className="w-3 h-3 mr-1 text-teal-600" />
                          MGM SmartScreen AI
                        </span>
                        {app.cvScore && (
                          <span className="text-xs font-bold text-mgm-dark">
                            Skor Kecocokan: <span className="text-mgm-green font-extrabold">{app.cvScore}%</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {app.cvSuggestion || app.aiAnalysis || 'Belum dilakukan analisis kesesuaian berkas dengan lowongan.'}
                      </p>
                    </div>

                    <button
                      onClick={() => onRefreshCV(candidate, app)}
                      disabled={analyzingCVs[app.id]}
                      className="shrink-0 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center"
                    >
                      {analyzingCVs[app.id] ? (
                        <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mr-1"></div>
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      Analisis AI
                    </button>
                  </div>

                  {/* Per-Application Stage Updater */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 shrink-0">Ubah Stage Lamaran:</span>
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1 sm:flex-initial justify-end">
                      <select
                        value={app.status}
                        disabled={isUpdatingThisApp}
                        onChange={(e) => onUpdateStage(candidate.userId, e.target.value as CandidateStage, app.id)}
                        className="max-w-full min-w-0 text-[11px] font-bold bg-slate-50 border border-slate-200 text-mgm-dark rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-mgm-green cursor-pointer"
                      >
                        {ALL_SELECTABLE_STAGES.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {app.status !== 'Ditolak' && (
                        <button
                          onClick={() => onUpdateStage(candidate.userId, 'Ditolak', app.id)}
                          disabled={isUpdatingThisApp}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all flex items-center shrink-0 cursor-pointer"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Tolak
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 3. DOKUMEN YANG DIUPLOAD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-mgm-green" />
              Dokumen yang Diupload ({candidate.documents.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* CV */}
            <div className={`p-2.5 rounded-xl border ${cvDoc ? 'bg-white border-slate-200' : 'bg-slate-50/60 border-dashed border-slate-200 text-slate-400'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-mgm-dark">Curriculum Vitae</span>
                {cvDoc && <FileCheck className="w-3.5 h-3.5 text-mgm-green" />}
              </div>
              {cvDoc ? (
                <div className="mt-1 space-y-1">
                  <p className="text-[10px] text-slate-500 truncate" title={cvDoc.fileName}>{cvDoc.fileName}</p>
                  <a
                    href={cvDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[10px] text-mgm-green font-bold hover:underline"
                  >
                    Buka File <ExternalLink className="w-2.5 h-2.5 ml-1" />
                  </a>
                </div>
              ) : (
                <span className="text-[10px] italic">Belum diunggah</span>
              )}
            </div>

            {/* IJAZAH */}
            <div className={`p-2.5 rounded-xl border ${ijazahDoc ? 'bg-white border-slate-200' : 'bg-slate-50/60 border-dashed border-slate-200 text-slate-400'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-mgm-dark">Ijazah</span>
                {ijazahDoc && <FileCheck className="w-3.5 h-3.5 text-mgm-green" />}
              </div>
              {ijazahDoc ? (
                <div className="mt-1 space-y-1">
                  <p className="text-[10px] text-slate-500 truncate" title={ijazahDoc.fileName}>{ijazahDoc.fileName}</p>
                  <a
                    href={ijazahDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[10px] text-mgm-green font-bold hover:underline"
                  >
                    Buka File <ExternalLink className="w-2.5 h-2.5 ml-1" />
                  </a>
                </div>
              ) : (
                <span className="text-[10px] italic">Belum diunggah</span>
              )}
            </div>

            {/* SERTIFIKAT */}
            <div className={`p-2.5 rounded-xl border ${certDoc ? 'bg-white border-slate-200' : 'bg-slate-50/60 border-dashed border-slate-200 text-slate-400'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-mgm-dark">Sertifikat</span>
                {certDoc && <FileCheck className="w-3.5 h-3.5 text-mgm-green" />}
              </div>
              {certDoc ? (
                <div className="mt-1 space-y-1">
                  <p className="text-[10px] text-slate-500 truncate" title={certDoc.fileName}>{certDoc.fileName}</p>
                  <a
                    href={certDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[10px] text-mgm-green font-bold hover:underline"
                  >
                    Buka File <ExternalLink className="w-2.5 h-2.5 ml-1" />
                  </a>
                </div>
              ) : (
                <span className="text-[10px] italic">Opsional (Kosong)</span>
              )}
            </div>
          </div>
        </div>

        {/* 4. HASIL TES & WAWANCARA RINGKAS */}
        {(candidate.testResults.length > 0 || candidate.interviews.length > 0) && (
          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-teal-800">
              <span className="flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                Hasil Asesmen & Wawancara AI
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {candidate.testResults.map((t, idx) => {
                const isValid = String(t.validated).toLowerCase().includes('valid');
                return (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-teal-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold uppercase text-[10px] text-slate-500 block">Tes {t.testType}</span>
                      <span className="font-extrabold text-mgm-dark text-sm">Skor: {t.score}</span>
                    </div>
                    {isValid ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Valid ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => onValidateTest(candidate.userId, t.testType)}
                        disabled={actionLoading === `validate-test-${candidate.userId}-${t.testType}`}
                        className="text-[10px] font-bold bg-mgm-dark text-white px-2 py-1 rounded hover:bg-opacity-90 shadow-sm"
                      >
                        Validasi
                      </button>
                    )}
                  </div>
                );
              })}

              {candidate.interviews.map((iv, idx) => {
                const isValid = String(iv.validated).toLowerCase().includes('valid');
                return (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-teal-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold uppercase text-[10px] text-slate-500 block">Wawancara AI</span>
                      <span className="font-bold text-slate-700 text-xs">Selesai dievaluasi</span>
                    </div>
                    {isValid ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Valid ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => onValidateInterview(candidate.userId)}
                        disabled={actionLoading === `validate-interview-${candidate.userId}`}
                        className="text-[10px] font-bold bg-mgm-dark text-white px-2 py-1 rounded hover:bg-opacity-90 shadow-sm"
                      >
                        Validasi
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CARD BOTTOM ACTION */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Registrasi: {new Date(candidate.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <button
          onClick={() => onOpenDossier(candidate)}
          className="text-xs font-bold text-mgm-dark hover:text-mgm-green transition-colors inline-flex items-center group"
        >
          Lihat Dossier Lengkap
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform text-mgm-green" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// FULL CANDIDATE DOSSIER MODAL
// ============================================================================
function CandidateDetailModal({
  candidate,
  activeTab,
  setActiveTab,
  actionLoading,
  analyzingCVs,
  onClose,
  onUpdateStage,
  onRefreshCV,
  onValidateTest,
  onValidateInterview
}: {
  candidate: CandidateRecord;
  activeTab: 'overview' | 'profile' | 'applications' | 'documents' | 'tests' | 'interviews';
  setActiveTab: (tab: 'overview' | 'profile' | 'applications' | 'documents' | 'tests' | 'interviews') => void;
  actionLoading: string | null;
  analyzingCVs: Record<string, boolean>;
  onClose: () => void;
  onUpdateStage: (userId: string, newStage: CandidateStage, appId?: string) => void;
  onRefreshCV: (cand: CandidateRecord, app: ApplicationData) => void;
  onValidateTest: (userId: string, testType: string) => void;
  onValidateInterview: (userId: string) => void;
}) {
  const isUpdatingCandidateStage =
    actionLoading === `stage-user-${candidate.userId}` ||
    candidate.applications.some(a => actionLoading === `stage-${a.id}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 flex flex-col max-h-[90vh]"
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-mgm-dark to-[#264c52] text-white p-6 md:p-8 relative flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono bg-white/20 px-2.5 py-0.5 rounded text-white">ID: {candidate.userId}</span>
              <span className="text-xs px-3 py-0.5 rounded-full font-extrabold bg-mgm-green text-white">
                Tahap: {candidate.overallStatus}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight pt-1">{candidate.name}</h2>
            <p className="text-white/80 text-xs md:text-sm">{candidate.email} • {candidate.profile.phoneNumber || 'Nomor HP belum diisi'}</p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL SUB-TABS */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/70 overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'Ringkasan & Tahap' },
            { id: 'profile', label: 'Biodata Lengkap' },
            { id: 'applications', label: `Lamaran (${candidate.applications.length})` },
            { id: 'documents', label: `Dokumen (${candidate.documents.length})` },
            { id: 'tests', label: `Hasil Tes (${candidate.testResults.length})` },
            { id: 'interviews', label: `Wawancara AI (${candidate.interviews.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-mgm-green text-mgm-dark font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-sm custom-scrollbar">
          {/* STAGE PIPELINE CONTROLLER ALWAYS AVAILABLE IN OVERVIEW & APPLICATIONS */}
          {(activeTab === 'overview' || activeTab === 'applications') && (
            <StagePipelineControl
              currentStage={candidate.overallStatus}
              isUpdating={isUpdatingCandidateStage}
              onSelectStage={(newStage) =>
                onUpdateStage(candidate.userId, newStage, candidate.applications[0]?.id)
              }
            />
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Profile Highlight */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Pendidikan:</span>
                  <span className="font-bold text-mgm-dark text-base">
                    {candidate.profile.highestEducation || '-'} {candidate.profile.major ? `– ${candidate.profile.major}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Tempat, Tanggal Lahir:</span>
                  <span className="font-bold text-mgm-dark text-base">{candidate.profile.birthPlaceDate || '-'}</span>
                </div>
                <div className="col-span-full">
                  <span className="text-xs text-slate-400 font-semibold block">Alamat Domisili:</span>
                  <span className="font-medium text-slate-700">{candidate.profile.homeAddress || '-'}</span>
                </div>
              </div>

              {/* Positions Highlight */}
              <div className="space-y-3">
                <h4 className="font-bold text-mgm-dark text-base flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-mgm-green" />
                  Lamaran yang Diajukan
                </h4>
                {candidate.applications.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">Kandidat belum memilih lowongan kerja.</p>
                ) : (
                  candidate.applications.map(app => {
                    const appStageStyle = getStageStyle(app.status);
                    return (
                      <div key={app.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h5 className="font-extrabold text-base text-mgm-dark">{app.jobTitle}</h5>
                            <span className="text-xs text-slate-400">ID Lamaran: {app.id}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${appStageStyle.badgeBg} ${appStageStyle.badgeText} ${appStageStyle.badgeBorder}`}>
                              {app.status}
                            </span>
                          </div>
                        </div>

                        {/* AI Matching Box */}
                        <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-teal-900 flex items-center">
                              <Sparkles className="w-4 h-4 mr-1.5 text-teal-600" />
                              Hasil Analisis AI CV Match
                            </span>
                            {app.cvScore && (
                              <span className="bg-teal-700 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                                {app.cvScore}% Match
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {app.cvSuggestion || app.aiAnalysis || 'Belum dilakukan analisis AI.'}
                          </p>
                        </div>

                        {/* Decision & Stage Bar in Modal */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => onRefreshCV(candidate, app)}
                            disabled={analyzingCVs[app.id]}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center"
                          >
                            {analyzingCVs[app.id] ? (
                              <div className="w-3.5 h-3.5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mr-1.5"></div>
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Refresh Analisis AI
                          </button>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">Ubah Tahap:</span>
                            <select
                              value={app.status}
                              disabled={actionLoading === `stage-${app.id}`}
                              onChange={(e) => onUpdateStage(candidate.userId, e.target.value as CandidateStage, app.id)}
                              className="text-xs font-bold bg-slate-50 border border-slate-300 text-mgm-dark rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mgm-green"
                            >
                              {ALL_SELECTABLE_STAGES.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-base text-mgm-dark">Informasi Biodata & Profil Lengkap</h4>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Nama Lengkap</label>
                    <p className="font-bold text-slate-800 text-sm">{candidate.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Alamat Email</label>
                    <p className="font-semibold text-slate-800 text-sm">{candidate.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Nomor Telepon / WhatsApp</label>
                    <p className="font-semibold text-slate-800 text-sm">{candidate.profile.phoneNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Tempat, Tanggal Lahir</label>
                    <p className="font-semibold text-slate-800 text-sm">{candidate.profile.birthPlaceDate || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Pendidikan Terakhir</label>
                    <p className="font-semibold text-slate-800 text-sm">{candidate.profile.highestEducation || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Program Studi / Jurusan</label>
                    <p className="font-semibold text-slate-800 text-sm">{candidate.profile.major || '-'}</p>
                  </div>
                  <div className="col-span-full">
                    <label className="text-xs font-bold text-slate-400 block mb-1">Alamat Domisili Lengkap</label>
                    <p className="font-medium text-slate-800 text-sm">{candidate.profile.homeAddress || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Tanggal Registrasi Akun</label>
                    <p className="font-mono text-xs text-slate-500">
                      {new Date(candidate.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-base text-mgm-dark">Daftar Semua Lamaran Posisi</h4>
              {candidate.applications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">Tidak ada riwayat lamaran.</div>
              ) : (
                <div className="space-y-4">
                  {candidate.applications.map(app => {
                    const appStageStyle = getStageStyle(app.status);
                    return (
                      <div key={app.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h5 className="font-bold text-base text-mgm-dark">{app.jobTitle}</h5>
                            <span className="text-xs text-slate-400">Dilamar pada: {new Date(app.createdAt).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${appStageStyle.badgeBg} ${appStageStyle.badgeText} ${appStageStyle.badgeBorder}`}>
                              {app.status}
                            </span>
                            <select
                              value={app.status}
                              disabled={actionLoading === `stage-${app.id}`}
                              onChange={(e) => onUpdateStage(candidate.userId, e.target.value as CandidateStage, app.id)}
                              className="text-xs font-bold bg-slate-50 border border-slate-300 text-mgm-dark rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-mgm-green"
                            >
                              {ALL_SELECTABLE_STAGES.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                          <span className="text-xs font-bold text-slate-500 block">Detail Analisis CV AI:</span>
                          <p className="text-xs text-slate-700 whitespace-pre-wrap">{app.aiAnalysis || app.cvSuggestion || 'Belum dianalisis.'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-base text-mgm-dark">Berkas Dokumen yang Diupload</h4>
              {candidate.documents.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Kandidat belum mengunggah dokumen apapun.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {candidate.documents.map((doc, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-mgm-dark text-white">
                          {doc.type}
                        </span>
                        <h5 className="font-bold text-sm text-slate-800 line-clamp-1" title={doc.fileName}>{doc.fileName}</h5>
                        <p className="text-[11px] text-slate-400">
                          Diunggah: {new Date(doc.uploadedAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-mgm-light text-mgm-dark hover:text-mgm-green border border-slate-200 p-2.5 rounded-xl transition-colors shrink-0"
                        title="Buka Berkas"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TESTS */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-base text-mgm-dark">Hasil Asesmen & Ujian Online</h4>
              {candidate.testResults.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Belum ada rekaman hasil tes online dari kandidat ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {candidate.testResults.map((t, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs uppercase font-extrabold text-slate-400">Tipe Ujian</span>
                          <h5 className="text-lg font-bold text-mgm-dark">Tes {t.testType}</h5>
                        </div>
                        <div className="text-right">
                          <span className="text-xs uppercase font-extrabold text-slate-400">Skor Capaian</span>
                          <div className="text-2xl font-extrabold text-mgm-green">{t.score}</div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-500 block mb-1">Analisis Hasil Tes:</span>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{t.resume}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                          String(t.validated).toLowerCase().includes('valid')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          Status: {t.validated}
                        </span>

                        {!String(t.validated).toLowerCase().includes('valid') && (
                          <button
                            onClick={() => onValidateTest(candidate.userId, t.testType)}
                            disabled={actionLoading === `validate-test-${candidate.userId}-${t.testType}`}
                            className="bg-mgm-dark text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 flex items-center shadow-sm"
                          >
                            <ShieldCheck className="w-4 h-4 mr-1.5" />
                            Validasi Hasil Tes Ini
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: INTERVIEWS */}
          {activeTab === 'interviews' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-base text-mgm-dark">Hasil Sesi Wawancara AI (MGM SmartInterview)</h4>
              {candidate.interviews.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Belum ada sesi wawancara yang diselesaikan oleh kandidat ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {candidate.interviews.map((iv, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                      {/* AI Evaluation */}
                      <div className="bg-teal-50/70 p-4 rounded-xl border border-teal-100 space-y-2">
                        <span className="text-xs font-bold text-teal-900 flex items-center">
                          <Sparkles className="w-4 h-4 mr-1.5 text-teal-600" />
                          Rangkuman & Rekomendasi AI
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{iv.aiSummary}</p>
                      </div>

                      {/* Conversation Log */}
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Transkrip Percakapan Wawancara:</span>
                        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                          {iv.summary}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                          String(iv.validated).toLowerCase().includes('valid')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          Status: {iv.validated}
                        </span>

                        {!String(iv.validated).toLowerCase().includes('valid') && (
                          <button
                            onClick={() => onValidateInterview(candidate.userId)}
                            disabled={actionLoading === `validate-interview-${candidate.userId}`}
                            className="bg-mgm-dark text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 flex items-center shadow-sm"
                          >
                            <ShieldCheck className="w-4 h-4 mr-1.5" />
                            Validasi Hasil Wawancara Ini
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Tutup Dossier
          </button>
        </div>
      </motion.div>
    </div>
  );
}
