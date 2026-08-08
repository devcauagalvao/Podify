import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

export function PhotoLightbox({
  url,
  filename,
  onClose,
}: {
  url: string
  filename: string
  onClose: () => void
}) {
  const [baixando, setBaixando] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function baixar() {
    setBaixando(true)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(url, '_blank')
    } finally {
      setBaixando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        title="Fechar"
      >
        <X size={20} />
      </button>
      <img
        src={url}
        alt="Foto do atendimento"
        className="max-h-[75vh] max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={(e) => {
          e.stopPropagation()
          baixar()
        }}
        disabled={baixando}
        className="absolute bottom-6 flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 shadow-lg hover:bg-slate-100 disabled:opacity-60"
      >
        <Download size={16} /> {baixando ? 'Baixando...' : 'Baixar'}
      </button>
    </div>
  )
}
