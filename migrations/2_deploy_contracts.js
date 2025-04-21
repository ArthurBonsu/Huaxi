const ChaCha20Poly1305 = artifacts.require("ChaCha20Poly1305");


// Add other contract imports as needed

module.exports = function(deployer) {
  // Deploy contracts in order
  deployer.deploy(ChaCha20Poly1305);

};