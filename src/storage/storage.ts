import type { BackupV1 } from '@/types/application'
import { parseBackup } from './backup'

export const STORAGE_KEY = 'job-tracker:v1'
export interface StorageService {
  load(): BackupV1 | null
  save(data: BackupV1): void
}
export const localStorageService: StorageService = {
  load() {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? parseBackup(saved) : null
  },
  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      throw new Error(
        'Could not save on this device. Check browser storage permissions or available space, then try again.',
      )
    }
  },
}
