const UncertaintyAnalytics = artifacts.require("UncertaintyAnalytics");
const RequestManager = artifacts.require("RequestManager");

module.exports = function(deployer) {
  deployer.deploy(RequestManager, UncertaintyAnalytics.address);
};