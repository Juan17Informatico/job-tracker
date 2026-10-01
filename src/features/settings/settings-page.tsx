import { useRef, useState } from 'react'
import { Download, HardDrive, Monitor, Moon, Sun, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAppStore } from '@/store/use-app-store'
import { useLanguage } from '@/hooks/use-language'
import { createBackup, downloadBackup, parseBackup } from '@/storage/backup'
import { STORAGE_KEY } from '@/storage/storage'
import type { Backup } from '@/types/application'

export function SettingsPage() {
  const { t } = useTranslation()
  const { language, changeLanguage } = useLanguage()
  const { applications, settings, storageError } = useAppStore()
  const input = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Backup | null>(null)
  const exportData = () => {
    downloadBackup(createBackup(applications, settings))
    toast.success(t('settings.backupDownloaded'))
  }
  const restore = () => {
    if (!pending) return
    try {
      useAppStore.getState().replaceData(pending)
      setPending(null)
      toast.success(t('settings.backupRestored'))
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  const recover = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) throw new Error(t('settings.noOriginal'))
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
  const appearance = [
    { value: 'light' as const, Icon: Sun },
    { value: 'dark' as const, Icon: Moon },
    { value: 'system' as const, Icon: Monitor },
  ]
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow heading-eyebrow">
            <span />
            {t('settings.eyebrow')}
          </div>
          <h1>
            {t('settings.title')}
            <span className="title-dot">.</span>
          </h1>
          <p>{t('settings.subtitle')}</p>
        </div>
      </div>
      <div className="settings-sections">
        <section className="settings-section">
          <div>
            <h2>{t('settings.appearanceTitle')}</h2>
            <p>{t('settings.appearanceText')}</p>
          </div>
          <div className="appearance-options">
            {appearance.map(({ value, Icon }) => (
              <button
                key={value}
                className={settings.theme === value ? 'selected' : ''}
                aria-label={t(`settings.${value}Theme`)}
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
                <span>{t(`settings.${value}`)}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="settings-section language-setting">
          <div>
            <h2>{t('settings.languageTitle')}</h2>
            <p>{t('settings.languageText')}</p>
          </div>
          <div className="language-options">
            <button
              className={language === 'en' ? 'selected' : ''}
              aria-pressed={language === 'en'}
              onClick={() => changeLanguage('en')}
            >
              {t('common.english')}
            </button>
            <button
              className={language === 'es' ? 'selected' : ''}
              aria-pressed={language === 'es'}
              onClick={() => changeLanguage('es')}
            >
              {t('common.spanish')}
            </button>
          </div>
        </section>
        <section className="settings-section">
          <div>
            <h2>{t('settings.dataTitle')}</h2>
            <p>{t('settings.dataText')}</p>
          </div>
          <div className="data-notice">
            <HardDrive size={23} />
            <div>
              <strong>{t('settings.storedTitle')}</strong>
              <p>{t('settings.storedText', { count: applications.length })}</p>
            </div>
          </div>
          <div className="data-action">
            <div>
              <h3>{t('settings.exportTitle')}</h3>
              <p>{t('settings.exportText')}</p>
            </div>
            <Button variant="outline" onClick={exportData} disabled={!!storageError}>
              <Download size={16} />
              {t('settings.export')}
            </Button>
          </div>
          {storageError && (
            <Button variant="outline" onClick={recover}>
              <Download size={16} />
              {t('settings.recover')}
            </Button>
          )}
          <div className="data-action">
            <div>
              <h3>{t('settings.restoreTitle')}</h3>
              <p>{t('settings.restoreText')}</p>
            </div>
            <Button variant="outline" onClick={() => input.current?.click()}>
              <Upload size={16} />
              {t('settings.import')}
            </Button>
          </div>
          <input
            ref={input}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            aria-label={t('settings.import')}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              if (file.size > 10 * 1024 * 1024) {
                toast.error(t('settings.importSize'))
                return
              }
              try {
                setPending(parseBackup(await file.text()))
              } catch (error) {
                toast.error(
                  error instanceof SyntaxError ? t('invalidJson') : (error as Error).message,
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
        title={t('settings.restoreTitle')}
        description={`${pending?.applications.length ?? 0} ${t('common.opportunities')}.`}
        confirmLabel={t('settings.backupRestored')}
        onConfirm={restore}
      />
    </>
  )
}
