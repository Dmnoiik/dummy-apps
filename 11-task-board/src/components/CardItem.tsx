import { useState } from 'react'
import type { DragEvent } from 'react'
import type { Card } from '../types'
import { dueLabel, dueStatus } from '../lib/dates'

interface Props {
  card: Card
  showDue: boolean
  dragging: boolean
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleItem: (itemId: string) => void
  onDragStart: (e: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
  onDropOn: (e: DragEvent<HTMLElement>) => void
}

export default function CardItem({
  card,
  showDue,
  dragging,
  onOpen,
  onDuplicate,
  onDelete,
  onToggleItem,
  onDragStart,
  onDragEnd,
  onDropOn,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const doneCount = card.checklist.filter((i) => i.done).length
  const status = card.due && showDue ? dueStatus(card.due, new Date()) : null
  const statusClass =
    status === 'overdue' ? 'badge-overdue' : status === 'today' ? 'badge-today' : 'badge-soon'

  return (
    <article
      className={`card${dragging ? ' card-dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropOn}
    >
      <div className="card-head">
        <h3 className="card-title">
          <button type="button" className="title-btn" onClick={onOpen}>
            {card.title}
          </button>
        </h3>
        <span className={`priority priority-${card.priority}`}>{card.priority}</span>
      </div>

      {card.description && <p className="card-desc">{card.description}</p>}

      <div className="card-meta">
        {card.labels.map((l) => (
          <span key={l} className="label">
            {l}
          </span>
        ))}
        {status && <span className={`badge ${statusClass}`}>{dueLabel(status)}</span>}
        {card.checklist.length > 0 && (
          <span className="progress">
            {doneCount}/{card.checklist.length}
          </span>
        )}
        {card.assignee && (
          <span className="avatar" title={card.assignee}>
            {card.assignee.slice(0, 1)}
          </span>
        )}
      </div>

      <div className="card-actions">
        <button type="button" className="link-btn" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Hide checklist' : 'Show checklist'}
        </button>
        <button type="button" className="link-btn" onClick={onDuplicate}>
          Duplicate
        </button>
        <button
          type="button"
          className="link-btn link-danger"
          aria-label={`Delete ${card.title}`}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>

      {expanded && (
        <div className="checklist" role="group" aria-label="Checklist">
          {card.checklist.length === 0 && <p className="checklist-empty">No checklist items yet.</p>}
          {card.checklist.map((item) => (
            <label key={item.id} className="check-item">
              <input type="checkbox" checked={item.done} onChange={() => onToggleItem(item.id)} />
              <span className={item.done ? 'check-done' : undefined}>{item.text}</span>
            </label>
          ))}
        </div>
      )}
    </article>
  )
}
