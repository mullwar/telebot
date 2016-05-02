'use strict';

const TeleBot = require('../');

const bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-',
  modules: {
    flooder: {
      interval: 2,
      message: 'Too many messages!'
    }
  }
});

// Use flooder module
bot.use(require('../modules/flooder.js'));

// On every message
bot.on('*', msg => {
  return bot.sendMessage(msg.from.id, `Echo: ${ msg.text }`);
});

// Yes, thats it. Now, try to spam bot with messages ;)

bot.connect();
