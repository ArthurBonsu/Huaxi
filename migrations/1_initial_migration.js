//const TransactionValidator = artifacts.require("TransactionValidator");
const BlockchainRegistryBase = artifacts.require("BlockchainRegistryBase");
const BlockchainRegistry = artifacts.require("BlockchainRegistry");
const BlockchainMonitor = artifacts.require("BlockchainMonitor");


// Add other contract imports as needed

module.exports = function(deployer) {
  // Deploy contracts in order
  deployer.deploy(BlockchainRegistryBase);
  deployer.deploy(BlockchainRegistry);
  deployer.deploy(BlockchainMonitor);
};