const TeleBot = require('../');

const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    usePlugins: ['floodProtection'],
    pluginConfig: {
        floodProtection: {
            interval: 2,
            message: 'Too many messages, relax!'
        }
    }
});

// On every message
bot.on('*', (msg) => {
    return bot.sendMessage(msg.from.id, `Echo: ${ msg.text }`);
});

// Now try to spam bot with messages ;)

bot.start();
