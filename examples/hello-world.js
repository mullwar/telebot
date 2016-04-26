'use strict';

const TeleBot = require('../');
const bot = new TeleBot('-PASTEYOURTELEGRAMBOTAPITOKENHERE-');

// On every text mesage
bot.on('text', msg => {
  let id = msg.from.id;
  let text = msg.text;
  return bot.sendMessage(id, `You said: ${ text }`);
});

bot.connect();
