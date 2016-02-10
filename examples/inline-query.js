/*
  To enable this option, send the /setinline command to @BotFather and provide
  the placeholder text that the user will see in the input field after typing
  your bot’s name.
*/
var TeleBot = require('../');

var bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-'
});

// Count inline query requests
var counter = 0;

bot.on('query', function(data) {
  counter++;
  var query = data.query;
  console.log('inline query:', query);
  // Create a new answer list object
  var answers = new bot.answerList(data.id);
  // Add an article
  answers.addArticle({
    id: 'query',
    title: 'Inline Title',
    description: 'Your query: ' + query,
    message_text: 'You clicked!'
  });
  // ...and one more
  answers.addArticle({
    id: 'counter',
    title: 'Counter',
    description: 'Recived query ' + counter + ' times.',
    message_text: 'Counter text here.'
  });
  // Send answers
  return bot.answerQuery(answers);
});

bot.connect();
