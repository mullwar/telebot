'use strict';

const TeleBot = require('../');
const bot = new TeleBot('-PASTEYOURTELEGRAMBOTAPITOKENHERE-');

bot.on('/time', msg => {

  return bot.sendMessage(msg.from.id, 'Getting time...').then(re => {
    // Start updating message
    updateTime(msg.from.id, re.result.message_id);
  });

});

function updateTime(chatId, messageId) {

  // Update every second
  setInterval(x => {
    bot.editText(
      { chatId, messageId }, `<b>Current time:</b> ${ time() }`,
      { parse: 'html' }
    ).catch(error => console.log('Error:', error));
  }, 1000);

}

bot.connect();

// Get current time
function time() {
  return new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}
