import { z } from 'zod'
import { recordSchema } from '@/features/applications/schema'
import type { BackupV1, JobApplication, Settings } from '@/types/application'

export const settingsSchema = z.object({ theme: z.enum(['light', 'dark', 'system']) })
export const backupSchema = z
  .object({
    version: z.literal(1),
    exportedAt: z.string().datetime(),
    applications: z.array(recordSchema).max(10000),
    settings: settingsSchema,
  })
  .refine(
    (data) => new Set(data.applications.map((a) => a.id)).size === data.applications.length,
    'The backup contains duplicate application IDs',
  )

// Future version migrations belong here, before validating the current format.
export function parseBackup(json: string): BackupV1 {
  const raw: unknown = JSON.parse(json)
  const version = z.object({ version: z.number() }).safeParse(raw)
  if (!version.success || version.data.version !== 1)
    throw new Error('Unsupported backup version. Please choose a version 1 Job Tracker file.')
  const result = backupSchema.safeParse(raw)
  if (!result.success)
    throw new Error(
      'This file contains invalid application data. Your current data has not been changed.',
    )
  return result.data
}
export function createBackup(applications: JobApplication[], settings: Settings): BackupV1 {
  return { version: 1, exportedAt: new Date().toISOString(), applications, settings }
}
export function downloadBackup(backup: BackupV1) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
  )
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `job-tracker-${backup.exportedAt.slice(0, 10)}.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
