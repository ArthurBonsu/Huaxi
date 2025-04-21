


import Web3 from 'web3';

export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: NativeCurrency;
}

// Define the Ethereum provider interface for type safety
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (eventName: string, callback: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, callback: (...args: any[]) => void) => void;
}

// Extend the Window object to include ethereum property

// Array of supported networks with their configurations
export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/your-api-key",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    }
  },
  {
    chainId: 137,
    name: "Polygon Mainnet",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    }
  },
  {
    chainId: 56,
    name: "Binance Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org",
    blockExplorer: "https://bscscan.com",
    nativeCurrency: {
      name: "Binance Coin",
      symbol: "BNB",
      decimals: 18
    }
  },
  {
    chainId: 42161,
    name: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    }
  },
  {
    chainId: 10,
    name: "Optimism",
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    }
  }
];

/**
 * Get network configuration by chain ID
 * @param chainId - The blockchain network ID
 * @returns Network configuration
 */
export const getNetworkConfig = (chainId: number): NetworkConfig => {
  const network = SUPPORTED_NETWORKS.find(net => net.chainId === chainId);
  
  if (!network) {
    throw new Error(`Unsupported network with chainId: ${chainId}`);
  }
  
  return network;
};

/**
 * Initialize Web3 instance using the browser's Ethereum provider
 * @returns Web3 instance or null if no provider
 */
export const initWeb3 = (): Web3 | null => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new Web3(window.ethereum as any);
  }
  return null;
};

/**
 * Connect to wallet and get user's account address
 * @returns Connected account address or null
 */
export const connectWallet = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('No Ethereum provider found');
    return null;
  }

  try {
    // Request account access using type assertion for window.ethereum
    const accounts = await (window.ethereum as EthereumProvider).request({
      method: 'eth_requestAccounts' 
    });

    // Return the first account
    return accounts[0];
  } catch (error) {
    console.error('Failed to connect wallet', error);
    return null;
  }
};

/**
 * Switch to a different blockchain network
 * @param chainId - The blockchain network ID to switch to
 */
export const switchNetwork = async (chainId: number): Promise<void> => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Network switching is only available in browser environments with an Ethereum provider');
  }

  const network = getNetworkConfig(chainId);
  const ethereum = window.ethereum as EthereumProvider;
  
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }]
    });
  } catch (switchError: any) {
    // If the network is not added, add it
    if (switchError.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: network.name,
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.blockExplorer],
            nativeCurrency: network.nativeCurrency
          }]
        });
      } catch (addError) {
        console.error('Failed to add network', addError);
        throw addError;
      }
    } else {
      console.error('Failed to switch network', switchError);
      throw switchError;
    }
  }
};