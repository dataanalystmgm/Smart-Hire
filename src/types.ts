export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'applicant' | 'admin';
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: 'Applied' | 'Screening' | 'Testing' | 'Interview' | 'Offered' | 'Rejected';
  createdAt: string;
}
