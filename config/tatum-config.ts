export interface TatumNetworkConfig {
    name: string;
    chainId: number;
    type: 'mainnet' | 'testnet';
    rpcUrl?: string;
    providerUrl?: string;
    explorerUrl?: string;
  }
  
  export const TatumNetworks: Record<string, TatumNetworkConfig> = {
    sepolia: {
      name: 'Sepolia Testnet',
      chainId: 11155111,
      type: 'testnet',
      rpcUrl: process.env.TATUM_ETHEREUM_ENDPOINT || 'https://ethereum-sepolia.gateway.tatum.io/',
      providerUrl: process.env.ETHEREUM_PROVIDER_URL || 'https://sepolia.infura.io/v3/c8ed01b44b5a4595b3981b2324419e8b',
      explorerUrl: 'https://sepolia.etherscan.io'
    },
    ethereum: {
      name: 'Ethereum Mainnet',
      chainId: 1,
      type: 'mainnet',
      rpcUrl: 'https://ethereum.gateway.tatum.io/v3/',
      explorerUrl: 'https://etherscan.io'
    },
    polkadot: {
      name: 'Polkadot',
      chainId: 1,
      type: 'mainnet',
      rpcUrl: process.env.POLKADOT_PROVIDER_URL || 'wss://polkadot-rpc.publicnode.com',
      explorerUrl: 'https://polkadot.js.org/apps/#/explorer'
    }
  };
  
  export function getTatumNetworkConfig(network: string): TatumNetworkConfig {
    const config = TatumNetworks[network.toLowerCase()];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }
    return config;
  }
  
  export const TatumConstants = {
    API_KEY: process.env.NEXT_PUBLIC_TATUM_API_KEY,
    DEFAULT_NETWORK: 'sepolia',
    API_BASE_URL: 'https://api.tatum.io/v3',
    SUPPORTED_NETWORKS: Object.keys(TatumNetworks),
    CONTRACT_ADDRESSES: {
      METADATA_PARSER: process.env.METADATA_PARSER_ADDRESS,
      PACECHAIN_CHANNEL: process.env.PACECHAIN_CHANNEL_ADDRESS,
      RELAY_CHAIN: process.env.RELAY_CHAIN_ADDRESS
    }
  };