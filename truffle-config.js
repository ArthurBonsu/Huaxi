require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000
    },
    ethereum_testnet: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      ),
      network_id: 5,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    tatum_testnet: {
      provider: () => new HDWalletProvider({
        privateKeys: [process.env.PRIVATE_KEY],
        providerOrUrl: 'https://ethereum-sepolia.gateway.tatum.io/',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_TATUM_API_KEY
        }
      }),
      network_id: 11155111, // Sepolia network ID
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200
    }
  },
  
  compilers: {
    solc: {
      version: "0.8.20", // Updated to latest version from original config
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  // Project structure configuration
  contracts_directory: './contracts',
  contracts_build_directory: './build/contracts',
  migrations_directory: './migrations',

  // Database configuration
  db: {
    enabled: false
  }
};