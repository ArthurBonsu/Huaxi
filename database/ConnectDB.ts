// database/ConnectDB.ts
import { MongoClient } from 'mongodb';
import { Logger } from '@/utils/logger';

const uri = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  Logger.error('Database', 'MONGODB_URI not found in environment variables');
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    Logger.info('Database', 'Initializing MongoDB connection (development)');
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then(client => {
        Logger.info('Database', 'MongoDB connection established successfully');
        return client;
      })
      .catch(err => {
        Logger.error('Database', 'Failed to connect to MongoDB', { 
          error: err.message,
          stack: err.stack
        });
        throw err;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  Logger.info('Database', 'Initializing MongoDB connection (production)');
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      Logger.info('Database', 'MongoDB connection established successfully');
      return client;
    })
    .catch(err => {
      Logger.error('Database', 'Failed to connect to MongoDB', { 
        error: err.message,
        stack: err.stack
      });
      throw err;
    });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;