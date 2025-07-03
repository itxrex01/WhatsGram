const fs = require('fs');
const fse = require('fs-extra');
const extract = require('extract-zip');
const { zip, COMPRESSION_LEVEL } = require('zip-a-folder');
const { Deta } = require('deta');
const path = require('path');

class SessionManager {
  constructor(config) {
    this.config = config;
    this.deta = config.DETA_PROJECT_KEY ? Deta(config.DETA_PROJECT_KEY) : null;
    this.drive = this.deta ? this.deta.Drive('WhatsGram') : null;
  }

  async saveSession() {
    if (!this.drive || !fs.existsSync('./WWebJS')) return false;

    try {
      console.log('💾 Saving session to database...');
      
      // Copy session folder
      fse.copySync('./WWebJS', './WWebJS-Copy', { overwrite: true });
      
      // Compress
      await zip('./WWebJS-Copy', './session.zip', {
        compression: COMPRESSION_LEVEL.high
      });
      
      // Upload to Deta
      await this.drive.put('session.zip', { path: './session.zip' });
      
      // Cleanup
      fs.unlinkSync('./session.zip');
      fse.removeSync('./WWebJS-Copy');
      
      console.log('✅ Session saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to save session:', error);
      return false;
    }
  }

  async getSession(initCallback) {
    if (!this.drive) return false;

    try {
      if (!fs.existsSync('./WWebJS')) {
        console.log('📥 Getting session from database...');
        
        const result = await this.drive.get('session.zip');
        if (result) {
          const buffer = await result.arrayBuffer();
          fs.writeFileSync('./session.zip', Buffer.from(buffer));
          
          await extract('./session.zip', {
            dir: path.join(__dirname, '../WWebJS')
          });
          
          fs.unlinkSync('./session.zip');
          console.log('✅ Session retrieved successfully');
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          initCallback();
          return true;
        }
        
        console.log('ℹ️ No session found, creating new one...');
      }
      return true;
    } catch (error) {
      console.error('❌ Failed to get session:', error);
      return false;
    }
  }

  async clearSession() {
    if (this.drive) {
      try {
        await this.drive.delete('session.zip');
        console.log('🗑️ Session cleared from database');
      } catch (error) {
        console.error('❌ Failed to clear session:', error);
      }
    }
    
    if (fs.existsSync('./WWebJS')) {
      fse.removeSync('./WWebJS');
      console.log('🗑️ Local session cleared');
    }
  }
}

module.exports = SessionManager;