const { WhatsGramCore } = require('./core');
const config = require('./config');

// Initialize WhatsGram
const bot = new WhatsGramCore(config);

// Start the bot
bot.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});