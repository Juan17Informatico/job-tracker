import { z } from 'zod'
import { applicationFields, recordSchema } from '@/features/applications/schema'
import { i18n } from '@/i18n'
import type {
  ApplicationStatus,
  Backup,
  BackupV1,
  BackupV2,
  JobApplication,
  Settings,
} from '@/types/application'

export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.enum(['en', 'es']).default('en'),
})
const legacyRecordSchema = applicationFields.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
const uniqueIds = <T extends { id: string }>(data: { applications: T[] }) =>
  new Set(data.applications.map((a) => a.id)).size === data.applications.length
const v1Schema = z
  .object({
    version: z.literal(1),
    exportedAt: z.string().datetime(),
    applications: z.array(legacyRecordSchema).max(10000),
    settings: z.object({ theme: z.enum(['light', 'dark', 'system']) }).default({ theme: 'system' }),
  })
  .refine(uniqueIds, 'The backup contains duplicate application IDs')
export const backupSchema = z
  .object({
    version: z.literal(2),
    exportedAt: z.string().datetime(),
    applications: z.array(recordSchema).max(10000),
    settings: settingsSchema,
  })
  .refine(uniqueIds, 'The backup contains duplicate application IDs')

export function initialStatusEvent(
  status: ApplicationStatus,
  appliedAt: string,
  createdAt: string,
  id: string = crypto.randomUUID(),
) {
  return {
    id,
    status,
    occurredAt: appliedAt ? `${appliedAt}T12:00:00.000Z` : createdAt,
  }
}
export function migrateV1(input: BackupV1, language: Settings['language'] = 'en'): BackupV2 {
  return {
    version: 2,
    exportedAt: input.exportedAt,
    settings: { theme: input.settings.theme, language },
    applications: input.applications.map((application) => ({
      ...application,
      statusHistory: [
        initialStatusEvent(
          application.status,
          application.appliedAt,
          application.createdAt,
          application.id,
        ),
      ],
      interviews: [],
    })),
  }
}

// The migration boundary keeps future version changes isolated and deterministic.
export function parseBackup(json: string): Backup {
  const raw: unknown = JSON.parse(json)
  const version = z.object({ version: z.number() }).safeParse(raw)
  if (!version.success || ![1, 2].includes(version.data.version))
    throw new Error(i18n.t('backupUnsupported'))
  const normalized =
    version.data.version === 2 && raw && typeof raw === 'object'
      ? {
          ...(raw as Record<string, unknown>),
          settings: {
            theme: (raw as { settings?: { theme?: string } }).settings?.theme ?? 'system',
            language: (raw as { settings?: { language?: string } }).settings?.language ?? 'en',
          },
          applications: Array.isArray((raw as { applications?: unknown }).applications)
            ? (raw as { applications: Array<Record<string, unknown>> }).applications.map(
                (application) => ({
                  ...application,
                  statusHistory: application.statusHistory ?? [
                    initialStatusEvent(
                      application.status as ApplicationStatus,
                      application.appliedAt as string,
                      application.createdAt as string,
                      application.id as string,
                    ),
                  ],
                  interviews: application.interviews ?? [],
                }),
              )
            : (raw as { applications?: unknown }).applications,
        }
      : raw
  const language =
    typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('es')
      ? 'es'
      : 'en'
  if (version.data.version === 1) {
    const result = v1Schema.safeParse(raw)
    if (!result.success) throw new Error(i18n.t('backupInvalid'))
    return migrateV1(result.data, language)
  }
  const result = backupSchema.safeParse(normalized)
  if (!result.success) throw new Error(i18n.t('backupInvalid'))
  return result.data
}
export function createBackup(
  applications: JobApplication[],
  settings: Pick<Settings, 'theme'> & Partial<Pick<Settings, 'language'>>,
): BackupV2 {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    applications: applications.map((application) => ({
      ...application,
      statusHistory: application.statusHistory?.length
        ? application.statusHistory
        : [
            initialStatusEvent(
              application.status,
              application.appliedAt,
              application.createdAt,
              application.id,
            ),
          ],
      interviews: application.interviews ?? [],
    })),
    settings: { theme: settings.theme, language: settings.language ?? 'en' },
  }
}
export function downloadBackup(backup: Backup) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
  )
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `job-tracker-${backup.exportedAt.slice(0, 10)}.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
