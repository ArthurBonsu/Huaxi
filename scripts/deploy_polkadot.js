// deploy_polkadot.js
require('dotenv').config();
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const fs = require('fs');
const path = require('path');

// Polkadot Network Configuration
const POLKADOT_PROVIDER_URL = process.env.POLKADOT_PROVIDER_URL || 'wss://rpc.polkadot.io';
const MNEMONIC = process.env.POLKADOT_MNEMONIC;

async function connectToPolkadotNetwork() {
  try {
    // Wait for crypto libraries to be ready
    await cryptoWaitReady();

    // Create a new WS provider
    const wsProvider = new WsProvider(POLKADOT_PROVIDER_URL);
    
    // Create API instance
    const api = await ApiPromise.create({ provider: wsProvider });
    
    // Verify network connection
    const [chain, nodeName, nodeVersion] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version()
    ]);

    console.log(`Connected to chain: ${chain}, Node: ${nodeName} v${nodeVersion}`);
    return { api, wsProvider };
  } catch (error) {
    console.error('Polkadot network connection failed:', error);
    throw error;
  }
}

async function setupPolkadotAccount() {
  const keyring = new Keyring({ type: 'sr25519' });
  
  if (!MNEMONIC) {
    throw new Error('Polkadot mnemonic not found in environment variables');
  }

  // Create account from mnemonic
  const account = keyring.addFromMnemonic(MNEMONIC);
  
  return { keyring, account };
}

async function deployRelayChainContracts(api, account) {
  try {
    // Load existing Ethereum contract addresses
    const contractAddressesPath = path.join(__dirname, '../config/contract_addresses.json');
    const contractAddresses = JSON.parse(fs.readFileSync(contractAddressesPath, 'utf8'));

    // Prepare transaction
    const tx = api.tx.system.remark(
      JSON.stringify({
        sourceChain: 'Ethereum',
        sourceContractAddresses: contractAddresses,
        timestamp: Date.now()
      })
    );

    // Sign and send transaction
    const hash = await tx.signAndSend(account);
    
    console.log('Relay Chain Transaction Hash:', hash.toHex());
    
    return hash;
  } catch (error) {
    console.error('Relay Chain contract deployment failed:', error);
    throw error;
  }
}

async function performCrossChainRegistration() {
  let connection = null;
  
  try {
    // Connect to Polkadot Network
    connection = await connectToPolkadotNetwork();
    
    // Setup account
    const { account } = await setupPolkadotAccount();
    
    // Deploy Relay Chain Contracts
    const relayChainHash = await deployRelayChainContracts(
      connection.api, 
      account
    );
    
    // Track performance metrics
    const performanceMetrics = {
      networkName: 'Polkadot',
      connectionTime: Date.now(),
      relayChainTransactionHash: relayChainHash.toHex(),
      status: 'Successful'
    };
    
    // Save performance metrics
    const metricsPath = path.join(__dirname, '../metrics/polkadot_deployment.json');
    fs.writeFileSync(metricsPath, JSON.stringify(performanceMetrics, null, 2));
    
    console.log('Cross-Chain Registration Complete');
    return performanceMetrics;
  } catch (error) {
    console.error('Cross-Chain Registration Failed:', error);
    throw error;
  } finally {
    // Close WebSocket connection
    if (connection && connection.wsProvider) {
      connection.wsProvider.disconnect();
    }
  }
}

// Main execution
if (require.main === module) {
  performCrossChainRegistration()
    .then(metrics => {
      console.log('Deployment Metrics:', metrics);
      process.exit(0);
    })
    .catch(error => {
      console.error('Deployment Error:', error);
      process.exit(1);
    });
}

module.exports = {
  connectToPolkadotNetwork,
  setupPolkadotAccount,
  deployRelayChainContracts,
  performCrossChainRegistration
};