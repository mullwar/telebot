/*

  Name: Flooder
  Description: Simple flood protection module.
  Module options: {
    flood: {
      interval: 1, // In seconds
      message: 'Flood message.' // Message
    }
  }

  NOTE: Received Telegram message time accuracy is one second!

*/

// Store users
const userList = {};

// Export bot module
module.exports = (bot, cfg) => {

  // Load config data
  let opt = cfg.flood || {};
  let interval = Number(opt.interval) || 1;
  let text = opt.message === undefined ?
    'Too many messages from you. Please, try later...' :
      opt.message;

  // Create message modifier
  bot.mod('message', data => {

    let msg = data.msg;
    let id = msg.from.id;
    let user = userList[id];
    let now = new Date(msg.date);

    if (user) {
      let diff = now - user.lastTime;
      user.lastTime = now;
      if (diff <= interval) {
        if (!user.flood) {
          if (text) bot.sendMessage(id, text);
          user.flood = true;
        }
        data.msg = {};
      } else {
        user.flood = false;
      }
    } else {
      userList[id] = { lastTime: now };
    }
  
    return data;
  
  });

};
