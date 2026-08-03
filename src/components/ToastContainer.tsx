import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useToastStore, type Toast } from '@/store/toastStore'

const STYLES: Record<Toast['type'], { wrap: string; icon: JSX.Element }> = {
  error: {
    wrap: 'border-rose-200 bg-rose-50 text-rose-700',
    icon: <AlertTriangle size={18} className="shrink-0 text-rose-500" />,
  },
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />,
  },
  info: {
    wrap: 'border-slate-200 bg-white text-ink-900',
    icon: <Info size={18} className="shrink-0 text-slate-400" />,
  },
}

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const s = STYLES[t.type]
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${s.wrap}`}
          >
            {s.icon}
            <p className="flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="-m-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg opacity-60 hover:bg-black/5 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
