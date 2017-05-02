const TeleBot = require('../');
const bot = new TeleBot('TELEGRAM_BOT_TOKEN');

// On inline query
bot.on('inlineQuery', msg => {

    let query = msg.query;
    console.log(`inline query: ${ query }`);

    // Create a new answer list object
    const answers = bot.answerList(msg.id, {cacheTime: 60});

    // Article
    answers.addArticle({
        id: 'query',
        title: 'Inline Title',
        description: `Your query: ${ query }`,
        message_text: 'Click!'
    });

    // Photo
    answers.addPhoto({
        id: 'photo',
        caption: 'Telegram logo.',
        photo_url: 'https://telegram.org/img/t_logo.png',
        thumb_url: 'https://telegram.org/img/t_logo.png'
    });

    // Gif
    answers.addGif({
        id: 'gif',
        gif_url: 'https://telegram.org/img/tl_card_wecandoit.gif',
        thumb_url: 'https://telegram.org/img/tl_card_wecandoit.gif'
    });

    // Send answers
    return bot.answerQuery(answers);

});

bot.start();
