const TeleBot = require('../');
const bot = new TeleBot('TELEGRAM_BOT_TOKEN');

var lastMessage;

bot.on('/start', msg => {

    const markup = updateKeyboard('apples');

    return bot.sendMessage(
        msg.from.id, 'This is a editMessageReplyMarkup example. So, apples or oranges?', {markup}
    ).then(re => {
        // Start updating message
        lastMessage = [msg.from.id, re.result.message_id];
    });

});

// On button callback
bot.on('callbackQuery', msg => {

    // Send confirm
    bot.answerCallbackQuery(msg.id);

    if (!lastMessage) return bot.sendMessage(msg.from.id, 'Type /start');

    const data = msg.data;
    const [chatId, messageId] = lastMessage;
    const replyMarkup = updateKeyboard(data);

    // Edit message markup
    return bot.editMessageReplyMarkup({chatId, messageId}, {replyMarkup});

});

bot.start();

// Returns keyboard markup
function updateKeyboard(fruit) {

    let apples = 'apples';
    let oranges = 'oranges';

    if (fruit == 'apples') {
        apples = `==> ${ apples } <==`;
    } else {
        oranges = `==> ${ oranges } <==`;
    }

    return bot.inlineKeyboard([
        [
            bot.inlineButton(apples, {callback: 'apples'}),
            bot.inlineButton(oranges, {callback: 'oranges'})
        ]
    ]);

}
