const { MongoClient } = require('mongodb');
const { Deta } = require('deta');

class Database {
  constructor(config) {
    this.config = config;
    this.mongoClient = null;
    this.deta = config.DETA_PROJECT_KEY ? Deta(config.DETA_PROJECT_KEY) : null;
    this.db = null;
  }

  // MongoDB Operations
  async connectMongo() {
    if (!this.config.DB_URL) {
      console.log('⚠️ No MongoDB URL provided');
      return false;
    }

    try {
      this.mongoClient = new MongoClient(this.config.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      await this.mongoClient.connect();
      this.db = this.mongoClient.db('WhatsGram');
      console.log('✅ Connected to MongoDB');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      return false;
    }
  }

  async disconnectMongo() {
    if (this.mongoClient) {
      await this.mongoClient.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  // PM Guard Operations
  async getPmGuardData(userId) {
    if (!this.db) return null;
    
    try {
      const collection = this.db.collection('pmguard');
      return await collection.findOne({ number: userId });
    } catch (error) {
      console.error('❌ Failed to get PM guard data:', error);
      return null;
    }
  }

  async setPmGuardData(userId, data) {
    if (!this.db) return false;
    
    try {
      const collection = this.db.collection('pmguard');
      await collection.updateOne(
        { number: userId },
        { $set: data },
        { upsert: true }
      );
      return true;
    } catch (error) {
      console.error('❌ Failed to set PM guard data:', error);
      return false;
    }
  }

  async getPmMessage() {
    if (!this.db) return null;
    
    try {
      const collection = this.db.collection('pmguard');
      const result = await collection.findOne({ name: 'pmMsg' });
      return result ? result.pmMsg : null;
    } catch (error) {
      console.error('❌ Failed to get PM message:', error);
      return null;
    }
  }

  async setPmMessage(message) {
    if (!this.db) return false;
    
    try {
      const collection = this.db.collection('pmguard');
      await collection.updateOne(
        { name: 'pmMsg' },
        { $set: { pmMsg: message } },
        { upsert: true }
      );
      return true;
    } catch (error) {
      console.error('❌ Failed to set PM message:', error);
      return false;
    }
  }

  // Deta Operations (for session storage)
  getDetaDrive(name = 'WhatsGram') {
    return this.deta ? this.deta.Drive(name) : null;
  }

  getDetaBase(name = 'WhatsGram') {
    return this.deta ? this.deta.Base(name) : null;
  }

  // Generic operations
  async saveData(collection, key, data) {
    if (!this.db) return false;
    
    try {
      const coll = this.db.collection(collection);
      await coll.updateOne(
        { _id: key },
        { $set: data },
        { upsert: true }
      );
      return true;
    } catch (error) {
      console.error(`❌ Failed to save data to ${collection}:`, error);
      return false;
    }
  }

  async getData(collection, key) {
    if (!this.db) return null;
    
    try {
      const coll = this.db.collection(collection);
      return await coll.findOne({ _id: key });
    } catch (error) {
      console.error(`❌ Failed to get data from ${collection}:`, error);
      return null;
    }
  }

  async deleteData(collection, key) {
    if (!this.db) return false;
    
    try {
      const coll = this.db.collection(collection);
      await coll.deleteOne({ _id: key });
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete data from ${collection}:`, error);
      return false;
    }
  }
}

module.exports = Database;