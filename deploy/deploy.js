// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");




async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  let address = '0x06Da25591CdF58758C4b3aBbFf18B092e4380B65'

  const Greeter = await hre.ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Hardhat!");

  await greeter.deployed();

  console.log("Greeter deployed to:", greeter.address);

  // Gnosis Safe Contract 
  const GnosisSafeContract = await hre.ethers.getContractFactory("GnosisSafeGetAddresses" );
  const gnosissafedeploy = await GnosisSafeContract.deploy(address);

  await gnosissafedeploy.deployed();

  console.log("Gnosis Safe Contract  deployed to:", gnosissafedeploy.address);

 

  const TokenABCContract = await hre.ethers.getContractFactory("TokenABC" );
  const TokensAbcdeploy = await TokenABCContract.deploy(10000000,2);

  await TokensAbcdeploy.deployed();

  console.log("TokenABC deployed to:", TokensAbcdeploy.address);

  
    const TokenBTCContract = await hre.ethers.getContractFactory("TokenBTC" );
    const TokenBTCdeploy = await TokenBTCContract.deploy(10000000, 2);
  
    await TokenBTCdeploy.deployed();
  
    console.log("TOken BTC  deployed to:", TokenBTCdeploy.address);

    // TokenETH
    const TokenETHContract = await hre.ethers.getContractFactory("TokenETH" );
    const TokenETHdeploy = await TokenETHContract.deploy(10000000, 2);
  
    await TokenETHdeploy.deployed();
  
    console.log("Token ETH   deployed to:", TokenETHdeploy.address);

        // TokenXYZ
     const TokenXYZContract = await hre.ethers.getContractFactory("TokenXYZ" );
     const tokenXYZdeploy = await TokenXYZContract.deploy(10000000, 2);
   
     await tokenXYZdeploy.deployed();
   
     console.log("TokenXYZ deployed to :", tokenXYZdeploy.address);

    // TokenSwap
    const TokenSwapContract = await hre.ethers.getContractFactory("TokenSwap");
    const Tokenedeploy = await TokenSwapContract.deploy( TokensAbcdeploy.address,tokenXYZdeploy.address);
  
    await Tokenedeploy.deployed();
  
    console.log("TokenSwap  deployed to:", Tokenedeploy.address);



    }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
