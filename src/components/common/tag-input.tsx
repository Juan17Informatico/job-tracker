import { useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
interface Props {
  id: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder: string
}
export function TagInput({ id, value, onChange, placeholder }: Props) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')
  const add = () => {
    const next = [...value]
    for (const part of draft.split(',')) {
      const tag = part.trim().slice(0, 40)
      if (tag && !next.some((t) => t.toLowerCase() === tag.toLowerCase()) && next.length < 30)
        next.push(tag)
    }
    onChange(next)
    setDraft('')
  }
  return (
    <div className="tag-input">
      {value.map((tag) => (
        <span className="tech-tag" key={tag}>
          {tag}
          <button
            type="button"
            aria-label={t('common.remove', { item: tag })}
            onClick={() => onChange(value.filter((t) => t !== tag))}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        placeholder={placeholder}
        maxLength={200}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add()
          } else if (e.key === 'Backspace' && !draft) onChange(value.slice(0, -1))
        }}
      />
    </div>
  )
}
