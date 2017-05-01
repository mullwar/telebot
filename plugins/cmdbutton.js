'use strict';

module.exports = (bot, cfg) => {
  
  bot.on('callbackQuery', (msg, props) => {
    const cmd = msg.data;
    if (cmd.charAt(0) == '/') {
      bot.answerCallback(msg.id);
      return bot.event(cmd, msg, props);
    }
  });

};
