require('dotenv').config();

module.exports = {
  // Telegram Bot
  TG_BOT_TOKEN: process.env.TG_BOT_TOKEN || '',
  TG_OWNER_ID: process.env.TG_OWNER_ID || '',
  TG_CHANNEL_ID: process.env.TG_CHANNEL_ID || '',

  // WhatsApp
  SESSION_DATA: process.env.SESSION_DATA || '',
  
  // Database
  DB_URL: process.env.DB_URL || '',
  DETA_PROJECT_KEY: process.env.DETA_PROJECT_KEY || '',
  
  // APIs
  REMOVE_BG_API: process.env.REMOVE_BG_API || '',
  OCR_SPACE_API_KEY: process.env.OCR_SPACE_API_KEY || '',
  
  // Heroku (for deployment)
  HEROKU_API_KEY: process.env.HEROKU_API_KEY || '',
  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || '',
  
  // Features
  PMGUARD_ENABLED: process.env.PMGUARD_ENABLED === 'true',
  PMGUARD_ACTION: process.env.PMGUARD_ACTION || 'mute', // 'mute' or 'block'
  
  // App Settings
  AUTO_RESTART_HOURS: 12,
  MAX_FILE_SIZE_MB: 100
};