import { useRef, useState } from 'react'
import { Download, HardDrive, Monitor, Moon, Sun, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAppStore } from '@/store/use-app-store'
import { createBackup, downloadBackup, parseBackup } from '@/storage/backup'
import { STORAGE_KEY } from '@/storage/storage'
import type { BackupV1 } from '@/types/application'
export function SettingsPage() {
  const { applications, settings, storageError } = useAppStore()
  const input = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<BackupV1 | null>(null)
  const exportData = () => {
    downloadBackup(createBackup(applications, settings))
    toast.success('Backup downloaded')
  }
  const restore = () => {
    if (!pending) return
    try {
      useAppStore.getState().replaceData(pending)
      setPending(null)
      toast.success('Backup restored')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  const recover = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) throw new Error('No original data found on this device.')
      const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'job-tracker-recovery.json'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow heading-eyebrow">
            <span />
            MAKE YOURSELF AT HOME
          </div>
          <h1>
            Your workspace<span className="title-dot">.</span>
          </h1>
          <p>A few preferences. Everything under your control.</p>
        </div>
      </div>
      <div className="settings-sections">
        <section className="settings-section">
          <div>
            <h2>Appearance</h2>
            <p>Choose the view that feels right for you.</p>
          </div>
          <div className="appearance-options">
            {(
              [
                { value: 'light', Icon: Sun },
                { value: 'dark', Icon: Moon },
                { value: 'system', Icon: Monitor },
              ] as const
            ).map(({ value, Icon }) => (
              <button
                key={value}
                className={settings.theme === value ? 'selected' : ''}
                aria-pressed={settings.theme === value}
                onClick={() => {
                  try {
                    useAppStore.getState().setTheme(value)
                  } catch (e) {
                    toast.error((e as Error).message)
                  }
                }}
              >
                <Icon size={23} />
                <span>{value[0].toUpperCase() + value.slice(1)}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="settings-section">
          <div>
            <h2>Your data, yours to keep.</h2>
            <p>Export a backup or bring your opportunities to another browser.</p>
          </div>
          <div className="data-notice">
            <HardDrive size={23} />
            <div>
              <strong>Stored locally, on this device</strong>
              <p>
                Your {applications.length} opportunities stay in this browser. Export a backup
                regularly: clearing browser data removes your local records.
              </p>
            </div>
          </div>
          <div className="data-action">
            <div>
              <h3>Export your workspace</h3>
              <p>Applications and preferences in a versioned JSON file.</p>
            </div>
            <Button variant="outline" onClick={exportData} disabled={!!storageError}>
              <Download size={16} />
              Export JSON
            </Button>
          </div>
          {storageError && (
            <Button variant="outline" onClick={recover}>
              <Download size={16} />
              Download original stored data
            </Button>
          )}
          <div className="data-action">
            <div>
              <h3>Restore from a backup</h3>
              <p>Preview a validated file before replacing your workspace.</p>
            </div>
            <Button variant="outline" onClick={() => input.current?.click()}>
              <Upload size={16} />
              Import JSON
            </Button>
          </div>
          <input
            ref={input}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            aria-label="Import backup file"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              if (file.size > 10 * 1024 * 1024) {
                toast.error('Choose a backup smaller than 10 MB.')
                return
              }
              try {
                setPending(parseBackup(await file.text()))
              } catch (e) {
                toast.error(
                  e instanceof SyntaxError ? 'This file is not valid JSON.' : (e as Error).message,
                )
              }
            }}
          />
        </section>
      </div>
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        title="Restore this workspace?"
        description={`This backup contains ${pending?.applications.length ?? 0} opportunities. It will replace your current ${applications.length} opportunities and appearance preference. Export your current workspace first if you want to keep it.`}
        confirmLabel="Replace and restore"
        onConfirm={restore}
      />
    </>
  )
}
