import { useState } from 'react'
import type { DragEvent } from 'react'
import type { Board as BoardModel, Card, Filters } from '../types'
import { matchesFilters } from '../lib/filters'
import Column from './Column'

interface Props {
  board: BoardModel
  filters: Filters
  onOpen: (card: Card) => void
  onMove: (cardId: string, columnId: string, targetId: string | null) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onToggleItem: (cardId: string, itemId: string) => void
}

export default function Board({
  board,
  filters,
  onOpen,
  onMove,
  onDuplicate,
  onDelete,
  onToggleItem,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const handleDrop = (columnId: string, targetId: string | null, e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    const id = draggingId ?? e.dataTransfer.getData('text/plain')
    setDraggingId(null)
    if (id) onMove(id, columnId, targetId)
  }

  return (
    <div className="board">
      {board.columns.map((column, i) => (
        <Column
          key={column.id}
          column={column}
          cards={column.cards.filter((c) => matchesFilters(c, filters))}
          isLast={i === board.columns.length - 1}
          draggingId={draggingId}
          onOpen={onOpen}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onToggleItem={onToggleItem}
          onDragStart={setDraggingId}
          onDragEnd={() => setDraggingId(null)}
          onDrop={handleDrop}
        />
      ))}
    </div>
  )
}
