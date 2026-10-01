import { z } from 'zod'
import { statuses } from '@/types/application'
import { today } from '@/lib/utils'
import type { ApplicationInput } from '@/types/application'

const url = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol)
    } catch {
      return false
    }
  }, 'Enter a complete http:// or https:// URL')
const tags = z.array(z.string().trim().min(1).max(40)).max(30)
export const applicationFields = z.object({
  company: z.string().trim().min(1, 'companyRequired').max(100),
  position: z.string().trim().min(1, 'positionRequired').max(150),
  jobUrl: url,
  companyUrl: url,
  salaryMin: z.number().finite().nonnegative().nullable(),
  salaryMax: z.number().finite().nonnegative().nullable(),
  currency: z
    .string()
    .refine(
      (value) => ['USD', 'EUR', 'GBP', 'CAD', 'COP', 'AUD'].includes(value),
      'unsupportedCurrency',
    ),
  location: z.string().trim().max(120),
  remote: z.boolean(),
  status: z.enum(statuses),
  technologies: tags,
  missingTechnologies: tags,
  source: z.string().trim().max(100),
  notes: z.string().max(10000),
  appliedAt: z.string().date().or(z.literal('')),
})
const validSalary = (data: ApplicationInput) =>
  data.salaryMin === null || data.salaryMax === null || data.salaryMax >= data.salaryMin
const salaryError = { message: 'maxAtLeastMin', path: ['salaryMax'] }
export const applicationSchema = applicationFields.refine(validSalary, salaryError)
export const recordSchema = applicationFields
  .extend({
    id: z.string().uuid(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    statusHistory: z
      .array(
        z.object({
          id: z.string().uuid(),
          status: z.enum(statuses),
          occurredAt: z.string().datetime(),
        }),
      )
      .min(1),
    interviews: z.array(
      z.object({
        id: z.string().uuid(),
        type: z.enum(['recruiter', 'technical', 'behavioral', 'final', 'other']),
        scheduledAt: z.string().datetime(),
        completedAt: z.string().datetime().optional(),
        notes: z.string().max(10000).optional(),
      }),
    ),
  })
  .refine(validSalary, salaryError)
export function emptyApplication(): ApplicationInput {
  return {
    company: '',
    position: '',
    jobUrl: '',
    companyUrl: '',
    salaryMin: null,
    salaryMax: null,
    currency: 'USD',
    location: '',
    remote: false,
    status: 'saved',
    technologies: [],
    missingTechnologies: [],
    source: '',
    notes: '',
    appliedAt: today(),
  }
}
