'use strict';

const TeleBot = require('../');
const bot = new TeleBot('-PASTEYOURTELEGRAMBOTAPITOKENHERE-');

// On commands
bot.on(['/start', '/back'], msg => {
  
  let markup = bot.keyboard([
    ['/buttons', '/inlineKeyboard'],
    ['/start','/hide']
  ], { resize: true });
  
  return bot.sendMessage(msg.from.id, 'Keyboard example.', { markup });

});

// Buttons
bot.on('/buttons', msg => {

  let markup = bot.keyboard([
    [bot.button('contact', 'Your contact'), bot.button('location', 'Your location')],
    ['/back', '/hide']
  ], { resize: true });

  return bot.sendMessage(msg.from.id, 'Button example.', { markup });

});

// Hide keyboard
bot.on('/hide', msg => {
  return bot.sendMessage(
    msg.from.id, 'Hide keyboard example. Type /back to show.', { markup: 'hide' }
  );
});

// On location on contact message
bot.on(['location', 'contact'], (msg, self) => {
  return bot.sendMessage(msg.from.id, `Thank you for ${ self.type }.`);
});

// Inline buttons
bot.on('/inlineKeyboard', msg => {

  let markup = bot.inlineKeyboard([
    [
      bot.inlineButton('callback', { callback: 'this_is_data' }),
      bot.inlineButton('inline', { inline: 'some query' })
    ], [
      bot.inlineButton('url', { url: 'https://telegram.org' })
    ]
  ]);

  return bot.sendMessage(msg.from.id, 'Inline keyboard example.', { markup });

});

// Inline button callback
bot.on('callbackQuery', msg => {
  // User message alert
  return bot.answerCallback(msg.id, `Inline button callback: ${ msg.data }`, true);
});

// Inline query
bot.on('inlineQuery', msg => {

  const query = msg.query;
  const answers = bot.answerList(msg.id);

  answers.addArticle({
    id: 'query',
    title: 'Inline Query',
    description: `Your query: ${ query }`,
    message_text: 'Click!'
  });

  return bot.answerQuery(answers);

});

bot.connect();
