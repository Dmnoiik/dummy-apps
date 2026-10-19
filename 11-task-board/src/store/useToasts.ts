import { useCallback, useState } from 'react'
import { uid } from '../lib/id'

export interface ToastItem {
  id: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export interface NotifyOptions {
  actionLabel?: string
  onAction?: () => void
  duration?: number
}

export type Notify = (message: string, options?: NotifyOptions) => void

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const notify: Notify = useCallback(
    (message, options = {}) => {
      const id = uid()
      setToasts((list) => [
        ...list,
        { id, message, actionLabel: options.actionLabel, onAction: options.onAction },
      ])
      window.setTimeout(() => dismiss(id), options.duration ?? 3000)
    },
    [dismiss],
  )

  return { toasts, notify, dismiss }
}
