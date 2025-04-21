// We call ethers and all modules here
let { ethers, upgrades } = require("hardhat");
let  { Signer, BigNumber, ContractFactory, Contract } =require ("ethers");
let  {SignerWithAddress} =require ('@nomiclabs/hardhat-ethers/signers');
let  { expect } =require ("chai");
let  chai   =require ("chai");
let  chaiaspromised =require ("chai-as-promised");
let  { Wallet } =require  ("ethers");
let  assert =require('assert');
let { networkConfig, getNetworkIdFromName } =require ("../utils/gethardhatconfig.js");
const fs = require('fs')
chai.use(require('chai-bignumber')());
// We call helpers for provider
let {
getInfuraProvider,
getInfuraListedAccounts,
getInfuraWebSocketProvider,
getInfuraApiKey,
getInfuraUrl,
getEtherscanProvider,
getEtherscanNetwork,
getEtherscanUrl,
getEtherscanTransactionReceipt,
getEtherscanPostUrl,
getEtherscanDetectedNetwork,
getEtherscanFetchedUrl,
getEtherscanHistory,
getAlchemyProvider,
getAlchemyWebSocketProvider,
getAlchemySigner,
getAlchemyListedAccounts,
getAlchemyTransaction,
getWallet,
getSignerForWallet,
PopulateWalletTransaction,
SignWalletTransaction,
signWalletMessage,
setWalletWithMnemonic,
getWalletBalanceWithMnemonic,
getWalletWithPrivateKey,
getWalletWithPublicKey,
ConnectToContract,
getContract,
DeployContract,
getContractDeployed,
getConnectContract,
AttachContractToAddress,
getSignerForContract,
getProviderInfoForTheContract,
getDeployedTransationInf,
getContractEventWithListener,
getContractEmmittedWithListener,
getDeployedTransactionForContractFactory,
getWalletForInfura
} = require("../utils/helpers");
let  { TransactionRequest } = require("@ethersproject/abstract-provider");
let ethereumwallet;
const  ROPSTEN_NETWORK = process.env.ROPSTEN_NETWORK;
const ROPSTEN_API = process.env.ROPSTEN_API;
const DEV_ADDRESS=process.env.DEV_ADDRESS;
const RINKEBY_NETWORKCODE  =process.env.RINKEBY_NETWORK;
const ROPSTEN_NETWORKCODE  =process.env.ROPSTEN_NETWORK;
const KOVAN_NETWORKCODE  =process.env.KOVAN_NETWORK;
const MAINNET_NETWORKCODE  =process.env.MAINNET_NETWORK;
const RINKEBY_API_KEYCODE =  process.env.RINKEBY_API_KEY;
const PRIVATE_KEYCODE = process.env.PRIVATE_KEY;
const APIKEY = process.env.APIKEY;
const RINKEBYPRIVATEKEYCODE = process.env.PRIVATE_KEY;
const PREFIXEDPRIVATEKEY = process.env.PRIVATE_KEYWITHPREFIX;
const _RINKEBY_API = process.env.RINKEBY_API;
const RINKEBY_API_KEY= process.env.RINKEBY_API_KEY;
const RINKEBY_MNEUMONIC=process.env.RINKEBY_MNEUMONIC;
let networkName;
let chainId; let tx;

ethereumwallet =  getWalletForInfura(String(PRIVATE_KEYCODE),String(ROPSTEN_NETWORKCODE),String(APIKEY) ); 
// Our deployment script
async function main () {
//We generate factory of contract from ethers, typechain can also help us to get the factory
const FileTokenContract = await ethers.getContractFactory('FileToken');
console.log('Deploying FileToken ...');
// We deploy proxy here passing all arguments and initializing with the same name as our funtion in the EnergyToken.sol file [initialize]
const filetokenupgraded = await upgrades.deployProxy(FileTokenContract,[ethereumwallet.address],  { initializer: 'initialize',gasPrice: 1000000000 });
await filetokenupgraded.deployed();
//Lets see our contract address.
console.log('File Token deployed to:', filetokenupgraded.address);
}
main();