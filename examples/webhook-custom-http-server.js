const TeleBot = require('../');

const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    webhook: {
        createServer: false,
        url: 'https://....'
    }
});

bot.on('text', msg => bot.sendMessage(msg.from.id, msg.text));

bot.start().then(listener => {
    const server = http.createServer(listener);
    server.listen(3200, '0.0.0.0');
});
