var TeleBot = require('../');

// Create a new bot
var bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-'
});

// Include ask module
bot.use(require('../modules/ask'));

// On start command
bot.on('/start', function(msg) {
  var id = msg.from.id;
  // Ask for name
  return bot.sendMessage(id, 'What is your name?', { ask: 'name' });
});

// Ask name event
bot.on('ask.name', function(msg) {
  var id = msg.from.id
  var name = msg.text;
  // Ask for age
  return bot.sendMessage(
    id, 'Hello, ' + name + '! Now, how old are you?', { ask: 'age' }
  );
});

// Ask age event
bot.on('ask.age', function(msg) {
  var id = msg.from.id;
  var age = Number(msg.text);
  // In incorrect age, ask again
  if (!age) {
    return bot.sendMessage(
      id, 'Incorrect age. Please, try again!', { ask: 'age' }
    );
  }
  // Send normal message (don't ask)
  return bot.sendMessage(id, 'You are ' + age + ' years old. Great!');
});

// Start getting updates
bot.connect();
