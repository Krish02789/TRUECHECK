import connectDB from './config/database.js';
import { checkDatabaseHealth } from './utils/dbUtils.js';

const testDatabase = async () => {
  try {
    console.log('Testing MongoDB connection...');
    await connectDB();
    
    console.log('Testing database health...');
    const health = await checkDatabaseHealth();
    console.log('Database health:', health);
    
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

testDatabase();
