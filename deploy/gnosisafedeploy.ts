//npx hardhat --network rinkeby deploy
/*import   { useState, useEffect }  from "react";
import ReactDom from "react-dom";
import Web3 from 'web3';

import  hre  from "hardhat";
import  { HardhatRuntimeEnvironment } from "hardhat/types";
import  { DeployFunction }  from "hardhat-deploy/types";
//let ethers  = require("ethers");
import   { Signer, BigNumber, ContractFactory, Contract } from "ethers";

import   { expect } from "chai";
import   Chai  from "chai" ;
import   Chaiaspromised from "chai-as-promised";
import   {ethers,utils, Wallet } from   "ethers";
//import {getInfuraProvider, getWallet } from "../utils/helpers";
import    assert from 'assert';
import  Fs  from 'fs';
import  { networkConfig, getNetworkIdFromName } from "../utils/gethardhatconfig.js";

import   { TransactionRequest }  from "@ethersproject/abstract-provider";
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



let error;
let result;
let gnosissafeaddress;

const func  = async (HardhatRuntimeEnvironment) => {  // 部署函数把hardhat运行时作为参数
  const {deployments, getNamedAccounts,getChainId} = HardhatRuntimeEnvironment; // we get the deployments and getNamedAccounts which are provided by hardhat-deploy
  const {deploy} = deployments; // the deployments field itself contains the deploy function

  const {deployer} = await getNamedAccounts(); // we fetch the accounts. These can be configured in hardhat.config.ts as explained above
//      const chainid          = await getChainId()






//let web3Provider = window.ethereum
 // const provider = new ethers.providers.Web3Provider(web3Provider)
 // const owner1 = provider.getSigner(0)

 const connectToWallet = () => {

 const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [connButtonText, setConnButtonText] = useState("Connect Wallet");
  const [provider, setProvider] = useState(null);


    if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
        const provider = new hre.ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        // other stuff using provider here
         const defaultAccount = provider.getSigner(0)
         setDefaultAccount(defaultAccount)
    }
  
  
      
 useEffect(() => {
    connectToWallet()
  }, [provider, defaultAccount])
 
  }

   
 let GnosisSafeGetAddressesDeployed = await deploy('GnosisSafeGetAddresses', { // this will create a deployment called 'Token'. By default it will look for an artifact with the same name. the contract option allows you to use a different artifact
    from: deployer, log: true, // display the address and gas used in the console (not when run in test though)
      });
  
    let safecontractaddress =   GnosisSafeGetAddressesDeployed.address
      

/*
 async function main(
  contractName: string,
  constructorParams?: any[],
  signer?: Signer
): Promise<void> {
   deployResult.deployed();
}
main(contractName, constructorParams, wallet)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  }

RESTORE HASH HERE
};

export default func;
func.tags = ['GnosisSafeGetAddresses']; 
*/
export default {};