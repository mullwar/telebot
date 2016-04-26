'use strict';

const TeleBot = require('../');
const TOKEN = '-PASTEYOURTELEGRAMBOTAPITOKENHERE-';

const bot = new TeleBot({
  token: TOKEN,
  webhook: {
    key: '__YOUR_KEY__.pem',
    cert: '__YOUR_CERT__.pem',
    url: `https://___YOUR_URL___/${ TOKEN }`,
    host: '0.0.0.0',
    port: 443
  }
});

bot.on('text', msg => bot.sendMessage(msg.from.id, msg.text));

bot.connect();
