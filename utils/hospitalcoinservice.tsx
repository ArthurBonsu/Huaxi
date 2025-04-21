import { ethers, Contract } from 'ethers';
import HospitalCoinABI from '../build/contracts/HospitalCoin.json';

export interface ContractConfig {
  address: string;
  chainId: number;
}

class HospitalCoinService {
  private contract: Contract | null = null;
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  // Initialize contract connection
  async initializeContract(config: ContractConfig) {
    // Check for Ethereum provider
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask');
    }

    // Create provider and signer
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner();

    // Create contract instance
    this.contract = new ethers.Contract(
      config.address, 
      HospitalCoinABI.abi, 
      this.signer
    );
  }

  // Request appointment
  async requestAppointment(
    doctorAddress: string, 
    appointmentFee: number
  ) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.requestAppointment(
        doctorAddress, 
        ethers.utils.parseUnits(appointmentFee.toString(), 18)
      );
      
      const receipt = await tx.wait();
      return receipt.events[0].args.appointmentId.toNumber();
    } catch (error) {
      console.error('Appointment request failed:', error);
      throw error;
    }
  }

  // Pay for appointment
  async payForAppointment(appointmentId: number) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.payForAppointment(appointmentId);
      return await tx.wait();
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }

  // Approve appointment
  async approveAppointment(appointmentId: number) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.approveAppointment(appointmentId);
      return await tx.wait();
    } catch (error) {
      console.error('Approval failed:', error);
      throw error;
    }
  }

  // Get appointment details
  async getAppointmentDetails(appointmentId: number) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const appointment = await this.contract.getAppointmentDetails(appointmentId);
      return {
        patient: appointment.patient,
        doctor: appointment.doctor,
        fee: ethers.utils.formatUnits(appointment.fee, 18),
        isPaid: appointment.isPaid,
        isApproved: appointment.isApproved
      };
    } catch (error) {
      console.error('Failed to fetch appointment details:', error);
      throw error;
    }
  }

  // Get token balance
  async getTokenBalance(address: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const balance = await this.contract.balanceOf(address);
      return ethers.utils.formatUnits(balance, 18);
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
      throw error;
    }
  }
}

export const hospitalCoinService = new HospitalCoinService();
export default hospitalCoinService;