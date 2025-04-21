const UncertaintyAnalytics = artifacts.require("UncertaintyAnalytics");
const ResponseManager = artifacts.require("ResponseManager");

module.exports = function(deployer) {
  deployer.deploy(ResponseManager, UncertaintyAnalytics.address);
};