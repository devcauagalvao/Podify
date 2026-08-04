import podifyIconUrl from '@/assets/logos/podify-icon.png'

export function FootIcon() {
  return <img src={podifyIconUrl} alt="PODIFY" className="h-9 w-auto object-contain" />
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.5H24v7h11.3C33.9 31.6 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.3-5.3C33.3 7.5 28.9 5.5 24 5.5 13.8 5.5 5.5 13.8 5.5 24S13.8 42.5 24 42.5 42.5 34.2 42.5 24c0-1.2-.1-2.4-.3-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l5.8 4.2C13.6 15.6 18.4 12.5 24 12.5c2.8 0 5.3 1 7.3 2.7l5.3-5.3C33.3 7.5 28.9 5.5 24 5.5c-7.5 0-14 4.2-17.7 10.4z"
      />
      <path
        fill="#4CAF50"
        d="M24 42.5c4.8 0 9.2-1.8 12.5-4.9l-5.8-4.9C28.9 34.3 26.6 35 24 35c-5.3 0-9.8-3.4-11.4-8.1l-5.9 4.5C10 39 16.4 42.5 24 42.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.5H24v7h11.3c-.8 2.2-2.2 4.1-4.1 5.4l5.8 4.9C40.5 34.9 42.5 30 42.5 24c0-1.2-.1-2.4-.3-3.5z"
      />
    </svg>
  )
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="card w-full max-w-md px-8 py-10 sm:px-10">{children}</div>
    </div>
  )
}

export function AuthHeader({
  title,
  subtitle,
  icon,
}: {
  title: string
  subtitle: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
        {icon ?? <FootIcon />}
      </div>
      <h1 className="text-2xl font-extrabold text-ink-900">{title}</h1>
      <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}
