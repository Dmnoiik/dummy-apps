import type { ToastItem } from '../store/useToasts'

interface Props {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export default function Toast({ toasts, onDismiss }: Props) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className="toast" role="status">
          <span>{t.message}</span>
          {t.actionLabel && (
            <button
              type="button"
              className="toast-action"
              onClick={() => {
                t.onAction?.()
                onDismiss(t.id)
              }}
            >
              {t.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
