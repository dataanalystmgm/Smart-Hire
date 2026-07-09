import { Job } from '../types';

export const INITIAL_JOBS: Job[] = [
  {
    id: '1',
    title: 'Data Analyst',
    department: 'Data & Analytics',
    location: 'Jakarta, Indonesia',
    type: 'Full-time',
    description: 'We are looking for a Data Analyst to join our team. You will analyze large datasets, build dashboards, and help drive business decisions.',
    requirements: ['Menguasai SQL', 'Python / R', 'Pengalaman dengan Tableau / PowerBI', 'Pengalaman minimal 2 tahun', 'Lulusan S1 Matematika / Statistik / Ilmu Komputer']
  },
  {
    id: '2',
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Looking for an experienced React developer to build stunning UIs. You will work closely with design and backend teams.',
    requirements: ['React dan ekosistemnya', 'TypeScript', 'Tailwind CSS', 'Pemahaman UI/UX yang baik', 'Pengalaman minimal 2 tahun']
  },
  {
    id: '3',
    title: 'Product Manager',
    department: 'Product',
    location: 'Jakarta, Indonesia',
    type: 'Full-time',
    description: 'Drive the product vision and execution for MGM SmartHire. Work with stakeholders to define roadmap and requirements.',
    requirements: ['Metodologi Agile / Scrum', 'Keterampilan Leadership yang kuat', 'Pengambilan keputusan berbasis data', 'Pengalaman minimal 3 tahun sebagai PM', 'Kemampuan komunikasi yang sangat baik']
  }
];

// Helper to load jobs with fallback
export async function getJobs(): Promise<Job[]> {
  try {
    const res = await fetch('/api/gas/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_data', type: 'Jobs' })
    });
    const d = await res.json();
    
    if (d.status === 'success' && !d.mocked && d.data && d.data.length > 0) {
      // Map Apps Script response to Job interface
      const gasJobs: Job[] = d.data.map((item: any) => {
        let reqs: string[] = [];
        try {
          reqs = JSON.parse(item.Requirements || '[]');
        } catch (e) {
          reqs = String(item.Requirements || '').split(',').map((r: string) => r.trim()).filter(Boolean);
        }
        return {
          id: String(item.ID || item.id),
          title: String(item.Title || item.title),
          department: String(item.Department || item.department),
          location: String(item.Location || item.location),
          type: String(item.Type || item.type),
          description: String(item.Description || item.description),
          requirements: reqs
        };
      });
      
      // Sync local storage
      localStorage.setItem('mgm_jobs', JSON.stringify(gasJobs));
      return gasJobs;
    }
  } catch (error) {
    console.warn('Failed to fetch jobs from GAS, falling back to local storage:', error);
  }

  // Local storage fallback
  const stored = localStorage.getItem('mgm_jobs');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse mgm_jobs from localStorage', e);
    }
  }

  // Initial fallback if nothing in localStorage
  localStorage.setItem('mgm_jobs', JSON.stringify(INITIAL_JOBS));
  return INITIAL_JOBS;
}

export async function addJob(job: Job): Promise<boolean> {
  // 1. Add to local storage
  const currentJobs = await getJobs();
  currentJobs.push(job);
  localStorage.setItem('mgm_jobs', JSON.stringify(currentJobs));

  // 2. Sync to GAS Google Sheets
  try {
    const response = await fetch('/api/gas/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_job',
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        description: job.description,
        requirements: job.requirements
      })
    });
    const d = await response.json();
    return d.status === 'success';
  } catch (err) {
    console.error('Failed to sync job to Google Sheet', err);
    return false;
  }
}

export async function updateJob(job: Job): Promise<boolean> {
  // 1. Update in local storage
  const currentJobs = await getJobs();
  const updatedJobs = currentJobs.map((j: Job) => j.id === job.id ? job : j);
  localStorage.setItem('mgm_jobs', JSON.stringify(updatedJobs));

  // 2. Sync to GAS Google Sheets
  try {
    const response = await fetch('/api/gas/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'edit_job',
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        description: job.description,
        requirements: job.requirements
      })
    });
    const d = await response.json();
    return d.status === 'success';
  } catch (err) {
    console.error('Failed to sync job edit to Google Sheet', err);
    return false;
  }
}
