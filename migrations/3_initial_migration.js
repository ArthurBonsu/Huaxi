const MetadataParser = artifacts.require("MetadataParser");


// Add other contract imports as needed

module.exports = function(deployer) {
  // Deploy contracts in order
  deployer.deploy(MetadataParser);

};