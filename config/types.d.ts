// ethereum-provider-types.ts
import { ExternalProvider } from '@ethersproject/providers';

/**
 * Utility type to help with Ethereum provider methods
 * Use this for type assertion when needed
 */
export interface EthereumProvider extends ExternalProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(eventName: string, callback: (...args: any[]) => void): void;
  removeListener(eventName: string, callback: (...args: any[]) => void): void;
}

/**
 * Type assertion helper for window.ethereum
 */
export function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window !== 'undefined') {
    return window.ethereum as EthereumProvider;
  }
  return undefined;
}

import Web3 from 'web3';
import type { ExternalProvider } from '@ethersproject/providers';

// Don't redeclare Window interface since it's already declared elsewhere
// Instead, use the existing ExternalProvider type

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Export type definitions for our functions
export type GetNetworkConfigFn = (chainId: number) => NetworkConfig;
export type InitWeb3Fn = () => Web3 | null;
export type ConnectWalletFn = () => Promise<string | null>;
export type SwitchNetworkFn = (chainId: number) => Promise<void>;

// Export the array type
export type SupportedNetworks = NetworkConfig[];

