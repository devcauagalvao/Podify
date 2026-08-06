import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AdminRoute } from '@/routes/AdminRoute'
import { ToastContainer } from '@/components/ToastContainer'

import LandingPage from '@/pages/landing/LandingPage'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import EsqueciSenha from '@/pages/EsqueciSenha'
import ConfirmarRedefinicao from '@/pages/ConfirmarRedefinicao'
import RedefinirSenha from '@/pages/RedefinirSenha'
import Termos from '@/pages/Termos'
import Privacidade from '@/pages/Privacidade'
import Dashboard from '@/pages/Dashboard'
import Clientes from '@/pages/Clientes'
import ClientePerfil from '@/pages/ClientePerfil'
import AnamneseList from '@/pages/anamnese/AnamneseList'
import AnamneseForm from '@/pages/anamnese/AnamneseForm'
import Agenda from '@/pages/Agenda'
import LiaPodologa from '@/pages/LiaPodologa'
import Financeiro from '@/pages/Financeiro'
import Estoque from '@/pages/Estoque'
import Fornecedores from '@/pages/Fornecedores'
import Assinatura from '@/pages/Assinatura'
import Admin from '@/pages/Admin'

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
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/confirmar-redefinicao" element={<ConfirmarRedefinicao />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/privacidade" element={<Privacidade />} />

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
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
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
    </BrowserRouter>
  )
}
