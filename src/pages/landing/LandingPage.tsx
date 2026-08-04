import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { FootIcon } from '@/components/BrandMark'
import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { ValueProps } from './ValueProps'
import { Features } from './Features'
import { Testimonials } from './Testimonials'
import { Pricing } from './Pricing'
import { FinalCta } from './FinalCta'
import { Footer } from './Footer'

export default function LandingPage() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  // Mesmo padrão de loading do ProtectedRoute — evita um flash da landing
  // antes da sessão terminar de carregar.
  if (loading) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-5 bg-surface">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
          <FootIcon />
        </div>
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ValueProps />
      <Features />
      <Testimonials />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  )
}
