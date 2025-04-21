// pages/api/transactions/process-transaction.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Logger } from '@/utils/logger';

interface TransactionData {
  city: string;
  date: string;
  sector: string;
  ktCO2: number;
  account: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  Logger.info('API:ProcessTransaction', 'Request received', { 
    requestId, 
    method: req.method,
    url: req.url
  });
  
  if (req.method === 'POST') {
    try {
      Logger.debug('API:ProcessTransaction', 'Processing POST request', { requestId });
      
      const data = req.body;
      Logger.debug('API:ProcessTransaction', 'Request body', { requestId, data });
      
      const { city, date, sector, ktCO2, account }: TransactionData = data;
      
      // Validate input
      if (!city || !date || !sector || !ktCO2 || !account) {
        Logger.warn('API:ProcessTransaction', 'Missing required fields', { 
          requestId, 
          receivedFields: Object.keys(data) 
        });
        
        return res.status(400).json({ 
          status: 'error', 
          message: 'Missing required fields' 
        });
      }

      // Log valid transaction data
      Logger.info('API:ProcessTransaction', 'Transaction data validated', { 
        requestId, 
        city, 
        date, 
        sector, 
        ktCO2, 
        account 
      });

      // Process transaction
      // Add your blockchain transaction logic here
      Logger.debug('API:ProcessTransaction', 'Simulating blockchain transaction processing', { requestId });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Logger.info('API:ProcessTransaction', 'Transaction processed successfully', { requestId });
      
      res.status(200).json({
        status: 'success',
        message: 'Transaction processed',
        data: { city, date, sector, ktCO2 }
      });
    } catch (error) {
      Logger.error('API:ProcessTransaction', 'Error processing transaction', { 
        requestId, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      res.status(500).json({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } else {
    Logger.warn('API:ProcessTransaction', 'Method not allowed', { 
      requestId, 
      method: req.method 
    });
    
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}