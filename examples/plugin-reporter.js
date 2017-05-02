const TeleBot = require('../');

const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    usePlugins: ['reporter'],
    plugins: {
        reporter: {
            // What to report?
            events: ['*', 'reconnect', 'reconnected', 'stop', 'error'],
            // User list
            to: ['USER_ID']
        }
    }
});

// Make an error
bot.on('/error', x => ___REPORT_ERROR_TEST___);

// Stop with message
bot.on('/stop', x => bot.stop('bye!'));

bot.start();
