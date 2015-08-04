var TeleBot = require('../');

// User ID list who receive reports
var REPORT_TO = [00000000];

var bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-',
  // Module config data
  report: {
    error: REPORT_TO,
    connect: REPORT_TO,
    sendMessage: REPORT_TO,
    // ...any type of event!
  }
});

// Use external bot module
bot.use(require('../modules/report'));

// On every text message
bot.on('text', function(msg) {
  var opt = {};
  // Skip example
  if (msg.text == 'skip') {
    msg.text = 'Skip report for this event!';
    opt.skipReport = true;
  }
  return bot.sendMessage(msg.from.id, msg.text, opt);
});

// Make an error by sending command
bot.on('/error', function(msg) {
  bot.make_an_error_here(-1);
});

// Start getting updates
bot.connect();
