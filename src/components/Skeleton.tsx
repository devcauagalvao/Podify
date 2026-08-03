import { clsx } from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-lg bg-slate-200/70', className)} />
}

export function SkeletonListRow({
  avatar = true,
  trailing = 'text',
}: {
  avatar?: boolean
  trailing?: 'text' | 'icon' | false
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {avatar && <Skeleton className="h-10 w-10 shrink-0 rounded-full" />}
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      {trailing === 'text' && <Skeleton className="h-3.5 w-16 shrink-0" />}
      {trailing === 'icon' && <Skeleton className="h-4 w-4 shrink-0 rounded" />}
    </div>
  )
}

export function SkeletonList({
  rows = 5,
  avatar = true,
  trailing = 'text',
}: {
  rows?: number
  avatar?: boolean
  trailing?: 'text' | 'icon' | false
}) {
  return (
    <div className="card divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonListRow key={i} avatar={avatar} trailing={trailing} />
      ))}
    </div>
  )
}

export function SkeletonStatCards({
  count = 3,
  className = 'grid-cols-1 gap-4 sm:grid-cols-3',
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={clsx('grid', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3 p-5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="w-full space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Placeholder de um bloco de seção do formulário de Anamnese: cabeçalho +
 * grid de rótulo/campo, no mesmo formato do componente `Section` real. */
export function SkeletonSection({ fields = 6 }: { fields?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="bg-slate-100 px-5 py-2.5">
        <Skeleton className="h-3 w-40 bg-slate-300/70" />
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Skeleton do calendário mensal da Agenda: navegação + grid de 7 colunas. */
export function SkeletonCalendar() {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-11 w-11 rounded-lg" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-11 w-11 rounded-lg" />
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-3 w-6" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    </div>
  )
}

/** Três pontinhos pulsando, pro indicador "digitando" de um chat. */
export function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-2xl bg-brand-50 px-4 py-3">
      <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" />
    </div>
  )
}
