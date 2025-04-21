// services/cross-chain-service.ts
import axios from 'axios';
import { Logger } from '../utils/logger';

export interface CrossChainTransactionData {
  city: string;
  date: string;
  sector: string;
  ktCO2: string;
  ethereumAddress: string;
  polkadotAddress?: string;
}

export class CrossChainService {
  static async processCrossChainTransaction(data: CrossChainTransactionData) {
    try {
      const response = await axios.post('/api/process-transaction', data);
      
      Logger.info('Cross-Chain Transaction Processed', {
        transactionHashes: response.data.transactionHashes,
        processingTime: response.data.processingTime
      });

      return response.data;
    } catch (error) {
      Logger.error('Cross-Chain Transaction Failed', error);
      throw error;
    }
  }
}