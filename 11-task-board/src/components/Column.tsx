import { useState } from 'react'
import type { DragEvent } from 'react'
import type { Card, Column as ColumnModel } from '../types'
import CardItem from './CardItem'

interface Props {
  column: ColumnModel
  cards: Card[]
  isLast: boolean
  draggingId: string | null
  onOpen: (card: Card) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onToggleItem: (cardId: string, itemId: string) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDrop: (columnId: string, targetId: string | null, e: DragEvent<HTMLElement>) => void
}

export default function Column({
  column,
  cards,
  isLast,
  draggingId,
  onOpen,
  onDuplicate,
  onDelete,
  onToggleItem,
  onDragStart,
  onDragEnd,
  onDrop,
}: Props) {
  const [over, setOver] = useState(false)
  const total = column.cards.length
  const atLimit = column.wip !== undefined && total >= column.wip

  return (
    <section
      className={`column${over ? ' column-over' : ''}`}
      aria-label={column.name}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
      }}
      onDrop={(e) => {
        setOver(false)
        onDrop(column.id, null, e)
      }}
    >
      <header className="column-head">
        <h2>{column.name}</h2>
        <span className={`count${atLimit ? ' count-full' : ''}`}>
          {column.wip !== undefined ? `${total}/${column.wip}` : total}
        </span>
      </header>
      <div className="column-body">
        {cards.map((card, index) => (
          <CardItem
            key={index}
            card={card}
            showDue={!isLast}
            dragging={draggingId === card.id}
            onOpen={() => onOpen(card)}
            onDuplicate={() => onDuplicate(card.id)}
            onDelete={() => onDelete(card.id)}
            onToggleItem={(itemId) => onToggleItem(card.id, itemId)}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', card.id)
              onDragStart(card.id)
            }}
            onDragEnd={onDragEnd}
            onDropOn={(e) => {
              e.stopPropagation()
              setOver(false)
              onDrop(column.id, card.id, e)
            }}
          />
        ))}
        {cards.length === 0 && <p className="column-empty">Drop cards here</p>}
      </div>
    </section>
  )
}
