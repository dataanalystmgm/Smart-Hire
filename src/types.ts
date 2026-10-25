export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'applicant' | 'admin';
  avatarUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  company?: string;
  companyLogo?: string;
  classification?: string;
  subClassification?: string;
  workArrangement?: 'On-site' | 'Hybrid' | 'Remote';
  salaryMin?: number;
  salaryMax?: number;
  salaryDisplay?: string;
  salaryPeriod?: 'monthly' | 'yearly';
  highlights?: string[];
  responsibilities?: string[];
  benefits?: string[];
  postedAt?: string;
  experienceLevel?: string;
  isFeatured?: boolean;
  companyRating?: number;
  companyReviewCount?: number;
  quickApply?: boolean;
  applicantCount?: number;
  viewsCount?: number;
  jobDescUrl?: string;
  jobDescFileName?: string;
  jobDescType?: 'file' | 'url';
  jobDescText?: string;
  interviewQuestions?: string[];
  interviewPrompt?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  size: string;
  description: string;
  rating: number;
  reviewCount: number;
  benefits: string[];
  activeJobsCount: number;
  website?: string;
  verified?: boolean;
}

export interface SalaryGuideItem {
  id: string;
  role: string;
  category: string;
  minSalary: number;
  medianSalary: number;
  maxSalary: number;
  salaryGrowth: string;
  commonSkills: string[];
  jobCount: number;
  overview: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
}

export interface JobAlert {
  id: string;
  userId: string;
  keyword?: string;
  classification?: string;
  location?: string;
  workArrangement?: string;
  frequency: 'Harian' | 'Mingguan';
  createdAt: string;
}

export type ApplicationStage =
  | 'Kotak masuk'
  | 'Prescreen'
  | 'Terpilih'
  | 'Wawancara'
  | 'Penawaran'
  | 'Menerima Tawaran'
  | 'Tidak cocok'
  | 'Terdaftar'
  | 'Pre Screening'
  | 'Menerima Tawaran / Tidak'
  | 'Tidak Menerima Tawaran'
  | 'Ditolak';

export type RecruitmentStage =
  | 'Terdaftar'
  | 'Pre Screening'
  | 'Terpilih'
  | 'Wawancara'
  | 'Penawaran'
  | 'Menerima Tawaran / Tidak'
  | 'Menerima Tawaran'
  | 'Tidak Menerima Tawaran'
  | 'Ditolak'
  | 'Applied'
  | 'Screening'
  | 'Testing'
  | 'Interview'
  | 'Offered'
  | 'Approved'
  | 'Rejected';

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: RecruitmentStage | string;
  stage?: ApplicationStage | string;
  createdAt: string;
}
