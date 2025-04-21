
// utils/envUtils.ts

/**
 * Environment utility functions for detecting browser vs server environment
 */

/**
 * Determines if the code is running in a browser environment
 * This is useful for conditional logic that should only run client-side
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Determines if the code is running in a server environment (Node.js)
 * This is useful for conditional logic that should only run server-side
 */
export const isServer = !isBrowser;

/**
 * Determines if the application is running in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Determines if the application is running in production mode
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Determines if the application is running in test mode
 */
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Safely access environment variables, with optional default values
 * @param key The environment variable key
 * @param defaultValue Optional default value if the environment variable is not set
 */
export const getEnvVariable = (key: string, defaultValue?: string): string => {
  return process.env[key] || defaultValue || '';
};