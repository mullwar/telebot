'use strict';

const TeleBot = require('../');

const bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-',
  modules: {
    report: {
      // What to report?
      events: ['*', 'reconnect', 'reconnected', 'disconnect', 'error'],
      // User list
      to: ['USER_ID']
    }
  }
});

// Use report module
bot.use(require('../modules/report.js'));

// Error
bot.on('/error', x => ___REPORT_ERROR_TEST___);

// Disconnect
bot.on('/disconnect', x => bot.disconnect('bye!'));

bot.connect();
