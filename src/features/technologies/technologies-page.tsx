import { Code2, Plus, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/use-app-store'
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
  const applications = useAppStore((s) => s.applications)
  const stacks = [
    {
      title: 'On the radar',
      description: 'Technologies mentioned in your opportunities.',
      Icon: Code2,
      tags: countTags(applications.map((a) => a.technologies)),
    },
    {
      title: 'Room to grow',
      description: 'Skills you’ve marked as something to learn.',
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
            STAY CURIOUS
          </div>
          <h1>
            Your next skill<span className="title-dot">.</span>
          </h1>
          <p>Let your opportunities point you toward what to learn.</p>
        </div>
        <Button onClick={onAdd}>
          <Plus size={17} />
          Add opportunity
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
                {tags.map((t) => (
                  <div className="technology-row" key={t.name}>
                    <span className="tech-tag">{t.name}</span>
                    <span>
                      {t.count} {t.count === 1 ? 'opportunity' : 'opportunities'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="technology-empty">
                Add technology tags to an opportunity
                <br />
                and they’ll find a home here.
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  )
}
