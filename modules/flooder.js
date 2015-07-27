/*

  Flooder
  Simple flood protection module

  CONFIG:

  flood: {
    interval: 1, // in seconds
    message: 'Flood message.' // message
  }
  
  NOTE: Received Telegram message time accuracy is one second!

*/

// Store users
var userList = {};

// Export bot module
module.exports = function(bot) {
  // Load config data
  var cfg = bot.cfg.flood || {};
  var interval = Number(cfg.interval) || 1;
  var text = cfg.message === undefined ?
    'Too many messages from you. Please, try later...' : cfg.message;
  // Create message modifier
  bot.mod('message', function(msg) {
    var id = msg.from.id, user = userList[id];
    var now = new Date(msg.date);
    if (user) {
      var diff = now - user.lastTime;
      user.lastTime = now;
      if (diff <= interval) {
        if (!user.flood) {
          if (text) bot.sendMessage(id, text);
          user.flood = true;
        }
        msg = {};
      } else {
        user.flood = false;
      }
    } else {
      userList[id] = { lastTime: now };
    }
    return msg;
  });
};
