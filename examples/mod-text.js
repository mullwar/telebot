'use strict';

const TeleBot = require('../');
const bot = new TeleBot('-PASTEYOURTELEGRAMBOTAPITOKENHERE-');

// Send user message to himself
bot.on('text', msg => bot.sendMessage(msg.from.id, msg.text));

// Mod every text message
bot.mod('text', data => {
  const msg = data.msg;
  msg.text = `📢 ${ msg.text }`;
  return data;
});

bot.connect();
