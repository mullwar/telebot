'use strict';

const TeleBot = require('../');
const ngrok = require('ngrok');

const token = '-PASTEYOURTELEGRAMBOTAPITOKENHERE-';
const host = '0.0.0.0';
const port = 443;

ngrok.connect(port, (error, url) => {

  if (error) return console.error('[ngrok] error:', error);

  const bot = new TeleBot({
    token, webhook: { url, host, port }
  });

  bot.on('text', msg => bot.sendMessage(msg.from.id, msg.text));

  bot.connect();
  
});

