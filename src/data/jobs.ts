import { Job, Company, SalaryGuideItem, SavedJob, JobAlert } from '../types';
import { GoogleSheetsService } from '../services/googleSheets';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'PT Mercindo Global Manufaktur',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=120&h=120&q=80',
    industry: 'Manufaktur & Tekstil',
    location: 'Jakarta & Karawang',
    size: '1.000 - 5.000 Karyawan',
    description: 'Perusahaan manufaktur sarung tangan olahraga dan garmen internasional terkemuka dengan standar ekspor global ke 25+ negara di dunia.',
    rating: 4.8,
    reviewCount: 240,
    benefits: ['BPJS Lengkap & Asuransi Swasta', 'Bonus Kinerja & THR', 'Tunjangan Transportasi & Makan', 'Jenjang Karir Global'],
    activeJobsCount: 4,
    website: 'https://mercindo.co.id',
    verified: true
  },
  {
    id: 'comp-2',
    name: 'Mercindo Tech & Digital Labs',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
    industry: 'Teknologi Informasi & Software',
    location: 'Jakarta Selatan (Hybrid)',
    size: '200 - 500 Karyawan',
    description: 'Divisi inovasi teknologi digital yang mengembangkan sistem ERP industri, otomasi manufaktur pintar, dan platform AI rekrutmen terdepan.',
    rating: 4.9,
    reviewCount: 156,
    benefits: ['Kebijakan Kerja Hybrid / Remote', 'Tunjangan Laptop & Workspace', 'Budget Pelatihan & Sertifikasi', 'Asuransi Kesehatan Keluarga'],
    activeJobsCount: 5,
    website: 'https://tech.mercindo.co.id',
    verified: true
  },
  {
    id: 'comp-3',
    name: 'Nusantara Supply Chain & Logistics',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=120&h=120&q=80',
    industry: 'Rantai Pasok & Logistik',
    location: 'Surabaya & Tanjung Priok',
    size: '500 - 1.000 Karyawan',
    description: 'Penyedia layanan distribusi dan rantai pasokan logistik multimoda yang terintegrasi secara cerdas di seluruh Indonesia.',
    rating: 4.6,
    reviewCount: 98,
    benefits: ['Tunjangan Operasional', 'Insentif Lembur & KPI', 'Klinik Kesehatan Kantor', 'Program Kebugaran'],
    activeJobsCount: 3,
    website: 'https://nusantaralogistics.id',
    verified: true
  },
  {
    id: 'comp-4',
    name: 'Prima Solusi Finansial',
    logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=120&h=120&q=80',
    industry: 'Perbankan & Keuangan',
    location: 'Jakarta Pusat',
    size: '250 - 500 Karyawan',
    description: 'Mitra keuangan korporasi dan manajemen perbendaharaan yang mendukung pendanaan proyek industri strategis.',
    rating: 4.7,
    reviewCount: 112,
    benefits: ['Bonus Tahunan Kompetitif', 'Asuransi Kesehatan Rawat Inap & Jalan', 'Pinjaman Karyawan Berbunga Rendah', 'Fasilitas Gym'],
    activeJobsCount: 2,
    website: 'https://primasolusi.com',
    verified: true
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'hse-staff',
    title: 'HSE Staff',
    company: 'PT Mercindo Global Manufaktur',
    companyLogo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=120&h=120&q=80',
    department: 'Health, Safety & Environment',
    classification: 'Manufaktur & Teknik',
    subClassification: 'HSE & Keselamatan Kerja',
    location: 'Brebes & Karawang',
    workArrangement: 'On-site',
    type: 'Full-time',
    description: 'Kami mencari HSE Staff (Health, Safety and Environment) berdedikasi untuk memantau implementasi SMK3, memastikan kepatuhan keselamatan kerja di area pabrik, melakukan inspeksi berkala, serta menyusun laporan pemantauan lingkungan.',
    highlights: [
      'Penerapan standar keselamatan kerja SMK3 & ISO 45001 kelas dunia',
      'Tunjangan sertifikasi profesi K3 Umum Kemnaker RI',
      'Fasilitas asuransi kesehatan komprehensif & MCU rutin berkala'
    ],
    responsibilities: [
      'Melakukan inspeksi berkala keselamatan kerja (APD, alat kerja, dan jalur evakuasi)',
      'Menyusun dokumen HIRADC/RR dan Job Safety Analysis (JSA)',
      'Melakukan pemantauan lingkungan (kualitas air, suhu, pencahayaan, kebisingan, dan limbah B3)',
      'Mengelola Chemical Safety Data Sheet (CSDS) dan pengawasan chemical pabrik',
      'Memimpin Safety Talk / Tool Box Meeting harian bersama tim produksi'
    ],
    requirements: [
      'Pendidikan S1/D3 Kesehatan Masyarakat, Teknik Lingkungan, atau K3',
      'Pengalaman kerja minimal 1-2 tahun di posisi HSE / Staf K3 di industri manufaktur',
      'Memiliki sertifikat Ahli K3 Umum Kemnaker yang masih berlaku',
      'Memiliki kemampuan audit internal SMK3 dan komunikasi yang lugas'
    ],
    benefits: [
      'Asuransi Kesehatan Lengkap (BPJS & Asuransi Swasta)',
      'Tunjangan Operasional Lapangan & Makan Siang',
      'Program Pengembangan Karir & Pelatihan K3 Lanjutan',
      'Cuti Tahunan & Fasilitas Kebugaran'
    ],
    postedAt: '2026-10-08T08:00:00Z',
    experienceLevel: '1-3 Tahun',
    isFeatured: true,
    companyRating: 4.8,
    companyReviewCount: 240,
    quickApply: true,
    applicantCount: 77,
    viewsCount: 3820
  },
  {
    id: '1',
    title: 'Data Analyst & BI Specialist',
    company: 'Mercindo Tech & Digital Labs',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
    department: 'Data & Analytics',
    classification: 'Data & Analitik',
    subClassification: 'Business Intelligence',
    location: 'Jakarta Selatan',
    workArrangement: 'Hybrid',
    type: 'Full-time',
    description: 'Kami mencari Data Analyst & BI Specialist yang bersemangat untuk mengeksplorasi data manufaktur, supply chain, dan user behavior untuk menghasilkan dashboard interaktif serta actionable insights bagi direksi dan manajemen operasional.',
    highlights: [
      'Fleksibilitas kerja 2 hari WFH per minggu & jam kerja fleksibel',
      'Tunjangan sertifikasi internasional (Google Cloud, PowerBI, Tableau)',
      'Asuransi kesehatan swasta kelas 1 termasuk anggota keluarga'
    ],
    responsibilities: [
      'Mendesain, mengembangkan, dan memelihara dashboard analitik interaktif di Tableau/PowerBI',
      'Menulis query SQL yang dioptimalkan untuk data pipeline dan warehouse BigQuery/PostgreSQL',
      'Bekerjasama dengan tim produk dan engineering untuk merumuskan metrik KPI utama bisnis',
      'Menyajikan hasil analisis prediktif dan laporan berkala kepada jajaran eksekutif'
    ],
    requirements: [
      'Pengalaman minimal 2-3 tahun sebagai Data Analyst / BI Analyst',
      'Mahir SQL tingkat lanjut (Complex Joins, Window Functions, Subqueries)',
      'Pengalaman dengan Python/R untuk data wrangling dan statistik dasar',
      'Keahlian terbukti dalam Tableau, Power BI, atau Metabase',
      'Lulusan S1 Matematika, Statistik, Ilmu Komputer, atau bidang terkait'
    ],
    benefits: [
      'Asuransi Rawat Jalan & Inap (Termasuk Kacamata & Gigi)',
      'Tunjangan Laptop MacBook Pro / ThinkPad',
      'Bonus Kinerja Tahunan & Insentif Prestasi',
      'Cuti Tahunan 15 Hari + Wellness Day'
    ],
    postedAt: '2026-10-18T08:00:00Z',
    experienceLevel: '1-3 Tahun',
    isFeatured: true,
    companyRating: 4.9,
    companyReviewCount: 156,
    quickApply: true,
    applicantCount: 28,
    viewsCount: 342
  },
  {
    id: '2',
    title: 'Senior Frontend Developer (React / TypeScript)',
    company: 'Mercindo Tech & Digital Labs',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
    department: 'Engineering',
    classification: 'Teknologi Informasi',
    subClassification: 'Frontend & Web Development',
    location: 'Remote (Indonesia)',
    workArrangement: 'Remote',
    type: 'Full-time',
    salaryMin: 18000000,
    salaryMax: 26000000,
    salaryDisplay: 'Rp 18.000.000 - Rp 26.000.000 / bln',
    salaryPeriod: 'monthly',
    description: 'Bergabunglah dengan tim inti engineering kami untuk membangun arsitektur antarmuka web modern berskala besar. Anda akan memimpin pengembangan frontend menggunakan React 19, TypeScript, dan Tailwind CSS dengan fokus pada performa, aksesibilitas, dan design system standar kelas dunia.',
    highlights: [
      '100% Remote kerja dari mana saja di Indonesia',
      'Home office setup allowance Rp 7.500.000 di awal bergabung',
      'Budget tahunan Rp 15.000.000 untuk konferensi dan kursus teknologi'
    ],
    responsibilities: [
      'Membangun dan mengembangkan komponen UI modular dengan React, TypeScript, dan Vite',
      'Mengoptimalkan performa web (Core Web Vitals, state management, render efficiency)',
      'Bekerjasama erat dengan desainer UI/UX dalam Figma design system implementation',
      'Melakukan code review, testing otomatis (Jest/Playwright), dan mentoring junior developer'
    ],
    requirements: [
      'Pengalaman kerja profesional minimal 3-4 tahun dengan React dan TypeScript',
      'Pemahaman mendalam tentang state management modern dan React Server Components',
      'Keahlian kuat dalam Tailwind CSS, CSS Grid, dan responsive layouts',
      'Familiar dengan RESTful API integration, WebSockets, dan Web Performance optimization',
      'Portfolio proyek aktif atau kontribusi open-source yang dapat ditunjukkan'
    ],
    benefits: [
      'Program Kepemilikan Saham (ESOP)',
      'Tunjangan Internet bulanan & WFH setup',
      'Asuransi Kesehatan Swasta Premium',
      'Fleksibilitas penuh jam kerja'
    ],
    postedAt: '2026-10-19T10:30:00Z',
    experienceLevel: '3-5 Tahun',
    isFeatured: true,
    companyRating: 4.9,
    companyReviewCount: 156,
    quickApply: true,
    applicantCount: 42,
    viewsCount: 510
  },
  {
    id: '3',
    title: 'Lead Product Manager',
    company: 'PT Mercindo Global Manufaktur',
    companyLogo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=120&h=120&q=80',
    department: 'Product',
    classification: 'Manajemen Produk',
    subClassification: 'Digital Product Management',
    location: 'Jakarta Pusat',
    workArrangement: 'Hybrid',
    type: 'Full-time',
    salaryMin: 22000000,
    salaryMax: 32000000,
    salaryDisplay: 'Rp 22.000.000 - Rp 32.000.000 / bln',
    salaryPeriod: 'monthly',
    description: 'Kami mencari Lead Product Manager berpengalaman untuk memimpin visi produk sistem rekrutmen cerdas MGM SmartHire dan sistem operasional digital korporasi. Anda akan berkolaborasi langsung dengan C-Level dan tim lintas disiplin untuk menghasilkan produk yang berdampak luas.',
    highlights: [
      'Kepemimpinan strategis memegang roadmap produk digital korporat',
      'Lingkungan kerja dinamis dengan tim lintas fungsi berkaliber tinggi',
      'Tunjangan transportasi, gadget korporat, dan bonus tahunan'
    ],
    responsibilities: [
      'Menyusun product vision, roadmap, dan OKR kuartalan untuk portofolio produk MGM',
      'Mengorganisir riset pengguna, wawancara stakeholder, dan validasi problem-solution fit',
      'Memimpin sprint planning bersama Scrum Master, Tech Lead, dan Designer',
      'Mengukur metrik adopsi produk, kepuasan pengguna (NPS), dan ROI fitur'
    ],
    requirements: [
      'Pengalaman minimal 3-5 tahun sebagai Product Manager (diutamakan SaaS / Enterprise)',
      'Rekam jejak sukses meluncurkan produk dari konsepsi hingga adopsi skala besar',
      'Kemampuan analisis data kuantitatif yang kuat (SQL, Mixpanel, Amplitude)',
      'Kepemimpinan komunikasi luar biasa dalam Bahasa Indonesia dan Bahasa Inggris',
      'Gelar S1 di bidang Sistem Informasi, Teknik, Manajemen Bisnis, atau setara'
    ],
    benefits: [
      'BPJS Ketenagakerjaan & Kesehatan Kelas 1 VIP',
      'Tunjangan Kendaraan / Parkir VIP Kantor',
      'Program Mentorship Eksekutif',
      'Bonus Kinerja Kuartalan'
    ],
    postedAt: '2026-10-15T09:15:00Z',
    experienceLevel: 'Senior (5+ Tahun)',
    isFeatured: true,
    companyRating: 4.8,
    companyReviewCount: 240,
    quickApply: true,
    applicantCount: 19,
    viewsCount: 280
  },
  {
    id: '4',
    title: 'Quality Control Supervisor (Garment & Gloves)',
    company: 'PT Mercindo Global Manufaktur',
    companyLogo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=120&h=120&q=80',
    department: 'Manufacturing & QC',
    classification: 'Manufaktur & Teknik',
    subClassification: 'Quality Assurance & Control',
    location: 'Karawang, Jawa Barat',
    workArrangement: 'On-site',
    type: 'Full-time',
    salaryMin: 8500000,
    salaryMax: 13000000,
    salaryDisplay: 'Rp 8.500.000 - Rp 13.000.000 / bln',
    salaryPeriod: 'monthly',
    description: 'Bertanggung jawab memimpin tim inspeksi kualitas produk sarung tangan ekspor di lini produksi pabrik Karawang. Memastikan seluruh output memenuhi standar AQL (Acceptable Quality Limit) dari buyer internasional ternama di Eropa dan Amerika.',
    highlights: [
      'Fasilitas mess karyawan ber-AC & makan siang gratis',
      'Kesempatan pelatihan sertifikasi ISO 9001:2015 berbiaya penuh',
      'Bonus target efisiensi pabrik setiap bulan'
    ],
    responsibilities: [
      'Mengawasi implementasi standar QC pada proses cutting, sewing, dan packaging',
      'Menganalisis root-cause cacat produksi dan merekomendasikan tindakan preventif',
      'Menyusun laporan harian QC dan berkoordinasi langsung dengan Factory Manager',
      'Memimpin tim QC inspector sebanyak 15-20 orang per shift'
    ],
    requirements: [
      'Minimal 2 tahun pengalaman sebagai QC Supervisor di industri tekstil / garmen / sarung tangan',
      'Memahami standar inspeksi AQL 1.5/2.5 dan standar buyer ekspor',
      'Disiplin tinggi, teliti, dan memiliki jiwa kepemimpinan di lapangan',
      'Bersedia ditempatkan di pabrik PT Mercindo di Karawang'
    ],
    benefits: [
      'Fasilitas Jemputan Karyawan / Mess Gratis',
      'Tunjangan Shift & Insentif Lembur Resmi',
      'BPJS Kesehatan & Ketenagakerjaan',
      'Pemeriksaan Kesehatan Rutin Tahunan (MCU)'
    ],
    postedAt: '2026-10-20T11:00:00Z',
    experienceLevel: '1-3 Tahun',
    isFeatured: false,
    companyRating: 4.8,
    companyReviewCount: 240,
    quickApply: true,
    applicantCount: 35,
    viewsCount: 198
  },
  {
    id: '5',
    title: 'HR Generalist & Talent Acquisition',
    company: 'PT Mercindo Global Manufaktur',
    companyLogo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=120&h=120&q=80',
    department: 'Human Resources',
    classification: 'Sumber Daya Manusia (HR)',
    subClassification: 'Talent Acquisition & Employee Relations',
    location: 'Jakarta Pusat',
    workArrangement: 'Hybrid',
    type: 'Full-time',
    salaryMin: 9000000,
    salaryMax: 14000000,
    salaryDisplay: 'Rp 9.000.000 - Rp 14.000.000 / bln',
    salaryPeriod: 'monthly',
    description: 'Mengelola end-to-end proses rekrutmen talenta terbaik menggunakan platform MGM SmartHire AI, administrasi kekaryawanan, hubungan industrial, serta program pengembangan budaya kerja yang positif dan inklusif.',
    highlights: [
      'Pemanfaatan tools AI modern untuk mempercepat proses rekrutmen',
      'Suasana kantor kolaboratif & program well-being karyawan',
      'Kesempatan memperluas jaringan HR dan hubungan industrial'
    ],
    responsibilities: [
      'Melakukan sourcing, screening, dan interview calon kandidat level staff hingga managerial',
      'Mengoperasikan platform rekrutmen AI MGM SmartHire untuk penilaian objektif pelamar',
      'Menangani kepatuhan ketenagakerjaan, kontrak kerja (PKWT/PKWTT), dan BPJS',
      'Menginisiasi program engagement karyawan dan pelatihan internal'
    ],
    requirements: [
      'Pendidikan S1 Psikologi, Hukum, atau Manajemen SDM',
      'Pengalaman kerja minimal 2 tahun di bidang HR Generalist / Talent Acquisition',
      'Memahami UU Cipta Kerja dan regulasi ketenagakerjaan Indonesia',
      'Memiliki keterampilan interpersonal yang hangat dan komunikasi persuasif'
    ],
    benefits: [
      'BPJS Lengkap & Asuransi Kesehatan Rawat Inap',
      'Tunjangan Komunikasi & Transportasi',
      'Family Gathering Tahunan',
      'Budget Pelatihan HR Profesional'
    ],
    postedAt: '2026-10-17T07:45:00Z',
    experienceLevel: '1-3 Tahun',
    isFeatured: false,
    companyRating: 4.8,
    companyReviewCount: 240,
    quickApply: true,
    applicantCount: 51,
    viewsCount: 420
  },
  {
    id: '6',
    title: 'DevOps & Cloud Infrastructure Engineer',
    company: 'Mercindo Tech & Digital Labs',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
    department: 'Engineering',
    classification: 'Teknologi Informasi',
    subClassification: 'DevOps & Cloud Computing',
    location: 'Jakarta Selatan',
    workArrangement: 'Hybrid',
    type: 'Full-time',
    salaryMin: 17000000,
    salaryMax: 25000000,
    salaryDisplay: 'Rp 17.000.000 - Rp 25.000.000 / bln',
    salaryPeriod: 'monthly',
    description: 'Mengelola infrastruktur cloud GCP/AWS, pipeline CI/CD otomatis, container orchestration dengan Kubernetes, serta memelihara ketersediaan tinggi (high availability) dan keamanan sistem enterprise Mercindo.',
    highlights: [
      'Arsitektur modern berbasis Google Cloud Platform & Kubernetes (GKE)',
      'Dukungan penuh sertifikasi cloud (Google Certified Professional Cloud Architect)',
      'Rotasi on-call terstruktur dengan kompensasi tunjangan siaga'
    ],
    responsibilities: [
      'Merancang dan memelihara pipeline CI/CD menggunakan GitHub Actions / GitLab CI',
      'Mengelola cluster Kubernetes, monitoring dengan Prometheus/Grafana, dan centralized logging',
      'Mengimplementasikan praktik Infrastructure-as-Code (Terraform / Pulumi)',
      'Menjaga standar keamanan cloud, manajemen sertifikat SSL, dan audit kerentanan berkala'
    ],
    requirements: [
      'Pengalaman kerja minimal 3 tahun di ranah DevOps / SRE / Cloud Engineer',
      'Mahir Docker, Kubernetes, Linux System Administration, dan Bash/Python scripting',
      'Pengalaman mendalam dengan Google Cloud Platform (GCP) atau AWS',
      'Familiar dengan konsep GitOps, zero-downtime deployment, dan microservices'
    ],
    benefits: [
      'Asuransi Kesehatan Kelas 1 VIP',
      'Tunjangan Gadget & Peralatan Kerja Modern',
      'Bonus Tahunan & Insentif Kinerja',
      'Tunjangan Sertifikasi Cloud Rp 10 Juta/tahun'
    ],
    postedAt: '2026-10-16T14:20:00Z',
    experienceLevel: '3-5 Tahun',
    isFeatured: true,
    companyRating: 4.9,
    companyReviewCount: 156,
    quickApply: true,
    applicantCount: 22,
    viewsCount: 315
  },
  {
    id: '7',
    title: 'Digital Marketing & Growth Specialist',
    company: 'Mercindo Tech & Digital Labs',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
    department: 'Marketing',
    classification: 'Pemasaran & Media',
    subClassification: 'Digital Marketing & Growth',
    location: 'Jakarta Selatan',
    workArrangement: 'Hybrid',
    type: 'Full-time',
    salaryMin: 10000000,
    salaryMax: 16000000,
    salaryDisplay: 'Rp 10.000.000 - Rp 16.000.000 / bln',
    salaryPeriod: 'monthly',
    description: 'Merancang dan mengeksekusi strategi akuisisi pengguna digital, kampanye berbayar (Google Ads, Meta Ads, LinkedIn Ads), optimalisasi SEO, serta content marketing untuk memperkenalkan solusi rekrutmen cerdas ke pasar B2B.',
    highlights: [
      'Budget iklan riil untuk eksperimen kampanye skala besar',
      'Akses ke tools marketing analytics premium (Ahrefs, Semrush, HubSpot)',
      'Bonus target perolehan qualified lead'
    ],
    responsibilities: [
      'Mengelola performa iklan berbayar (SEM, Paid Social) dengan target CPA dan ROAS optimal',
      'Menganalisis conversion rate funnel website dan landing page (A/B testing)',
      'Menyusun strategi konten edukatif B2B untuk LinkedIn dan media sosial industri',
      'Membuat laporan performa marketing mingguan menggunakan data Google Analytics 4'
    ],
    requirements: [
      'Pengalaman minimal 2-3 tahun dalam Digital Marketing B2B atau Tech Startup',
      'Mahir mengoperasikan Google Ads, Meta Ads Manager, GA4, dan Tag Manager',
      'Keahlian dalam copywriting persuasif dan dasar-dasar visual design (Canva/Figma)',
      'Terbiasa dengan data-driven decision making'
    ],
    benefits: [
      'Jam Kerja Fleksibel & Hybrid (2 hari WFH)',
      'Tunjangan Transportasi & Kuota Internet',
      'Asuransi Kesehatan Swasta',
      'Bonus Kinerja Kuartalan'
    ],
    postedAt: '2026-10-18T13:00:00Z',
    experienceLevel: '1-3 Tahun',
    isFeatured: false,
    companyRating: 4.9,
    companyReviewCount: 156,
    quickApply: true,
    applicantCount: 39,
    viewsCount: 360
  },
  {
    id: '8',
    title: 'Finance & Accounting Supervisor',
    company: 'Prima Solusi Finansial',
    companyLogo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=120&h=120&q=80',
    department: 'Finance',
    classification: 'Keuangan & Akuntansi',
    subClassification: 'Corporate Accounting & Tax',
    location: 'Jakarta Pusat',
    workArrangement: 'On-site',
    type: 'Full-time',
    salaryMin: 11000000,
    salaryMax: 17000000,
    salaryDisplay: 'Rp 11.000.000 - Rp 17.000.000 / bln',
    salaryPeriod: 'monthly',
    description: 'Memimpin tim akuntansi dan perpajakan untuk menyusun laporan keuangan bulanan, kepatuhan pajak (SPT Masa & Tahunan), rekonsiliasi kas bank, serta koordinasi audit eksternal dari kantor akuntan publik.',
    highlights: [
      'Jenjang karir jelas menuju Finance Manager',
      'Lingkungan kerja terstruktur di gedung perkantoran prestisius Sudirman',
      'Tunjangan makan siang eksekutif dan asuransi rawat jalan'
    ],
    responsibilities: [
      'Menyusun dan memvalidasi Laporan Laba Rugi, Neraca, dan Arus Kas secara tepat waktu',
      'Memastikan kepatuhan pelaporan perpajakan PPh 21, 23, 4(2), dan PPN e-Faktur',
      'Mengawasi proses pembayaran vendor, AR/AP, dan rekonsiliasi perbankan',
      'Mendampingi auditor internal dan eksternal selama periode pemeriksaan tahunan'
    ],
    requirements: [
      'Minimal S1 Akuntansi / Keuangan dengan IPK minimal 3.00',
      'Pengalaman kerja minimal 3 tahun di bidang Accounting & Tax',
      'Memiliki sertifikasi Brevet Pajak A & B (nilai tambah untuk Brevet C)',
      'Menguasai software akuntansi Accurate / SAP / Oracle dan mahir Excel tingkat lanjut'
    ],
    benefits: [
      'Bonus Tahunan Kompetitif',
      'Asuransi Kesehatan Swasta Lengkap',
      'Tunjangan Transportasi Jabatan',
      'Fasilitas Pinjaman Karyawan'
    ],
    postedAt: '2026-10-14T09:00:00Z',
    experienceLevel: '3-5 Tahun',
    isFeatured: false,
    companyRating: 4.7,
    companyReviewCount: 112,
    quickApply: true,
    applicantCount: 24,
    viewsCount: 220
  }
];

export const INITIAL_SALARY_GUIDE: SalaryGuideItem[] = [
  {
    id: 'sal-1',
    role: 'Frontend Developer',
    category: 'Teknologi Informasi',
    minSalary: 10000000,
    medianSalary: 18000000,
    maxSalary: 28000000,
    salaryGrowth: '+12.4% YoY',
    commonSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Web Performance'],
    jobCount: 142,
    overview: 'Posisi Frontend Developer terus mengalami lonjakan permintaan seiring adopsi web app modern di berbagai industri digital di Indonesia.'
  },
  {
    id: 'sal-2',
    role: 'Data Analyst',
    category: 'Data & Analitik',
    minSalary: 9000000,
    medianSalary: 15000000,
    maxSalary: 24000000,
    salaryGrowth: '+14.1% YoY',
    commonSkills: ['SQL', 'Python', 'Power BI', 'Tableau', 'Statistik'],
    jobCount: 98,
    overview: 'Analisis data menjadi pilar utama pengambilan keputusan strategis korporasi, memicu kenaikan kompensasi yang stabil bagi profesional data.'
  },
  {
    id: 'sal-3',
    role: 'Product Manager',
    category: 'Manajemen Produk',
    minSalary: 15000000,
    medianSalary: 25000000,
    maxSalary: 42000000,
    salaryGrowth: '+15.8% YoY',
    commonSkills: ['Product Strategy', 'Agile/Scrum', 'User Research', 'Data Analysis', 'Roadmapping'],
    jobCount: 76,
    overview: 'Peran strategis yang menjembatani bisnis, teknologi, dan kebutuhan pengguna dengan kompensasi tertinggi di jajaran manajemen non-eksekutif.'
  },
  {
    id: 'sal-4',
    role: 'DevOps / Cloud Engineer',
    category: 'Teknologi Informasi',
    minSalary: 14000000,
    medianSalary: 22000000,
    maxSalary: 35000000,
    salaryGrowth: '+18.2% YoY',
    commonSkills: ['Kubernetes', 'Docker', 'Google Cloud Platform', 'AWS', 'Terraform', 'CI/CD'],
    jobCount: 64,
    overview: 'Keahlian cloud automation dan security infrastructure menjadi salah satu keterampilan dengan pertumbuhan permintaan karir tertinggi tahun ini.'
  },
  {
    id: 'sal-5',
    role: 'Digital Marketing Specialist',
    category: 'Pemasaran & Media',
    minSalary: 8000000,
    medianSalary: 13000000,
    maxSalary: 20000000,
    salaryGrowth: '+9.5% YoY',
    commonSkills: ['Google Ads', 'Meta Ads', 'SEO', 'Data Analytics', 'Copywriting'],
    jobCount: 115,
    overview: 'Pemasaran digital berbasis data dan performance-driven terus menjadi fokus perusahaan dalam mengakuisisi konsumen dan klien B2B.'
  },
  {
    id: 'sal-6',
    role: 'HR Generalist / Recruiter',
    category: 'Sumber Daya Manusia (HR)',
    minSalary: 7500000,
    medianSalary: 12000000,
    maxSalary: 18500000,
    salaryGrowth: '+8.0% YoY',
    commonSkills: ['Talent Acquisition', 'Hubungan Industrial', 'Employee Engagement', 'UU Ketenagakerjaan', 'AI Recruiting Tools'],
    jobCount: 88,
    overview: 'Transformasi HR digital dan talent management menuntut praktisi SDM yang fasih dengan teknologi rekrutmen modern.'
  },
  {
    id: 'sal-7',
    role: 'Quality Control Supervisor',
    category: 'Manufaktur & Teknik',
    minSalary: 7000000,
    medianSalary: 11000000,
    maxSalary: 16000000,
    salaryGrowth: '+7.2% YoY',
    commonSkills: ['AQL Standards', 'ISO 9001', 'Root Cause Analysis', 'Auditing', 'Shopfloor Leadership'],
    jobCount: 52,
    overview: 'Sektor manufaktur berorientasi ekspor terus memberikan penghargaan tinggi bagi pengawas mutu dengan standar internasional.'
  },
  {
    id: 'sal-8',
    role: 'Finance & Accounting Supervisor',
    category: 'Keuangan & Akuntansi',
    minSalary: 9500000,
    medianSalary: 14500000,
    maxSalary: 22000000,
    salaryGrowth: '+8.7% YoY',
    commonSkills: ['Tax Brevet A/B', 'Financial Reporting', 'Auditing', 'Excel Advanced', 'Accurate/SAP'],
    jobCount: 84,
    overview: 'Kepatuhan regulasi pajak dan transparansi pelaporan keuangan menjaga permintaan posisi supervisor akuntansi tetap kokoh.'
  }
];

export function getSpecialistCategory(department?: string, classification?: string, title?: string): string {
  const exactCategories = [
    'Teknologi Informasi',
    'Data & Analitik',
    'Manajemen Produk',
    'Manufaktur & Teknik',
    'Pemasaran & Media',
    'Keuangan & Akuntansi',
    'Sumber Daya Manusia (HR)',
    'Rantai Pasok & Logistik'
  ];

  if (classification && exactCategories.includes(classification.trim())) {
    return classification.trim();
  }
  if (department && exactCategories.includes(department.trim())) {
    return department.trim();
  }

  const text = `${classification || ''} ${department || ''} ${title || ''}`.toLowerCase();

  if (text.includes('data') || text.includes('analitik') || text.includes('analytics') || text.includes('bi ')) {
    return 'Data & Analitik';
  }
  if (
    text.includes('teknologi informasi') ||
    text.includes('engineering') ||
    text.includes('software') ||
    text.includes('frontend') ||
    text.includes('backend') ||
    text.includes('devops') ||
    text.includes('cloud') ||
    /\bit\b/.test(text)
  ) {
    return 'Teknologi Informasi';
  }
  if (text.includes('produk') || text.includes('product')) {
    return 'Manajemen Produk';
  }
  if (text.includes('pemasaran') || text.includes('marketing') || text.includes('media')) {
    return 'Pemasaran & Media';
  }
  if (
    text.includes('keuangan') ||
    text.includes('akuntansi') ||
    text.includes('finance') ||
    text.includes('accounting') ||
    text.includes('tax')
  ) {
    return 'Keuangan & Akuntansi';
  }
  if (
    text.includes('sumber daya manusia') ||
    text.includes('human resources') ||
    text.includes('hrd') ||
    text.includes('talent') ||
    text.includes('rekrutmen') ||
    /\bhr\b/.test(text)
  ) {
    return 'Sumber Daya Manusia (HR)';
  }
  if (
    text.includes('logistik') ||
    text.includes('logistics') ||
    text.includes('rantai pasok') ||
    text.includes('supply chain') ||
    text.includes('warehouse') ||
    text.includes('warehousing') ||
    text.includes('gudang') ||
    text.includes('ppic')
  ) {
    return 'Rantai Pasok & Logistik';
  }
  if (
    text.includes('manufaktur') ||
    text.includes('manufacturing') ||
    text.includes('teknik') ||
    text.includes('qc') ||
    text.includes('quality') ||
    text.includes('hse') ||
    text.includes('safety') ||
    text.includes('environment') ||
    text.includes('operations') ||
    text.includes('operasional') ||
    text.includes('produksi') ||
    text.includes('production') ||
    text.includes('sewing') ||
    text.includes('garment') ||
    text.includes('garmen')
  ) {
    return 'Manufaktur & Teknik';
  }

  return 'Manufaktur & Teknik';
}

// Local + Server helper to store and retrieve Job Desc & Interview Questions metadata
function getLocalJobMetaMap(): Record<string, Partial<Job>> {
  try {
    const raw = localStorage.getItem('mgm_job_meta_map');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalJobMeta(job: Job) {
  try {
    const map = getLocalJobMetaMap();
    const meta: Partial<Job> = {
      jobDescUrl: job.jobDescUrl,
      jobDescFileName: job.jobDescFileName,
      jobDescType: job.jobDescType,
      jobDescText: job.jobDescText,
      interviewQuestions: job.interviewQuestions,
      interviewPrompt: job.interviewPrompt
    };
    if (job.id) map[String(job.id).trim()] = { ...(map[String(job.id).trim()] || {}), ...meta };
    if (job.title) {
      const tKey = `title:${job.title.trim().toLowerCase()}`;
      map[tKey] = { ...(map[tKey] || {}), ...meta };
    }
    localStorage.setItem('mgm_job_meta_map', JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to save local job meta:', e);
  }
}

async function syncJobMetaToServer(job: Job) {
  saveLocalJobMeta(job);
  try {
    await fetch('/api/jobs/meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        title: job.title,
        jobDescUrl: job.jobDescUrl,
        jobDescFileName: job.jobDescFileName,
        jobDescType: job.jobDescType,
        jobDescText: job.jobDescText,
        interviewQuestions: job.interviewQuestions,
        interviewPrompt: job.interviewPrompt
      })
    });
  } catch (e) {
    console.warn('Failed to sync job meta to server:', e);
  }
}

// Helper to load jobs directly from Google Sheet ID 1RZNZ4tMbw_qLZ9-iElGnfsFzk3JL1oFKeU3I6i_xEjU
export async function getJobs(): Promise<Job[]> {
  let serverMetaMap: Record<string, any> = {};
  try {
    const metaRes = await fetch('/api/jobs/meta');
    if (metaRes.ok) {
      const metaJson = await metaRes.json();
      if (metaJson?.data) serverMetaMap = metaJson.data;
    }
  } catch {}

  const localMetaMap = getLocalJobMetaMap();

  // Also check any locally added/edited jobs in mgm_jobs so newly added local jobs are not lost
  let localStoredJobs: Job[] = [];
  try {
    const rawStored = localStorage.getItem('mgm_jobs');
    if (rawStored) {
      const parsed = JSON.parse(rawStored);
      if (Array.isArray(parsed)) localStoredJobs = parsed;
    }
  } catch {}

  const mergeJobMeta = (baseJob: Job): Job => {
    const idKey = String(baseJob.id || '').trim();
    const titleKey = `title:${String(baseJob.title || '').trim().toLowerCase()}`;
    const sMeta = serverMetaMap[idKey] || serverMetaMap[titleKey] || {};
    const lMeta = localMetaMap[idKey] || localMetaMap[titleKey] || {};
    const localJobMatch = localStoredJobs.find(
      j => String(j.id) === idKey || j.title?.trim().toLowerCase() === baseJob.title?.trim().toLowerCase()
    );

    const jobDescUrl =
      lMeta.jobDescUrl ||
      sMeta.jobDescUrl ||
      localJobMatch?.jobDescUrl ||
      baseJob.jobDescUrl ||
      '';
    const jobDescFileName =
      lMeta.jobDescFileName ||
      sMeta.jobDescFileName ||
      localJobMatch?.jobDescFileName ||
      baseJob.jobDescFileName ||
      '';
    const jobDescType =
      lMeta.jobDescType ||
      sMeta.jobDescType ||
      localJobMatch?.jobDescType ||
      baseJob.jobDescType ||
      (jobDescUrl.startsWith('data:') ? 'file' : jobDescUrl ? 'url' : undefined);
    const jobDescText =
      lMeta.jobDescText ||
      sMeta.jobDescText ||
      localJobMatch?.jobDescText ||
      baseJob.jobDescText ||
      '';
    const interviewQuestions =
      (Array.isArray(lMeta.interviewQuestions) && lMeta.interviewQuestions.length > 0
        ? lMeta.interviewQuestions
        : undefined) ||
      (Array.isArray(sMeta.interviewQuestions) && sMeta.interviewQuestions.length > 0
        ? sMeta.interviewQuestions
        : undefined) ||
      (Array.isArray(localJobMatch?.interviewQuestions) && localJobMatch!.interviewQuestions!.length > 0
        ? localJobMatch!.interviewQuestions
        : undefined) ||
      (Array.isArray(baseJob.interviewQuestions) && baseJob.interviewQuestions.length > 0
        ? baseJob.interviewQuestions
        : []);
    const interviewPrompt =
      lMeta.interviewPrompt ||
      sMeta.interviewPrompt ||
      localJobMatch?.interviewPrompt ||
      baseJob.interviewPrompt ||
      '';

    return {
      ...baseJob,
      jobDescUrl: jobDescUrl || undefined,
      jobDescFileName: jobDescFileName || undefined,
      jobDescType,
      jobDescText: jobDescText || undefined,
      interviewQuestions,
      interviewPrompt: interviewPrompt || undefined
    };
  };

  try {
    let sheetJobs = await GoogleSheetsService.getJobs();

    // Fallback to GAS proxy if direct read returned empty
    if (!sheetJobs || sheetJobs.length === 0) {
      try {
        const res = await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_data', type: 'Jobs' })
        });
        const d = await res.json();
        if (d.status === 'success' && !d.mocked && Array.isArray(d.data) && d.data.length > 0) {
          sheetJobs = d.data;
        }
      } catch (e) {}
    }
    
    if (sheetJobs && sheetJobs.length > 0) {
      const loadedJobs: Job[] = sheetJobs.map((item: any) => {
        let reqs: string[] = [];
        if (Array.isArray(item.requirements)) {
          reqs = item.requirements;
        } else {
          try {
            reqs = JSON.parse(item.requirements || item.Requirements || '[]');
          } catch {
            reqs = String(item.requirements || item.Requirements || '').split(',').map((r: string) => r.trim()).filter(Boolean);
          }
        }

        const itemId = String(item.id || item.ID || '');
        const itemTitle = String(item.title || item.Title || '');
        const itemDept = String(item.department || item.Department || '');
        const rawClass = String(item.classification || item.Classification || '');
        const matchInitial = INITIAL_JOBS.find(
          j => j.id === itemId || j.title.toLowerCase() === itemTitle.toLowerCase()
        );

        const resolvedClassification = getSpecialistCategory(
          itemDept,
          rawClass !== itemDept ? rawClass : (matchInitial?.classification || ''),
          itemTitle
        );

        const baseJob: Job = {
          id: itemId,
          title: itemTitle,
          department: itemDept,
          location: String(item.location || item.Location || ''),
          type: String(item.type || item.Type || 'Full-time'),
          description: String(item.description || item.Description || ''),
          requirements: reqs,
          company: item.company || matchInitial?.company || 'PT Mercindo Global Manufaktur',
          companyLogo: item.companyLogo || matchInitial?.companyLogo || 'https://lh3.googleusercontent.com/d/1datmNG_YznNrYUENZe2n-1eWfTZEJkfJ',
          classification: resolvedClassification,
          subClassification: item.subClassification || matchInitial?.subClassification,
          workArrangement: item.workArrangement || matchInitial?.workArrangement || 'On-site',
          highlights: item.highlights && item.highlights.length > 0 ? item.highlights : matchInitial?.highlights,
          benefits: item.benefits || matchInitial?.benefits,
          responsibilities: item.responsibilities || matchInitial?.responsibilities,
          postedAt: item.postedAt || matchInitial?.postedAt || new Date().toISOString(),
          experienceLevel: item.experienceLevel || matchInitial?.experienceLevel || '1-3 Tahun',
          isFeatured: item.isFeatured ?? matchInitial?.isFeatured ?? false,
          companyRating: item.companyRating ? Number(item.companyRating) : matchInitial?.companyRating ?? 4.8,
          companyReviewCount: item.companyReviewCount ? Number(item.companyReviewCount) : matchInitial?.companyReviewCount ?? 150,
          quickApply: item.quickApply ?? matchInitial?.quickApply ?? true,
          applicantCount: item.applicantCount ? Number(item.applicantCount) : matchInitial?.applicantCount ?? 20,
          viewsCount: item.viewsCount ? Number(item.viewsCount) : matchInitial?.viewsCount ?? 150,
          jobDescUrl: item.jobDescUrl || item.JobDescUrl || matchInitial?.jobDescUrl,
          jobDescFileName: item.jobDescFileName || item.JobDescFileName || matchInitial?.jobDescFileName,
          interviewQuestions: item.interviewQuestions || matchInitial?.interviewQuestions,
          interviewPrompt: item.interviewPrompt || item.InterviewPrompt || matchInitial?.interviewPrompt
        };

        return mergeJobMeta(baseJob);
      });

      // Also include any newly added local jobs that aren't in sheetJobs yet
      localStoredJobs.forEach(localJob => {
        const existsInSheet = loadedJobs.some(
          sj => String(sj.id) === String(localJob.id) || sj.title.trim().toLowerCase() === localJob.title.trim().toLowerCase()
        );
        if (!existsInSheet) {
          loadedJobs.push(mergeJobMeta(localJob));
        }
      });
      
      localStorage.setItem('mgm_jobs', JSON.stringify(loadedJobs));
      return loadedJobs;
    }
  } catch (error) {
    console.warn('Failed to fetch jobs directly from Google Sheet, falling back to local storage:', error);
  }

  // Local storage fallback
  if (localStoredJobs.length > 0) {
    return localStoredJobs.map((j: Job) =>
      mergeJobMeta({
        ...j,
        classification: getSpecialistCategory(j.department, j.classification, j.title)
      })
    );
  }

  // Initial fallback if nothing in localStorage
  const mergedInitial = INITIAL_JOBS.map(mergeJobMeta);
  localStorage.setItem('mgm_jobs', JSON.stringify(mergedInitial));
  return mergedInitial;
}

export async function addJob(job: Job): Promise<boolean> {
  const currentJobs = await getJobs();
  const enrichedJob: Job = {
    ...job,
    company: job.company || 'PT Mercindo Global Manufaktur',
    classification: getSpecialistCategory(job.department, job.classification, job.title),
    workArrangement: job.workArrangement || 'On-site',
    highlights: job.highlights && job.highlights.length > 0 ? job.highlights : [
      'Lingkungan kerja kolaboratif & dinamis',
      'Tunjangan asuransi kesehatan & pelatihan',
      'Peluang pengembangan karir terstruktur'
    ],
    postedAt: job.postedAt || new Date().toISOString(),
    quickApply: true,
    applicantCount: 0,
    viewsCount: 1
  };

  await syncJobMetaToServer(enrichedJob);

  const filteredExisting = currentJobs.filter(j => j.id !== enrichedJob.id);
  filteredExisting.push(enrichedJob);
  localStorage.setItem('mgm_jobs', JSON.stringify(filteredExisting));

  try {
    const res = await GoogleSheetsService.addJob(enrichedJob);
    return res.success;
  } catch (err) {
    console.error('Failed to sync job directly to Google Sheet', err);
    return false;
  }
}

export async function updateJob(job: Job): Promise<boolean> {
  await syncJobMetaToServer(job);
  const currentJobs = await getJobs();
  const exists = currentJobs.some((j: Job) => j.id === job.id);
  const updatedJobs = exists
    ? currentJobs.map((j: Job) => (j.id === job.id ? { ...j, ...job } : j))
    : [...currentJobs, job];
  localStorage.setItem('mgm_jobs', JSON.stringify(updatedJobs));

  return true;
}

// ========================
// SAVED JOBS (SEEK Bookmark Feature)
// ========================
export function getSavedJobs(userId: string): SavedJob[] {
  try {
    const raw = localStorage.getItem(`mgm_saved_jobs_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isJobSaved(userId: string, jobId: string): boolean {
  if (!userId) return false;
  const list = getSavedJobs(userId);
  return list.some(item => item.jobId === jobId);
}

export function toggleSaveJob(userId: string, jobId: string): { isSaved: boolean; count: number } {
  if (!userId) return { isSaved: false, count: 0 };
  const current = getSavedJobs(userId);
  const exists = current.some(item => item.jobId === jobId);
  let updated: SavedJob[];
  if (exists) {
    updated = current.filter(item => item.jobId !== jobId);
  } else {
    updated = [
      {
        id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        jobId,
        savedAt: new Date().toISOString()
      },
      ...current
    ];
  }
  localStorage.setItem(`mgm_saved_jobs_${userId}`, JSON.stringify(updated));
  return { isSaved: !exists, count: updated.length };
}

// ========================
// JOB ALERTS (SEEK Notifikasi Lowongan)
// ========================
export function getJobAlerts(userId: string): JobAlert[] {
  try {
    const raw = localStorage.getItem(`mgm_job_alerts_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveJobAlert(alert: JobAlert): JobAlert[] {
  const current = getJobAlerts(alert.userId);
  const updated = [alert, ...current];
  localStorage.setItem(`mgm_job_alerts_${alert.userId}`, JSON.stringify(updated));
  return updated;
}

export function deleteJobAlert(userId: string, alertId: string): JobAlert[] {
  const current = getJobAlerts(userId);
  const updated = current.filter(a => a.id !== alertId);
  localStorage.setItem(`mgm_job_alerts_${userId}`, JSON.stringify(updated));
  return updated;
}

// ========================
// COMPANIES (SEEK Company Reviews / Explorer)
// ========================
export function getCompanies(): Company[] {
  try {
    const stored = localStorage.getItem('mgm_companies');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse mgm_companies', e);
  }
  localStorage.setItem('mgm_companies', JSON.stringify(INITIAL_COMPANIES));
  return INITIAL_COMPANIES;
}

export function getCompanyById(id: string): Company | undefined {
  const companies = getCompanies();
  return companies.find(c => c.id === id);
}

// ========================
// SALARY GUIDE (SEEK Salary Benchmark)
// ========================
export function getSalaryGuide(): SalaryGuideItem[] {
  try {
    const stored = localStorage.getItem('mgm_salary_guide');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse mgm_salary_guide', e);
  }
  localStorage.setItem('mgm_salary_guide', JSON.stringify(INITIAL_SALARY_GUIDE));
  return INITIAL_SALARY_GUIDE;
}
