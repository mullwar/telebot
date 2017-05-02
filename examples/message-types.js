const TeleBot = require('../');
const bot = new TeleBot('TELEGRAM_BOT_TOKEN');

// On every type of message (& command)
bot.on(['*', '/*'], (msg, self) => {
    let id = msg.from.id;
    let reply = msg.message_id;
    let type = self.type;
    let parse = 'html';
    return bot.sendMessage(
        id, `This is a <b>${ type }</b> message.`, {reply, parse}
    );
});

bot.start();
