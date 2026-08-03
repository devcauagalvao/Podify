import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  Users,
  ClipboardList,
  CalendarDays,
  Bot,
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
import { SUPPORT_WHATSAPP_URL, SUPPORT_EMAIL } from '@/lib/contact'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/anamnese', label: 'Anamnese', icon: ClipboardList },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/lia', label: 'LIA Podóloga', icon: Bot },
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
                'flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
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
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Mail size={18} /> E-mail
          </a>
        </div>

        <button
          onClick={signOut}
          className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </div>
  )
}

function FootLogo() {
  return (
    <img
      src="/podify-logo.jpg"
      alt=""
      width={26}
      height={26}
      className="h-[26px] w-[26px] shrink-0 rounded-full object-cover"
    />
  )
}
