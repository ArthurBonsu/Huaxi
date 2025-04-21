import create, { State } from 'zustand'

export interface User extends State {
  hasMetamask: boolean
  isLoggedIn: boolean
  address: string | null
  setHasMetamask: (val: boolean) => void
  setIsLoggedIn: (val: boolean) => void
  setAddress: (val: string | null) => void
}

export const useUserStore = create<User>((set) => ({
  hasMetamask: false,
  isLoggedIn: false,
  address: '',
  setHasMetamask: (hasMetamask) => set({ hasMetamask }),
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setAddress: (address) => set({ address }),
}))
