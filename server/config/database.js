const mongoose = require('mongoose');

// Global MongoDB connection
let db = null;

const connectDB = async () => {
  try {
    if (db) {
      return db;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ytkgroup', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    db = conn.connection;
    
    // Connection event listeners
    db.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    db.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    db.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Get database instance
const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

// Get mongoose instance
const getMongoose = () => {
  return mongoose;
};

module.exports = {
  connectDB,
  getDB,
  getMongoose
}; 