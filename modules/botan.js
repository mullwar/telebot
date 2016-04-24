/*
  Name: Botan
  Description: Advanced analytics for your Telegram bot: http://botan.io
  NPM Requirements: botanio
  Module options: {
    botan: 00000 // Your AppMetrika key
  }
*/

'use strict';

module.exports = function(bot) {
  
  // Check AppMetrika key
  const TOKEN = bot.cfg.botan;
  if (!TOKEN) return console.error('[botan] no token key');
  
  const botan = require('botanio')(TOKEN);
  
  // Track every type of message
  bot.on('*', msg => {
    botan.track(msg, this.type);
  });

};
