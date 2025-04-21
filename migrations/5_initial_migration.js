
const TransactionValidator = artifacts.require("TransactionValidator");

// Add other contract imports as needed

module.exports = function(deployer) {
  // Deploy contracts in order

  deployer.deploy(TransactionValidator);
};