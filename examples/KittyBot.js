/*
  KittyBot
  Shows random Kitty pictures and gifs.
  See this code in action, by visiting @KittyBot on Telegram!
*/

var TeleBot = require('../');

// Create a new bot
var bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-',
  sleep: 1000,
});

// Great API for this
var API = 'https://thecatapi.com/api/images/get?format=src&type=';

// Command keyboard
var keys = bot.keyboard([
  ['/kitty', '/kittygif']
], { resize: true, once: false });

// On every text message
bot.on('text', function(msg) {
  console.log('[text] ' + msg.chat.id + ' ' + msg.text);
});

// On command "start" and "help"
bot.on(['/start', '/help'], function(msg) {
  return bot.sendMessage(msg.chat.id,
    '😺 Use commands: /kitty, /kittygif and /about', { markup: keys }
  );
});

// On command "about"
bot.on('/about', function(msg) {
  var text = '😽 This bot is powered by TeleBot library ' +
    'https://github.com/kosmodrey/telebot Go check the source code!';
  return bot.sendMessage(msg.chat.id, text);
});

// On command "kitty" and "kittygif"
bot.on(['/kitty', '/kittygif'], function(msg) {
  var id = msg.chat.id, cmd = this.cmd[0];
  // Picture or gif?
  var promise = cmd == '/kitty' ?
    // Send downloaded data to user
    bot.sendPhoto(id, API + 'jpg', { name: 'kitty.jpg' }) :
    bot.sendDocument(id, API + 'gif', { name: 'kitty.gif' });
  // Send "uploading photo" action
  bot.sendAction(id, 'upload_photo');
  return promise.catch(function(error) {
    // Send an error
    bot.sendMessage(id, '😿 An error (' + error + ') occurred, try again.');
  });
});

// Start getting updates
bot.connect();
