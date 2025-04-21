const PacechainChannel = artifacts.require("PacechainChannel");
const SpeculativeTransactionHandler = artifacts.require("SpeculativeTransactionHandler");
const ConfidenceScoreCalculator = artifacts.require("ConfidenceScoreCalculator");
const AssetTransferProcessor = artifacts.require("AssetTransferProcessor");


// Add other contract imports as needed

module.exports = function(deployer) {
  // Deploy contracts in order
  deployer.deploy(PacechainChannel);
  deployer.deploy(SpeculativeTransactionHandler);
  deployer.deploy(ConfidenceScoreCalculator);
  deployer.deploy(AssetTransferProcessor);
};