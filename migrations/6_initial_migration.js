const RewardDistributor = artifacts.require("RewardDistributor");
const RewardToken = artifacts.require("RewardToken");

module.exports = function(deployer, network, accounts) {
  // Deploy the RewardToken first
  deployer.deploy(RewardToken).then(() => {
    // Then deploy the RewardDistributor with the RewardToken address
    return deployer.deploy(RewardDistributor, RewardToken.address);
  });
};