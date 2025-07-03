const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { Telegraf } = require('telegraf');
const QRCode = require('qrcode');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const SessionManager = require('./session');
const ModuleLoader = require('./loader');

class WhatsGramCore {
  constructor(config) {
    this.config = config;
    this.whatsappClient = null;
    this.telegramBot = null;
    this.sessionManager = new SessionManager(config);
    this.moduleLoader = new ModuleLoader();
    this.isReady = false;
  }

  async start() {
    console.log('🚀 Starting WhatsGram v2...');
    
    // Initialize Telegram Bot
    await this.initTelegram();
    
    // Initialize WhatsApp Client
    await this.initWhatsApp();
    
    // Load modules
    await this.loadModules();
    
    console.log('✅ WhatsGram v2 started successfully!');
  }

  async initTelegram() {
    this.telegramBot = new Telegraf(this.config.TG_BOT_TOKEN);
    
    // Set commands
    await this.telegramBot.telegram.setMyCommands([
      { command: 'start', description: 'Start bot' },
      { command: 'restart', description: 'Restart WhatsApp client' },
      { command: 'send', description: 'Send message to WhatsApp' }
    ]);

    this.telegramBot.launch();
    console.log('📱 Telegram bot initialized');
  }

  async initWhatsApp() {
    // Get session if exists
    await this.sessionManager.getSession(() => this.createWhatsAppClient());
    
    if (!this.whatsappClient) {
      this.createWhatsAppClient();
    }
  }

  createWhatsAppClient() {
    this.whatsappClient = new Client({
      authStrategy: new LocalAuth({ dataPath: './WWebJS' }),
      puppeteer: { headless: true, args: ["--no-sandbox"] }
    });

    // QR Code handler
    this.whatsappClient.on('qr', async (qr) => {
      console.log('📱 QR Code received, sending to Telegram...');
      await QRCode.toFile('qr.png', qr);
      await this.telegramBot.telegram.sendPhoto(
        this.config.TG_OWNER_ID,
        { source: 'qr.png' },
        { caption: 'Scan this QR code within 20 seconds...' }
      );
      qrcode.generate(qr, { small: true });
    });

    // Ready handler
    this.whatsappClient.on('ready', async () => {
      console.log('✅ WhatsApp client ready!');
      this.isReady = true;
      await this.sessionManager.saveSession();
      
      if (fs.existsSync('qr.png')) {
        fs.unlinkSync('qr.png');
      }
      
      await this.telegramBot.telegram.sendMessage(
        this.config.TG_OWNER_ID,
        '✅ WhatsApp connected successfully!'
      );
    });

    // Auth failure handler
    this.whatsappClient.on('auth_failure', () => {
      console.log('❌ Authentication failed');
      this.sessionManager.clearSession();
    });

    this.whatsappClient.initialize();
  }

  async loadModules() {
    // Load WhatsApp module
    const whatsappModule = require('../modules/whatsapp');
    this.moduleLoader.loadModule('whatsapp', whatsappModule, {
      client: this.whatsappClient,
      config: this.config,
      MessageMedia
    });

    // Load Telegram module  
    const telegramModule = require('../modules/telegram');
    this.moduleLoader.loadModule('telegram', telegramModule, {
      bot: this.telegramBot,
      whatsappClient: this.whatsappClient,
      config: this.config,
      MessageMedia
    });

    console.log('📦 Modules loaded successfully');
  }

  async stop() {
    if (this.whatsappClient) {
      await this.whatsappClient.destroy();
    }
    if (this.telegramBot) {
      this.telegramBot.stop();
    }
    console.log('🛑 WhatsGram stopped');
  }
}

module.exports = WhatsGramCore;