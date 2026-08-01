import { useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

const CLOSE_ANIMATION_MS = 150

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const [closing, setClosing] = useState(false)

  function handleClose() {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, CLOSE_ANIMATION_MS)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black/40 ${closing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}
        onClick={handleClose}
      />
      <div
        className={`card relative w-full max-w-md p-6 ${closing ? 'animate-modal-panel-out' : 'animate-modal-panel-in'}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">{title}</h2>
          <button onClick={handleClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
