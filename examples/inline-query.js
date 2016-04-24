/*
  To enable this option, send the /setinline command to @BotFather and provide
  the placeholder text that the user will see in the input field after typing
  your bot’s name.
*/

'use strict';

const TeleBot = require('../');

const bot = new TeleBot('-PASTEYOURTELEGRAMBOTAPITOKENHERE-');

// Count inline query requests
let counter = 0;

bot.on('inlineQuery', function(data) {

  const query = data.query;
  console.log('inline query:', query);

  counter++;

  // Create a new answer list object
  const answers = bot.answerList(data.id);

  // Add an article
  answers.addArticle({
    id: 'query',
    title: 'Inline Title',
    description: `Your query: ${ query }`,
    message_text: 'You clicked!'
  });

  // ...and one more
  answers.addArticle({
    id: 'counter',
    title: 'Counter',
    description: `Recived query ${ counter } times.`,
    message_text: 'Counter text here.'
  });

  // Send answers
  return bot.answerQuery(answers);

});

bot.connect();
