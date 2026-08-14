import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AdminRoute } from '@/routes/AdminRoute'
import { ToastContainer } from '@/components/ToastContainer'
import { SessionLoadingScreen } from '@/components/SessionLoadingScreen'

// Páginas de auth ficam eager: são pequenas e costumam ser a primeira tela
// (login, recuperação de senha), então não vale o Suspense flash nelas.
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import EsqueciSenha from '@/pages/EsqueciSenha'
import ConfirmarRedefinicao from '@/pages/ConfirmarRedefinicao'
import RedefinirSenha from '@/pages/RedefinirSenha'
import Termos from '@/pages/Termos'
import Privacidade from '@/pages/Privacidade'
import ExcluirConta from '@/pages/ExcluirConta'

// Todo o resto é lazy: cada tela só baixa/processa quando o usuário
// realmente navega até ela, em vez de tudo entrar no bundle inicial.
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Clientes = lazy(() => import('@/pages/Clientes'))
const ClientePerfil = lazy(() => import('@/pages/ClientePerfil'))
const AnamneseList = lazy(() => import('@/pages/anamnese/AnamneseList'))
const AnamneseForm = lazy(() => import('@/pages/anamnese/AnamneseForm'))
const Agenda = lazy(() => import('@/pages/Agenda'))
const LiaPodologa = lazy(() => import('@/pages/LiaPodologa'))
const Financeiro = lazy(() => import('@/pages/Financeiro'))
const Estoque = lazy(() => import('@/pages/Estoque'))
const Fornecedores = lazy(() => import('@/pages/Fornecedores'))
const Assinatura = lazy(() => import('@/pages/Assinatura'))
// Admin é o maior ganho: 99% dos usuários nunca acessam essa área, então
// nem o código dela deve começar a baixar pra eles.
const Admin = lazy(() => import('@/pages/admin/Admin'))

function AppRoutes() {
  const passwordRecovery = useAuthStore((s) => s.passwordRecovery)
  const location = useLocation()

  // Sessão de recovery (evento PASSWORD_RECOVERY) nunca pode ser tratada
  // como login normal. Isso precisa vencer QUALQUER outra regra de
  // redirecionamento (landing, login, signup, rota protegida) — por isso
  // roda antes de <Routes>, não dentro de cada página.
  if (passwordRecovery && location.pathname !== '/redefinir-senha') {
    return <Navigate to="/redefinir-senha" replace />
  }

  return (
    <Suspense fallback={<SessionLoadingScreen />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/confirmar-redefinicao" element={<ConfirmarRedefinicao />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/excluir-conta" element={<ExcluirConta />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/:id" element={<ClientePerfil />} />
          <Route path="/anamnese" element={<AnamneseList />} />
          <Route path="/anamnese/nova" element={<AnamneseForm />} />
          <Route path="/anamnese/:id" element={<AnamneseForm />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/lia" element={<LiaPodologa />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/assinatura" element={<Assinatura />} />
        </Route>

        {/* Fora do <ProtectedRoute> de propósito: /admin usa AdminLayout
            (tema escuro, sem sidebar de cliente), não o AppLayout que o
            ProtectedRoute aplicaria — AdminRoute cuida da própria checagem
            de sessão/loading. */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <ToastContainer />
      <AppRoutes />
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  )
}
