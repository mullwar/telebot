const TeleBot = require('../');

const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    usePlugins: ['reporter'],
    pluginConfig: {
        reporter: {
            // What to report?
            events: ['*', 'reconnect', 'reconnected', 'stop', 'error'],
            // User list
            to: ['USER_ID']
        }
    }
});

// Make an error
bot.on('/error', (msg) => msg.MAKE_AN_ERROR);

// Stop with message
bot.on('/stop', () => bot.stop('bye!'));

bot.start();
