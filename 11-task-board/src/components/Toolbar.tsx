import { LABELS, PEOPLE } from '../types'
import type { Filters } from '../types'

interface Props {
  filters: Filters
  onChange: (next: Filters) => void
  onAddCard: () => void
  onReset: () => void
}

export default function Toolbar({ filters, onChange, onAddCard, onReset }: Props) {
  return (
    <div className="toolbar">
      <label className="field field-search">
        <span className="field-label">Search cards</span>
        <input
          type="search"
          value={filters.query}
          placeholder="Search by title"
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field-label">Assignee</span>
        <select
          value={filters.assignee ?? ''}
          onChange={(e) => onChange({ ...filters, assignee: e.target.value || undefined })}
        >
          <option value="">Everyone</option>
          {PEOPLE.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Label</span>
        <select
          value={filters.label ?? ''}
          onChange={(e) => onChange({ ...filters, label: e.target.value || undefined })}
        >
          <option value="">All labels</option>
          {LABELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <div className="toolbar-actions">
        <button type="button" className="btn btn-primary" onClick={onAddCard}>
          Add card
        </button>
        <button type="button" className="btn btn-ghost" onClick={onReset}>
          Reset demo data
        </button>
      </div>
    </div>
  )
}
