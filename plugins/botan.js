/*
  Name: Botan
  Description: Advanced analytics for your Telegram bot: http://botan.io
  NPM Requirements: botanio
  Module options: {
    botan: 00000 // Your AppMetrika key
  }
*/

'use strict';

module.exports = (bot, cfg) => {
  
  // Check AppMetrika key
  const TOKEN = cfg.botan;

  // On no token
  if (!TOKEN) return console.error('[botan] no token key');
  console.log('[botan] started');
  
  // Require botanio
  const botan = require('botanio')(TOKEN);
  
  // Track every type of message
  bot.on('*', (msg, props) => botan.track(msg, props.type));

};
