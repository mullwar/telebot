/*
  Name: Ask
  Description: Get direct answers from users!
*/

// Store user list
const userList = {};

module.exports = bot => {

  // On every text message
  bot.on('*', (msg, info) => {

    let id = msg.chat.id,
      ask = userList[id];
    
    // If no question, then it's a regular message
    if (!ask) return;

    // Delete user from list and send custom event
    delete userList[id];
    bot.event('ask.' + ask, msg, info);
  
  });
  
  // Before call sendMessage method
  bot.on('sendMessage', args => {

    let id = args[0],
      opt = args[2] || {};

    let ask = opt.ask;

    // If "ask" in options, add user to list
    if (ask) userList[id] = ask;
  
  });

};
