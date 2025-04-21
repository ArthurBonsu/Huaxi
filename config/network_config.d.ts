// network_config.d.ts

export interface NetworkConfig {
    networkId: number;
    chainId: number;
    provider: string;
    type: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
  }
  
  export interface NetworkConfigurations {
    networks: {
      [key: string]: NetworkConfig;
    };
    default: string;
  }
  
  declare const networkConfig: NetworkConfigurations;
  
  export default networkConfig;