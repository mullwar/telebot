const TeleBot = require('../');

const BUTTONS = {
    hello: {
        label: '👋 Hello',
        command: '/hello'
    },
    world: {
        label: '🌍 World',
        command: '/world'
    },
    hide: {
        label: '⌨️ Hide keyboard',
        command: '/hide'
    }
};

const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    usePlugins: ['namedButtons'],
    pluginConfig: {
        namedButtons: {
            buttons: BUTTONS
        }
    }
});


bot.on('/hello', (msg) => msg.reply.text('Hello command!'));
bot.on('/world', (msg) => msg.reply.text('World command!'));
bot.on('/hide', (msg) => msg.reply.text('Type /start to show keyboard again.', {replyMarkup: 'hide'}));

bot.on('/start', (msg) => {

    let replyMarkup = bot.keyboard([
        [BUTTONS.hello.label, BUTTONS.world.label],
        [BUTTONS.hide.label]
    ], {resize: true});

    return bot.sendMessage(msg.from.id, 'See keyboard below.', {replyMarkup});

});

bot.start();
