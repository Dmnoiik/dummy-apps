import { useEffect, useState } from 'react'
import type { Board, Card, CardForm } from '../types'
import { createSeed } from '../data/seed'
import { uid } from '../lib/id'
import type { Notify } from './useToasts'

const STORAGE_KEY = 'taskline:v1'

function load(): Board {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.columns)) return parsed as Board
    }
  } catch {
    // fall through to the seed data
  }
  return createSeed()
}

export function parseLabels(text: string): string[] {
  return text
    .split(',')
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean)
}

function applyForm(card: Card, form: CardForm): Card {
  return {
    ...card,
    title: form.title.trim(),
    description: form.description.trim(),
    assignee: form.assignee,
    priority: form.priority,
    due: form.due,
    labels: parseLabels(form.labels),
  }
}

function relocate(
  columns: Board['columns'],
  cardId: string,
  toColumnId: string,
  targetId: string | null,
): Board['columns'] {
  const fromCol = columns.find((c) => c.cards.some((x) => x.id === cardId))
  const dest = columns.find((c) => c.id === toColumnId)
  if (!fromCol || !dest) return columns
  const moved = fromCol.cards.find((x) => x.id === cardId)!
  const from = fromCol.cards.indexOf(moved)

  let insertAt = dest.cards.filter((c) => c.id !== cardId).length
  if (targetId) {
    const to = dest.cards.findIndex((c) => c.id === targetId)
    insertAt = fromCol.id === dest.id && from < to ? to + 1 : to
  }

  return columns.map((col) => {
    let cards = col.cards
    if (col.id === fromCol.id) cards = cards.filter((c) => c.id !== cardId)
    if (col.id === dest.id) {
      cards = cards.slice()
      cards.splice(insertAt, 0, moved)
    }
    return { ...col, cards }
  })
}

export function useBoard(notify: Notify) {
  const [board, setBoard] = useState<Board>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
    } catch {
      // storage unavailable; keep working in memory
    }
  }, [board])

  const moveCard = (cardId: string, toColumnId: string, targetId: string | null) => {
    const source = board.columns.find((c) => c.cards.some((x) => x.id === cardId))
    const dest = board.columns.find((c) => c.id === toColumnId)
    if (!source || !dest) return
    if (source.id !== dest.id && dest.wip !== undefined && dest.cards.length > dest.wip) {
      notify(`WIP limit reached in ${dest.name}`)
      return
    }
    setBoard((prev) => ({ columns: relocate(prev.columns, cardId, toColumnId, targetId) }))
  }

  const removeCard = (cardId: string) => {
    const snapshot = board
    setBoard((prev) => ({
      columns: prev.columns.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== cardId) })),
    }))
    notify('Card deleted', {
      actionLabel: 'Undo',
      onAction: () => setBoard(snapshot),
      duration: 5000,
    })
  }

  const duplicateCard = (cardId: string) => {
    setBoard((prev) => ({
      columns: prev.columns.map((col) => {
        const index = col.cards.findIndex((c) => c.id === cardId)
        if (index === -1) return col
        const original = col.cards[index]
        const copy: Card = { ...original, id: uid(), title: `${original.title} (copy)` }
        const cards = col.cards.slice()
        cards.splice(index + 1, 0, copy)
        return { ...col, cards }
      }),
    }))
  }

  const toggleChecklistItem = (cardId: string, itemId: string) => {
    const target = board.columns.flatMap((c) => c.cards).find((c) => c.id === cardId)
    const item = target?.checklist.find((i) => i.id === itemId)
    if (!item) return
    item.done = !item.done
    setBoard((prev) => ({
      columns: prev.columns.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === cardId ? { ...c } : c)),
      })),
    }))
  }

  /** Updates an existing card, or adds it to the first column when it is new. */
  const saveCard = (id: string, form: CardForm) => {
    setBoard((prev) => {
      const exists = prev.columns.some((col) => col.cards.some((c) => c.id === id))
      if (exists) {
        return {
          columns: prev.columns.map((col) => ({
            ...col,
            cards: col.cards.map((c) => (c.id === id ? applyForm(c, form) : c)),
          })),
        }
      }
      const fresh = applyForm(
        { id, title: '', description: '', assignee: '', priority: 'medium', due: '', labels: [], checklist: [] },
        form,
      )
      return {
        columns: prev.columns.map((col, i) => (i === 0 ? { ...col, cards: [...col.cards, fresh] } : col)),
      }
    })
  }

  const resetDemo = () => {
    setBoard(createSeed())
    notify('Demo data restored')
  }

  return { board, moveCard, removeCard, duplicateCard, toggleChecklistItem, saveCard, resetDemo }
}
