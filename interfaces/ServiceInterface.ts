// interfaces/ServiceInterface.ts
export interface BlockchainService {
    title: string;
    description: string;
    requiresAuthentication: boolean;
    actions: ServiceAction[];
  }
  
  export interface ServiceAction {
    name: string;
    description: string;
    requiredPermissions: string[];
    execute: () => Promise<void>;
  }