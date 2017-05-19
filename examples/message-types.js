const TeleBot = require('../');
const bot = new TeleBot('TELEGRAM_BOT_TOKEN');

// On every type of message (& command)
bot.on(['*', '/*'], (msg, self) => {
    let id = msg.from.id;
    let replyToMessage = msg.message_id;
    let type = self.type;
    let parseMode = 'html';
    return bot.sendMessage(
        id, `This is a <b>${ type }</b> message.`, {replyToMessage, parseMode}
    );
});

bot.start();
