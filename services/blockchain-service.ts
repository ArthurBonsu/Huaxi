// services/blockchain-service.ts
import { ethers } from 'ethers';
import { logger } from '@/utils/logger';
import { getNetworkConfig } from '@/config/supported_network';
import { SUPPORTED_NETWORKS } from '@/config/supported_network';
import type { EthereumProvider } from '@/config/types.d';

// NOTE: In a real implementation, you would import your contract ABIs
const HOSPITAL_COIN_ABI = []; // Replace with actual ABI

export class BlockchainService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private hospitalCoinContract: ethers.Contract | null = null;
  private networkId: number | null = null;
  private isInitialized = false;

  constructor() {
    logger.info('BlockchainService', 'Service created');
    this.init();
  }

  private async init(): Promise<void> {
    logger.info('BlockchainService', 'Initializing service');
    
    if (typeof window === 'undefined') {
      logger.info('BlockchainService', 'Running in server environment, skipping initialization');
      return;
    }
    
    if (window.ethereum) {
      try {
        // Get the network ID
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainId = parseInt(chainIdHex as string, 16);
        this.networkId = chainId;
        
        const networkInfo = SUPPORTED_NETWORKS.find(n => n.chainId === chainId);
        logger.info('BlockchainService', 'Network detected', { 
          chainId,
          networkName: networkInfo?.name || 'Unknown Network' 
        });
        
       // services/blockchain-service.ts (continued)
        // Initialize provider
        this.provider = new ethers.providers.Web3Provider(window.ethereum as any);
        logger.debug('BlockchainService', 'Web3Provider initialized');
        
        // Initialize signer
        this.signer = this.provider.getSigner();
        logger.debug('BlockchainService', 'Signer initialized');
        
        // Check if we're on a supported network
        if (!SUPPORTED_NETWORKS.some(n => n.chainId === chainId)) {
          logger.warn('BlockchainService', 'Connected to unsupported network', { chainId });
        } else {
          // Initialize contracts if on supported network
          await this.initializeContracts(chainId);
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
        logger.info('BlockchainService', 'Service initialized successfully');
      } catch (error) {
        logger.error('BlockchainService', 'Initialization failed', { 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    } else {
      logger.warn('BlockchainService', 'No Ethereum provider found');
    }
  }
  
  private async initializeContracts(chainId: number): Promise<void> {
    logger.info('BlockchainService', 'Initializing contracts', { chainId });
    
    try {
      // In a real implementation, you would get contract addresses from a config
      const hospitalCoinAddress = "0x1234567890123456789012345678901234567890"; // Replace with actual address
      
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }
      
      // Initialize the HospitalCoin contract
      this.hospitalCoinContract = new ethers.Contract(
        hospitalCoinAddress,
        HOSPITAL_COIN_ABI,
        this.signer
      );
      
      logger.info('BlockchainService', 'HospitalCoin contract initialized', { 
        address: hospitalCoinAddress 
      });
    } catch (error) {
      logger.error('BlockchainService', 'Contract initialization failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
  
  private setupEventListeners(): void {
    logger.debug('BlockchainService', 'Setting up event listeners');
    
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethereum = window.ethereum as any;
      
      ethereum.on('accountsChanged', (accounts: string[]) => {
        logger.info('BlockchainService', 'Accounts changed event', { 
          accounts: accounts.length > 0 ? accounts[0] : 'No accounts' 
        });
      });
      
      ethereum.on('chainChanged', (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        logger.info('BlockchainService', 'Chain changed event', { 
          chainId: newChainId 
        });
        
        // Update service state
        this.networkId = newChainId;
        
        // Re-initialize contracts for the new chain
        this.initializeContracts(newChainId).catch(error => {
          logger.error('BlockchainService', 'Failed to initialize contracts after chain change', { 
            error: error instanceof Error ? error.message : String(error) 
          });
        });
      });
      
      ethereum.on('disconnect', (error: { code: number; message: string }) => {
        logger.warn('BlockchainService', 'Provider disconnected', { 
          code: error.code,
          message: error.message 
        });
        
        // Reset service state
        this.provider = null;
        this.signer = null;
        this.hospitalCoinContract = null;
        this.networkId = null;
        this.isInitialized = false;
      });
    }
  }
  
  // Hospital Coin Methods
  
  /**
   * Request a new appointment
   */
  public async requestAppointment(doctorAddress: string, appointmentFee: number): Promise<string> {
    logger.info('BlockchainService', 'Requesting appointment', { 
      doctorAddress, 
      appointmentFee 
    });
    
    try {
      this.ensureInitialized();
      
      if (!this.hospitalCoinContract) {
        throw new Error('HospitalCoin contract not initialized');
      }
      
      logger.debug('BlockchainService', 'Calling requestAppointment on contract');
      
      // Call the contract method
      const tx = await this.hospitalCoinContract.requestAppointment(
        doctorAddress,
        ethers.utils.parseUnits(appointmentFee.toString(), 18) // Convert to wei
      );
      
      logger.debug('BlockchainService', 'Transaction submitted', { hash: tx.hash });
      
      // Wait for transaction to be mined
      logger.debug('BlockchainService', 'Waiting for transaction confirmation');
      const receipt = await tx.wait();
      
      logger.info('BlockchainService', 'Appointment requested successfully', { 
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber 
      });
      
      // Find the appointmentId from the event
      const event = receipt.events?.find(e => e.event === 'AppointmentRequested');
      const appointmentId = event?.args?.appointmentId.toString();
      
      logger.info('BlockchainService', 'Appointment ID retrieved', { appointmentId });
      
      return appointmentId;
    } catch (error) {
      logger.error('BlockchainService', 'Failed to request appointment', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
  
  /**
   * Pay for an appointment
   */
  public async payForAppointment(appointmentId: string): Promise<void> {
    logger.info('BlockchainService', 'Paying for appointment', { appointmentId });
    
    try {
      this.ensureInitialized();
      
      if (!this.hospitalCoinContract) {
        throw new Error('HospitalCoin contract not initialized');
      }
      
      logger.debug('BlockchainService', 'Calling payForAppointment on contract');
      
      // Call the contract method
      const tx = await this.hospitalCoinContract.payForAppointment(appointmentId);
      
      logger.debug('BlockchainService', 'Transaction submitted', { hash: tx.hash });
      
      // Wait for transaction to be mined
      logger.debug('BlockchainService', 'Waiting for transaction confirmation');
      const receipt = await tx.wait();
      
      logger.info('BlockchainService', 'Payment completed successfully', { 
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber 
      });
    } catch (error) {
      logger.error('BlockchainService', 'Failed to pay for appointment', { 
        appointmentId,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
  
  /**
   * Approve an appointment (doctor only)
   */
  public async approveAppointment(appointmentId: string): Promise<void> {
    logger.info('BlockchainService', 'Approving appointment', { appointmentId });
    
    try {
      this.ensureInitialized();
      
      if (!this.hospitalCoinContract) {
        throw new Error('HospitalCoin contract not initialized');
      }
      
      logger.debug('BlockchainService', 'Calling approveAppointment on contract');
      
      // Call the contract method
      const tx = await this.hospitalCoinContract.approveAppointment(appointmentId);
      
      logger.debug('BlockchainService', 'Transaction submitted', { hash: tx.hash });
      
      // Wait for transaction to be mined
      logger.debug('BlockchainService', 'Waiting for transaction confirmation');
      const receipt = await tx.wait();
      
      logger.info('BlockchainService', 'Appointment approved successfully', { 
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber 
      });
    } catch (error) {
      logger.error('BlockchainService', 'Failed to approve appointment', { 
        appointmentId,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
  
  /**
   * Get appointment details
   */
  public async getAppointmentDetails(appointmentId: string): Promise<any> {
    logger.info('BlockchainService', 'Getting appointment details', { appointmentId });
    
    try {
      this.ensureInitialized();
      
      if (!this.hospitalCoinContract) {
        throw new Error('HospitalCoin contract not initialized');
      }
      
      logger.debug('BlockchainService', 'Calling getAppointmentDetails on contract');
      
      // Call the contract method
      const details = await this.hospitalCoinContract.getAppointmentDetails(appointmentId);
      
      logger.info('BlockchainService', 'Appointment details retrieved successfully', { 
        appointmentId,
        patient: details.patient,
        doctor: details.doctor,
        fee: ethers.utils.formatUnits(details.fee, 18),
        isPaid: details.isPaid,
        isApproved: details.isApproved
      });
      
      return {
        patient: details.patient,
        doctor: details.doctor,
        fee: parseFloat(ethers.utils.formatUnits(details.fee, 18)),
        isPaid: details.isPaid,
        isApproved: details.isApproved
      };
    } catch (error) {
      logger.error('BlockchainService', 'Failed to get appointment details', { 
        appointmentId,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
  
  /**
   * Get coin balance
   */
  public async getCoinBalance(address: string): Promise<number> {
    logger.info('BlockchainService', 'Getting coin balance', { address });
    
    try {
      this.ensureInitialized();
      
      if (!this.hospitalCoinContract) {
        throw new Error('HospitalCoin contract not initialized');
      }
      
      logger.debug('BlockchainService', 'Calling balanceOf on contract');
      
      // Call the contract method
      const balance = await this.hospitalCoinContract.balanceOf(address);
      
      const formattedBalance = parseFloat(ethers.utils.formatUnits(balance, 18));
      
      logger.info('BlockchainService', 'Balance retrieved successfully', { 
        address,
        balance: formattedBalance
      });
      
      return formattedBalance;
    } catch (error) {
      logger.error('BlockchainService', 'Failed to get coin balance', { 
        address,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
  
  // Utility methods
  
  /**
   * Ensure the service is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      logger.error('BlockchainService', 'Service not initialized');
      throw new Error('Blockchain service not initialized');
    }
  }
  
  /**
   * Check if MetaMask is installed
   */
  public isMetaMaskInstalled(): boolean {
    const isInstalled = typeof window !== 'undefined' && 
                       window.ethereum !== undefined && 
                       (window.ethereum as any).isMetaMask === true;
    
    logger.debug('BlockchainService', 'MetaMask installation check', { 
      isInstalled 
    });
    
    return isInstalled;
  }
  
  /**
   * Get current chain ID
   */
  public getCurrentChainId(): number | null {
    logger.debug('BlockchainService', 'Getting current chain ID', { 
      chainId: this.networkId 
    });
    
    return this.networkId;
  }
  
  /**
   * Check if connected to a supported network
   */
  public isOnSupportedNetwork(): boolean {
    const isSupported = this.networkId !== null && 
                       SUPPORTED_NETWORKS.some(n => n.chainId === this.networkId);
    
    logger.debug('BlockchainService', 'Supported network check', { 
      chainId: this.networkId,
      isSupported
    });
    
    return isSupported;
  }
  
  /**
   * Switch to a different network
   */
  public async switchNetwork(chainId: number): Promise<void> {
    logger.info('BlockchainService', 'Switching network', { targetChainId: chainId });
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No Ethereum provider found');
      }
      
      const ethereum = window.ethereum as any;
      
      // Check if the network is supported
      const network = SUPPORTED_NETWORKS.find(n => n.chainId === chainId);
      if (!network) {
        logger.error('BlockchainService', 'Attempted to switch to unsupported network', { 
          chainId 
        });
        throw new Error(`Network with chain ID ${chainId} is not supported`);
      }
      
      // Convert chain ID to hex
      const chainIdHex = `0x${chainId.toString(16)}`;
      
      try {
        logger.debug('BlockchainService', 'Requesting network switch', { 
          chainIdHex 
        });
        
        // Request switch
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }]
        });
        
        logger.info('BlockchainService', 'Network switched successfully', { 
          chainId,
          networkName: network.name 
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          logger.info('BlockchainService', 'Network not added to wallet, attempting to add', { 
            chainId 
          });
          
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: network.name,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.blockExplorer]
            }]
          });
          
          logger.info('BlockchainService', 'Network added successfully', { 
            chainId,
            networkName: network.name 
          });
        } else {
          logger.error('BlockchainService', 'Failed to switch network', { 
            error: switchError 
          });
          throw switchError;
        }
      }
      
      // Update service state
      this.networkId = chainId;
      
      // Re-initialize contracts
      await this.initializeContracts(chainId);
    } catch (error) {
      logger.error('BlockchainService', 'Network switch failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
}

// Create a singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;