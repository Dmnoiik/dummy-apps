import { useEffect, useRef, useState } from 'react'
import type { Card, CardForm, Priority } from '../types'
import { PEOPLE } from '../types'

interface Props {
  card: Card
  isNew: boolean
  onSave: (id: string, form: CardForm) => void
  onClose: () => void
}

function toForm(card: Card): CardForm {
  return {
    title: card.title,
    description: card.description,
    assignee: card.assignee,
    priority: card.priority,
    due: card.due,
    labels: card.labels.join(', '),
  }
}

export default function CardModal({ card, isNew, onSave, onClose }: Props) {
  const [form, setForm] = useState<CardForm>(() => toForm(card))
  const [error, setError] = useState('')
  const formRef = useRef(form)
  formRef.current = form

  const submit = () => {
    if (!formRef.current.title.trim()) {
      setError('Title is required')
      return
    }
    onSave(card.id, formRef.current)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        submit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
  }, [])

  const set = <K extends keyof CardForm>(key: K, value: CardForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'New card' : 'Edit card'}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose()
        }}
      >
        <h2 className="modal-title">{isNew ? 'New card' : 'Card details'}</h2>
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <label className="field">
            <span className="field-label">Title</span>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => {
                set('title', e.target.value)
                setError('')
              }}
            />
            {error && <span className="field-error">{error}</span>}
          </label>
          <label className="field">
            <span className="field-label">Description</span>
            <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </label>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Assignee</span>
              <select value={form.assignee} onChange={(e) => set('assignee', e.target.value)}>
                <option value="">Unassigned</option>
                {PEOPLE.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Priority</span>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Due date</span>
              <input type="date" value={form.due} onChange={(e) => set('due', e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">Labels</span>
              <input
                value={form.labels}
                placeholder="frontend, design"
                onChange={(e) => set('labels', e.target.value)}
              />
            </label>
          </div>
          <div className="modal-actions">
            <span className="hint">Ctrl+S to save</span>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
