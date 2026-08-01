import { useRef, useState, useEffect } from 'react'
import { Undo2, Trash2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Point = { x: number; y: number }

function midPoint(p1: Point, p2: Point): Point {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
}

function drawStroke(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length === 0) return
  if (points.length < 3) {
    const p = points[0]
    ctx.beginPath()
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2)
    ctx.fillStyle = ctx.strokeStyle as string
    ctx.fill()
    return
  }
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length - 1; i++) {
    const mid = midPoint(points[i], points[i + 1])
    ctx.quadraticCurveTo(points[i].x, points[i].y, mid.x, mid.y)
  }
  ctx.stroke()
}

export function SignaturePad({
  ownerId,
  anamneseId,
  tipo,
  onSaved,
}: {
  ownerId: string
  anamneseId: string
  tipo: 'paciente' | 'profissional'
  onSaved: (url: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Point[][]>([])
  const currentStrokeRef = useRef<Point[]>([])
  const drawingRef = useRef(false)
  const [hasDrawing, setHasDrawing] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0f1b2d'
  }, [])

  function getCtx() {
    return canvasRef.current!.getContext('2d')!
  }

  function getPos(e: React.MouseEvent | React.TouchEvent): Point {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const point = 'touches' in e ? e.touches[0] : e
    return { x: point.clientX - rect.left, y: point.clientY - rect.top }
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    drawingRef.current = true
    setHasDrawing(true)
    setError(null)
    currentStrokeRef.current = [getPos(e)]
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawingRef.current) return
    e.preventDefault()
    const points = currentStrokeRef.current
    points.push(getPos(e))
    if (points.length >= 3) {
      const ctx = getCtx()
      const n = points.length
      const mid = midPoint(points[n - 2], points[n - 1])
      const prevMid = midPoint(points[n - 3], points[n - 2])
      ctx.beginPath()
      ctx.moveTo(prevMid.x, prevMid.y)
      ctx.quadraticCurveTo(points[n - 2].x, points[n - 2].y, mid.x, mid.y)
      ctx.stroke()
    }
  }

  function end() {
    if (!drawingRef.current) return
    drawingRef.current = false
    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push(currentStrokeRef.current)
    }
    currentStrokeRef.current = []
    setStrokeCount(strokesRef.current.length)
  }

  function redrawAll() {
    const canvas = canvasRef.current!
    const ctx = getCtx()
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke)
    }
  }

  function desfazer() {
    strokesRef.current.pop()
    redrawAll()
    setHasDrawing(strokesRef.current.length > 0)
    setStrokeCount(strokesRef.current.length)
    setError(null)
  }

  function limpar() {
    strokesRef.current = []
    currentStrokeRef.current = []
    redrawAll()
    setHasDrawing(false)
    setStrokeCount(0)
    setError(null)
  }

  async function salvar() {
    if (!hasDrawing || uploading) return
    setUploading(true)
    setError(null)

    const canvas = canvasRef.current!
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) {
      setUploading(false)
      setError('Não foi possível gerar a imagem da assinatura. Tente novamente.')
      return
    }

    const path = `${ownerId}/${anamneseId}/${tipo}.png`
    const { error: uploadError } = await supabase.storage
      .from('assinaturas')
      .upload(path, blob, { upsert: true, contentType: 'image/png' })

    if (uploadError) {
      setUploading(false)
      setError(`Falha ao salvar assinatura: ${uploadError.message}. Tente novamente antes de continuar.`)
      return
    }

    const { data } = supabase.storage.from('assinaturas').getPublicUrl(path)
    setUploading(false)
    onSaved(`${data.publicUrl}?t=${Date.now()}`)
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="h-32 w-full touch-none rounded-xl border border-dashed border-slate-300 bg-white"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={salvar}
          disabled={!hasDrawing || uploading}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <Check size={14} /> {uploading ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={desfazer}
          disabled={strokeCount === 0 || uploading}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
        >
          <Undo2 size={14} /> Desfazer
        </button>
        <button
          type="button"
          onClick={limpar}
          disabled={!hasDrawing || uploading}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
        >
          <Trash2 size={14} /> Limpar
        </button>
      </div>
    </div>
  )
}
