module.exports = {
    networks: {
      // Local and Ethereum Networks
      development: {
        networkId: 5777,
        chainId: 5777,
        provider: 'http://127.0.0.1:9545',
        type: 'local',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18
        }
      },
      mainnet: {
        networkId: 1,
        chainId: 1,
        provider: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
        type: 'mainnet',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18
        }
      },
      sepolia: {
        networkId: 11155111,
        chainId: 11155111,
        provider: 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID',
        type: 'testnet',
        nativeCurrency: {
          name: 'Sepolia ETH',
          symbol: 'ETH',
          decimals: 18
        }
      },
      
      // Polkadot and Substrate Networks
      polkadot: {
        networkId: 1,
        chainId: 1,
        provider: 'wss://rpc.polkadot.io',
        type: 'mainnet',
        nativeCurrency: {
          name: 'DOT',
          symbol: 'DOT',
          decimals: 10
        }
      },
      kusama: {
        networkId: 2,
        chainId: 2,
        provider: 'wss://kusama-rpc.polkadot.io',
        type: 'mainnet',
        nativeCurrency: {
          name: 'KSM',
          symbol: 'KSM',
          decimals: 12
        }
      },
      
      // Layer 2 and Alternative Networks
      polygon: {
        networkId: 137,
        chainId: 137,
        provider: 'https://polygon-rpc.com',
        type: 'mainnet',
        nativeCurrency: {
          name: 'Matic',
          symbol: 'MATIC',
          decimals: 18
        }
      },
      arbitrum: {
        networkId: 42161,
        chainId: 42161,
        provider: 'https://arb1.arbitrum.io/rpc',
        type: 'mainnet',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        }
      },
      optimism: {
        networkId: 10,
        chainId: 10,
        provider: 'https://mainnet.optimism.io',
        type: 'mainnet',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        }
      },
      
      // Binance Smart Chain
      bsc: {
        networkId: 56,
        chainId: 56,
        provider: 'https://bsc-dataseed.binance.org/',
        type: 'mainnet',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        }
      }
    },
    
    // Default network configuration
    default: 'development'
  };