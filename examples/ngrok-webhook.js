'use strict';

const TeleBot = require('../');
const ngrok = require('ngrok');

const host = '0.0.0.0';
const port = 443;

ngrok.connect(port, (error, url) => {

  if (error) return console.error('[ngrok] error:', error);

  const bot = new TeleBot({
    token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-',
    webhook: { url, host, port }
  });

  bot.on('text', msg => bot.sendMessage(msg.from.id, msg.text));

  bot.connect();
  
});

