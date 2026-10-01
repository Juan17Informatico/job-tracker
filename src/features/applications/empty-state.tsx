import { ArrowRight, BriefcaseBusiness, Check, Code2, MapPin, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
export function EmptyState({
  onAdd,
  onDemo,
  filtered,
  onReset,
}: {
  onAdd: () => void
  onDemo: () => void
  filtered: boolean
  onReset: () => void
}) {
  const { t } = useTranslation()
  if (filtered)
    return (
      <div className="empty-state filtered-empty">
        <span className="empty-small-icon">
          <BriefcaseBusiness size={28} />
        </span>
        <h2>{t('dashboard.noMatch')}</h2>
        <p>{t('dashboard.noMatchText')}</p>
        <Button variant="outline" onClick={onReset}>
          {t('dashboard.clearFilters')}
        </Button>
      </div>
    )
  return (
    <div className="empty-state">
      <div className="empty-art" aria-hidden="true">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="illustration-card card-back" />
        <div className="illustration-card card-front">
          <span className="illustration-company">
            <BriefcaseBusiness size={21} />
          </span>
          <div>
            <span className="skeleton-line long" />
            <span className="skeleton-line short" />
          </div>
          <span className="illustration-check">
            <Check size={13} />
          </span>
          <div className="illustration-tags">
            <span>React</span>
            <span>TypeScript</span>
            <span>+2</span>
          </div>
          <div className="illustration-location">
            <MapPin size={10} />
            {t('empty.illustrationRole')}
            <span />
          </div>
        </div>
        <span className="art-spark">
          <Sparkles size={21} />
        </span>
        <span className="art-code">
          <Code2 size={17} />
        </span>
        <span className="art-dot" />
      </div>
      <span className="eyebrow">{t('empty.eyebrow')}</span>
      <h2>{t('empty.title')}</h2>
      <p>{t('empty.text')}</p>
      <Button onClick={onAdd}>
        <Plus size={17} />
        {t('empty.addFirst')}
      </Button>
      <button className="text-link demo-link" onClick={onDemo}>
        {t('empty.demo')} <ArrowRight size={14} />
      </button>
      <div className="empty-features">
        <span>
          <Check size={13} />
          {t('empty.organized')}
        </span>
        <span>
          <Check size={13} />
          {t('empty.skills')}
        </span>
        <span>
          <Check size={13} />
          {t('empty.progress')}
        </span>
      </div>
    </div>
  )
}
