const CityRegister = artifacts.require("CityRegister");
const CompanyRegister = artifacts.require("CompanyRegister");
const CityEmissions = artifacts.require("CityEmissionsContract");
const RenewalTheory = artifacts.require("RenewalTheoryContract");
const CityHealth = artifacts.require("CityHealthCalculator");
const TemperatureRenewal = artifacts.require("TemperatureRenewalContract");
const ClimateReduction = artifacts.require("ClimateReductionContract");
const Mitigation = artifacts.require("MitigationContract");
const CarbonCreditMarket = artifacts.require("CarbonCreditMarket");

module.exports = async function(deployer, network, accounts) {
  try {
    // Network-specific configuration
    const networkConfig = {
      development: {
        uniswapRouter: accounts[8],
        carbonToken: accounts[7],
        usdToken: accounts[6],
        carbonFeed: accounts[4],
        tempFeed: accounts[3]
      },
      mainnet: {
        // Replace with actual mainnet addresses
        uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
        carbonToken: '0x0000000000000000000000000000000000000000',
        usdToken: '0x0000000000000000000000000000000000000000',
        carbonFeed: '0x0000000000000000000000000000000000000000',
        tempFeed: '0x0000000000000000000000000000000000000000'
      },
      ropsten: {
        // Replace with Ropsten testnet addresses if different
        uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        carbonToken: '0x0000000000000000000000000000000000000000',
        usdToken: '0x0000000000000000000000000000000000000000',
        carbonFeed: '0x0000000000000000000000000000000000000000',
        tempFeed: '0x0000000000000000000000000000000000000000'
      }
    };

    // Select network configuration, default to development if not specified
    const config = networkConfig[network] || networkConfig.development;

    // Fallback addresses if network config is incomplete
    const getFallbackAddress = (address, fallbackIndex) => 
      address && address !== '0x0000000000000000000000000000000000000000' 
        ? address 
        : accounts[fallbackIndex];

    // Deploy CityRegister with explicit constructor parameters
    const cityRegister = await CityRegister.new("RPSTOKENS", "RPS");
    console.log('CityRegister deployed at:', cityRegister.address);

    // Deploy CompanyRegister with explicit constructor parameters
    const companyRegister = await CompanyRegister.new("RPSTOKENS", "RPS");
    console.log('CompanyRegister deployed at:', companyRegister.address);

    // Deploy CityEmissions
    const cityEmissions = await CityEmissions.new();
    console.log('CityEmissions deployed at:', cityEmissions.address);

    // Deploy RenewalTheory
    const renewalTheory = await RenewalTheory.new();
    console.log('RenewalTheory deployed at:', renewalTheory.address);

    // Prepare addresses with fallback
    const uniswapRouter = getFallbackAddress(config.uniswapRouter, 8);
    const carbonToken = getFallbackAddress(config.carbonToken, 7);
    const usdToken = getFallbackAddress(config.usdToken, 6);

    // Deploy CarbonCreditMarket
    const carbonCreditMarket = await CarbonCreditMarket.new(
      uniswapRouter,
      carbonToken,
      usdToken
    );
    console.log('CarbonCreditMarket deployed at:', carbonCreditMarket.address);

    // Deploy CityHealth
    const cityHealth = await CityHealth.new();
    console.log('CityHealth deployed at:', cityHealth.address);

    // Deploy TemperatureRenewal
    const temperatureRenewal = await TemperatureRenewal.new();
    console.log('TemperatureRenewal deployed at:', temperatureRenewal.address);

    // Deploy ClimateReduction
    const climateReduction = await ClimateReduction.new(carbonCreditMarket.address);
    console.log('ClimateReduction deployed at:', climateReduction.address);

    // Prepare Chainlink feed addresses with fallback
    const carbonFeed = getFallbackAddress(config.carbonFeed, 4);
    const tempFeed = getFallbackAddress(config.tempFeed, 3);

    // Deploy Mitigation
    const mitigation = await Mitigation.new(carbonFeed, tempFeed);
    console.log('Mitigation deployed at:', mitigation.address);

    // Optional: Log network being deployed to
    console.log(`Deployment completed for network: ${network}`);

  } catch (error) {
    console.error('Deployment error:', error);
    throw error;
  }
};