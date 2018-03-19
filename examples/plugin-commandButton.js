const TeleBot = require('../');

const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    usePlugins: ['commandButton']
});

// Command /start
bot.on('/start', msg => {

    // Inline keyboard markup
    const replyMarkup = bot.inlineKeyboard([
        [
            // First row with command callback button
            bot.inlineButton('Command button', {callback: '/hello'})
        ],
        [
            // Second row with regular command button
            bot.inlineButton('Regular data button', {callback: 'hello'})
        ]
    ]);

    // Send message with keyboard markup
    return bot.sendMessage(msg.from.id, 'Example of command button.', {replyMarkup});

});

// Command /hello
bot.on('/hello', msg => {
    return bot.sendMessage(msg.from.id, 'Hello!');
});

// Button callback
bot.on('callbackQuery', (msg) => {

    console.log('callbackQuery data:', msg.data);
    bot.answerCallbackQuery(msg.id);

});

bot.start();
