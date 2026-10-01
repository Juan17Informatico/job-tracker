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
export type InterviewType = 'recruiter' | 'technical' | 'behavioral' | 'final' | 'other'
export interface ApplicationStatusEvent {
  id: string
  status: ApplicationStatus
  occurredAt: string
}
export interface InterviewEvent {
  id: string
  type: InterviewType
  scheduledAt: string
  completedAt?: string
  notes?: string
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
  statusHistory: ApplicationStatusEvent[]
  interviews: InterviewEvent[]
}
export type ApplicationInput = Omit<
  JobApplication,
  'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'interviews'
>
export interface Settings {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'es'
}
export interface BackupV1 {
  version: 1
  exportedAt: string
  applications: Array<Omit<JobApplication, 'statusHistory' | 'interviews'>>
  settings: Pick<Settings, 'theme'>
}
export interface BackupV2 {
  version: 2
  exportedAt: string
  applications: JobApplication[]
  settings: Settings
}
export type Backup = BackupV2
