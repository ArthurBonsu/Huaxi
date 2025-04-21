import axios from 'axios';
import Web3 from 'web3';
import { getTatumNetworkConfig } from '../config/tatum-config';

export interface TatumConnectionOptions {
  apiKey?: string;
  network?: string;
}

export class TatumBlockchainService {
  private apiKey: string;
  private web3: Web3;
  private networkConfig;

  constructor(options: TatumConnectionOptions = {}) {
    const apiKey = options.apiKey || process.env.NEXT_PUBLIC_TATUM_API_KEY;
    const network = options.network || 'sepolia';

    if (!apiKey) {
      throw new Error('Tatum API Key is required');
    }

    this.apiKey = apiKey;
    this.networkConfig = getTatumNetworkConfig(network);
    
    // Prefer Tatum RPC URL, fallback to provider URL
    const providerUrl = this.networkConfig.rpcUrl || this.networkConfig.providerUrl;
    
    // Create Web3 instance with custom provider configuration
    this.web3 = new Web3(providerUrl);

    // Set up custom provider options
    const provider = this.web3.currentProvider as any;
    if (provider) {
      provider.headers = {
        'x-api-key': this.apiKey
      };
    }
  }

  // Comprehensive connection test
  async testConnection(): Promise<{
    connected: boolean;
    blockNumber?: number;
    networkInfo?: any;
    accounts?: string[];
  }> {
    try {
      // Test block number retrieval
      const blockNumber = await this.getCurrentBlockNumber();
      
      // Attempt to retrieve accounts
      let accounts: string[] = [];
      try {
        accounts = await this.getAccounts();
      } catch (accountError) {
        console.warn('Could not retrieve accounts:', accountError);
      }

      return {
        connected: true,
        blockNumber,
        networkInfo: {
          name: this.networkConfig.name,
          chainId: this.networkConfig.chainId,
          type: this.networkConfig.type
        },
        accounts
      };
    } catch (error) {
      console.error('Tatum connection test failed:', error);
      return { 
        connected: false,
        accounts: []
      };
    }
  }

  // Get accounts with error handling
  async getAccounts(): Promise<string[]> {
    try {
      return await this.web3.eth.getAccounts();
    } catch (error) {
      console.error('Failed to retrieve accounts:', error);
      return [];
    }
  }

 // Fix balance method
 async getBalance(address: string): Promise<string> {
  try {
    const balanceWei = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balanceWei.toString(), 'ether');
  } catch (error) {
    console.error(`Failed to get balance for ${address}:`, error);
    throw error;
  }
}

  // Get current block number
  async getCurrentBlockNumber(): Promise<number> {
    try {
      // Ensure rpcUrl exists
      const rpcUrl = this.networkConfig.rpcUrl || this.networkConfig.providerUrl;
      
      if (!rpcUrl) {
        throw new Error('No RPC URL available for block number retrieval');
      }
  
      const response = await axios.post(
        rpcUrl,
        {
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
  
      // Ensure response and result exist
      if (!response.data || !response.data.result) {
        throw new Error('Invalid response from RPC');
      }
  
      return parseInt(response.data.result, 16);
    } catch (error) {
      console.error('Failed to get block number:', error);
      
      // Fallback to Web3 method if axios fails
      try {
        return Number(await this.web3.eth.getBlockNumber());
      } catch (web3Error) {
        console.error('Web3 block number retrieval failed:', web3Error);
        throw error;
      }
    }
  }



  // Deploy a contract with comprehensive error handling
 // Fix deployment method with correct types
 async deployContract(
  abi: any[], 
  bytecode: string, 
  from: string, 
  privateKey: string
): Promise<{ 
  contractAddress: string, 
  transactionHash: string,
  blockNumber: number 
}> {
  try {
    // Create contract instance
    const contract = new this.web3.eth.Contract(abi);

    // Estimate gas and convert bigint to number
    const gasEstimate = await contract
      .deploy({ data: bytecode })
      .estimateGas({ from });
    
    // Convert gasEstimate to number and add buffer
    const gasLimit = Number(gasEstimate) * 1.2;

    // Get current gas price
    const gasPrice = await this.web3.eth.getGasPrice();

    // Sign the transaction
    const signedTx = await this.web3.eth.accounts.signTransaction(
      {
        from,
        data: bytecode,
        gas: Math.floor(gasLimit), // Use calculated gas limit
        gasPrice: gasPrice.toString() // Convert bigint to string
      },
      privateKey
    );

    if (!signedTx.rawTransaction) {
      throw new Error('Transaction signing failed: No raw transaction');
    }

    // Send the transaction
    const receipt = await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    if (!receipt.contractAddress) {
      throw new Error('Contract deployment failed: No contract address in receipt');
    }

    return {
      contractAddress: receipt.contractAddress,
      transactionHash: receipt.transactionHash.toString(), // Convert to string
      blockNumber: Number(receipt.blockNumber) || 0 // Convert to number
    };
  } catch (error) {
    console.error('Contract deployment failed:', error);
    throw error;
  }
}

 // Fix transaction method with correct types
 async sendTransaction(
  from: string, 
  to: string, 
  amount: string, 
  privateKey: string,
  options?: {
    gasPrice?: string;
    gasLimit?: number;
    nonce?: number;
  }
): Promise<{
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: number;
}> {
  try {
    // Get nonce and gas price
    const nonce = options?.nonce || Number(await this.web3.eth.getTransactionCount(from));
    const gasPrice = options?.gasPrice || (await this.web3.eth.getGasPrice()).toString();

    // Prepare transaction
    const tx = {
      from,
      to,
      value: this.web3.utils.toWei(amount, 'ether'),
      gas: options?.gasLimit || 21000,
      gasPrice,
      nonce
    };

    // Sign transaction
    const signedTx = await this.web3.eth.accounts.signTransaction(tx, privateKey);

    if (!signedTx.rawTransaction) {
      throw new Error('Transaction signing failed: No raw transaction');
    }

    // Send signed transaction
    const receipt = await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    return {
      transactionHash: receipt.transactionHash.toString(),
      blockNumber: receipt.blockNumber ? Number(receipt.blockNumber) : undefined,
      gasUsed: receipt.gasUsed ? Number(receipt.gasUsed) : undefined
    };
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}
  // Get detailed transaction details
  async getTransactionDetails(txHash: string) {
    try {
      const transaction = await this.web3.eth.getTransaction(txHash);
      const receipt = await this.web3.eth.getTransactionReceipt(txHash);

      return {
        ...transaction,
        receipt,
        explorerUrl: `${this.networkConfig.explorerUrl}/tx/${txHash}`
      };
    } catch (error) {
      console.error(`Failed to get transaction details for ${txHash}:`, error);
      throw error;
    }
  }
 
  // Utility method to interact with specific contracts
  getContractInstance(address: string, abi: any[]) {
    return new this.web3.eth.Contract(abi, address);
  }
}



// Factory function with improved type safety and configuration
export function createTatumBlockchainService(
  options: TatumConnectionOptions = {}
): TatumBlockchainService {
  return new TatumBlockchainService(options);
}

// Export a pre-configured service for easy import
export const tatumService = createTatumBlockchainService();