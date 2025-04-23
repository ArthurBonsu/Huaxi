// contexts/PatientDoctorContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { logger } from '@/utils/logger';
import { APPOINTMENT_CONFIG } from '@/config/appointment_config';

// Define interfaces for the application
export interface Patient {
  id: string;
  name: string;
  address: string;
  requestTimestamp: number;
  paymentAmount: number;
  paymentHash?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Doctor {
  id: string;
  name: string;
  address: string;
  specialization: string;
}

// Add new patient profile interface
export interface PatientProfile {
  name: string;
  email?: string;
  birthDate?: string;
  phone?: string;
  address: string;
}

// Add Ethereum provider type
interface Ethereum {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, callback: (...args: any[]) => void) => void;
  removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
}

export interface PatientDoctorContextType {
  // Wallet and Connection
  currentAccount: string;
  connectWallet: () => Promise<void>;
  
  // Patient Interactions
  createPatientRequest: (patientDetails: Omit<Patient, 'id' | 'status'>) => Promise<void>;
  payForAppointment: (patientAddress: string, amount: number) => Promise<void>;
  
  // Patient Profile management
  createPatientProfile: (profileData: PatientProfile) => Promise<void>;
  
  // Doctor Interactions
  createDoctorProfile: (doctorDetails: Omit<Doctor, 'id'>) => Promise<void>;
  reviewPatientRequests: () => Promise<Patient[]>;
  approvePatientRequest: (patientId: string) => Promise<void>;
  rejectPatientRequest: (patientId: string) => Promise<void>;
  
  // Lists
  pendingPatients: Patient[];
  approvedPatients: Patient[];
  rejectedPatients: Patient[];
  
  // Coin-related
  getPatientCoinBalance: (address: string) => Promise<number>;
  transferPatientCoins: (to: string, amount: number) => Promise<void>;
}

// Create the context
export const PatientDoctorContext = createContext<PatientDoctorContextType | undefined>(undefined);

// Context Provider Component
export const PatientDoctorProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  logger.info('PatientDoctorContext', 'Initializing provider');

  // State Variables
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [pendingPatients, setPendingPatients] = useState<Patient[]>([]);
  const [approvedPatients, setApprovedPatients] = useState<Patient[]>([]);
  const [rejectedPatients, setRejectedPatients] = useState<Patient[]>([]);
  
  // Check for existing connection on mount
  useEffect(() => {
    logger.info('PatientDoctorContext', 'Checking for existing wallet connection');
    
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await (window.ethereum as any).request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0) {
            logger.info('PatientDoctorContext', 'Found existing wallet connection', { account: accounts[0] });
            setCurrentAccount(accounts[0]);
            
            // Load initial data
            await loadInitialData(accounts[0]);
          } else {
            logger.info('PatientDoctorContext', 'No existing wallet connection found');
          }
        } catch (error) {
          logger.error('PatientDoctorContext', 'Error checking existing connection', { 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
    };
    
    checkConnection();
  }, []);
  
  // Set up event listeners for wallet
  useEffect(() => {
    logger.info('PatientDoctorContext', 'Setting up wallet event listeners');
    
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethereum = window.ethereum as any;
      
      const handleAccountsChanged = (accounts: string[]) => {
        logger.info('PatientDoctorContext', 'Accounts changed event', { 
          accounts: accounts.length > 0 ? accounts : 'No accounts' 
        });
        
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          loadInitialData(accounts[0]);
        } else {
          setCurrentAccount('');
          // Clear data when disconnected
          setPendingPatients([]);
          setApprovedPatients([]);
          setRejectedPatients([]);
        }
      };
      
      const handleChainChanged = (chainId: string) => {
        logger.info('PatientDoctorContext', 'Chain changed event', { chainId });
        // Reload the page to avoid any state inconsistencies
        window.location.reload();
      };
      
      // Add event listeners
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      
      // Clean up
      return () => {
        logger.info('PatientDoctorContext', 'Removing wallet event listeners');
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);
  
  // Load initial data
  const loadInitialData = async (account: string) => {
    logger.info('PatientDoctorContext', 'Loading initial data for account', { account });
    
    try {
      // In a real app, you would fetch this data from your contracts
      // For now, we're using dummy data
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dummy data for testing
      setPendingPatients([
        {
          id: `p-${Date.now()}-1`,
          name: 'John Doe',
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          requestTimestamp: Date.now() - 86400000, // 1 day ago
          paymentAmount: 50,
          status: 'pending'
        },
        {
          id: `p-${Date.now()}-2`,
          name: 'Jane Smith',
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44f',
          requestTimestamp: Date.now() - 43200000, // 12 hours ago
          paymentAmount: 75,
          status: 'pending'
        }
      ]);
      
      setApprovedPatients([
        {
          id: `a-${Date.now()}-1`,
          name: 'Bob Johnson',
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44a',
          requestTimestamp: Date.now() - 172800000, // 2 days ago
          paymentAmount: 100,
          status: 'approved'
        }
      ]);
      
      setRejectedPatients([
        {
          id: `r-${Date.now()}-1`,
          name: 'Alice Brown',
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44b',
          requestTimestamp: Date.now() - 259200000, // 3 days ago
          paymentAmount: 25,
          status: 'rejected'
        }
      ]);
      
      logger.info('PatientDoctorContext', 'Initial data loaded successfully', {
        pendingCount: 2,
        approvedCount: 1,
        rejectedCount: 1
      });
    } catch (error) {
      logger.error('PatientDoctorContext', 'Error loading initial data', { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  // Wallet Connection
  const connectWallet = async () => {
    logger.info('PatientDoctorContext', 'Connecting wallet');
    
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        logger.debug('PatientDoctorContext', 'Requesting account access');
        
        // Use type assertion to tell TypeScript that ethereum exists and has request method
        const accounts = await (window.ethereum as any).request({ 
          method: 'eth_requestAccounts' 
        });
        
        logger.info('PatientDoctorContext', 'Wallet connected successfully', { account: accounts[0] });
        setCurrentAccount(accounts[0]);
        
        // Load data for the newly connected account
        await loadInitialData(accounts[0]);
        
        return accounts[0];
      } catch (error) {
        logger.error('PatientDoctorContext', 'Failed to connect wallet', { 
          error: error instanceof Error ? error.message : String(error)
        });
        throw new Error('Wallet connection failed');
      }
    } else {
      logger.error('PatientDoctorContext', 'Ethereum provider not found');
      throw new Error('Please install MetaMask');
    }
  };

  // *** NEW FUNCTION: Create Patient Profile ***
  const createPatientProfile = async (profileData: PatientProfile) => {
    logger.info('PatientDoctorContext', 'Creating patient profile', profileData);
    
    try {
      if (!currentAccount) {
        logger.warn('PatientDoctorContext', 'No wallet connected');
        throw new Error('Wallet not connected');
      }
      
      // Validate profile data
      if (!profileData.name) {
        logger.warn('PatientDoctorContext', 'Missing required profile field: name');
        throw new Error('Name is required for patient profile');
      }

      // In a real implementation, this would call a contract method
      // Simulate blockchain delay
      logger.debug('PatientDoctorContext', 'Simulating blockchain transaction for profile creation');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store in local storage for persistence (in a real app, this would be on blockchain)
      localStorage.setItem(`patient_profile_${currentAccount}`, JSON.stringify(profileData));
      localStorage.setItem(`patient_onboarded_${currentAccount}`, 'true');
      
      logger.info('PatientDoctorContext', 'Patient profile created successfully', {
        name: profileData.name,
        address: profileData.address || currentAccount
      });
    } catch (error) {
      logger.error('PatientDoctorContext', 'Error creating patient profile', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  };

  // Patient Request Creation
  const createPatientRequest = async (patientDetails: Omit<Patient, 'id' | 'status'>) => {
    logger.info('PatientDoctorContext', 'Creating patient request', patientDetails);
    
    try {
      if (!currentAccount) {
        logger.warn('PatientDoctorContext', 'No wallet connected');
        throw new Error('Wallet not connected');
      }
      
      // Validate patient details against config
      logger.debug('PatientDoctorContext', 'Validating patient details', {
        minFee: APPOINTMENT_CONFIG.MIN_APPOINTMENT_FEE,
        providedFee: patientDetails.paymentAmount
      });
      
      if (patientDetails.paymentAmount < APPOINTMENT_CONFIG.MIN_APPOINTMENT_FEE) {
        logger.warn('PatientDoctorContext', 'Payment amount below minimum', {
          min: APPOINTMENT_CONFIG.MIN_APPOINTMENT_FEE,
          provided: patientDetails.paymentAmount
        });
        throw new Error(`Minimum payment amount is ${APPOINTMENT_CONFIG.MIN_APPOINTMENT_FEE} HCOIN`);
      }
      
      // Generate a unique ID
      const newId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(
        `${patientDetails.name}${patientDetails.address}${Date.now()}`
      ));
      
      logger.debug('PatientDoctorContext', 'Generated patient ID', { id: newId });
      
      // Create new patient object
      const newPatient: Patient = {
        ...patientDetails,
        id: newId,
        status: 'pending'
      };

      // In a real implementation, this would call a contract method
      // Simulate blockchain delay
      logger.debug('PatientDoctorContext', 'Simulating blockchain transaction');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to pending patients locally (in a real app, this would be on-chain)
      setPendingPatients(prev => {
        const updated = [...prev, newPatient];
        logger.debug('PatientDoctorContext', 'Updated pending patients', { count: updated.length });
        return updated;
      });
      
      logger.info('PatientDoctorContext', 'Patient request created successfully', { id: newId });
    } catch (error) {
      logger.error('PatientDoctorContext', 'Error creating patient request', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  };

  // Payment for Appointment
  const payForAppointment = async (patientAddress: string, amount: number) => {
    logger.info('PatientDoctorContext', 'Processing appointment payment', { 
      patientAddress, 
      amount 
    });
    
    try {
      if (!currentAccount) {
        logger.warn('PatientDoctorContext', 'No wallet connected');
        throw new Error('Wallet not connected');
      }
      
      // Implement coin transfer logic
      // This would interact with the hospital coin contract
      logger.debug('PatientDoctorContext', 'Simulating blockchain transaction for payment');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      logger.info('PatientDoctorContext', 'Payment processed successfully', {
        from: currentAccount,
        to: patientAddress,
        amount
      });
    } catch (error) {
      logger.error('PatientDoctorContext', 'Payment processing failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  };

  // Doctor Profile Creation
  const createDoctorProfile = async (doctorDetails: Omit<Doctor, 'id'>) => {
    logger.info('PatientDoctorContext', 'Creating doctor profile', doctorDetails);
    
    try {
      if (!currentAccount) {
        logger.warn('PatientDoctorContext', 'No wallet connected');
        throw new Error('Wallet not connected');
      }
      
      // Validate specialization
      const validSpecializations = Object.keys(APPOINTMENT_CONFIG.SPECIALIZATION_FEE_MULTIPLIERS);
      if (!validSpecializations.includes(doctorDetails.specialization)) {
        logger.warn('PatientDoctorContext', 'Invalid specialization', { 
          specialization: doctorDetails.specialization,
          validOptions: validSpecializations
        });
        throw new Error('Invalid specialization selected');
      }
      
      // Generate a unique ID
      const doctorId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(
        `${doctorDetails.name}${doctorDetails.address}${Date.now()}`
      ));
      
      // Implement doctor profile registration
      // This would interact with the smart contract
      logger.debug('PatientDoctorContext', 'Simulating blockchain transaction for doctor profile creation');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Also store in localStorage for this demo (in a real app, this would be on blockchain)
      localStorage.setItem(`doctor_onboarded_${currentAccount}`, 'true');
      
      logger.info('PatientDoctorContext', 'Doctor profile created successfully', {
        id: doctorId,
        name: doctorDetails.name,
        specialization: doctorDetails.specialization
      });
    } catch (error) {
      logger.error('PatientDoctorContext', 'Doctor profile creation failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  };

  // Review Patient Requests
  const reviewPatientRequests = async (): Promise<Patient[]> => {
    logger.info('PatientDoctorContext', 'Reviewing patient requests');
    
    try {
      if (!currentAccount) {
        logger.warn('PatientDoctorContext', 'No wallet connected');
        throw new Error('Wallet not connected');
      }
      
      // In a real implementation, this would fetch from the blockchain
      // Simulate blockchain delay
      logger.debug('PatientDoctorContext', 'Simulating blockchain data fetch');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.info('PatientDoctorContext', 'Patient requests retrieved successfully', { 
        count: pendingPatients.length 
      });
      
      return pendingPatients;
    } catch (error) {
      logger.error('PatientDoctorContext', 'Error reviewing patient requests', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  };

  // Approve Patient Request
  const approvePatientRequest = async (patientId: string) => {
    logger.info('PatientDoctorContext', 'Approving patient request', { patientId });
    
    try {
      if (!currentAccount) {
        logger.warn('PatientDoctorContext', 'No wallet connected');
        throw new Error('Wallet not connected');
      }
      
      // Find the patient in pending list
      const patient = pendingPatients.find(p => p.id === patientId);
      if (!patient) {
        logger.warn('PatientDoctorContext', 'Patient not found for approval', { patientId });
        throw new Error('Patient not found');
      }
      
      logger.debug('PatientDoctorContext', 'Found patient for approval', { 
        id: patient.id,
        name: patient.name 
      });
      
      // In a real implementation, this would call a contract method
      // Simulate blockchain delay
      logger.debug('PatientDoctorContext', 'Simulating blockchain transaction for approval');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update patient status
      const approvedPatient = { ...patient, status: 'approved' as const };
      
      // Move patient from pending to approved
      setPendingPatients(prev => {
        const updated = prev.filter(p => p.id !== patientId);
        logger.debug('PatientDoctorContext', 'Updated pending patients after approval', { count: updated.length });
        return updated;
      });
      
      setApprovedPatients(prev => {
        const updated = [...prev, approvedPatient];
        logger.debug('PatientDoctorContext', 'Updated approved patients', { count: updated.length });
        return updated;
      });
      
      logger.info('PatientDoctorContext', 'Patient request approved successfully', { patientId });
    } catch (error) {
      logger.error('PatientDoctorContext', 'Error approving patient request', { 
        patientId,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  };

  // Reject Patient Request
  const rejectPatientRequest = async (patientId: string) => {
    logger.info('PatientDoctorContext', 'Rejecting patient request', { patientId });
    
    try {
      if (!currentAccount) {
        logger.warn('PatientDoctorContext', 'No wallet connected');
        throw new Error('Wallet not connected');
      }
      
      // Find the patient in pending list
      const patient = pendingPatients.find(p => p.id === patientId);
      if (!patient) {
        logger.warn('PatientDoctorContext', 'Patient not found for rejection', { patientId });
        throw new Error('Patient not found');
      }
      
      logger.debug('PatientDoctorContext', 'Found patient for rejection', { 
        id: patient.id,
        name: patient.name 
      });
      
      // In a real implementation, this would call a contract method
      // Simulate blockchain delay
      logger.debug('PatientDoctorContext', 'Simulating blockchain transaction for rejection');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update patient status
      const rejectedPatient = { ...patient, status: 'rejected' as const };
      
      // Move patient from pending to rejected
      setPendingPatients(prev => {
        const updated = prev.filter(p => p.id !== patientId);
        logger.debug('PatientDoctorContext', 'Updated pending patients after rejection', { count: updated.length });
        return updated;
      });
      
      setRejectedPatients(prev => {
        const updated = [...prev, rejectedPatient];
        logger.debug('PatientDoctorContext', 'Updated rejected patients', { count: updated.length });
        return updated;
      });
      
      logger.info('PatientDoctorContext', 'Patient request rejected successfully', { patientId });
    } catch (error) {
      logger.error('PatientDoctorContext', 'Error rejecting patient request', { 
        patientId,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  };

  // Get Patient Coin Balance
  const getPatientCoinBalance = async (address: string): Promise<number> => {
    logger.info('PatientDoctorContext', 'Getting patient coin balance', { address });
    
    try {
      if (!currentAccount) {
        logger.warn('PatientDoctorContext', 'No wallet connected');
        throw new Error('Wallet not connected');
      }
      
      // In a real implementation, this would call a contract method
      // Simulate blockchain delay
      logger.debug('PatientDoctorContext', 'Simulating blockchain call for balance check');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock balance
      const balance = Math.floor(Math.random() * 1000);
      
      logger.info('PatientDoctorContext', 'Patient coin balance retrieved', { 
        address,
        balance 
      });
      
      return balance;
    } catch (error) {
      logger.error('PatientDoctorContext', 'Error getting patient balance', { 
        address,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  };

  // Transfer Patient Coins
  const transferPatientCoins = async (to: string, amount: number) => {
    logger.info('PatientDoctorContext', 'Transferring patient coins', { to, amount });
    
    try {
      if (!currentAccount) {
        logger.warn('PatientDoctorContext', 'No wallet connected');
        throw new Error('Wallet not connected');
      }
      
      if (amount <= 0) {
        logger.warn('PatientDoctorContext', 'Invalid transfer amount', { amount });
        throw new Error('Transfer amount must be greater than 0');
      }
      
      // In a real implementation, this would call a contract method
      // Simulate blockchain delay
      logger.debug('PatientDoctorContext', 'Simulating blockchain transaction for transfer');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      logger.info('PatientDoctorContext', 'Coin transfer completed successfully', {
        from: currentAccount,
        to,
        amount
      });
    } catch (error) {
      logger.error('PatientDoctorContext', 'Error transferring coins', { 
        to,
        amount,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  };

  // Context Value
  const contextValue: PatientDoctorContextType = {
    currentAccount,
    connectWallet,
    createPatientRequest,
    payForAppointment,
    createDoctorProfile,
    createPatientProfile, // Add the new function to the context value
    reviewPatientRequests,
    approvePatientRequest,
    rejectPatientRequest,
    pendingPatients,
    approvedPatients,
    rejectedPatients,
    getPatientCoinBalance,
    transferPatientCoins
  };

  return (
    <PatientDoctorContext.Provider value={contextValue}>
      {children}
    </PatientDoctorContext.Provider>
  );
};

// Custom Hook for using the context
export const usePatientDoctorContext = () => {
  const context = useContext(PatientDoctorContext);
  if (context === undefined) {
    logger.error('usePatientDoctorContext', 'Hook used outside of provider');
    throw new Error('usePatientDoctorContext must be used within a PatientDoctorProvider');
  }
  return context;
};

export default PatientDoctorContext;