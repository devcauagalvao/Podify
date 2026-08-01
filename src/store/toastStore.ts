import { create } from 'zustand'

export type ToastType = 'error' | 'success' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastState {
  toasts: Toast[]
  push: (message: string, type?: ToastType) => void
  dismiss: (id: string) => void
}

const DURATIONS: Record<ToastType, number> = {
  error: 7000,
  success: 4000,
  info: 5000,
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  push: (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => get().dismiss(id), DURATIONS[type])
  },

  dismiss: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

export function toastError(message: string) {
  useToastStore.getState().push(message, 'error')
}

export function toastSuccess(message: string) {
  useToastStore.getState().push(message, 'success')
}

export function toastInfo(message: string) {
  useToastStore.getState().push(message, 'info')
}
