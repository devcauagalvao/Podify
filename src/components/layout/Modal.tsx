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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className={`absolute inset-0 bg-black/40 ${closing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}
        onClick={handleClose}
      />
      {/* Em mobile ocupa quase a tela toda (bottom sheet, max-h-[92vh]) com
          scroll interno só no corpo — cabeçalho fica fixo/visível. Em
          desktop volta a ser um card centralizado normal. */}
      <div
        className={`card relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-b-none sm:max-h-[85vh] sm:max-w-md sm:rounded-2xl ${closing ? 'animate-modal-panel-out' : 'animate-modal-panel-in'}`}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" />
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-ink-900">{title}</h2>
          <button
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
