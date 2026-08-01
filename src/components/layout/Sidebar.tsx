import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  Users,
  ClipboardList,
  CalendarDays,
  Stethoscope,
  DollarSign,
  Package,
  Truck,
  CreditCard,
  MessageCircle,
  Mail,
  LogOut,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/anamnese', label: 'Anamnese', icon: ClipboardList },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/lia', label: 'LIA Podologa', icon: Stethoscope },
  { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/estoque', label: 'Estoque', icon: Package },
  { to: '/fornecedores', label: 'Fornecedores', icon: Truck },
  { to: '/assinatura', label: 'Assinatura', icon: CreditCard },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const signOut = useAuthStore((s) => s.signOut)

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="px-6 py-6">
        <div className="flex items-center gap-1.5">
          <FootLogo />
          <span className="text-xl font-extrabold tracking-tight text-ink-900">
            <span className="text-brand-500">P</span>ODIFY
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-400 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
              )
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4 px-3 pb-6">
        <div className="border-t border-slate-100 pt-4">
          <p className="px-3.5 pb-2 text-[11px] font-semibold tracking-wider text-slate-400">
            SUPORTE
          </p>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
          <a
            href="mailto:suporte@podify.com.br"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Mail size={18} /> E-mail
          </a>
        </div>

        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </div>
  )
}

function FootLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="white" />
      <path
        d="M24 8c-3 0-5 2.5-5 6s2 6.5 2 10c0 4 2.5 7 6 7 3 0 5.5-2.5 5.5-6 0-3-1.5-5-1.5-8.5C31 12 28 8 24 8Z"
        fill="#2f9d84"
      />
      <circle cx="18" cy="10" r="2" fill="#2f9d84" />
      <circle cx="14" cy="12.5" r="2" fill="#2f9d84" />
      <circle cx="11" cy="16.5" r="2" fill="#2f9d84" />
    </svg>
  )
}
