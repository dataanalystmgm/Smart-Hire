import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en';
export type Theme = 'light' | 'dark';

interface ThemeLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  id: {
    // Nav
    'nav.home': 'Home',
    'nav.jobs': 'Lowongan',
    'nav.about': 'Tentang Kami',
    'nav.companies': 'Perusahaan',
    'nav.admin': 'Admin Dashboard',
    'nav.myDashboard': 'Dashboard Saya',
    'nav.tests': 'Tes Online',
    'nav.interview': 'Wawancara AI',
    'nav.login': 'Masuk',
    'nav.register': 'Daftar',
    'nav.logout': 'Keluar',
    'nav.savedJobs': 'Lowongan Tersimpan',

    // Hero
    'hero.badge': 'Platform Karir Ekosistem Mercindo',
    'hero.title': 'Temukan Karir Masa Depan di',
    'hero.desc': 'Jelajahi ratusan peluang kerja unggulan dengan proses rekrutmen transparan, profil perusahaan terpercaya, dan seleksi cerdas berbasis AI.',
    'hero.partner': 'Mitra Resmi MGM Career Network',
    'hero.verifiedReviews': 'Ulasan Perusahaan',

    // Search
    'search.what': 'Apa (What)',
    'search.whatPlaceholder': 'Keahlian, posisi, atau kata kunci...',
    'search.classification': 'Klasifikasi',
    'search.allIndustries': 'Semua Industri',
    'search.allClassifications': 'Semua Klasifikasi',
    'search.where': 'Dimana (Where)',
    'search.allLocations': 'Semua Lokasi',
    'search.find': 'FIND',
    'search.popular': 'Populer saat ini:',

    // Filters
    'filter.system': 'Sistem Kerja:',
    'filter.allSystems': 'Semua Sistem',
    'filter.type': 'Tipe Kerja:',
    'filter.allTypes': 'Semua Tipe',
    'filter.time': 'Waktu Tayang:',
    'filter.anytime': 'Kapan Saja',
    'filter.sort': 'Urutkan:',
    'filter.relevant': 'Paling Relevan',
    'filter.newest': 'Tanggal Terbaru',
    'filter.reset': 'Reset Filter',
    'filter.jobAlert': 'Buat Notifikasi Lowongan',
    'filter.showing': 'Menampilkan',
    'filter.jobs': 'lowongan pekerjaan',
    'filter.inCategory': 'di kategori',
    'filter.inLocation': 'lokasi',
    'filter.realtime': 'Update realtime',

    // Categories
    'cat.badge': 'Kategori Pekerjaan',
    'cat.title': 'Jelajahi Berdasarkan Spesialisasi',
    'cat.viewAll': 'Lihat Semua Spesialisasi',
    'cat.vacancies': 'lowongan',

    // Featured
    'featured.badge': 'Lowongan Unggulan (Featured)',
    'featured.title': 'Peluang Karir Terhangat Pekan Ini',
    'featured.viewAll': 'Buka Portal Lowongan Lengkap',
    'featured.details': 'Detail Info',
    'featured.applyNow': 'Lamar Sekarang',

    // Why Us
    'why.badge': 'Keunggulan Ekosistem',
    'why.title': 'Mengapa Berkarir Melalui Mercindo SmartHire?',
    'why.aiScreening': 'Screening Cerdas AI',
    'why.aiScreeningDesc': 'CV Anda dicocokkan secara objektif dengan kualifikasi pekerjaan secara instan tanpa bias subjektif manusia.',
    'why.aiInterview': 'Wawancara AI Fleksibel',
    'why.aiInterviewDesc': 'Jadwalkan dan selesaikan wawancara awal dengan asisten AI kapan saja sesuai kenyamanan jadwal harian Anda.',
    'why.assessment': 'Assessment Terintegrasi',
    'why.assessmentDesc': 'Tes logika visual hingga Kraepelin psikometrik langsung di platform dengan skor evaluasi transparan.',

    // About Section
    'about.badge': 'Tentang Perusahaan',
    'about.title': 'Terdepan dalam Manufaktur & Inovasi Teknologi Global',
    'about.desc': 'PT. Mercindo Global Manufaktur adalah konglomerasi industri terkemuka yang memadukan keunggulan manufaktur garmen sarung tangan olahraga berstandar ekspor ke 25+ negara dengan inovasi teknologi digital mutakhir. Kami berkomitmen memberikan tempat bertumbuh terbaik bagi setiap talenta.',
    'about.seeMore': 'Lihat selengkapnya',

    // Call To Action
    'cta.title': 'Siap Melangkah Maju Bersama Kami?',
    'cta.desc': 'Daftarkan diri Anda hari ini, upload resume Anda, dan biarkan sistem rekomendasi serta seleksi AI kami mempertemukan Anda dengan peluang karir ideal.',
    'cta.registerBtn': 'Daftar Akun Sekarang',
    'cta.browseBtn': 'Cari Lowongan Kerja',

    // Footer
    'footer.desc': 'Platform rekrutmen cerdas yang didukung oleh Artificial Intelligence untuk menemukan talenta terbaik dengan proses yang lebih efisien dan terukur.',
    'footer.company': 'Perusahaan',
    'footer.career': 'Karir',
    'footer.contact': 'Hubungi Kami',
    'footer.rights': 'All rights reserved.',

    // Theme & Language
    'theme.toggleLight': 'Ganti ke Mode Terang',
    'theme.toggleDark': 'Ganti ke Mode Gelap',
    'lang.switchTo': 'Switch to English'
  },
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.jobs': 'Jobs',
    'nav.about': 'About Us',
    'nav.companies': 'Companies',
    'nav.admin': 'Admin Dashboard',
    'nav.myDashboard': 'My Dashboard',
    'nav.tests': 'Online Tests',
    'nav.interview': 'AI Interview',
    'nav.login': 'Sign In',
    'nav.register': 'Register',
    'nav.logout': 'Sign Out',
    'nav.savedJobs': 'Saved Jobs',

    // Hero
    'hero.badge': 'Mercindo Ecosystem Career Portal',
    'hero.title': 'Discover Your Future Career at',
    'hero.desc': 'Explore hundreds of verified job openings with transparent hiring processes, authentic company reviews, and smart AI screening.',
    'hero.partner': 'Official Partner of MGM Career Network',
    'hero.verifiedReviews': 'Company Reviews',

    // Search
    'search.what': 'What',
    'search.whatPlaceholder': 'Skills, job title, or keywords...',
    'search.classification': 'Classification',
    'search.allIndustries': 'All Industries',
    'search.allClassifications': 'All Classifications',
    'search.where': 'Where',
    'search.allLocations': 'All Locations',
    'search.find': 'FIND',
    'search.popular': 'Popular searches:',

    // Filters
    'filter.system': 'Work System:',
    'filter.allSystems': 'All Systems',
    'filter.type': 'Work Type:',
    'filter.allTypes': 'All Types',
    'filter.time': 'Date Listed:',
    'filter.anytime': 'Anytime',
    'filter.sort': 'Sort by:',
    'filter.relevant': 'Most Relevant',
    'filter.newest': 'Newest Date',
    'filter.reset': 'Reset Filters',
    'filter.jobAlert': 'Create Job Alert',
    'filter.showing': 'Showing',
    'filter.jobs': 'job vacancies',
    'filter.inCategory': 'in category',
    'filter.inLocation': 'location',
    'filter.realtime': 'Realtime update',

    // Categories
    'cat.badge': 'Job Categories',
    'cat.title': 'Explore by Specialization',
    'cat.viewAll': 'View All Specializations',
    'cat.vacancies': 'openings',

    // Featured
    'featured.badge': 'Featured Opportunities',
    'featured.title': 'Hottest Career Opportunities This Week',
    'featured.viewAll': 'Open Full Job Portal',
    'featured.details': 'Details',
    'featured.applyNow': 'Apply Now',

    // Why Us
    'why.badge': 'Ecosystem Benefits',
    'why.title': 'Why Advance Your Career with Mercindo SmartHire?',
    'why.aiScreening': 'Smart AI Screening',
    'why.aiScreeningDesc': 'Your CV is objectively matched with position criteria instantly without subjective bias.',
    'why.aiInterview': 'Flexible AI Interview',
    'why.aiInterviewDesc': 'Schedule and take pre-screening interviews with AI anytime according to your busy schedule.',
    'why.assessment': 'Integrated Assessment',
    'why.assessmentDesc': 'Take visual logic and psychometric tests directly in the platform with transparent evaluation scoring.',

    // About Section
    'about.badge': 'About Company',
    'about.title': 'Leading in Global Manufacturing & Technology Innovation',
    'about.desc': 'PT. Mercindo Global Manufaktur is a premier industrial group combining export-standard sports glove manufacturing across 25+ countries with cutting-edge digital AI innovation.',
    'about.seeMore': 'Learn more',

    // Call To Action
    'cta.title': 'Ready to Take the Next Step With Us?',
    'cta.desc': 'Register your account today, upload your resume, and let our AI recommendations and smart screening connect you with your ideal career.',
    'cta.registerBtn': 'Register Account Now',
    'cta.browseBtn': 'Explore All Jobs',

    // Footer
    'footer.desc': 'Smart recruitment platform powered by Artificial Intelligence to discover premier talent through efficient and measurable processes.',
    'footer.company': 'Company',
    'footer.career': 'Careers',
    'footer.contact': 'Contact Us',
    'footer.rights': 'All rights reserved.',

    // Theme & Language
    'theme.toggleLight': 'Switch to Light Mode',
    'theme.toggleDark': 'Switch to Dark Mode',
    'lang.switchTo': 'Ganti ke Bahasa Indonesia'
  }
};

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export function ThemeLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mgm_lang');
    return (saved === 'en' || saved === 'id') ? saved : 'id';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('mgm_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Apply dark mode class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mgm_theme', theme);
  }, [theme]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('mgm_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'id' ? 'en' : 'id'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const t = (key: string, defaultText?: string): string => {
    const currentDict = translations[language] || translations.id;
    return currentDict[key] || defaultText || key;
  };

  return (
    <ThemeLanguageContext.Provider value={{ language, setLanguage, toggleLanguage, theme, setTheme, toggleTheme, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLanguage() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
}
