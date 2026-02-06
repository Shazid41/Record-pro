
export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  gpa: number;
  department: string;
  email: string;
  status: 'Enrolled' | 'Graduated' | 'On Leave';
  enrollmentDate: string;
}

export type SortField = 'name' | 'rollNumber' | 'gpa' | 'enrollmentDate';
export type SortOrder = 'asc' | 'desc';

export interface PerformanceInsights {
  averageGpa: number;
  totalStudents: number;
  departmentDistribution: Record<string, number>;
  topPerformers: Student[];
  atRiskStudents: Student[];
  aiAnalysis: string;
}
