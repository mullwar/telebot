var TeleBot = require('../');

var bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-'
});

bot.on('text', function(msg) {
  var id = msg.from.id;
  var firstName = msg.from.first_name;
  return bot.sendMessage(id, 'Hello, ' + firstName + '!');
});

bot.connect();
