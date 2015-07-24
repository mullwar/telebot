var TeleBot = require('../');

// ID list
var REPORT_TO = ['00000000'];

var bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-',
  // Custom config data
  reporter: {
    error: { to: REPORT_TO },
    tick: { to: REPORT_TO }
  }
});

// Use external bot module
bot.use(require('../modules/reporter'));

// Make an error by sending command
bot.on('/error', function(msg) {
  bot.make_an_error_here(-1);
});

bot.connect();
