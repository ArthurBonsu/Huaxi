const UncertaintyAnalytics = artifacts.require("UncertaintyAnalytics");

module.exports = function(deployer) {
  deployer.deploy(UncertaintyAnalytics);
};