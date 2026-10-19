import type { Action } from 'svelte/action'

export interface SlotOptions {
  disabled: boolean
  onSelect: () => void
}

export const slotInteraction: Action<HTMLElement, SlotOptions> = (node, options) => {
  let current = options

  const handleClick = () => {
    if (!current.disabled) current.onSelect()
  }
  node.addEventListener('click', handleClick)

  return {
    update(next) {
      current = next
    },
    destroy() {
      node.removeEventListener('click', handleClick)
    },
  }
}
