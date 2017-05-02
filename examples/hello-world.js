const TeleBot = require('../');
const bot = new TeleBot('TELEGRAM_BOT_TOKEN');

// On every text message
bot.on('text', msg => {
    let id = msg.from.id;
    let text = msg.text;
    return bot.sendMessage(id, `You said: ${ text }`);
});

bot.connect();
