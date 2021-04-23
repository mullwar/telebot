const TeleBot = require('../');

const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    usePlugins: ['ctx']
});

// On start command
bot.on('/start', msg => {

    // Reply adding context
    return msg.reply.text('Hi', {ctx: {
        from: 'Hi',
        info: 'You can pass whatever you want'
    }});

});

// On any text message
bot.on('text', msg => {

    // ctx exists
    if (msg.ctx) {
        return msg.reply.text('Context received 🎉');
    }

    return msg.reply.text('No context here 😖');

});

bot.start();
