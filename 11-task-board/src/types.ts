export type Priority = 'low' | 'medium' | 'high'

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Card {
  id: string
  title: string
  description: string
  assignee: string
  priority: Priority
  due: string
  labels: string[]
  checklist: ChecklistItem[]
}

export interface Column {
  id: string
  name: string
  wip?: number
  cards: Card[]
}

export interface Board {
  columns: Column[]
}

export interface CardForm {
  title: string
  description: string
  assignee: string
  priority: Priority
  due: string
  labels: string
}

export interface Filters {
  assignee?: string
  label?: string
  query: string
}

export const PEOPLE = ['Ania', 'Bartek', 'Kasia']
export const LABELS = ['frontend', 'backend', 'design', 'docs', 'research']
