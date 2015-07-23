var TeleBot = require('../');

var bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-'
});

var helloKeys = bot.keyboard([
  ['/start', '/help', '/bot'],
  ['/hideKeyboard']
], { resize: true, once: false });

bot.on(['/start', '/help'], function(msg) {
  return bot.sendMessage(
    this.user, 'Command list:\n/start\n/help\n/bot\n/hideKeyboard',
    { markup: helloKeys }
  );
});

bot.on('/bot', function(msg) {
  var action = this.cmd[1];
  switch(action) {
    case 'quit':
      return bot.sendMessage(this.user, 'Quit: bye bye!').then(function() {
        bot.disconnect();
        process.exit();
      });
    case undefined:
      return bot.sendMessage(this.user, 'Bot action required.\n/bot <action>');
    default:
      return bot.sendMessage(this.user, 'Unknown "' + action + '" action.');
  }
});

bot.on('/hideKeyboard', function(msg) {
  return bot.sendMessage(this.user, 'Keyboard is hidden.', { markup: 'hide' });
});

bot.connect();
