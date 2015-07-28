/*
  Ask
  Get direct answers from users!
*/

// Storage
var LIST = {};

module.exports = function(bot) {
  // On every text message
  bot.on('text', function(msg) {
    var id = msg.chat.id, ask = LIST[id];
    if (!ask) return;
    // Delete user from list and send custom event
    delete LIST[id];
    bot.event('ask.' + ask, msg, this);
  });
  // Before call sendMessage method
  bot.on('sendMessage', function(args) {
    var id = args[0], opt = args[2] || {};
    var ask = opt.ask;
    // If "ask" in options, add user to list
    if (ask) LIST[id] = ask;
  });
};
