'use strict';

const TeleBot = require('../');

const bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-',
  plugins: {
    flooder: {
      interval: 2,
      message: 'Too many messages!'
    }
  }
});

// Use flooder module
bot.use(require('../plugins/flooder.js'));

// On every message
bot.on('*', msg => {
  return bot.sendMessage(msg.from.id, `Echo: ${ msg.text }`);
});

// Yes, thats it. Now, try to spam bot with messages ;)

bot.start();
