import { ArrowRight, BriefcaseBusiness, Check, Code2, MapPin, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  if (filtered)
    return (
      <div className="empty-state filtered-empty">
        <span className="empty-small-icon">
          <BriefcaseBusiness size={28} />
        </span>
        <h2>No matching opportunities</h2>
        <p>Try another company, technology, or status.</p>
        <Button variant="outline" onClick={onReset}>
          Clear filters
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
            Your next great role
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
      <span className="eyebrow">GOOD THINGS START SOMEWHERE</span>
      <h2>Your next chapter starts here.</h2>
      <p>
        A place for every opportunity, from the first “what if”
        <br className="desktop-break" /> to the offer you’ve been waiting for.
      </p>
      <Button onClick={onAdd}>
        <Plus size={17} />
        Add your first opportunity
      </Button>
      <button className="text-link demo-link" onClick={onDemo}>
        Or take a look around with demo data <ArrowRight size={14} />
      </button>
      <div className="empty-features">
        <span>
          <Check size={13} />
          Keep your search organized
        </span>
        <span>
          <Check size={13} />
          Discover skills to grow
        </span>
        <span>
          <Check size={13} />
          See your progress
        </span>
      </div>
    </div>
  )
}
