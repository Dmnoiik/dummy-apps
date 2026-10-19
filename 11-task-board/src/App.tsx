import { useState } from 'react'
import type { Card, CardForm, Filters } from './types'
import { uid } from './lib/id'
import { useBoard } from './store/useBoard'
import { useToasts } from './store/useToasts'
import Toolbar from './components/Toolbar'
import Board from './components/Board'
import CardModal from './components/CardModal'
import Toast from './components/Toast'

interface Editing {
  card: Card
  isNew: boolean
}

function blankCard(): Card {
  return {
    id: uid(),
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    due: '',
    labels: [],
    checklist: [],
  }
}

export default function App() {
  const { toasts, notify, dismiss } = useToasts()
  const { board, moveCard, removeCard, duplicateCard, toggleChecklistItem, saveCard, resetDemo } =
    useBoard(notify)
  const [filters, setFilters] = useState<Filters>({ query: '' })
  const [editing, setEditing] = useState<Editing | null>(null)

  const handleSave = (id: string, form: CardForm) => {
    saveCard(id, form)
    notify('Saved')
    setEditing(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <h1>Taskline</h1>
        </div>
        <p className="tagline">Plan the work, move the cards.</p>
      </header>

      <Toolbar
        filters={filters}
        onChange={setFilters}
        onAddCard={() => setEditing({ card: blankCard(), isNew: true })}
        onReset={resetDemo}
      />

      <main>
        <Board
          board={board}
          filters={filters}
          onOpen={(card) => setEditing({ card, isNew: false })}
          onMove={moveCard}
          onDuplicate={duplicateCard}
          onDelete={removeCard}
          onToggleItem={toggleChecklistItem}
        />
      </main>

      {editing && (
        <CardModal
          card={editing.card}
          isNew={editing.isNew}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
