const ProofOfStakeValidator = artifacts.require("ProofOfStakeValidator");
const StateManager = artifacts.require("StateManager");
const TransactionRelay = artifacts.require("TransactionRelay");
const ReceivingBlockchainInterface = artifacts.require("ReceivingBlockchainInterface");

// Add other contract imports as needed

module.exports = function(deployer) {
  // Deploy contracts in order
  deployer.deploy(ProofOfStakeValidator);
  deployer.deploy(StateManager);
  deployer.deploy(TransactionRelay);
  deployer.deploy(ReceivingBlockchainInterface);
};