const { getDB, getMongoose } = require('../config/database');

// Database utility functions
class DatabaseUtils {
  // Get database connection status
  static isConnected() {
    try {
      const db = getDB();
      return db.readyState === 1; // 1 = connected
    } catch (error) {
      return false;
    }
  }

  // Get database stats
  static async getStats() {
    try {
      const db = getDB();
      const stats = await db.db.admin().listDatabases();
      return {
        connected: this.isConnected(),
        databases: stats.databases,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Database stats error:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // Health check
  static async healthCheck() {
    try {
      const db = getDB();
      await db.db.admin().ping();
      return {
        status: 'healthy',
        connected: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get collection stats
  static async getCollectionStats(collectionName) {
    try {
      const db = getDB();
      const stats = await db.db.collection(collectionName).stats();
      return {
        collection: collectionName,
        count: stats.count,
        size: stats.size,
        avgObjSize: stats.avgObjSize,
        storageSize: stats.storageSize,
        indexes: stats.nindexes
      };
    } catch (error) {
      console.error(`Collection stats error for ${collectionName}:`, error);
      return {
        collection: collectionName,
        error: error.message
      };
    }
  }

  // Get all collections stats
  static async getAllCollectionsStats() {
    try {
      const db = getDB();
      const collections = await db.db.listCollections().toArray();
      const stats = [];

      for (const collection of collections) {
        const collectionStats = await this.getCollectionStats(collection.name);
        stats.push(collectionStats);
      }

      return stats;
    } catch (error) {
      console.error('All collections stats error:', error);
      return [];
    }
  }

  // Create indexes for better performance
  static async createIndexes() {
    try {
      const mongoose = getMongoose();
      
      // User indexes
      await mongoose.model('User').createIndexes();
      
      // Message indexes
      await mongoose.model('Message').createIndexes();
      
      // Group indexes
      await mongoose.model('Group').createIndexes();
      
      // GroupMessage indexes
      await mongoose.model('GroupMessage').createIndexes();

      console.log('All indexes created successfully');
      return { success: true, message: 'Indexes created successfully' };
    } catch (error) {
      console.error('Create indexes error:', error);
      return { success: false, error: error.message };
    }
  }

  // Backup database info (metadata only)
  static async getBackupInfo() {
    try {
      const stats = await this.getAllCollectionsStats();
      const health = await this.healthCheck();
      
      return {
        timestamp: new Date().toISOString(),
        health: health,
        collections: stats,
        totalDocuments: stats.reduce((sum, stat) => sum + (stat.count || 0), 0),
        totalSize: stats.reduce((sum, stat) => sum + (stat.size || 0), 0)
      };
    } catch (error) {
      console.error('Backup info error:', error);
      return {
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

module.exports = DatabaseUtils; 