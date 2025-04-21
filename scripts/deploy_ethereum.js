require('dotenv').config({ path: '.env.local' });
const Web3 = require('web3');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Environment variables
const NEXT_PUBLIC_TATUM_API_KEY = process.env.NEXT_PUBLIC_TATUM_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.ETHEREUM_PROVIDER_URL;
const CHAIN_ID = 11155111; // Sepolia chain ID
const CHAIN = 'ethereum-sepolia'; // This corresponds to the {CHAIN} part in the URL

// Providers configuration
const providers = [
  {
    url: INFURA_URL,
    name: 'Infura',
    chainId: CHAIN_ID,
    minBalance: '0.1',
    retryAttempts: 3,
    timeout: 30000,
  },
  {
    url: `https://x-api-key:${NEXT_PUBLIC_TATUM_API_KEY}@${CHAIN}.gateway.tatum.io`,
    name: 'Tatum',
    chainId: CHAIN_ID,
    minBalance: '0.1',
    retryAttempts: 3,
    timeout: 30000,
  },
];

// Test Tatum connection
async function testTatumConnection() {
  try {
    const response = await axios.post(
      `https://x-api-key:${NEXT_PUBLIC_TATUM_API_KEY}@${CHAIN}.gateway.tatum.io`,
      {
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.result) {
      console.log('Tatum connection successful. Latest block number:', parseInt(response.data.result, 16));
      return true;
    } else {
      console.log('Tatum connection failed. Unexpected response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Tatum connection test failed:', error.message);
    return false;
  }
}

// Get Web3 Provider
async function getWeb3Provider() {
  if (!PRIVATE_KEY) {
    throw new Error('Private key not found in environment variables');
  }

  for (const provider of providers) {
    try {
      console.log(`Attempting to connect to ${provider.name} with URL: ${provider.url}`);

      let web3Provider;

      if (provider.name === 'Tatum') {
        const tatumConnected = await testTatumConnection();

        if (!tatumConnected) {
          console.log('Skipping Tatum due to failed connection test');
          continue;
        }
      }

      web3Provider = new Web3.providers.HttpProvider(provider.url);

      const web3 = new Web3(web3Provider);

      // Add the account using the private key
      const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
      web3.eth.accounts.wallet.add(account);
      web3.eth.defaultAccount = account.address;

      // Test provider connectivity
      await web3.eth.getBlockNumber();

      const balance = await web3.eth.getBalance(account.address);
      const balanceInEth = web3.utils.fromWei(balance, 'ether');

      console.log(`Connected to ${provider.name}. Account balance: ${balanceInEth} ETH`);

      if (parseFloat(balanceInEth) >= parseFloat(provider.minBalance)) {
        return { web3, provider: web3Provider };
      }

      console.log(`Insufficient balance on ${provider.name}. Trying next provider...`);
    } catch (error) {
      console.error(`Failed to connect to ${provider.name}:`, error.message);
    }
  }

  throw new Error('No viable provider found');
}

async function retryOperation(operation, maxRetries = 3, delay = 2000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === maxRetries - 1) {
        console.error(`All ${maxRetries} attempts failed. Last error:`, error);
        throw error;
      }
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function verifyContract(contractAddress, contractName, contractSource, compilerVersion = 'v0.8.19') {
  if (!ETHERSCAN_API_KEY) {
    throw new Error('ETHERSCAN_API_KEY not found in environment variables');
  }
  try {
    const response = await axios.post('https://api-sepolia.etherscan.io/api', null, {
      params: {
        module: 'contract',
        action: 'verifysourcecode',
        apikey: ETHERSCAN_API_KEY,
        contractaddress: contractAddress,
        sourceCode: contractSource,
        codeformat: 'solidity-single-file',
        contractname: contractName,
        compilerversion: compilerVersion,
        optimizationUsed: 1,
      },
    });
    if (response.data.status !== '1') {
      throw new Error(`Contract verification failed: ${response.data.result}`);
    }
    return response.data;
  } catch (error) {
    console.error(`Verification error for ${contractName}:`, error);
    throw error;
  }
}

async function deployContract(contractName, abi, bytecode) {
  return retryOperation(async () => {
    const { web3, provider } = await getWeb3Provider();
    const accounts = await web3.eth.getAccounts();
    try {
      const contract = new web3.eth.Contract(abi);
      console.log(`Estimating gas for ${contractName}...`);
      const gasEstimate = await contract.deploy({ data: bytecode }).estimateGas({ from: accounts[0] });
      const gasPrice = await web3.eth.getGasPrice();
      const totalCost = web3.utils.fromWei((BigInt(gasEstimate) * BigInt(gasPrice)).toString(), 'ether');
      console.log(`Estimated deployment cost for ${contractName}: ${totalCost} ETH`);
      console.log(`Deploying ${contractName}...`);
      const deployedContract = await contract.deploy({ data: bytecode }).send({ from: accounts[0], gas: Math.floor(gasEstimate * 1.2) });
      console.log(`${contractName} deployed to:`, deployedContract.options.address);
      return { address: deployedContract.options.address, transactionHash: deployedContract.transactionHash };
    } catch (error) {
      console.error(`Deployment error for ${contractName}:`, error);
      throw error;
    } finally {
      if (provider && provider.engine) {
        await new Promise((resolve) => {
          provider.engine.stop();
          resolve();
        });
      }
    }
  }, 3, 5000);
}

async function deployAllContracts() {
  console.log('Starting contract deployment...');
  const contractsDir = path.join(__dirname, '../contracts');
  const buildContractsDir = path.join(__dirname, '../build/contracts');
  const addressesPath = path.join(__dirname, '../config/contract_addresses.json');
  // Ensure directories exist
  if (!fs.existsSync(buildContractsDir)) {
    throw new Error('Build directory not found. Please compile contracts first.');
  }
  // Read or create addresses file
  let existingAddresses = {};
  try {
    existingAddresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  } catch (error) {
    console.log('No existing addresses file found. Creating new one.');
  }
  const deployedContracts = {};
  const contractFiles = fs.readdirSync(buildContractsDir).filter((f) => f.endsWith('.json') && !f.includes('Metadata'));
  for (const file of contractFiles) {
    const contractName = path.basename(file, '.json');
    console.log(`Processing ${contractName}...`);
    try {
      const contractPath = path.join(buildContractsDir, file);
      const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
      const existingAddress = existingAddresses[contractName]?.address;
      const deploymentResult = await deployContract(contractName, contractData.abi, contractData.bytecode);
      const sourceCodePath = path.join(contractsDir, `**/${contractName}.sol`);
      const sourceCodes = glob.sync(sourceCodePath);
      if (sourceCodes.length > 0) {
        const sourceCode = fs.readFileSync(sourceCodes[0], 'utf8');
        console.log(`Verifying ${contractName}...`);
        const verificationResult = await verifyContract(deploymentResult.address, contractName, sourceCode);
        deployedContracts[contractName] = {
          address: deploymentResult.address,
          abi: `${contractName}.json`,
          transactionHash: deploymentResult.transactionHash,
          verificationStatus: verificationResult,
          previousAddress: existingAddress,
        };
        console.log(`${contractName} deployed and verified successfully`);
      }
    } catch (error) {
      console.error(`Failed to deploy and verify ${contractName}:`, error);
      // Continue with other contracts even if one fails
    }
  }
  const updatedAddresses = {
    ...existingAddresses,
    ...Object.fromEntries(
      Object.entries(deployedContracts).map(([name, contract]) => [
        name,
        { address: contract.address, abi: contract.abi, previousAddress: contract.previousAddress },     ]),
      ),
    };
    // Ensure config directory exists
    const configDir = path.dirname(addressesPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(addressesPath, JSON.stringify(updatedAddresses, null, 2));
    console.log('Contracts deployed and addresses updated:', deployedContracts);
    return deployedContracts;
  }
  
  // Main execution
  if (require.main === module) {
    // Process-level unhandled rejection handler
    process.on('unhandledRejection', (error) => {
      console.error('Unhandled promise rejection:', error);
      process.exit(1);
    });
  
    // Validate required environment variables
    const requiredEnvVars = {
      'NEXT_PUBLIC_TATUM_API_KEY': NEXT_PUBLIC_TATUM_API_KEY,
      'PRIVATE_KEY': PRIVATE_KEY,
      'ETHERSCAN_API_KEY': ETHERSCAN_API_KEY,
    };
    const missingEnvVars = Object.entries(requiredEnvVars).filter(([_, value]) => !value).map(([key]) => key);
    if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:', missingEnvVars.join(', '));
      process.exit(1);
    }
  
    // Add timeout for the entire deployment process
    const deploymentTimeout = setTimeout(() => {
      console.error('Deployment timed out after 5 minutes');
      process.exit(1);
    }, 300000); // 5 minutes
  
    testTatumConnection()
      .then((result) => {
        if (result) {
          console.log('Tatum connection test passed. Proceeding with deployment...');
          return deployAllContracts();
        } else {
          console.log('Tatum connection test failed. Please check your configuration.');
          process.exit(1);
        }
      })
      .then(() => {
        clearTimeout(deploymentTimeout);
        console.log('Deployment completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        clearTimeout(deploymentTimeout);
        console.error('Deployment failed:', { message: error.message, stack: error.stack, details: error.details || 'No additional details' });
        process.exit(1);
      });
  }
  
  module.exports = {
    deployContract,
    deployAllContracts,
    verifyContract,
    getWeb3Provider,
    testTatumConnection,
  };