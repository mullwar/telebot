/*
  Name: Botan
  Description: Advanced analytics for your Telegram bot: http://botan.io/
  NPM Requirements: botanio
  Bot Options: {
    botan: 00000 // Your AppMetrika key
  }
*/

module.exports = function(bot) {
  var TOKEN = bot.cfg.botan;
  if (!TOKEN) {
    console.log('[botan] Error: no token key');
    return;
  }
  var botan = require('botanio')(TOKEN);
  // Track every type of message
  bot.on('*', function(msg) {
    botan.track(msg, this.type);
  });
};
