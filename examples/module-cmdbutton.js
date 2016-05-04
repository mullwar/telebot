'use strict';

const TeleBot = require('../');
const bot = new TeleBot('-PASTEYOURTELEGRAMBOTAPITOKENHERE-');

// Use command button module
bot.use(require('../modules/cmdbutton.js'));

// Command /start
bot.on('/start', msg => {
  
  // Inline keyboard markup
  let markup = bot.inlineKeyboard([
    [
      // Button in first row with command callback
      bot.inlineButton('Command button', { callback: '/hello' }),
    ],
    [
      // Second row with regular command button
      bot.inlineButton('Regular data button', { callback: 'hello' })
    ]
  ]);

  // Send message with keyboard markup
  return bot.sendMessage(msg.from.id, 'Example of command button.', { markup });

});

// Command /hello
bot.on('/hello', msg => {
  return bot.sendMessage(msg.from.id, 'Hello!');
});

// Button callback
bot.on('callbackQuery', msg => {
  console.log(`[callback] ${ msg.data }`);
  bot.answerCallback(msg.id);
});

bot.connect();
