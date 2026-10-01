import { Code2, Plus, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/use-app-store'
import { useTranslation } from 'react-i18next'
function countTags(groups: string[][]) {
  const counts = new Map<string, { name: string; count: number }>()
  for (const group of groups)
    for (const key of new Set(group.map((t) => t.toLowerCase()))) {
      const previous = counts.get(key)
      counts.set(key, {
        name: previous?.name ?? group.find((t) => t.toLowerCase() === key) ?? key,
        count: (previous?.count ?? 0) + 1,
      })
    }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
export function TechnologiesPage({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation()
  const applications = useAppStore((s) => s.applications)
  const stacks = [
    {
      title: t('technologies.radar'),
      description: t('technologies.radarDescription'),
      Icon: Code2,
      tags: countTags(applications.map((a) => a.technologies)),
    },
    {
      title: t('technologies.grow'),
      description: t('technologies.growDescription'),
      Icon: Sprout,
      tags: countTags(applications.map((a) => a.missingTechnologies)),
    },
  ]
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow heading-eyebrow">
            <span />
            {t('technologies.eyebrow')}
          </div>
          <h1>
            {t('technologies.title')}
            <span className="title-dot">.</span>
          </h1>
          <p>{t('technologies.subtitle')}</p>
        </div>
        <Button onClick={onAdd}>
          <Plus size={17} />
          {t('technologies.add')}
        </Button>
      </div>
      <div className="technology-grid">
        {stacks.map(({ title, description, Icon, tags }) => (
          <section className="technology-panel" key={title}>
            <Icon size={25} />
            <h2>{title}</h2>
            <p>{description}</p>
            {tags.length ? (
              <div className="technology-rows">
                {tags.map((tag) => (
                  <div className="technology-row" key={tag.name}>
                    <span className="tech-tag">{tag.name}</span>
                    <span>
                      {tag.count}{' '}
                      {tag.count === 1 ? t('common.opportunity') : t('common.opportunities')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="technology-empty">{t('technologies.empty')}</div>
            )}
          </section>
        ))}
      </div>
    </>
  )
}
