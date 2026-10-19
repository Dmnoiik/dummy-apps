const DAY_MS = 24 * 60 * 60 * 1000

export type DueStatus = 'overdue' | 'today' | { inDays: number }

export function toLocalISODate(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

/** Local calendar date `offset` days from `base`, as YYYY-MM-DD. */
export function shiftDate(base: Date, offset: number): string {
  return toLocalISODate(new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset))
}

export function dueStatus(due: string, now: Date): DueStatus {
  const diff = new Date(due).getTime() - now.getTime()
  if (diff < 0) return 'overdue'
  if (due === toLocalISODate(now)) return 'today'
  return { inDays: Math.ceil(diff / DAY_MS) }
}

export function dueLabel(status: DueStatus): string {
  if (status === 'overdue') return 'Overdue'
  if (status === 'today') return 'Due today'
  return status.inDays === 1 ? 'Due in 1 day' : `Due in ${status.inDays} days`
}
