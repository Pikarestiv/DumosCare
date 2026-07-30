import { create } from 'zustand'

export const useUiStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  enrollModalOpen: false,
  openEnrollModal: () => set({ enrollModalOpen: true }),
  closeEnrollModal: () => set({ enrollModalOpen: false }),
}))
