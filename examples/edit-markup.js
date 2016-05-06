'use strict';

const TeleBot = require('../');
const bot = new TeleBot('-PASTEYOURTELEGRAMBOTAPITOKENHERE-');

var lastMessage;

bot.on('/start', msg => {

  const markup = updateKeyboard('apples');

  return bot.sendMessage(
    msg.from.id, 'This is a editMarkup example. So, apples or oranges?', { markup }
  ).then(re => {
    // Start updating message
    lastMessage = [msg.from.id, re.result.message_id];
  });

});

// On button callback
bot.on('callbackQuery', msg => {

  // Send confirm
  bot.answerCallback(msg.id);

  if (!lastMessage) return bot.sendMessage(msg.from.id, 'Type /start');

  const data = msg.data;
  const [chatId, messageId] = lastMessage;
  const markup = updateKeyboard(msg.data);

  // Edit message markup
  return bot.editMarkup({ chatId, messageId }, { markup });

});

bot.connect();

// Returns keyboard markup
function updateKeyboard(fruit) {
  
  let apples = 'apples';
  let oranges = 'oranges';

  if (fruit == 'apples') {
    apples = `==> ${ apples } <==`;
  } else {
    oranges = `==> ${ oranges } <==`;
  }
  
  return bot.inlineKeyboard([
    [
      bot.inlineButton(apples, { callback: 'apples' }),
      bot.inlineButton(oranges, { callback: 'oranges' })
    ]
  ]);

}
