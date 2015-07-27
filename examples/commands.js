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
    msg.from.id, 'Command list:\n/start\n/help\n/bot\n/hideKeyboard',
    { markup: helloKeys }
  );
});

bot.on('/bot', function(msg) {
  var action = this.cmd[1];
  var id = msg.from.id;
  switch (action) {
    case 'quit':
      return bot.sendMessage(id, 'Quit: bye bye!').then(function() {
        bot.disconnect();
        process.exit();
      });
    case undefined:
      return bot.sendMessage(id, 'Action required.\n/bot <action>');
    default:
      return bot.sendMessage(id, 'Unknown "' + action + '" action.');
  }
});

bot.on('/hideKeyboard', function(msg) {
  return bot.sendMessage(msg.from.id, 'Keyboard is hidden.', { markup: 'hide' });
});

bot.connect();
