import type { Card, Filters } from '../types'

export function matchesFilters(card: Card, f: Filters): boolean {
  const filtering = f.assignee || f.label
  const hit =
    (f.assignee && card.assignee === f.assignee) || (f.label && card.labels.includes(f.label))
  if (filtering && !hit) return false

  const query = f.query.trim()
  if (query && !card.title.includes(query)) return false
  return true
}
