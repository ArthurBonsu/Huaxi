// stores/useEtherstore.ts

import create, { State } from 'zustand';
import { Web3Provider } from '@ethersproject/providers/lib';
import supportedChains from 'constants/supportedChains';
import { Chain } from 'types/ethers';
import {ethers} from 'ethers'
export interface EtherStore extends State {
  address: string;
  provider: Web3Provider | ethers.providers.Web3Provider | null; // Update this line
  chainId: Chain['chainId'];
  setAddress: (address: EtherStore['address']) => void;
  setProvider: (provider: EtherStore['provider']) => void;
  setChainId: (network: EtherStore['chainId']) => void;
  setEtherStore: (values: Omit<EtherStore, 'setProvider' | 'setAddress' | 'setChainId' | 'setEtherStore'>) => void;
}

export const INITIAL_STATE = {
  address: '',
  provider: null,
  chainId: supportedChains[0].chainId,
};

export const useEthersStore = create<EtherStore>((set) => ({
  ...INITIAL_STATE,
  setAddress: (address) => set({ address }),
  setProvider: (provider: Web3Provider | ethers.providers.Web3Provider| null) => set({ provider }), // Update this line
  setChainId: (chainId) => set({ chainId }),
  setEtherStore: (values) => set(values),
}));