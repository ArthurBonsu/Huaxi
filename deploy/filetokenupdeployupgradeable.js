let  hre = require("hardhat");
const {upgrade, ethers }= hre;
let   { Signer, BigNumber, ContractFactory, Contract } =require ("ethers");
// import   {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
let { expect } =require ("chai");
let  chai =require ("chai");
let   chaiaspromised  =require ("chai-as-promised");
let   { Wallet  } = require ("ethers");

let   assert =require ('assert');
//import gethardhatconfig  from "../utils/gethardhatconfig.ts";


let  fs = require('fs');

// import chai.use from 'chai-bignumber'


// Adding Provider to the deployment 
//We call helper from deployment


 let  abstractprovider =require ("@ethersproject/abstract-provider"); 
 
 import  {getWalletForInfura} from '../utils/getHelper';


 const {TransactionRequest} = abstractprovider; 
let ethereumwallet;


const {  networkConfig,getNetworkIdFromName, developmentChains, autoFundCheck }  = gethardhatconfig();
// Environment variables 
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
//Ethereum wallet
ethereumwallet =  getWalletForInfura(String(PRIVATE_KEYCODE),String(ROPSTEN_NETWORKCODE),String(APIKEY) ); 

//token deployment
async function main () {
  const FileTokenUpgradeable = await ethers.getContractFactory('FileTokenUpgradeable');
  console.log('Deploying FileTokenUpgradeable...');
  const filetokenupgradeable = await upgrades.deployProxy(FileTokenUpgradeable,[ethereumwallet.address],  { initializer: 'ownerpick',gasPrice: 1000000000 });
  await filetokenupgradeable.deployed();
  console.log('FileTokenUpgradeable deployed to:', filetokenupgradeable.address);
}

main();

module.exports