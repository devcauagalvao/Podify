import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toastError } from './toastStore'
import type { Profile } from '@/types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  init: () => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<void>
  signUp: (
    email: string,
    password: string,
    data: { full_name: string; nome_clinica?: string },
  ) => Promise<{ error: string | null }>
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  init: async () => {
    const { data } = await supabase.auth.getSession()
    set({ user: data.session?.user ?? null })
    if (data.session?.user) await get().refreshProfile()
    set({ loading: false, initialized: true })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ user: session?.user ?? null })
      if (session?.user) {
        await get().refreshProfile()
      } else {
        set({ profile: null })
      }
    })
  },

  refreshProfile: async () => {
    const userId = get().user?.id
    if (!userId) return
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error) {
      toastError(`Não foi possível carregar seu perfil: ${error.message}`)
      return
    }
    if (data) set({ profile: data })
  },

  signInWithPassword: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    })
  },

  signUp: async (email, password, data) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data },
    })
    return { error: error?.message ?? null }
  },

  resetPasswordForEmail: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/redefinir-senha',
    })
    return { error: error?.message ?? null }
  },

  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error?.message ?? null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
