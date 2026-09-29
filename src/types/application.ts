export const statuses = [
  'saved',
  'applied',
  'contacted',
  'interview',
  'technical_test',
  'rejected',
  'offer',
] as const
export type ApplicationStatus = (typeof statuses)[number]
export const statusLabels: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  contacted: 'Contacted',
  interview: 'Interview',
  technical_test: 'Technical test',
  rejected: 'Rejected',
  offer: 'Offer',
}
export interface JobApplication {
  id: string
  company: string
  position: string
  jobUrl: string
  companyUrl: string
  salaryMin: number | null
  salaryMax: number | null
  currency: string
  location: string
  remote: boolean
  status: ApplicationStatus
  technologies: string[]
  missingTechnologies: string[]
  source: string
  notes: string
  appliedAt: string
  createdAt: string
  updatedAt: string
}
export type ApplicationInput = Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>
export interface Settings {
  theme: 'light' | 'dark' | 'system'
}
export interface BackupV1 {
  version: 1
  exportedAt: string
  applications: JobApplication[]
  settings: Settings
}
