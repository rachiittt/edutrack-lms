import mongoose from 'mongoose';
import { config } from './env';

// Singleton pattern for DB connection
class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {

      console.log('📦 Using existing database connection');
      return;
    }

    try {
      const conn = await mongoose.connect(config.mongoUri);
      this.isConnected = true;
      console.log(`MongoDB connected: ${conn.connection.host}`);

    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);

    }
  }

  public async disconnect(): Promise<void> {

    if (!this.isConnected) return;
    await mongoose.disconnect();
    this.isConnected = false;
    console.log('MongoDB disconnected');

  }
}

export const database = Database.getInstance();
