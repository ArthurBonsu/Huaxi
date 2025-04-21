// utils/logger.ts
import { APPOINTMENT_CONFIG } from '@/config/appointment_config';
import { getNetworkConfig } from '@/config/supported_network';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

type LogFilter = (entry: LogEntry) => boolean;

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private isEnabled = true;
  private filters: LogFilter[] = [];
  private networkInfo: string = 'Network not detected';
  private persistLogs: boolean = true;
  private maxLogEntries: number = 1000;

  private constructor() {
    // Try to get network info on initialization
    this.updateNetworkInfo();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Static log methods that proxy to the singleton instance
  public static info(component: string, message: string, data?: any): void {
    Logger.getInstance().info(component, message, data);
  }

  public static debug(component: string, message: string, data?: any): void {
    Logger.getInstance().debug(component, message, data);
  }

  public static warn(component: string, message: string, data?: any): void {
    Logger.getInstance().warn(component, message, data);
  }

  public static error(component: string, message: string, data?: any): void {
    Logger.getInstance().error(component, message, data);
  }

  private async updateNetworkInfo(): Promise<void> {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const chainIdNum = parseInt(chainId, 16);
        const network = getNetworkConfig(chainIdNum);
        this.networkInfo = `${network.name} (${chainIdNum})`;
        this.info('Logger', 'Network detected', { network: this.networkInfo });
      } catch (error) {
        this.warn('Logger', 'Failed to detect network', { error: String(error) });
      }
    }
  }

  private createLogEntry(level: LogLevel, component: string, message: string, data?: any): LogEntry {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data: data || null
    };
    
    if (this.shouldLogEntry(entry)) {
      this.logs.push(entry);
      
      // Trim logs if they exceed max capacity
      if (this.persistLogs && this.logs.length > this.maxLogEntries) {
        this.logs = this.logs.slice(-this.maxLogEntries);
      }
    }
    
    return entry;
  }

  private shouldLogEntry(entry: LogEntry): boolean {
    if (this.filters.length === 0) return true;
    return this.filters.some(filter => filter(entry));
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.isEnabled) return;
    
    const { timestamp, level, component, message, data } = entry;
    const formattedMessage = `[${timestamp}][${level}][${component}] ${message}`;
    const dataString = data ? JSON.stringify(data, null, 2) : '';
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, dataString);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, dataString);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, dataString);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, dataString);
        break;
    }
  }

  public debug(component: string, message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, component, message, data);
    this.logToConsole(entry);
  }

  public info(component: string, message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, component, message, data);
    this.logToConsole(entry);
  }

  public warn(component: string, message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.WARN, component, message, data);
    this.logToConsole(entry);
  }

  public error(component: string, message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.ERROR, component, message, data);
    this.logToConsole(entry);
  }

  public addFilter(filter: LogFilter): void {
    this.filters.push(filter);
  }

  public removeAllFilters(): void {
    this.filters = [];
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getLogsByComponent(component: string): LogEntry[] {
    return this.logs.filter(log => log.component === component);
  }

  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public enableLogging(): void {
    this.isEnabled = true;
  }

  public disableLogging(): void {
    this.isEnabled = false;
  }

  public disableLogPersistence(): void {
    this.persistLogs = false;
  }

  public enableLogPersistence(): void {
    this.persistLogs = true;
  }

  public setMaxLogEntries(max: number): void {
    this.maxLogEntries = max;
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // For development/debugging only - adds log methods to window object
  public exposeToWindow(): void {
    if (typeof window !== 'undefined') {
      (window as any).appLogger = {
        debug: this.debug.bind(this),
        info: this.info.bind(this),
        warn: this.warn.bind(this),
        error: this.error.bind(this),
        getLogs: this.getLogs.bind(this),
        clearLogs: this.clearLogs.bind(this),
        exportLogs: this.exportLogs.bind(this)
      };
    }
  }
}

export const logger = Logger.getInstance();

// Initialize by exposing to window in development
if (process.env.NODE_ENV === 'development') {
  logger.exposeToWindow();
}