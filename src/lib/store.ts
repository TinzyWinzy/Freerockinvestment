'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export interface WizardState {
  step: number
  packageId: string
  tvBundle: boolean
  roofType: string
  propertyType: string
  phases: string
  province: string
  city: string
  suburb: string
  truckAccess: boolean
  installDate: string
  name: string
  phone: string
  email: string
  payAfterInstall: boolean
  monthlyBill: number
  photoUrl: string
}

const initialWizard: WizardState = {
  step: 0,
  packageId: '',
  tvBundle: false,
  roofType: '',
  propertyType: 'residential',
  phases: 'single',
  province: '',
  city: '',
  suburb: '',
  truckAccess: false,
  installDate: '',
  name: '',
  phone: '',
  email: '',
  payAfterInstall: true,
  monthlyBill: 200,
  photoUrl: '',
}

interface AppStore {
  wizard: WizardState
  setWizard: (partial: Partial<WizardState>) => void
  resetWizard: () => void
  offlineQuotes: string[]
  addOfflineQuote: (id: string) => void
  removeOfflineQuote: (id: string) => void
  quotedPackages: string[]
  setQuotedPackages: (ids: string[]) => void
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      wizard: { ...initialWizard },
      setWizard: (partial) =>
        set((state) => ({ wizard: { ...state.wizard, ...partial } })),
      resetWizard: () => set({ wizard: { ...initialWizard } }),
      offlineQuotes: [],
      addOfflineQuote: (id) =>
        set((state) => ({
          offlineQuotes: state.offlineQuotes.includes(id)
            ? state.offlineQuotes
            : [...state.offlineQuotes, id],
        })),
      removeOfflineQuote: (id) =>
        set((state) => ({
          offlineQuotes: state.offlineQuotes.filter((q) => q !== id),
        })),
      quotedPackages: [],
      setQuotedPackages: (ids) => set({ quotedPackages: ids }),
      toasts: [],
      addToast: (toast) =>
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'freerock-store',
      partialize: (state) => ({
        wizard: state.wizard,
        offlineQuotes: state.offlineQuotes,
        quotedPackages: state.quotedPackages,
      }),
    }
  )
)
