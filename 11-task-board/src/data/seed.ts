import type { Board, Card, ChecklistItem, Priority } from '../types'
import { uid } from '../lib/id'
import { shiftDate } from '../lib/dates'

function items(...texts: string[]): ChecklistItem[] {
  return texts.map((text) => ({ id: uid(), text, done: false }))
}

function card(
  title: string,
  assignee: string,
  labels: string[],
  priority: Priority,
  due: string,
  extra: Partial<Card> = {},
): Card {
  return { id: uid(), title, description: '', assignee, priority, due, labels, checklist: [], ...extra }
}

export function createSeed(now: Date = new Date()): Board {
  const day = (offset: number) => shiftDate(now, offset)
  return {
    columns: [
      {
        id: 'backlog',
        name: 'Backlog',
        cards: [
          card('Research competitor boards', 'Kasia', ['research'], 'low', '', {
            description: 'Compare how three other tools handle swimlanes and WIP limits.',
          }),
          card('Plan Q4 roadmap', 'Ania', ['docs'], 'medium', day(14)),
          card('Export board to CSV', '', ['backend'], 'low', ''),
        ],
      },
      {
        id: 'todo',
        name: 'To Do',
        cards: [
          card('Set up CI pipeline', 'Bartek', ['backend'], 'high', day(5), {
            description: 'Run type checks and the build on every push.',
            checklist: items('Add workflow file', 'Cache dependencies', 'Publish build artifact'),
          }),
          card('Login page', 'Ania', ['frontend'], 'high', day(0), {
            description: 'Email and password form with inline validation.',
          }),
          card('Write onboarding copy', 'Kasia', ['design'], 'medium', day(9), {
            description: 'Three short steps shown to first-time users.',
            checklist: items('Draft welcome message', 'Review tone with the team'),
          }),
          card('Fix navbar overlap', 'Bartek', ['frontend'], 'medium', ''),
        ],
      },
      {
        id: 'in-progress',
        name: 'In Progress',
        wip: 3,
        cards: [
          card('Design settings screen', 'Kasia', ['design'], 'high', day(3)),
          card('Write API docs', 'Ania', ['docs'], 'medium', day(7)),
        ],
      },
      {
        id: 'review',
        name: 'Review',
        wip: 4,
        cards: [
          card('Audit accessibility', 'Ania', ['research'], 'medium', day(-2)),
          card('Pricing page copy', 'Kasia', ['design'], 'low', day(2)),
        ],
      },
      {
        id: 'done',
        name: 'Done',
        cards: [
          card('Kick-off meeting', 'Ania', ['docs'], 'low', ''),
          card('Pick tech stack', 'Kasia', ['research'], 'medium', ''),
        ],
      },
    ],
  }
}
