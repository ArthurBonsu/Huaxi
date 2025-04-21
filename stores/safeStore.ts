

import create, { State } from 'zustand';
import { Web3Provider } from '@ethersproject/providers/lib';
import supportedChains from 'constants/supportedChains';
import { Chain } from 'types/ethers';
import {ethers} from 'ethers'

export interface SafeStore extends State {
  safeAddress: string;
  ownersAddress: string[];
  safeContractAddress: string;
  isPendingSafeCreation: boolean;
  pendingSafeData: any;
  isPendingAddOwner: boolean;
  pendingAddOwnerData: any;
  setSafeAddress: (safeAddress: SafeStore['safeAddress']) => void;
  setOwnersAddress: (ownersAddress: SafeStore['ownersAddress']) => void;
  setSafeContractAddress: (safeContractAddress: SafeStore['safeContractAddress']) => void;
  setIsPendingSafeCreation: (isPendingSafeCreation: SafeStore['isPendingSafeCreation']) => void;
  setPendingSafeData: (pendingSafeData: SafeStore['pendingSafeData']) => void;
  setIsPendingAddOwner: (isPendingAddOwner: SafeStore['isPendingAddOwner']) => void;
  setPendingAddOwnerData: (pendingAddOwnerData: SafeStore['pendingAddOwnerData']) => void;
  setSafeStore: (values: { safeAddress: string; safeContractAddress: string }) => void;
}

export const INITIAL_STATE = {
  safeAddress: '',
  ownersAddress: [],
  safeContractAddress: '',
  isPendingSafeCreation: false,
  pendingSafeData: null,
  isPendingAddOwner: false,
  pendingAddOwnerData: null,
};

export const useSafeStore = create<SafeStore>((set) => ({
  ...INITIAL_STATE,
  setSafeAddress: (safeAddress: string) => set({ safeAddress }),
  setOwnersAddress: (ownersAddress: string[]) => set({ ownersAddress }),
  setSafeContractAddress: (safeContractAddress: string) => set({ safeContractAddress }),
  setIsPendingSafeCreation: (isPendingSafeCreation: boolean) => set({ isPendingSafeCreation }),
  setPendingSafeData: (pendingSafeData: any) => set({ pendingSafeData }),
  setIsPendingAddOwner: (isPendingAddOwner: boolean) => set({ isPendingAddOwner }),
  setPendingAddOwnerData: (pendingAddOwnerData: any) => set({ pendingAddOwnerData }),
  setSafeStore: (values: { safeAddress: string; safeContractAddress: string }) => set({ ...values, ownersAddress: INITIAL_STATE.ownersAddress }),
}));