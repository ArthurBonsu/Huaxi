// scripts/deploy_ethereum.js
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

async function deployContracts() {
  try {
    console.log('Starting deployment to Ethereum...');
    const startTime = performance.now();

    // Initialize web3 with provider
    const web3 = new Web3(process.env.ETHEREUM_RPC_URL);
    
    // Load ALL contract artifacts
    const contractArtifacts = {
      BlockchainRegistryBase: require('../build/contracts/BlockchainRegistryBase.json'),
      BlockchainRegistry: require('../build/contracts/BlockchainRegistry.json'),
      BlockchainMonitor: require('../build/contracts/BlockchainMonitor.json'),
      ChaCha20Poly1305: require('../build/contracts/ChaCha20Poly1305.json'),
      MetadataParser: require('../build/contracts/MetadataParser.json'),
      PacechainChannel: require('../build/contracts/PacechainChannel.json'),
      SpeculativeTransactionHandler: require('../build/contracts/SpeculativeTransactionHandler.json'),
      ConfidenceScoreCalculator: require('../build/contracts/ConfidenceScoreCalculator.json'),
      AssetTransferProcessor: require('../build/contracts/AssetTransferProcessor.json'),
      ZKPVerifierBase: require('../build/contracts/ZKPVerifierBase.json'),
      ProofGenerator: require('../build/contracts/ProofGenerator.json'),
      TransactionValidator: require('../build/contracts/TransactionValidator.json'),
      ClusterManager: require('../build/contracts/ClusterManager.json'),
      ClusterCommunication: require('../build/contracts/ClusterCommunication.json'),
      RewardBase: require('../build/contracts/RewardBase.json'),
      RewardCalculator: require('../build/contracts/RewardCalculator.json'),
      RewardDistributor: require('../build/contracts/RewardDistributor.json'),
      RewardToken: require('../build/contracts/RewardToken.json'),
      ProofOfStakeValidator: require('../build/contracts/ProofOfStakeValidator.json'),
      StateManager: require('../build/contracts/StateManager.json'),
      TransactionRelay: require('../build/contracts/TransactionRelay.json'),
      RelayChain: require('../build/contracts/RelayChain.json'),
      ReceivingBlockchainInterface: require('../build/contracts/ReceivingBlockchainInterface.json')
    };

    // Deployment object to store deployed contract addresses
    const deployedContracts = {};

    // Deploy contracts sequentially
    for (const [contractName, artifact] of Object.entries(contractArtifacts)) {
      try {
        console.log(`Deploying ${contractName}...`);
        const deployedContract = await deployContract(web3, artifact);
        deployedContracts[contractName] = deployedContract.options.address;
      } catch (deployError) {
        console.error(`Failed to deploy ${contractName}:`, deployError);
        // Optionally, you can choose to continue or stop deployment
        // throw deployError; // Uncomment to stop on first deployment failure
      }
    }

    const endTime = performance.now();
    const deploymentTime = endTime - startTime;

    // Save deployment information
    const deploymentInfo = {
      networkId: await web3.eth.net.getId(),
      deploymentTime,
      contracts: deployedContracts,
      timestamp: new Date().toISOString()
    };

    // Save deployment info to file
    const deploymentPath = path.join(__dirname, '../config/deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log('Deployment completed successfully!');
    console.log(`Total deployment time: ${deploymentTime}ms`);
    console.log('Deployment info saved to:', deploymentPath);

    return deploymentInfo;
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

async function deployContract(web3, artifact) {
  // Ensure the artifact has the required properties
  if (!artifact.abi || !artifact.bytecode) {
    throw new Error('Invalid contract artifact');
  }

  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  
  const contract = new web3.eth.Contract(artifact.abi);
  const deploy = contract.deploy({
    data: artifact.bytecode,
    arguments: [] // Add constructor arguments if needed
  });

  const gasEstimate = await deploy.estimateGas();
  const gasPrice = await web3.eth.getGasPrice();
  
  const deployed = await deploy.send({
    from: account,
    gas: gasEstimate,
    gasPrice: gasPrice
  });

  console.log(`Contract deployed at: ${deployed.options.address}`);
  return deployed;
}

if (require.main === module) {
  deployContracts()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });

module.exports = deployContracts;
  }