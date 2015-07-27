var TeleBot = require('../');

var bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-'
});

var API = 'https://thecatapi.com/api/images/get?format=src&type=';

var keys = bot.keyboard([
  ['/kitty', '/kittygif']
], { resize: true, once: false });

bot.on('text', function(msg) {
  console.log('[text] ' + msg.chat.id + ' ' + msg.text);
});

bot.on(['/start', '/help'], function(msg) {
  return bot.sendMessage(
    msg.chat.id, '😺 Use commands: /kitty or /kittygif', { markup: keys }
  );
});

bot.on(['/kitty', '/kittygif'], function(msg) {
  var id = msg.chat.id, cmd = this.cmd[0];
  var promise = cmd == '/kitty' ?
    bot.sendPhoto(id, API + 'jpg', { name: 'kitty.jpg' }) :
    bot.sendDocument(id, API + 'gif', { name: 'kitty.gif' });
  bot.sendAction(id, 'upload_photo');
  return promise.catch(function(error) {
    bot.sendMessage(id, '😿 An error (' + error + ') occurred, try again.');
  });
});

bot.connect();
